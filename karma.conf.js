module.exports = function(config) {
  'use strict';
  config.set({

    frameworks: ['jasmine'],

    plugins: [
      'karma-jasmine',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-ie-launcher'
    ],

    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/undo.js/undo.js',
      'test/polyfill/bind.js',
      'src/js/**/_declaration.js',
      'src/js/**/*.js',
      'src/js/directives/**/*.js',
      'src/js/*-dom-*.js',
      'test/helpers/*.js',
      'test/**/*.spec.js'
    ],

    // list of files to exclude
    exclude: [

    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: ['progress'],

    // web server port
    port: 9876,


    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    //browsers: ['Chrome'],
    browsers: ['PhantomJS'],
    //browsers: ['Firefox'],
    //browsers: ['IE'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
