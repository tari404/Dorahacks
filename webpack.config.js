const webpack = require('webpack')
const path = require('path')

const config = {
  entry: {
    main: './src/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: './dist/'
  },
  devServer: {
    hot: true,
    inline: true,
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(gif|jpg|woff|svg|eot|ttf)\??.*$/,
        loader: 'url-loader?limit=50000&name=[name].[ext]'
      },
      {
        test: /\.(obj|png)\??.*$/,
        loader: 'file-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /three\//,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false,
        drop_console: true
      }
    })
  ]
}

module.exports = config