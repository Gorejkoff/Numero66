// поиск и замена путей
import replace from "gulp-replace";
// обработка ошибок
import plumber from "gulp-plumber";
//сообщения подсказки
import notify from "gulp-notify";
// локальный сервер (выводит результат в браузер)
import browsersync from "browser-sync";
// проверка обновления картинок, позволяет обрабатывать только изменённые картинки
import newer from "gulp-newer";
// разделение на режимы разработчик/продакшин
import ifPlugin from "gulp-if";

// экспорт объекта
export const plugins = {
   replace: replace,
   plumber: plumber,
   notify: notify,
   browsersync: browsersync,
   newer: newer,
   if: ifPlugin,
}