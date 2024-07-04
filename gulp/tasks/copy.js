export const copy = () => {
   return app.gulp.src(app.path.src.files)// копирование из исходников
      .pipe(app.gulp.dest(app.path.build.files));// запись файлов сборки

}
