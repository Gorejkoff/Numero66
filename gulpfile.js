// основной модуль
import gulp from "gulp";
// импорт путей
import { path } from "./gulp/config/path.js";
// импорт плагина
import { plugins } from "./gulp/config/plugins.js";
// передаём значения в глобальную переменную
global.app = {
   isBuild: process.argv.includes('--build'),
   isDev: !process.argv.includes('--build'),
   path: path,
   gulp: gulp,
   plugins: plugins,
}

// импорт задач
import { copy } from "./gulp/tasks/copy.js";
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { otfToTtf, ttfToWoff, fontsfiles } from "./gulp/tasks/fonts.js";
import { svgSprive } from "./gulp/tasks/svgSprive.js";
import { zip } from "./gulp/tasks/zip.js";
//import { ftp } from "./gulp/tasks/ftp.js";

// запуск в консоли (npm run svgSprive)
export { svgSprive }

// наблюдатель за изменениями в файлах
function watcher() {
   gulp.watch(path.watch.files, copy);
   gulp.watch(path.watch.html, html);
   gulp.watch(path.watch.scss, scss);
   gulp.watch(path.watch.js, js);
   gulp.watch(path.watch.images, gulp.series(reset, images));
   gulp.watch(path.watch.fonts, fontsfiles);
   gulp.watch(path.watch.svgSprive, svgSprive);
}

// последовательная обработка шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsfiles);

// паралельное выполнение сценариев по копированию файлов
const mainTasks = gulp.series(fonts, gulp.parallel(copy, html, scss, js, images, svgSprive));

// построение сценариев выполнения задач (остановка выполнения задачи ctrl + c)
//series метод последовательного выполнения задач, parallel метод параллельного выполнения задач
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
//const deployFTP = gulp.series(reset, mainTasks, ftp);

// экспорт сценариев, что бы была возможначть пользоваться вне файла
export { dev } // режим разработчика
export { build } // режим production (производство), конечный результат
export { deployZIP } // архивация проекта 
//export { deployFTP } // загрузка на ftp сервер

// выполненте сценария по умолчанию
gulp.task('default', dev);



