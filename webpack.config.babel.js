var path = require('path')

module.exports = {
  entry: './src/main.js',
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'metrics-vis.js',
    library: 'MetricsVis',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader']
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      }
    ]
  }
};
