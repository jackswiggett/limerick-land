const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const Line = require('./models/Line');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost/limerick-land');

// create a new first line
app.post('/firstline', async (req, res) => {
  const line = new Line({
    text: req.body.text,
    isFirstLine: true,
  });
  await line.save();
  res.end();
});

// get all existing first lines
app.get('/firstline', async (req, res) => {
  const firstLines = await Line
    .find({ isFirstLine: true })
    .select('text')
    .sort({ createdAt: -1 }) // show recently added lines first
    .exec();
  res.json(firstLines);
});

// create a new line that is a child of an existing line
app.post('/line', async (req, res) => {
  const line = new Line({
    text: req.body.text,
    isFirstLine: false,
    isLastLine: req.body.isLastLine,
  });
  await line.save();

  const parent = await Line.findById(req.body.parentId).exec();
  parent.children.push(line._id);
  await parent.save();

  res.end('Success');
})

// get a line along with its ancestors and children
app.get('/line', async (req, res) => {
  const line = await Line.findById(req.query.lineId).exec();

  /*
   * Asynchronously get all the children of this line
   *
   * 'line.children' is an array of ObjectIds, for example:
   *   [ObjectId("5aee23a1ff219e508a5097b8"), ObjectId("5aee1adeef88824e44ee5fae")]
   *
   * 'children' will be an array of objects, e.g.
   *   [{ text: 'some line' }, { text: 'some other line' }]
   */
  const children = await Promise.all(line.children.map(async (childId) => {
    const child = await Line.findById(childId).select('text').exec();
    return child;
  }));

  // Get all the ancestors of this line, up until we reach the first line
  const ancestors = [line];
  while (!ancestors[0].isFirstLine) {
    const parent = await Line
      .findOne({ children: ancestors[0]._id })
      .select('text isFirstLine')
      .exec();
    ancestors.splice(0, 0, parent);
  }

  ancestors.pop(); // remove this line

  res.json({
    ...line.toObject(),
    children,
    ancestors,
  });
})
    
app.get('/randpoem', async (req, res) => {
//  const line = await Line.findById(req.query.lineId).exec();
//  const line = null;
  
  const lastLines = await Line.find({ isLastLine: true }).exec();
  if (lastLines.length === 0) return res.json({});
  const idx = Math.floor((Math.random() * lastLines.length));
  const line = lastLines[idx];

  // Get all the ancestors of this line, up until we reach the first line
  const ancestors = [line];
  while (!ancestors[0].isFirstLine) {
    const parent = await Line
      .findOne({ children: ancestors[0]._id })
      .select('text isFirstLine')
      .exec();
    ancestors.splice(0, 0, parent);
  }

  ancestors.pop(); // remove this line
  
  res.json({
    ...line.toObject(),
    ancestors,
  });
})

app.listen(3100, () => console.log('limerick-land-server listening on port 3100'));
