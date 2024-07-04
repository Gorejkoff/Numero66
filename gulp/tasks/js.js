// для возможности подключать (import, export) пайлы .js используя синтаксис ES6 необходимо подключить webpack-stream
// установить модуль webpack-stream и webpack
/* import webpack from "webpack-stream";

export const js = () => {
   return app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
      .pipe(app.plugins.plumber(
         app.plugins.notify.onError({
            title: "JS",
            message: "Error: <%= error.message %>"
         }, null)))
      .pipe(webpack({
         mode: app.isBuild ? 'production' : 'development',
         output: { filename: 'app.js' }
      }))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.gulp.src(app.path.src.jsall))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.plugins.browsersync.stream());
} */

import concat from 'gulp-concat';

export const js = () => {
   return app.gulp.src([`${app.path.src.appjs}`, `${app.path.src.jsmodules}`])
      .pipe(concat('app.js'))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.gulp.src(app.path.src.js))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.plugins.browsersync.stream());
};
