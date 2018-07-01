const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTemplate = require('html-webpack-template');

const production = process.env.NODE_ENV === 'production';

module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      files: [
        'app',
        'dist',
      ],
    },

    copy: {
      'app/frontend.html': 'src/frontend/index.html',
      'app/backend.html': 'src/backend/index.html',
    },

    eslint: {
      files: 'src/**/*.js',
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
        mode: process.env.NODE_ENV || 'development',
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
          if (/^(@lxndr\/gst|@lxndr\/vlc|globby)/.test(request)) {
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

  grunt.registerTask('default', ['clean', 'webpack:main', 'webpack:renderer', 'copy', 'stylus']);
  grunt.registerTask('lint', ['eslint']);
};
