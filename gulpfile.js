const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const sequence = require('gulp-sequence');

const dir = './_book/';

//复制文件
gulp.task("copy", () => {
    return gulp.src(src + '**/*.*')
    	.pipe(gulp.dest(dest));
});


//js压缩
gulp.task('compress', () => {
	return gulp.src(dir + '**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(dir));
});

//压缩html
gulp.task('min-html', () => {
	return gulp.src(dir + '**/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(dir));
});


gulp.task('build', ['min-html', 'compress']);
