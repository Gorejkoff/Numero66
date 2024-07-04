import dartSass from "sass"; //  препроцессор SASS
import gulpSass from "gulp-sass"; // плагин запуска препроцессора
import rename from "gulp-rename";// переименовывание файла css
//import cleanCss from "gulp-clean-css"; // сжатие CSS файла
//import webpCss from "gulp-webpcss"; // вывод WEBP изображений (ещё установить плагин webp-converter@2.2.3)
import autoPrefixer from "gulp-autoprefixer"; // добавление вендерных префиксов
import groupCssMediaQueries from "gulp-group-css-media-queries" //группировка медиа запросов



const sass = gulpSass(dartSass); // плагин запуска препроцессора запускает препроцессор в константе

export const scss = () => {
   return app.gulp.src(app.path.src.scss, { sourcemaps: app.isDev }) // адрес откуда брать файлы. sourcemaps: true - карта, из какого файла записан фрагмент 
      .pipe(app.plugins.plumber(app.plugins.notify.onError({
         title: "SCSS",
         message: "Error: <%= error.message %>"
      })))
      .pipe(app.plugins.replace(/@img\//g, '../img/'))
      .pipe(sass({ outputStyle: 'expanded' })) // вызов компилятора с указанным стилем файла
      .pipe(app.plugins.if(app.isBuild, groupCssMediaQueries()))
      /*  .pipe(app.plugins.if(app.isBuild, webpCss({
          webpClass: ".webp", // если webbrowser потдерживает формат webp, то будет добавляться класс .webp для вывода изображения этого формата
          noWebpClass: ".no-webp" // добавится класс если webbrowser не потдерживает формат webp
       }))) */
      .pipe(app.plugins.if(app.isBuild, autoPrefixer({
         grid: true,
         overrideBrowserslist: ["last 3 version"],
         cascade: true,
      })))
      .pipe(rename("style.css")) // переименовывает файл 0_style.scss в style.scss
      .pipe(app.gulp.dest(app.path.build.css))  // запись не сжатого файла css, можно будет увидеть не сжатый код
      //.pipe(app.plugins.if(app.isBuild, cleanCss()))
      //.pipe(rename({ extname: ".min.css" })) // переименовывание файла css 
      //.pipe(app.gulp.dest(app.path.build.css)) // адрес куда записывать файл
      .pipe(app.gulp.src(app.path.src.css))
      .pipe(app.gulp.dest(app.path.build.css))
      .pipe(app.plugins.browsersync.stream()); // перезапуск браузера
}