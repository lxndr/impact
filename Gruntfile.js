'use strict';
const path = require('path');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      ''
    ],

    eslint: {
      files: 'src/**/*.js'
    },

    stylus: {
      compile: {
        files: {
          'src/ui/styles/all.css': 'src/ui/styles/all.styl'
        },
        options: {
          compress: false
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
                electron: '1.7.9'
              }
            }]
          ]
        }
      }
    },

    webpack: {
      renderer: {
        entry: './src/ui/index.js',
        output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'renderer.js',
          pathinfo: true
        },
        target: 'electron-renderer',
        module: {
          rules: [{
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, 'src/ui')
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
                    electron: '1.7.9'
                  }
                }]
              ]
            }
          }]
        }
      }
    }
  });

  grunt.registerTask('default', ['babel:main', 'webpack:renderer', 'stylus']);
  grunt.registerTask('lint', ['eslint']);
};
