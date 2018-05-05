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
})

app.listen(3100, () => console.log('limerick-land-server listening on port 3100'));
