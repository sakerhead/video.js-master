import {gruntCustomizer, gruntOptionsMaker} from './options-customizer.js';
module.exports = function(grunt) {
  require('time-grunt')(grunt);

  let _ = require('lodash-compat');
  let pkg = grunt.file.readJSON('package.json');
  let license = grunt.file.read('build/license-header.txt');
  let bannerCommonData = _.pick(pkg, ['version', 'copyright']);
  let verParts = pkg.version.split('.');
  let version = {
    full: pkg.version,
    major: verParts[0],
    minor: verParts[1],
    patch: verParts[2]
  };

  const browserifyGruntDefaults = {
    browserifyOptions: {
      debug: true,
      standalone: 'videojs'
    },
    plugin: [
      ['browserify-derequire']
    ],
    transform: [
      require('babelify').configure({
        sourceMapRelative: './',
        loose: ['all']
      }),
      ['browserify-versionify', {
        placeholder: '__VERSION__',
        version: pkg.version
      }],
      ['browserify-versionify', {
        placeholder: '__VERSION_NO_PATCH__',
        version: version.majorMinor
      }],
      ['browserify-versionify', {
        placeholder: '__SWF_VERSION__',
        version: pkg.dependencies['@hola.org/videojs-swf'].match(
          />=([^ ]+)/)[1]
      }]
    ]
  };

  const githubReleaseDefaults = {
    options: {
      release: {
        tag_name: 'v'+ version.full,
        name: version.full,
        body: require('chg').find(version.full).changesRaw
      },
    },
    files: {
      src: [`dist/video-js-${version.full}.zip`] // Files that you want to attach to Release
    }
  };

  /**
   * Customizes _.merge behavior in `browserifyGruntOptions` to concatenate
   * arrays. This can be overridden on a per-call basis to
   *
   * @see https://lodash.com/docs#merge
   * @function browserifyGruntCustomizer
   * @private
   * @param  {Mixed} objectValue
   * @param  {Mixed} sourceValue
   * @return {Object}
   */
  const browserifyGruntCustomizer = gruntCustomizer;

  /**
   * Creates a unique object of Browserify Grunt task options.
   *
   * @function browserifyGruntOptions
   * @private
   * @param  {Object} [options]
   * @param  {Function} [customizer=browserifyGruntCustomizer]
   *         If the default array-concatenation behavior is not desireable,
   *         pass _.noop or a unique customizer (https://lodash.com/docs#merge).
   *
   * @return {Object}
   */
  const browserifyGruntOptions = gruntOptionsMaker(browserifyGruntDefaults, browserifyGruntCustomizer);

  const githubReleaseCustomizer = gruntCustomizer;
  const githubReleaseOptions = gruntOptionsMaker(githubReleaseDefaults, githubReleaseCustomizer);

  /**
   * Creates processor functions for license banners.
   *
   * @function createLicenseProcessor
   * @private
   * @param  {Object} data Custom data overriding `bannerCommonData`. Will
   *                       not be mutated.
   * @return {Function}    A function which returns a processed grunt template
   *                       using an object constructed from `bannerCommonData`
   *                       and the `data` argument.
   */
  function createLicenseProcessor(data) {
    return () => {
      return grunt.template.process(license, {
        data: _.merge({}, bannerCommonData, data)
      });
    };
  }

  version.majorMinor = `${version.major}.${version.minor}`;
  grunt.vjsVersion = version;

  // Project configuration.
  grunt.initConfig({
    pkg,
    clean: {
      build: ['build/temp/*'],
      dist: ['dist/*']
    },
    jshint: {
      src: {
        src: ['src/js/**/*.js', 'Gruntfile.js', 'test/unit/**/*.js'],
        options: {
          jshintrc: '.jshintrc'
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIn: 'build/temp/video.js.map',
        sourceMapRoot: '../../src/js',
        preserveComments: 'some',
        mangle: true,
        compress: {
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true
        }
      },
      build: {
        files: [
          {nonull: true, dest: 'build/temp/alt/video.novtt.min.js',src: 'build/temp/alt/video.novtt.js'},
          {nonull: true, dest: 'build/temp/alt/videojs.novtt.hls.min.js', src: 'build/temp/alt/videojs.novtt.hls.js'},
          {nonull: true, dest: 'build/temp/alt/videojs.novtt.osmf.min.js', src: 'build/temp/alt/videojs.novtt.osmf.js'},
          {nonull: true, dest: 'build/temp/origin/video.min.js', src: 'build/temp/origin/video.js'},
          {nonull: true, dest: 'build/temp/video.min.js', src: 'build/temp/video.js'},
          {nonull: true, dest: 'build/temp/videojs.hls.min.js', src: 'build/temp/videojs.hls.js'},
          {nonull: true, dest: 'build/temp/videojs.osmf.min.js', src: 'build/temp/videojs.osmf.js'},
        ]
      }
    },
    dist: {},
    watch: {
      novtt: {
        files: ['build/temp/video.basic.js'],
        tasks: ['concat:novtt']
      },
      minify: {
        files: ['build/temp/video.basic.js'],
        tasks: ['uglify']
      },
      skin: {
        files: ['src/css/**/*'],
        tasks: ['sass']
      },
      jshint: {
        files: ['src/**/*', 'test/unit/**/*.js', 'Gruntfile.js'],
        tasks: 'jshint'
      }
    },
    connect: {
      dev: {
        options: {
          port: Number(process.env.VJS_CONNECT_PORT) || 9999,
          livereload: true,
          useAvailablePort: true
        }
      }
    },
    copy: {
      minor: {
        files: [
          {expand: true, cwd: 'build/temp/', src: ['*'], dest: 'dist/'+version.majorMinor+'/', filter: 'isFile'} // includes files in path
        ]
      },
      patch: {
        files: [
          {expand: true, cwd: 'build/temp/', src: ['*'], dest: 'dist/'+version.full+'/', filter: 'isFile'} // includes files in path
        ]
      },
      fonts: { cwd: 'node_modules/videojs-font/fonts/', src: ['*'], dest: 'build/temp/font/', expand: true, filter: 'isFile' },
      swf:   { cwd: 'node_modules/@hola.org/videojs-swf/dist/', src: 'video-js.swf', dest: 'build/temp/', expand: true, filter: 'isFile' },
      osmf:   { cwd: 'node_modules/@hola.org/videojs-osmf/dist/', src: 'videojs-osmf.swf', dest: 'build/temp/', expand: true, filter: 'isFile' },
      ie8:   { cwd: 'node_modules/videojs-ie8/dist/', src: ['**/**'], dest: 'build/temp/ie8/', expand: true, filter: 'isFile' },
      dist:  { cwd: 'build/temp/', src: ['**/**', '!test*', '!video.basic.js'], dest: 'dist/', expand: true, filter: 'isFile' },
      examples: { cwd: 'docs/examples/', src: ['**/**'], dest: 'dist/examples/', expand: true, filter: 'isFile' }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: 'build/temp/',
        src: ['video-js.css', 'alt/video-js-cdn.css'],
        dest: 'build/temp/',
        ext: '.min.css'
      },
      origin: {
        expand: true,
        cwd: 'build/temp/origin/',
        src: ['video-js.css'],
        dest: 'build/temp/origin/',
        ext: '.min.css'
      },
    },
    sass: {
      build: {
        files: [
          {nonull: true, dest: 'build/temp/video-js.css', src: 'src/css/vjs.scss'},
          {nonull: true, dest: 'build/temp/alt/video-js-cdn.css', src: 'src/css/vjs-cdn.scss'}
        ]
      }
    },
    karma: {
      // this config file applies to all following configs except if overwritten
      options: {
        configFile: 'test/karma.conf.js'
      },

      defaults: {
        detectBrowsers: {
          enabled: !process.env.TRAVIS,
          usePhantomJS: false
        }
      },

      watch: {
        autoWatch: true,
        singleRun: false
      },

      // these are run locally on local browsers
      dev: { browsers: ['Chrome', 'Firefox', 'Safari'] },
      chromecanary: { browsers: ['ChromeCanary'] },
      chrome:       { browsers: ['Chrome'] },
      firefox:      { browsers: ['Firefox'] },
      safari:       { browsers: ['Safari'] },
      ie:           { browsers: ['IE'] },

      // this only runs on PRs from the mainrepo on BrowserStack
      browserstack: { browsers: ['chrome_bs'] },
      chrome_bs:    { browsers: ['chrome_bs'] },
      firefox_bs:   { browsers: ['firefox_bs'] },
      safari_bs:    { browsers: ['safari_bs'] },
      ie11_bs:      { browsers: ['ie11_bs'] },
      ie10_bs:      { browsers: ['ie10_bs'] },
      ie9_bs:       { browsers: ['ie9_bs'] },
      ie8_bs:       { browsers: ['ie8_bs'] }
    },
    vjsdocs: {
      all: {
        // TODO: Update vjsdocs to support new build, or switch to jsdoc
        src: '',
        dest: 'docs/api',
        options: {
          baseURL: 'https://github.com/videojs/video.js/blob/master/'
        }
      }
    },
    vjslanguages: {
      defaults: {
        files: {
          'build/temp/lang': ['lang/*.json']
        }
      }
    },
    zip: {
      dist: {
        router: function (filepath) {
          var path = require('path');
          return path.relative('dist', filepath);
        },
        // compression: 'DEFLATE',
        src: ['dist/**/*'],
        dest: 'dist/videojs-full-' + version.full + '.zip'
      },
      basic: {
        router: function (filepath) {
          var path = require('path');
          return path.relative('dist', filepath);
        },
        src: [
          'dist/video.js',
          'dist/video.min.js',
          'dist/video.js.map',
          'dist/video-js.css',
          'dist/video-js.min.css',
          'dist/video-js.swf',
        ],
        dest: 'dist/videojs-' + version.full + '.zip'
      },
      hls: {
        router: function (filepath) {
          var path = require('path');
          return path.relative('dist', filepath);
        },
        src: [
          'dist/videojs.hls.js',
          'dist/videojs.hls.min.js',
          'dist/videojs.hls.min.js.map',
          'dist/video-js.css',
          'dist/video-js.min.css',
          'dist/video-js.swf',
        ],
        dest: 'dist/videojs-hls-' + version.full + '.zip'
      },
      osmf: {
        router: function (filepath) {
          var path = require('path');
          return path.relative('dist', filepath);
        },
        src: [
          'dist/videojs.osmf.js',
          'dist/videojs.osmf.min.js',
          'dist/videojs.osmf.min.js.map',
          'dist/video-js.css',
          'dist/video-js.min.css',
          'dist/video-js.swf',
          'dist/videojs-osmf.swf',
        ],
        dest: 'dist/videojs-osmf-' + version.full + '.zip'
      },
    },
    version: {
      options: {
        pkg: 'package.json'
      },
      major: {
        options: {
          release: 'major'
        },
        src: ['package.json', 'component.json']
      },
      minor: {
        options: {
          release: 'minor'
        },
        src: ['package.json', 'component.json']
      },
      patch: {
        options: {
          release: 'patch'
        },
        src: ['package.json', 'component.json']
      },
      prerelease: {
        options: {
          release: 'prerelease'
        },
        src: ['package.json', 'component.json']
      },
      css: {
        options: {
          prefix: '@version\\s*'
        },
        src: 'build/temp/video-js.css'
      }
    },
    'github-release': {
      options: {
        repository: 'videojs/video.js',
        auth: {
          user: process.env.VJS_GITHUB_USER,
          password: process.env.VJS_GITHUB_TOKEN
        }
      },
      files: {
        src: [ // Files that you want to attach to Release
          `dist/videojs-full-${version.full}.zip`,
          `dist/videojs-${version.full}.zip`,
          `dist/videojs-hls-${version.full}.zip`,
          `dist/videojs-osmf-${version.full}.zip`,
        ]
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          standalone: 'videojs'
        },
        plugin: [
          ['browserify-derequire']
        ],
        transform: [
          require('babelify').configure({
            sourceMapRelative: './',
            loose: ['all']
          }),
          ['browserify-versionify', {
            placeholder: '__VERSION__',
            version: pkg.version
          }],
          ['browserify-versionify', {
            placeholder: '__VERSION_NO_PATCH__',
            version: version.majorMinor
          }],
          ['browserify-versionify', {
            placeholder: '__SWF_VERSION__',
            version: pkg.dependencies['@hola.org/videojs-swf'].match(
              />=([^ ]+)/)[1]
          }]
        ]
      },
      build: {
        files: {
          'build/temp/video.basic.js': ['src/js/video.js']
        }
      },
      dist: {
        options: browserifyGruntOptions({
          transform: [
            ['browserify-versionify', {
              placeholder: '../node_modules/videojs-vtt.js/dist/vtt.js',
              version: 'https://cdn.rawgit.com/gkatsev/vtt.js/vjs-v0.12.1/dist/vtt.min.js'
            }],
          ]
        }),
        files: {
          'build/temp/video.basic.js': ['src/js/video.js']
        }
      },
      watch: {
        options: {
          watch: true,
          keepAlive: true
        },
        files: {
          'build/temp/video.basic.js': ['src/js/video.js']
        }
      },
      tests: {
        options: {
          browserifyOptions: {
            debug: true,
            standalone: false
          },
          plugin: [
            ['proxyquireify/plugin']
          ],
          banner: false,
          watch: true,
          keepAlive: true
        },
        files: {
          'build/temp/tests.js': [
            'test/globals-shim.js',
            'test/unit/**/*.js'
          ]
        }
      }
    },
    exorcise: {
      build: {
        options: {},
        files: {
          'build/temp/video.js.map': ['build/temp/video.basic.js'],
        }
      }
    },
    coveralls: {
      options: {
        // warn instead of failing when coveralls errors
        // we've seen coveralls 503 relatively frequently
        force: true
      },
      all: {
        src: 'test/coverage/lcov.info'
      }
    },
    concat: {
      novtt: {
        options: {
          separator: '\n'
        },
        src: ['build/temp/video.basic.js'],
        dest: 'build/temp/alt/video.novtt.js',
        nonull: true,
      },
      vtt: {
        options: {
          separator: '\n',
        },
        src: ['build/temp/video.basic.js', 'node_modules/vtt.js/dist/vtt.js'],
        dest: 'build/temp/video.basic.js',
        nonull: true,
      },
      hola: {
        options: {
          separator: '\n',
          nonull: true,
        },
        files: [
          {nonull: true, dest: 'build/temp/origin/video.js', src: ['build/temp/video.basic.js']},
          {nonull: true, dest: 'build/temp/origin/videojs-hola-skin.js', src: ['node_modules/@hola.org/videojs-hola-skin/dist/js/videojs-hola-skin.js']},
          {nonull: true, dest: 'build/temp/origin/videojs-settings.js', src: ['node_modules/@hola.org/videojs-settings/dist/videojs-settings.js']},
          {nonull: true, dest: 'build/temp/origin/videojs.thumbnails.js', src: ['node_modules/@hola.org/videojs-thumbnails/videojs.thumbnails.js']},
          {nonull: true, dest: 'build/temp/origin/videojs-utils.js', src: ['node_modules/@hola.org/videojs-utils/dist/videojs-utils.js']},
          {nonull: true, dest: 'build/temp/video.basic.js', src: [
            'build/temp/video.basic.js',
            'node_modules/@hola.org/videojs-hola-skin/dist/js/videojs-hola-skin.js',
            'node_modules/@hola.org/videojs-settings/dist/videojs-settings.js',
            'node_modules/@hola.org/videojs-thumbnails/videojs.thumbnails.js',
            'node_modules/@hola.org/videojs-utils/dist/videojs-utils.js',
          ]},
          {nonull: true, dest: 'build/temp/alt/video.novtt.js', src: [
            'build/temp/alt/video.novtt.js',
            'node_modules/@hola.org/videojs-hola-skin/dist/js/videojs-hola-skin.js',
            'node_modules/@hola.org/videojs-settings/dist/videojs-settings.js',
            'node_modules/@hola.org/videojs-thumbnails/videojs.thumbnails.js',
            'node_modules/@hola.org/videojs-utils/dist/videojs-utils.js',
          ]},
        ],
      },
      hola_plugins: {
        options: {
          separator: '\n',
          nonull: true,
        },
        files: [
          // default versions
          {nonull: true, dest: 'build/temp/video.js', src: [
            'build/temp/video.basic.js',
            'node_modules/@hola.org/videojs-contrib-media-sources/dist/videojs-contrib-media-sources.js',
          ]},
          {nonull: true, dest: 'build/temp/origin/videojs.hls.js', src: ['node_modules/@hola.org/videojs-contrib-hls/dist/videojs-contrib-hls.js']},
          {nonull: true, dest: 'build/temp/origin/videojs-osmf.js', src: ['node_modules/@hola.org/videojs-osmf/dist/videojs-osmf.js']},
          {nonull: true, dest: 'build/temp/videojs.hls.js', src: [
            'build/temp/video.basic.js',
            'node_modules/@hola.org/videojs-contrib-hls/dist/videojs-contrib-hls.js',
          ]},
          {nonull: true, dest: 'build/temp/videojs.osmf.js', src: [
            'build/temp/video.basic.js',
            'node_modules/@hola.org/videojs-contrib-media-sources/dist/videojs-contrib-media-sources.js',
            'node_modules/@hola.org/videojs-osmf/dist/videojs-osmf.js',
          ]},
          // novtt versions
          {nonull: true, dest: 'build/temp/alt/video.novtt.js', src: [
            'build/temp/alt/video.novtt.js',
            'node_modules/@hola.org/videojs-contrib-media-sources/dist/videojs-contrib-media-sources.js',
          ]},
          {nonull: true, dest: 'build/temp/alt/videojs.novtt.hls.js', src: [
            'build/temp/alt/video.novtt.js',
            'node_modules/@hola.org/videojs-contrib-hls/dist/videojs-contrib-hls.js',
          ]},
          {nonull: true, dest: 'build/temp/alt/videojs.novtt.osmf.js', src: [
            'build/temp/alt/video.novtt.js',
            'node_modules/@hola.org/videojs-contrib-media-sources/dist/videojs-contrib-media-sources.js',
            'node_modules/@hola.org/videojs-osmf/dist/videojs-osmf.js',
          ]},
        ],
      },
      css: {
        options: {
          separator: '\n',
          nonull: true,
        },
        files: [
          {nonull: true, dest: 'build/temp/origin/video-js.css', src: ['build/temp/video-js.css']},
          {nonull: true, dest: 'build/temp/origin/videojs-hola-skin.css', src: ['node_modules/@hola.org/videojs-hola-skin/dist/css/videojs-hola-skin.css']},
          {nonull: true, dest: 'build/temp/origin/videojs.thumbnails.css', src: ['node_modules/@hola.org/videojs-thumbnails/videojs.thumbnails.css']},
          {nonull: true, dest: 'build/temp/video-js.css', src: [
            'build/temp/video-js.css',
            'node_modules/@hola.org/videojs-hola-skin/dist/css/videojs-hola-skin.css',
            'node_modules/@hola.org/videojs-thumbnails/videojs.thumbnails.css',
          ]},
        ],
      },
    },
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      // Run multiple watch tasks in parallel
      // Needed so watchify can cache intelligently
      watchAll: [
        'watch',
        'browserify:watch',
        'browserify:tests',
        'karma:watch'
      ],
      watchSandbox: [
        'watch',
        'browserify:watch'
      ]
    },
    usebanner: {
      novtt: {
        options: {
          process: createLicenseProcessor({includesVtt: false})
        },
        files: {
          src: ['build/temp/alt/video.novtt.js']
        }
      },
      vtt: {
        options: {
          process: createLicenseProcessor({includesVtt: true})
        },
        files: {
          src: ['build/temp/video.basic.js']
        }
      }
    },
    shell: {
      github: {
        command: [
          'git checkout -b tag-v'+version.full,
          'npm run build',
          'git add -f dist',
          'git commit -m "add dist v'+version.full+'"',
          'git tag -a v'+version.full+' -m "v'+version.full+'"',
          'git checkout master',
          'git branch -D tag-v'+version.full,
          'git push --tags origin'
        ].join('&&')
      }
    }
  });

  // load all the npm grunt tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('videojs-doc-generator');
  grunt.loadNpmTasks('chg');

  const buildDependents = [
    'clean:build',

    'jshint',
    'browserify:build',
    'exorcise:build',
    'concat:novtt',
    'concat:vtt',
    'usebanner:novtt',
    'usebanner:vtt',
    'concat:hola',
    'concat:hola_plugins',
    'uglify',

    'sass',
    'version:css',
    'concat:css',
    'cssmin',

    'copy:fonts',
    'copy:swf',
    'copy:osmf',
    'copy:ie8',
    'vjslanguages'
  ];

  grunt.registerTask('build', buildDependents);

  grunt.registerTask(
    'build:dist',
    buildDependents.map(task => task === 'browserify:build' ? 'browserify:dist' : task)
  );

  grunt.registerTask('dist', [
    'clean:dist',
    'build:dist',
    'copy:dist',
    'copy:examples',
  ]);

  grunt.registerTask('zip', [
    'zip:dist',
    'zip:basic',
    'zip:hls',
    'zip:osmf',
  ]);

  grunt.registerTask('release', ['shell:github']);

  grunt.registerTask('skin', ['sass']);

  // Default task - build and test
  grunt.registerTask('default', ['dist']);

  grunt.registerTask('test', ['dist', 'karma:defaults']);

  // Run while developing
  grunt.registerTask('dev', ['build', 'connect:dev', 'concurrent:watchSandbox']);

  grunt.registerTask('watchAll', ['build', 'connect:dev', 'concurrent:watchAll']);

  // Pick your testing, or run both in different terminals
  grunt.registerTask('test-ui', ['browserify:tests']);
  grunt.registerTask('test-cli', ['karma:watch']);

  // Load all the tasks in the tasks directory
  grunt.loadTasks('build/tasks');
};
