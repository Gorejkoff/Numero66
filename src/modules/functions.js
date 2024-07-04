// Проверка поддержки webp, добавление класса webp для HTML
export function isWebp() {
   // проверка поддержки webp
   function testWebP(callback) {
      let webP = new Image();
      webP.onload = webP.onerror = function () {
         callback(webP.height == 2);
      };
      webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
   }
   // добавление класса _webp или _no-webp для HTML
   testWebP(function (support) {
      if (support == true) {
         document.documentElement.classList.add('webp');
      } else {
         document.documentElement.classList.add('no-webp');
      }
   });
}