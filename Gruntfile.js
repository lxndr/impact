const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTemplate = require('html-webpack-template');

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt); // eslint-disable-line global-require

  grunt.initConfig({
    clean: {
      files: [
        'app',
        'dist',
        'coverage',
      ],
    },

    stylus: {
      compile: {
        files: {
          'app/frontend.css': 'src/frontend/styles/all.styl',
        },
      },
    },

    webpack: {
      options: {
        mode: NODE_ENV,
        devtool: 'inline-source-map',
        module: {
          rules: [{
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'node_modules/@lxndr'),
            ],
            loader: 'babel-loader',
          }, {
            test: /\.(png|svg)$/,
            loader: 'url-loader',
          }],
        },
      },
      main: {
        entry: './src/main/index.js',
        output: {
          path: path.resolve(__dirname, 'app'),
          filename: 'main.js',
          libraryTarget: 'commonjs2',
          pathinfo: true,
        },
        target: 'electron-main',
        node: {
          __dirname: false,
        },
      },
      renderer: {
        entry: {
          frontend: './src/frontend/index.js',
        },
        output: {
          path: path.resolve(__dirname, 'app'),
          filename: '[name].js',
          pathinfo: true,
        },
        target: 'electron-renderer',
        externals: [(context, request, callback) => {
          if (/^(globby|nedb)/.test(request)) {
            callback(null, `commonjs ${request}`);
            return;
          }

          callback();
        }],
        plugins: [new HtmlWebpackPlugin({
          title: 'Impact',
          filename: 'frontend.html',
          inject: false,
          template: HtmlWebpackTemplate,
          appMountIds: ['app'],
          meta: [{
            'http-equiv': 'Content-Security-Policy',
            content: 'script-src \'self\' file://*',
          }],
          links: ['frontend.css'],
        })],
      },
    },
  });

  grunt.registerTask('default', ['webpack:main', 'webpack:renderer', 'stylus']);
};
