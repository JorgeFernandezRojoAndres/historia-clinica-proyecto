const path = require('path');

module.exports = {
  entry: './public/agenda.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist'),
  },
  mode: 'development',
};
