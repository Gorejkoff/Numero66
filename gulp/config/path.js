

// получаем имя папки проекта
import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());


const buildFolder = `./dist`; // путь к папке с результатами, папка buildFolder будет создаваться автоматически в процесе действий gulp
const srcFolder = `./src`; // путь к папке с исходниками

// объект path хранит информацию о пути к файлам
export const path = {
   // объект путей к папке с результатом
   build: {
      js: `${buildFolder}/js/`,
      images: `${buildFolder}/img/`,
      svgSprite: `${buildFolder}/img/svgSprite/`,
      css: `${buildFolder}/css/`,
      html: `${buildFolder}/`,
      files: `${buildFolder}/files/`,
      fonts: `${buildFolder}/fonts/`,
   },
   // объект путей к папке с исходниками
   src: {
      appjs: `${srcFolder}/js/app_js/app.js`, // путь к главному файлу, будет первый в сборке
      jsmodules: `${srcFolder}/js/modules_js/*.js`, // модули, которые собираются в один файл
      js: `${srcFolder}/js/*.js`, // путь к файлам, которые не объединяются
      images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
      svg: `${srcFolder}/img/**/*.svg`,
      scss: `${srcFolder}/scss/0_style.scss`,
      css: `${srcFolder}/css/*.css`,
      html: `${srcFolder}/*.html`,
      fonts: `${srcFolder}/fonts/**/*.{woff,woff2}`,
      files: `${srcFolder}/files/**/*.*`, // значение масок: перенос из папки files, ** в любых вложенных папках в папке files, *.* любые файлы
      svgicons: `${srcFolder}/svgicons/*.svg`,
   },
   // объект путей к папкам за которыми необходимо следить и выполнять определённые действия
   watch: {
      js: `${srcFolder}/js/**/*.js`,
      scss: `${srcFolder}/scss/**/*.scss`,
      html: `${srcFolder}/**/*.html`,
      files: `${srcFolder}/files/**/*.*`,
      images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp,ico,svg}`,
      fonts: `${srcFolder}/fonts/**/*.{otf,ttf,woff,woff2}`,
      svgSprive: `${srcFolder}/svgicons/*.svg`,
   },
   clean: buildFolder,
   buildFolder: buildFolder,
   srcFolder: srcFolder,
   rootFolder: rootFolder,
   ftp: `test`, // название папки на удалённом сервере
}
