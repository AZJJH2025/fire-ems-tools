const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'data-formatter.[contenthash].js' : 'data-formatter.js',
      publicPath: '/static/js/react-data-formatter/dist/',
      library: 'DataFormatterUI',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: false // We'll handle script insertion ourselves
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
        publicPath: '/static/js/react-data-formatter/dist/'
      },
      compress: true,
      port: 9000,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        name: 'vendor'
      }
    },
    // Generate source maps for better debugging
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    // Externalize React and ReactDOM to reduce bundle size
    // These will be loaded from CDN
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      '@material-ui/core': 'MaterialUI',
      'react-beautiful-dnd': 'ReactBeautifulDnD'
    }
  };
};