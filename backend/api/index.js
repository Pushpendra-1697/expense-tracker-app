require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

let ready;

module.exports = async (req, res) => {
  if (!ready) {
    ready = connectDB();
  }
  await ready;
  return app(req, res);
};
