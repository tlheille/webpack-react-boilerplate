const path = require('path');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const TailwindCSS = require('tailwindcss');
const Autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webapck = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = function (_env, argv) {
  const productionMode = argv.mode === 'production';
  const developmentMode = !productionMode;
  return {
    entry: './src/assets/js/index.js',
    devtool: developmentMode && 'cheap-module-source-map',
    module: {
      rules: [
        {
          // Apply rules for .js and .jsx files
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheCompression: false,
                cacheDirectory: true,
                envName: productionMode ? 'production' : 'development'
              }
            },
            {
              loader: 'eslint-loader'
            }
          ]
        },
        {
          // Apply rules for .css files
          test: /\.(css)$/,
          use: [
            productionMode
              ? MiniCSSExtractPlugin.loader
              : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [TailwindCSS, Autoprefixer]
              }
            }
          ]
        },
        {
          // Apply rules for image files
          test: /\.(png|jpg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'static/images/[name].[hash:8].[ext]'
            }
          }
        },
        {
          // Apply rules for .svg files
          test: /\.(svg)$/,
          use: ['@svgr/webpack']
        },
        {
          // Apply rules for fonts
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/fonts/[name].[hash:8].[ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    plugins: [
      new CleanWebpackPlugin(),
      productionMode &&
        new MiniCSSExtractPlugin({
          filename: 'assets/css/[name].[contenthash:8].css',
          chunkFilename: 'assets/css/[name].[contenthash:8].chunk.css'
        }),
      new webapck.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          productionMode ? 'production' : 'development'
        )
      }),
      new HTMLWebpackPlugin({
        filename: 'index.html',
        inject: true,
        template: './src/template.html'
      })
    ].filter(Boolean),
    optimization: {
      minimize: productionMode,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              comparisons: false
            },
            mangle: {
              safari10: true
            },
            output: {
              comments: false,
              ascii_only: true
            },
            warnings: false
          }
        }),
        new OptimizeCSSAssetsPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];

              return `${cacheGroupKey}.${packageName.replace(
                '@',
                ''
              )}`;
            }
          },
          common: {
            minChunks: 2,
            priority: -10
          }
        }
      },
      runtimeChunk: 'single'
    },
    output: {
      filename: 'assets/js/[name].[contenthash:8].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    devServer: {
      contentBase: './dist',
      compress: true,
      historyApiFallback: true,
      open: true,
      overlay: true
    }
  };
};
