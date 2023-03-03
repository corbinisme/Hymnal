const { series, parallel, watch } = require('gulp');
var gulp = require('gulp');
const babel = require('gulp-babel');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass')(require('sass'));
var uglifycss = require('gulp-uglifycss');



function clean(cb) {
    // body omitted
    cb();
    
  }


  function css(cb) {
    // body omitted
    watch('src/css/*.css', { ignoreInitial: false }, function(cb) {
      // body omitted
      gulp.src('./src/css/*.css')
      .pipe(concat('assets.css'))
        .pipe(gulp.dest("www/css"))
        .pipe(rename('assets.min.css'))
        .pipe(uglifycss())
        .pipe(gulp.dest("www/css"));
      cb();
    });
  }

  
function javascript(cb) {
    // body omitted
    watch('src/lang/**/*.js', { ignoreInitial: false }, function(cb) {
        // body omitted
        gulp.src('./src/lang/*.js')
        .pipe(concat('lang.js'))
          .pipe(uglify())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('./www/js'));
        cb();
      });
  }
  

  function scss(cb) {
    // body omitted
    watch('src/sass/*.scss', { ignoreInitial: false }, function(cb) {
      // body omitted
      gulp.src('./src/sass/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./www/css'))
      .pipe(uglifycss())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./www/css'))
      cb();
    });
  }


gulp.task('sass', function(cb) {
  return gulp.src(['src/sass/**/*.scss'])
  //.pipe(browserify())
  .pipe(sass()) 
  .pipe(concat('style.css'))
  .pipe(gulp.dest('www/css'))

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



exports.build = series(clean, parallel(css, scss, javascript));