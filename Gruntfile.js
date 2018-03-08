'use strict';
const path = require('path');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      'app',
      'dist'
    ],

    copy: {
      'app/index.html': 'src/ui/index.html'
    },

    eslint: {
      files: 'src/**/*.js'
    },

    stylus: {
      compile: {
        files: {
          'app/bundle.css': 'src/ui/styles/all.styl'
        }
      }
    },

    babel: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/app',
          src: '**/*.js',
          dest: 'dist/main'
        }],
        options: {
          plugins: [
            'transform-object-rest-spread'
          ],
          presets: [
            ['env', {
              targets: {
                electron: '2.0.0-beta.2'
              }
            }]
          ]
        }
      }
    },

    webpack: {
      options: {
        module: {
          rules: [{
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'node_modules/@lxndr')
            ],
            loader: 'babel-loader',
            options: {
              plugins: [
                '@babel/proposal-object-rest-spread',
                '@babel/proposal-decorators',
                '@babel/proposal-class-properties'
              ],
              presets: [
                '@babel/react',
                ['@babel/env', {
                  modules: false,
                  targets: {
                    electron: '2.0.0-beta.2'
                  }
                }]
              ]
            }
          }]
        }
      },
      main: {
        entry: './src/app/index.js',
        output: {
          path: path.resolve(__dirname, 'app'),
          filename: 'main.js',
          libraryTarget: 'commonjs2',
          pathinfo: true
        },
        target: 'electron-main',
        node: {
          __dirname: false
        },
        externals: [function (context, request, callback) {
          if (/^(@lxndr\/gst|thenify-all|nedb-promise|globby)/.test(request)) {
            return callback(null, 'commonjs ' + request);
          }

          callback();
        }]
      },
      renderer: {
        entry: './src/ui/index.js',
        output: {
          path: path.resolve(__dirname, 'app'),
          filename: 'renderer.js',
          pathinfo: true
        },
        target: 'electron-renderer'
      }
    }
  });

  grunt.registerTask('default', ['webpack:main', 'webpack:renderer', 'copy', 'stylus']);
  grunt.registerTask('lint', ['eslint']);
};
