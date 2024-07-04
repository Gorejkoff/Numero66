export const server = (done) => {
   app.plugins.browsersync.init({
      server: {
         baseDir: `${app.path.build.html}` // папка с резудьтатом проекта
      },
      notify: false,
      port: 3000,
   });
}