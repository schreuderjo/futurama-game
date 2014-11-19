var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    jest = require('gulp-jest'),
    react = require('gulp-react'),
    webpack = require('gulp-webpack'),
    del = require('del'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    envify = require('envify'),
    source = require('vinyl-source-stream'),
    runSequence = require('run-sequence'),
    stylish = require('jshint-stylish');

var env = process.env.NODE_ENV;
var paths = {
    styles: ['app/src/styles/**/*.scss'],
    scripts: ['app/src/js/**/*.js'],
    assets: ['app/src/assets/**/*'],
    sprites: ['app/src/styles/sprites/**/*']
};

var dependencies = Object.keys(require('./package.json').dependencies);
var appModules = [
    'actions',
    'constants',
    'dispatcher',
    'components',
    'stores',
    'utils'
]; 

// https://gist.github.com/Sigmus/9253068
function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'Error',
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end');
}

function bundleApp(watch) {
    var bundler = browserify({
        debug: env !== 'production',
        fullPaths: env !== 'production',
        transform: [reactify, envify],
        cache: {}, 
        packageCache: {}
    })
    .external(dependencies)
    .require(appModules)
    .add('./app/src/js/app.js');
    
    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', handleErrors)
        .pipe(source('app.js'))
        .pipe(gulp.dest('./app/public/js/'));
    }

    bundler = watch ? watchify(bundler) : bundler; 

    bundler.on('update', function() {
        var startTime = Date.now();
        gutil.log('Rebundling...');
        rebundle();
        gutil.log('Rebundled in ' + (Date.now() - startTime) + 'ms');
    });
    
    return rebundle();
}

gulp.task('bundle-vendor', function() {
    var bundle = browserify({
        debug: false,
        fullPaths: false
    }).require(dependencies).bundle();

    return bundle.on('error', handleErrors)
    .pipe(source('vendor.js'))
    .pipe(gulp.dest('app/public/js/'));
});

gulp.task('watchify', function() {
    return bundleApp(true); 
});

gulp.task('bundle-app', function() {
    return bundleApp(false);
});

gulp.task('css', function() {
    gulp.src('./app/src/styles/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/public/css'));
});

gulp.task('copy-assets', function() {
    return gulp.src(paths.assets)
    .pipe(gulp.dest('app/public/assets/'));
});

gulp.task('copy-sprites', function() {
    return gulp.src(paths.sprites)
    .pipe(gulp.dest('app/public/css/'));
});

gulp.task('nodemon', function() {
    return nodemon({
        script: 'server/main.js',
        ext: 'js html',
        ignore: __dirname + '/app/**/*.js',
    });
});

gulp.task('jshint', function() {
    gulp.src([
        'app/src/js/**/*.js'
    ])
    .pipe(react()
    .on('error', handleErrors))
    .pipe(jshint({
        browser: true,
        devel: false,
        globalstrict: true,
        es3: true,
        globals: {
            jest: true,
            it: true,
            expect: true, 
            describe: true,
            require: true,
            module: true,
            Promise: true,
            React: true
        } 
    }))
    .pipe(jshint.reporter(stylish));
});

gulp.task('uglify', function() {
    return gulp.src('app/public/js/app.js')
    .pipe(uglify({
        mangle: true
    }))
    .pipe(gulp.dest('app/dist/js/'));
});

gulp.task('minify', function() {
    return gulp.src('app/public/css/main.css')
    .pipe(minify({
    
    }))
    .pipe(gulp.dest('app/dist/css/'));
});

gulp.task('clean', function() {
    return del('app/dist/**/*', function(err) {
        if (err) { console.log(err); }
        else { console.log('Dist removed'); }
    });
});

gulp.task('test', function() {
    return gulp.src('app/src/js/')
    .pipe(jest({
        unmockedModulePathPatterns: [
            'node_modules/react'
        ],
        testDirectoryName: '__tests__',
        rootDir: './app/src/js'
    }));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['jshint']);
    gulp.watch(paths.styles, ['css']);
    gulp.watch(paths.assets, ['copy-assets']);
    gulp.watch(paths.sprites, ['copy-sprites']);
});

gulp.task('release', ['clean'], function(callback) {
    runSequence(
        'jshint',
        ['css', 'bundle-vendor', 'bundle-app'],
        ['uglify', 'minify'],
        [], // concat
        callback
    );
});

gulp.task('build', function(callback) {
    runSequence(
        ['bundle-vendor', 'watchify', 'css'],
        callback
    );
});

gulp.task('default', ['build'], function(callback) {
    runSequence('watch', 'nodemon', 'jshint', callback);
});
