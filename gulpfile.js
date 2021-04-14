const gulp = require('gulp');
const concat = require('gulp-concat');
const refresh = require('gulp-livereload');
const lr = require('tiny-lr');
const server = lr();
const sass = require('gulp-sass');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const minifyCSS = require('gulp-minify-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');


gulp.task('lr-server', function() {
    server.listen(35729, function(err) {
        if(err) return console.log(err);
    });
})

gulp.task('sass', function() {
    gulp.src(['assets/css/**/*.scss'])
        //.pipe(browserify())
        .pipe(sass()) 
        .pipe(concat('theme.css'))
        .pipe(gulp.dest('www/css'))
        .pipe(refresh(server))
});


gulp.task('minify-scripts', function() {
    return gulp.src("src/js/**/*.js")
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest("www/js"))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("www/js"));
});

gulp.task('minify-lang', function() {
    return gulp.src("src/lang/**/*.js")
        .pipe(concat('lang.js'))
        .pipe(gulp.dest("www/js"))
        .pipe(rename('lang.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("www/js"));
});

gulp.task('minify-css', () => {
  return gulp.src('src/css/**/*.css')
    .pipe(concat('styles.css'))
    .pipe(rename('styles.min.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('www/css'));
});

gulp.task('default', function() {

    gulp.watch('src/css/**', function(event) {
        gulp.run('styles');
    })

})

/*
gulp.task('task-name', function () {
  return gulp.src('source-files') // Get source files with gulp.src
    .pipe(aGulpPlugin()) // Sends it through a gulp plugin
    .pipe(gulp.dest('destination')) // Outputs the file in the destination folder
});
*/