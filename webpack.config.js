const path = require('path');

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: {
    // Main entry points
    'incident-logger': './src/js/incident-logger.js',
    'nfirs-bundle': './src/js/nfirs-bundle.js',
    'components-bundle': './src/js/components-bundle.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'static/dist'),
    publicPath: '/static/dist/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      // Make it easier to import modules
      '@components': path.resolve(__dirname, 'src/js/components/'),
      '@nfirs': path.resolve(__dirname, 'src/js/nfirs/'),
      '@utils': path.resolve(__dirname, 'src/js/utils/')
    }
  }
};