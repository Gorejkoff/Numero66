// импорт плагина для сборки html файлов при помощи @@include('',{})
import fileInclude from "gulp-file-include";
// меняет формат в webp кроме svg
// import webpHtmlNosvg from "gulp-webp-html-nosvg";
// плагин фиксирует версию сборки, для предотвращения кэширования стилей в браузере
import versionNumber from "gulp-version-number";

// сохранение файлов html
export const html = () => {
   return app.gulp.src(app.path.src.html) // копирование из исходников
      .pipe(app.plugins.plumber(app.plugins.notify.onError({
         title: "HTML",
         message: "Error: <%= error.message %>"
      })))
      .pipe(fileInclude({
         prefix: '@@',
         basepath: '@file'
      })) // сборка файлов при помощи @@include
      .pipe(app.plugins.replace(/@img\//g, './img/'))
      // .pipe(app.plugins.if(app.isBuild, webpHtmlNosvg())) // меняет формат в webp кроме svg
      .pipe(
         app.plugins.if(app.isBuild, versionNumber({
            'value': '%DT%',
            'append': { 'key': '_v', 'cover': 0, 'to': ['css', 'js'] },
            'output': { 'file': 'gulp/version.json' }
         })))
      .pipe(app.gulp.dest(app.path.build.html)) // запись файлов сборки
      .pipe(app.plugins.browsersync.stream());
}

