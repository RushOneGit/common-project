var autoPrefixBrowserList = ['last 2 version'];
var gulp                  = require('gulp');
var gutil                 = require('gulp-util');
var concat                = require('gulp-concat');
var sass                  = require('gulp-sass');
var imagemin              = require('gulp-imagemin');
var browserSync           = require('browser-sync');
var autoprefixer          = require('gulp-autoprefixer');
var gulpSequence          = require('gulp-sequence').use(gulp);
var plumber               = require('gulp-plumber');
var gcmq                  = require('gulp-group-css-media-queries');
var svgstore              = require('gulp-svgstore');
var svgmin                = require('gulp-svgmin');
var useref                = require('gulp-useref');
var gulpif                = require('gulp-if');
var clean                 = require('gulp-clean');
var cache                 = require('gulp-cache');


gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: "app/",
			directory: true
		},
		options: {
			reloadDelay: 250
		},

		notify: true
	});
});

gulp.task('svgsprite', function () {
	return gulp
		.src('app/images/icons/*.svg')
		.pipe(svgmin({
			plugins: [{
					removeDoctype: false
				}, {
					removeComments: false
				}, {
				cleanupNumericValues: {
					floatPrecision: 2
				}
				}, {
				convertColors: {
					names2hex: false,
					rgb2hex: false
				}
				}]
		}))
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(gulp.dest('app/images'));
});

gulp.task('images', function() {
	gulp.src('dist/images/*.{png, jpg, gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('svg-images', function() {
	gulp.src('dist/images/*.svg')
		.pipe(plumber())
		.pipe(svgmin({
			plugins: [{
					removeDoctype: false
				}, {
					removeComments: false
				}, {
				cleanupNumericValues: {
					floatPrecision: 2
				}
				}, {
				convertColors: {
					names2hex: false,
					rgb2hex: false
				}
				}]
		}))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('images-deploy', function() {
	gulp.src(['app/images/**/*', '!app/images/README'])
		.pipe(plumber())
		.pipe(gulp.dest('dist/images'));
});

gulp.task('js', function() {
	return gulp.src('app/js/**/*.js')
		.pipe(plumber())
		.on('error', gutil.log)
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('js-deploy', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		/*.pipe(gulpif('*.js', concat('jquery.main.js')))*/
		.pipe(gulpif('*.js', gulp.dest('dist/')))
		.pipe(gulpif('*.html', gulp.dest('dist/')))
});

gulp.task('scss', function() {
	return gulp.src('app/scss/main.scss')
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(sass({
			errLogToConsole: true,
			includePaths: [
				'app/scss/'
			]
		}))
		.pipe(autoprefixer({
			browsers: autoPrefixBrowserList,
			cascade:  true
		}))
		.on('error', gutil.log)
		.pipe(gcmq())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('css-deploy', function() {

	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpif('*.css', concat('main.css')))
		.pipe(gulpif('*.css', gcmq()))
		.pipe(gulpif('*.css', gulp.dest('dist/css')))

});

gulp.task('html', function() {
	return gulp.src('app/*.html')
		.pipe(plumber())
		.pipe(browserSync.reload({stream: true}))
		.on('error', gutil.log);
});

gulp.task('folder-deploy', function() {
	gulp.src('app/*.json')
		.pipe(gulp.dest('dist'));

	gulp.src('app/video')
		.pipe(gulp.dest('dist/video'));

	gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	gulp.src('app/scss/**/*')
		.pipe(gulp.dest('dist/scss'));
});

gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
		.pipe(clean());
});

gulp.task('clear-cache', function (done) {
	return cache.clearAll(done);
});


gulp.task('default', ['browserSync', 'js', 'scss', 'html'], function() {
	gulp.watch('app/js/**/**', ['js']);
	gulp.watch('app/scss/**', ['scss']);
	gulp.watch('app/*.html', ['html']);
});

gulp.task('deploy', gulpSequence('clear-cache', 'clean', ['folder-deploy', 'js-deploy', 'css-deploy', 'images-deploy', 'images', 'svg-images']));
