// создание svg сборки
import svgSprite from "gulp-svg-sprite";


export const svgSprive = () => {
   return app.gulp.src(`${app.path.src.svgicons}`, {})
      .pipe(app.plugins.plumber(
         app.plugins.notify.onError({
            title: "SVGICONS",
            message: "Error: <%= error.message %>",
         }))
      )
      .pipe(svgSprite({
         /*   shape: {
              dimension: { // максимальный размер
                 maxWidth: 32,
                 maxHeight: 32
              },
              spacing: { // отступы
                 padding: 10
              },
              // dest: 'out/intermediate-svg' // Keep the intermediate files
           }, */
         mode: {
            stack: {
               sprite: `../iconsSprite.svg`,
               // создать страницу с перечнем иконок
               example: app.isBuild ? false : true,
            }
         },
      }))
      .pipe(app.gulp.dest(`${app.path.build.svgSprite}`));
}