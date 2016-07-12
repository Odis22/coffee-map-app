/*Requirements*/

var gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css'),
    concat = require('gulp-concat'),
    sass = require('gulp-ruby-sass'),
    htmlMin = require('gulp-htmlmin'),
    jsMin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    ngrok = require('ngrok'),
    psi = require('psi'),
    webserver = require('gulp-webserver');

/*==============Minification Tasks/Delivery to Dest Tasks=============*/

//Wait for sass compilation to finish
//then concatenate and minify resulting css files. 
gulp.task('clean', ['sass'], function(){
    gulp.src('src/css/*.css')
        .pipe(concatCss('main.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('dest/css/'))
        .pipe(gulp.dest('src/css/'));
    });

//compile sass into css
gulp.task('sass', function(){
     return sass('src/css/*.scss')
        .on('error', sass.logError)
        .pipe(gulp.dest('src/css/'));
            });

//minify html by collapsing whitespace. 
gulp.task('htmlMin', function(){
      gulp.src('src/*.html')
          .pipe(htmlMin({collapseWhitespace: true}))
          .pipe(gulp.dest('dest/'));
      });


/*Concatenate js files into single files for each app component.
e.g. all views become views.min.js 
minify the file. Rename with suffix .min

minified files are embedded as script tags in html. 
This enables loading of minified versions in both src
and dest versions of the html file because we like perf while testing too :)
The src glob must contain !.min to avoid concating preexisting min files on second run. 
as Such it is also essential to add the .min suffix to minified versions.*/  
gulp.task('jsMin', function(){
  //first pass, files in js folder.
      gulp.src('src/js/!(*.min).js')
          .pipe(concat('main.js'))
          .pipe(jsMin())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('dest/js/'))
          .pipe(gulp.dest('src/js/'));

  //second pass: models
      gulp.src('src/js/models/!(*.min).js')
          .pipe(concat('models.js'))
          .pipe(jsMin())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('dest/js/models'))
          .pipe(gulp.dest('src/js/models'));

  //third pass: collections
      gulp.src('src/js/collections/!(*.min).js')
          .pipe(concat('collections.js'))
          .pipe(jsMin())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('dest/js/collections'))
          .pipe(gulp.dest('src/js/collections'));

  //fourth pass: views 
      gulp.src('src/js/views/!(*.min).js')
          .pipe(concat('views.js'))
          .pipe(jsMin())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('dest/js/views'))
          .pipe(gulp.dest('src/js/views'));
      });

//Copies bower componenets used in src
//to a libs directory in dest. 
//No need to schange scripts in html. 
//Will only work if bower installs are run
//in the src folder
gulp.task('bowerCopy', function(){
        gulp.src('src/libs/**/*.*')
            .pipe(gulp.dest('dest/libs/'));
      });

/*======================Performance Testing Tasks====================*/

gulp.task('mobile', function(){
    //setup a tunnel with ngrok
      return ngrok.connect(4000, function(err_ngrok, url){
            return psi(url, {
              nokey: 'true',
              strategy: 'mobile',
          }).then(function (data) {
              console.log(data.pageStats);
              console.log('Speed score: ' + data.ruleGroups.SPEED.score);
          });
      });
});

gulp.task('desktop', function () {
    return ngrok.connect(4000, function(err_ngrok, url){
          return psi(site, {
              nokey: 'true',
              strategy: 'desktop',
          }).then(function (data) {
              console.log(data.pageStats);
              console.log('Speed score: ' + data.ruleGroups.SPEED.score);
          });
      });
});

/*===========Watcher Tasks=============*/

//Watch for changes to sass files then run css tasks.
gulp.task('watch' , function(){
    gulp.watch('src/css/*.scss', ['clean']);
    });

/*===========Gulp Serve===============*/

gulp.task('webserver', function(){
    gulp.src('src')
        .pipe(webserver({
            livereload: true,
            port: 4000
          }));
  }); 

//Runs all tasks in array when using `gulp`
gulp.task('default', ['bowerCopy', 'htmlMin', 'jsMin',  'clean', 'webserver' ]);