/*global module:false*/
module.exports = function(grunt) {

  var failOnJsHintErrors = grunt.option('failOnJsHintErrors') === true;

  function startExpress() {
    var express = require('express');
    var app = express();
    app.use(express.static(__dirname));
    var harp = require('harp');
    app.use('/math-input/dist', express.static(__dirname + '/dist'));
    app.use('/math-input/bower_components', express.static(__dirname + '/bower_components'));
    app.use('/math-input', express.static(__dirname + '/site'));
    app.use('/math-input', harp.mount(__dirname + '/site'));
    //app.use(require('connect-livereload')());

    app.get('/', function (req, res) {
      res.send('Hello World!');
    });

    var server = app.listen(3000, function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Example app listening at http://%s:%s', host, port);
    });
  }

  // Project configuration.
  var config = {
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',

    // Task configuration.
    clean: {
      css: ['dist/*.css'],
      js: ['dist/*.js'],
      mathquill: ['dist/mathquill']
    },

    less: {
      development: {
        options: {
          paths: ['src/css'],
          compress: true
        },
        files: {
          'dist/<%= pkg.name %>.css': 'src/css/math-input.less'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: !failOnJsHintErrors
      },
      main: ['Gruntfile.js','src/js/**/*.js']
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      dist: {
        src: ['src/js/**/_declaration.js', 'src/js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    exec: {
      'make-mathquill': {
          cmd: 'make -C bower_components/mathquill'
      }
    },

    copy: {
      mathquill: {
        files: [{
          expand: true,
          cwd: 'bower_components/mathquill/build/',
          src: ['**'],
          dest: 'dist/mathquill/'
        }]
      },
    },

    watch: {
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['js']
      },
      css: {
        files: ['src/css/**/*.less'],
        tasks: ['css']
      }
    },

    open: {
      index: {
        path: 'http://localhost:3000/math-input/index.html'
      }
    }
  };

  grunt.initConfig(config);

  // These plugins provide necessary tasks.
  var npmTasks = [
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-jshint',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-copy',
    'grunt-contrib-watch',
    'grunt-exec',
    'grunt-open'
  ];

  npmTasks.forEach(grunt.loadNpmTasks);

  // Custom tasks.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['js', 'css', 'mathquill']);
  grunt.registerTask('css', ['clean:css', 'less']);
  grunt.registerTask('js', ['clean:js', 'jshint', 'concat', 'uglify']);
  grunt.registerTask('mathquill', ['clean:mathquill', 'exec:make-mathquill', 'copy:mathquill']);
  grunt.registerTask('run', ['build', 'start-express', 'open', 'watch']);
  //grunt.registerTask('run-site-only', ['start-express', 'express-keepalive']);
  grunt.registerTask('start-express', startExpress);
  //grunt.registerTask('test', ['karma:once']);
};
