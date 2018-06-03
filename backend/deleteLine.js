/*
 * This script deletes a line from the database, as well as all of its descendants.
 *
 * Usage:   node deleteLine.js <lineId>
 * Example: node deleteLine.js 5b0c853bb540230014ab2386
 *
 * To use a remote database, set the MONGODB_URI environment variable.
 */

const Line = require("./models/line");
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/limerick-land";
mongoose.connect(MONGODB_URI);

let numLinesDeleted = 0;

const deleteLine = async (lineId) => {
  const line = await Line.findById(lineId);
  if (line === null) {
    console.error(`Line ${lineId} not found`);
    return;
  }

  // delete all the line's children
  await Promise.all(line.children.map(childId => deleteLine(childId)))

  // remove reference to this line in parent
  const parent = await Line.findOne({ children: lineId });
  if (parent === null) {
    console.log(`Line ${lineId} has no parent`);
  } else {
    parent.children.remove(lineId);
    await parent.save();
  }

  // delete this line
  await line.remove();
  numLinesDeleted += 1;
};

deleteLine(process.argv[2]).then(() => {
  console.log(`Deleted ${numLinesDeleted} line(s)`);
  mongoose.disconnect();
});
