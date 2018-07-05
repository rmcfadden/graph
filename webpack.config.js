const webpack = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    main: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'graph.js',
    library: 'Graph'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{ 
              loader: 'babel-loader',
              query: {
                presets: ['es2015','stage-3']
            }
        }
      ]
    },{
      test: /\.svg$/,
      loader: 'svg-inline-loader'
    }]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};