var gulp = require('gulp'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    minify = require('gulp-minify-css'),
    jest = require('jest-cli'),
    react = require('gulp-react'),
    webpack = require('webpack'),
    del = require('del'),
    source = require('vinyl-source-stream'),
    runSequence = require('run-sequence'),
    stylish = require('jshint-stylish');

var env = process.env.NODE_ENV;

var paths = {
    styles: ['client/src/styles/**/*.scss'],
    scripts: ['client/src/js/**/*.js'],
    assets: ['client/src/assets/**/*'],
    sprites: ['client/src/styles/sprites/**/*']
};

var dependencies = Object.keys(require('./package.json').dependencies);

// https://gist.github.com/Sigmus/9253068
function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'Error',
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end');
}

gulp.task('webpack:release', function(callback) {
    webpack({
        cache: false,
        watch: false,
        entry: {
            app: './client/src/js/app',
            vendor: dependencies
        },
        output: {
            path: __dirname + '/dist/js',
            filename: 'app.js'
        },
        module: {
            loaders: [
                { test: /\.js$/, loader: 'jsx-loader' }
            ]
        },
        resolve: {
            root: __dirname + '/client/src/js'
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
            new webpack.DefinePlugin({
			    "process.env": {
				    // This has effect on the react lib size
				    "NODE_ENV": JSON.stringify("production")
			    }
		    }),
		    new webpack.optimize.DedupePlugin(),
		    new webpack.optimize.UglifyJsPlugin()
        ]
    }, function(err, stats) {
        if (err) {
             throw new gutil.PluginError("webpack:build-dev", err);
        }
		gutil.log("[webpack:build-dev]", stats.toString({colors: true}));
    })
})

gulp.task('webpack', function(callback) {
    webpack({
        cache: true,
        watch: true,
        watchDelay: 200,
        entry: {
            app: './client/src/js/app',
            vendor: dependencies
        },
        output: {
            path: __dirname + '/client/public/js',
            filename: 'app.js'
        },
        module: {
            loaders: [
                { test: /\.js$/,  loader: "jsx-loader" }
            ]
        },
        resolve: {
            root: __dirname + '/client/src/js'
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
        ]
    }, function(err, stats) {
        if (err) {
             throw new gutil.PluginError("webpack:build-dev", err);
        }
		gutil.log("[webpack:build-dev]", stats.toString({colors: true}));
    });
    callback();
});

gulp.task('css', function() {
    return gulp.src('./client/src/styles/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('client/public/css'));
});

gulp.task('copy-assets', function() {
    return gulp.src(paths.assets)
        .pipe(gulp.dest('client/public/assets/'));
});

gulp.task('copy-sprites', function() {
    return gulp.src(paths.sprites)
        .pipe(gulp.dest('client/public/css/'));
});

gulp.task('nodemon', function() {
    return nodemon({
        script: 'server/main.js',
        ext: 'js html',
        ignore: __dirname + '/client/**/*.js',
    });
});

gulp.task('jshint', function() {
    return gulp.src([
        'client/src/js/**/*.js'
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
                beforeEach: true,
                expect: true,
                describe: true,
                require: true,
                module: true,
                Promise: true,
                React: true
            }
        }))
        .pipe(notify({
            message: function (file) {
                if (file.jshint.success) {
                    return false;
                }

                var noConsoleErrors = file.jshint.results.filter(function (data) {
                    return !~data.error.reason.indexOf('\'console\' is not defined');
                });

                if (noConsoleErrors.length === 0) {
                    return false;
                }

                var errors = noConsoleErrors.map(function (data) {
                    if (data.error) {
                        return '\t' + data.error.line + ':' + data.error.character + ' ' + data.error.reason;
                    }
                });

                return file.relative + '\n' + errors ;
            },
            title: "JS Hint Error"
        }))
        .pipe(jshint.reporter(stylish));
});

gulp.task('minify', function() {
    return gulp.src('client/public/css/main.css')
        .pipe(minify())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('clean-public', function() {
    return del('client/public/**/*', function(err) {
        if (err) { gutil.log(err); }
    });
});

gulp.task('clean-dist', function() {
    return del('dist/**/*', function(err) {
        if (err) { gutil.log(err); }
    });
});

gulp.task('test', function(callback) {
    var onComplete = function (result) {
        if (result) {
        } else {
            gutil.log('!!! Jest tests failed! You should fix them soon. !!!');
        }
        callback();
    }

    jest.runCLI({}, __dirname + '/client/src/js', onComplete);
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['jshint']);
    gulp.watch(paths.styles, ['css']);
    gulp.watch(paths.assets, ['copy-assets']);
    gulp.watch(paths.sprites, ['copy-sprites']);
});

gulp.task('release', function(callback) {
    runSequence(
        ['clean-public', 'clean-dist'],
        ['css', 'jshint'],
        ['minify', 'webpack:release'],
        callback
    );
});

gulp.task('build', function(callback) {
    runSequence(
        ['clean-public'],
        ['webpack', 'css'],
        callback
    );
});

gulp.task('default', ['build'], function(callback) {
    runSequence('watch', 'nodemon', 'jshint', callback);
});
