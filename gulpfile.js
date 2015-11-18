var gulp = require('gulp');
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();
var karma = require('gulp-karma');
var Server = require('karma').Server;

var paths = {
  scripts: ['./public/**/*.js', '!public/libs/**/*', '!public/test/**/*'],
  testScripts: ['./public/test/**/*.spec.js'],
  styles: ['./public/**/*.css'],
  index: './public/index.html',
  partials: ['public/**/*.html', '!public/index.html'],
  images: './public/images/**/*',
  fonts: './public/fonts/**/*',
  distDev: './dist.dev',
  distProd: './dist.prod',
  distScriptsProd: './dist.prod/scripts',
  scriptsDevServer: './app/**/*.js'
};

var pipes = {};

pipes.orderedVendorScripts = function() {
  return plugins.order(['jquery.js', 'angular.js', 'angular-animate.js', 'angular-aria.js', 'angular-material.js', 'angular-ui-router.js']);
};

pipes.orderedAppScripts = function() {
  return plugins.angularFilesort();
};


pipes.minifiedFileName = function() {
  return plugins.rename(function(path) {
    path.extname = '.min' + path.extname;
  });
};

pipes.validatedTestScripts = function() {
  return gulp.src(paths.testScripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
};

pipes.builtTestScripts = function() {
  return pipes.validatedTestScripts()
    .pipe(gulp.dest(paths.distDev + '/test/'));
};

pipes.validatedAppScripts = function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
};

pipes.builtAppScriptsDev = function() {
  return pipes.validatedAppScripts()
    .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
  var scriptedPartials = pipes.scriptedPartials();
  var validatedAppScripts = pipes.validatedAppScripts();

  return es.merge(scriptedPartials, validatedAppScripts)
    .pipe(pipes.orderedAppScripts())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('app.min.js'))
    .pipe(plugins.uglify().on('error', gutil.log))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.scriptedPartials = function() {
  return pipes.validatedPartials()
    .pipe(plugins.htmlhint.failReporter())
    .pipe(plugins.htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(plugins.ngHtml2js({
      moduleName: "docManagerApp",
      declareModule: false
    }));
};

pipes.builtVendorScriptsDev = function() {
  return gulp.src(bowerFiles())
    .pipe(gulp.dest('dist.dev/libs'));
};

pipes.builtVendorScriptsProd = function() {
  return gulp.src(bowerFiles('**/*.js'))
    .pipe(pipes.orderedVendorScripts())
    .pipe(plugins.concat('vendor.min.js'))
    .pipe(plugins.uglify().on('error', gutil.log))
    .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.validatedDevServerScripts = function() {
  return gulp.src(paths.scriptsDevServer)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
};

pipes.validatedPartials = function() {
  return gulp.src(paths.partials)
    .pipe(plugins.htmlhint({
      'doctype-first': false
    }))
    .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
  return pipes.validatedPartials()
    .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesDev = function() {
  return gulp.src(paths.styles)
    .pipe(plugins.sass())
    .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
  return gulp.src(paths.styles)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.minifyCss())
    .pipe(plugins.sourcemaps.write())
    .pipe(pipes.minifiedFileName())
    .pipe(gulp.dest(paths.distProd));
};


pipes.processedImagesDev = function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distDev + '/images/'));
};

pipes.processedFontsDev = function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.distDev + '/fonts/'));
};

pipes.processedImagesProd = function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distProd + '/images/'));
};

pipes.processedFontsProd = function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.distProd + '/fonts/'));
};


pipes.validatedIndex = function() {
  return gulp.src(paths.index)
    .pipe(plugins.htmlhint())
    .pipe(plugins.htmlhint.reporter());
};

pipes.builtIndexDev = function() {

  var orderedVendorScripts = pipes.builtVendorScriptsDev()
    .pipe(pipes.orderedVendorScripts());

  var orderedAppScripts = pipes.builtAppScriptsDev()
    .pipe(pipes.orderedAppScripts());

  var appStyles = pipes.builtStylesDev();

  return pipes.validatedIndex()
    .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
    .pipe(plugins.inject(orderedVendorScripts, {
      relative: true,
      name: 'bower'
    }))
    .pipe(plugins.inject(orderedAppScripts, {
      relative: true
    }))
    .pipe(plugins.inject(appStyles, {
      relative: true
    }))
    .pipe(gulp.dest(paths.distDev));
};

pipes.builtIndexProd = function() {

  var vendorScripts = pipes.builtVendorScriptsProd();
  var appScripts = pipes.builtAppScriptsProd();
  var appStyles = pipes.builtStylesProd();

  return pipes.validatedIndex()
    .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
    .pipe(plugins.inject(vendorScripts, {
      relative: true,
      name: 'bower'
    }))
    .pipe(plugins.inject(appScripts, {
      relative: true
    }))
    .pipe(plugins.inject(appStyles, {
      relative: true
    }))
    .pipe(plugins.htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
  return es.merge(pipes.builtIndexDev(), pipes.builtPartialsDev(), pipes.processedImagesDev(), pipes.processedFontsDev());
};

pipes.builtAppProd = function() {

  return es.merge(pipes.builtIndexProd(), pipes.processedImagesProd(), pipes.processedFontsProd());
};

// removes all compiled dev files
gulp.task('clean-dev', function() {
  return del(paths.distDev).then(function(paths) {

  });
});

// removes all compiled prod files
gulp.task('clean-prod', function() {
  return del(paths.distProd).then(function(paths) {

  });
});

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev', 'validate-devserver-scripts'], function() {

  // start nodemon to auto-reload the dev server
  plugins.nodemon({
      script: 'server.js',
      ext: 'js',
      watch: ['app/'],
      env: {
        NODE_ENV: 'development'
      }
    })
    .on('change', ['validate-devserver-scripts'])
    .on('restart', function() {
      console.log('[nodemon] restarted server');
    });

  // start live-reload server
  plugins.livereload.listen({
    start: true
  });

  // watch index
  gulp.watch(paths.index, function() {
    return pipes.builtIndexDev()
      .pipe(plugins.livereload());
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppScriptsDev()
      .pipe(plugins.livereload());
  });

  // watch html partials
  gulp.watch(paths.partials, function() {
    return pipes.builtPartialsDev()
      .pipe(plugins.livereload());
  });

  // watch styles
  gulp.watch(paths.styles, function() {
    return pipes.builtStylesDev()
      .pipe(plugins.livereload());
  });

});

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod', 'validate-devserver-scripts'], function() {

  // start nodemon to auto-reload the dev server
  plugins.nodemon({
      script: 'server.js',
      ext: 'js',
      watch: ['app/'],
      env: {
        NODE_ENV: 'production'
      }
    })
    .on('change', ['validate-devserver-scripts'])
    .on('restart', function() {
      console.log('[nodemon] restarted dev server');
    });

  // start live-reload server
  plugins.livereload.listen({
    start: true
  });

  // watch index
  gulp.watch(paths.index, function() {
    return pipes.builtIndexProd()
      .pipe(plugins.livereload());
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppScriptsProd()
      .pipe(plugins.livereload());
  });

  // watch hhtml partials
  gulp.watch(paths.partials, function() {
    return pipes.builtAppScriptsProd()
      .pipe(plugins.livereload());
  });

  // watch styles
  gulp.watch(paths.styles, function() {
    return pipes.builtStylesProd()
      .pipe(plugins.livereload());
  });

});

gulp.task('built-test-scripts', ['clean-build-app-dev'], pipes.builtTestScripts);

/////////////////////////////////////////////////////////////////////////////////////
//
// runs karma tests
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('test', ['built-test-scripts'], function(done) {

  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);
