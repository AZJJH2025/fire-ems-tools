const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      'data-formatter': './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
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
      }),
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
        publicPath: '',
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            const name = file.name.replace(/\.[a-f0-9]+\./, '.');
            manifest[name] = file.path.replace(/^.*\/dist\//, '');
            return manifest;
          }, seed);
          
          // Add entrypoints
          const entrypointFiles = {};
          Object.keys(entrypoints).forEach(entrypoint => {
            entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(
              fileName => !fileName.endsWith('.map')
            ).map(fileName => fileName.replace(/^.*\/dist\//, ''));
          });
          
          return {
            files: manifestFiles,
            entrypoints: entrypointFiles
          };
        }
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