'use strict';

var pathUtil = require('path');
var Q = require('q');
var gulp = require('gulp');
var rollup = require('rollup');
var less = require('gulp-less');
var jetpack = require('fs-jetpack');

var watch = require('gulp-watch');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var gulpLoadPlugins = require('gulp-load-plugins');

var $ = gulpLoadPlugins();

var BrowserSync = require('browser-sync');
var browserSync = BrowserSync.create();

var utils = require('./utils');
var generateSpecsImportFile = require('./generate_specs_import');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

var paths = {
    copyFromAppDir: [
        './node_modules/**',
        './vendor/**',
        './**/*.html',
        'fonts/**',
        'icon.png',
        './components/**'
    ],
}

var options = {
    ui: false,
    // Port 35829 = LiveReload's default port 35729 + 100.
    // If the port is occupied, Browsersync uses next free port automatically.
    port: 35829,
    ghostMode: false,
    open: false,
    notify: true,
    logSnippet: false,
    socket: {
      // Use the actual port here.
      domain: 'http://localhost:35829'
    }
}

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function(callback) {
    return destDir.dirAsync('.', { empty: true });
});


var copyTask = function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: paths.copyFromAppDir
    });
};

gulp.task('copy', ['clean'], copyTask);
//gulp.task('copy-watch', copyTask);

gulp.task('copy-watch', function(){
    return gulp.src(srcDir.path() + 'app/**/*.html', {base: srcDir.path()})        
        .pipe(watch(srcDir.path(), {base: srcDir.path()}))
        .pipe(gulp.dest(destDir.path(), {overwrite: true}))
        .pipe($.if(browserSync.active, browserSync.stream()));
});

var bundle = function (src, dest) {
    var deferred = Q.defer();

    rollup.rollup({
        entry: src
    }).then(function (bundle) {
        var jsFile = pathUtil.basename(dest);
        var result = bundle.generate({
            format: 'iife',
            sourceMap: true,
            sourceMapFile: jsFile,
        });
        return Q.all([
            destDir.writeAsync(dest, result.code + '\n//# sourceMappingURL=' + jsFile + '.map'),
            destDir.writeAsync(dest + '.map', result.map.toString()),
        ]);
    }).then(function () {
        deferred.resolve();
    }).catch(function (err) {
        console.error('build: Error during rollup', err.stack);
    });

    return deferred.promise;
};

var bundleApplication = function () {
    return Q.all([
        bundle(srcDir.path('background.js'), destDir.path('background.js')),
        bundle(srcDir.path('app.js'), destDir.path('app.js')),
        bundle(srcDir.path('router.js'), destDir.path('router.js')),
    ]);
};

var bundleSpecs = function () {
    generateSpecsImportFile().then(function (specEntryPointPath) {
        return Q.all([
            bundle(srcDir.path('background.js'), destDir.path('background.js')),
            bundle(specEntryPointPath, destDir.path('spec.js')),
        ]);
    });
};

var bundleTask = function () {
    if (utils.getEnvName() === 'test') {
        return bundleSpecs();
    }
    return bundleApplication();
};
gulp.task('bundle', ['clean'], bundleTask);
//gulp.task('bundle-watch', bundleTask);

gulp.task('bundle-watch', function(){
    return gulp.src(srcDir.path() + 'app/**/*.js', {base: srcDir.path()})        
        .pipe(watch(srcDir.path(), {base: srcDir.path()}))
        .pipe(gulp.dest(destDir.path(), {overwrite: true}))
        .pipe($.if(browserSync.active, browserSync.stream()));
});

var lessTask = function () {
    return gulp.src('app/stylesheets/main.less')    
    .pipe(less())
    .pipe(gulp.dest(destDir.path('stylesheets')))
    .pipe($.if(browserSync.active, browserSync.stream()));
};

gulp.task('less', ['clean'], lessTask);
gulp.task('less-watch', lessTask);


gulp.task('finalize', ['clean'], function () {
    var manifest = srcDir.read('package.json', 'json');
    // Add "dev" or "test" suffix to name, so Electron will write all data
    // like cookies and localStorage in separate places for each environment.
    switch (utils.getEnvName()) {
        case 'development':
            manifest.name += '-dev';
            manifest.productName += ' Dev';
            break;
        case 'test':
            manifest.name += '-test';
            manifest.productName += ' Test';
            break;
    }
    destDir.write('package.json', manifest);

    var configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json');
    destDir.copy(configFilePath, 'env_config.json');
});

gulp.task('watch', function cb() {

   browserSync.init(options, function(err, bs){
        if(err){
            return cb(err);
        }

        browserSync.watch('app/**/*.js')
            .on('change', function(){
                gulp.start('bundle-watch');
        });

        browserSync.watch('app/**/*.html')
            .on('change', function(){
                gulp.start('copy-watch');
        });

        browserSync.watch('app/stylesheets/main.less')
            .on('change', function(){
                gulp.start('less-watch');
        });

      
    });

});


gulp.task('build', ['bundle', 'less', 'copy', 'finalize']);