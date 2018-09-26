const gulp = require('gulp');
const mocha = require('gulp-mocha');
// const babel = require('gulp-babel');
const concat = require('gulp-concat');

//docs of jsdoc : http://www.css88.com/doc/jsdoc/about-configuring-jsdoc.html
var jsdoc = require('gulp-jsdoc3');

gulp.task('doc', function (cb) {
    gulp.src(['README.md', './src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});


gulp.task('test', function () {
    return gulp.src(['./test/**/*.js'])
        .pipe(mocha({
            reporter: 'spec',
            globals: {
                should: require('should')
            }
        }));
});

gulp.task('build', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest("dist"))
})

gulp.task('watch', function(){
    gulp.watch('./src/**/*.js', ['doc']);
});

gulp.task('default', ['watch']);