const path = require('path');

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

    babel: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/app',
          src: '**/*.js',
          dest: 'dist/main',
        }],
      },
    },

    webpack: {
      options: {
        mode: process.env.NODE_ENV || 'production',
        module: {
          rules: [{
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'node_modules/@lxndr'),
            ],
            loader: 'babel-loader',
            options: {
              plugins: [
                'transform-object-rest-spread',
                'transform-decorators-legacy',
                'transform-class-properties',
              ],
              presets: [
                'react',
                ['env', {
                  modules: false,
                  targets: {
                    electron: '2.0.0',
                  },
                }],
              ],
            },
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
          // backend: './src/backend/index.js',
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
      },
    },
  });

  grunt.registerTask('default', ['clean', 'webpack:main', 'webpack:renderer', 'copy', 'stylus']);
  grunt.registerTask('lint', ['eslint']);
};
