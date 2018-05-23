const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    children: {
      type: [mongoose.Schema.Types.ObjectId], // IDs of child lines
      index: true
    },
    index: {
      // 0, 1, 2, 3, or 4
      type: Number,
      min: 0,
      max: 4,
      index: true
    },
    userId: String
  },
  {
    timestamps: true // adds updatedAt and createdAt fields
  }
);

schema.index({ createdAt: 1 });

module.exports.ValidatedLine = mongoose.model("ValidatedLine", schema); // lines with rhyme checking
module.exports.UnvalidatedLine = mongoose.model("UnvalidatedLine", schema); // lines with no rhyme checking