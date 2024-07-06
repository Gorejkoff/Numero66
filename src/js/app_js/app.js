"use strict"

const isMobile = {
   Android: function () { return navigator.userAgent.match(/Android/i) },
   BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i) },
   iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i) },
   Opera: function () { return navigator.userAgent.match(/Opera Mini/i) },
   Windows: function () { return navigator.userAgent.match(/IEMobile/i) },
   any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
   }
};
const isPC = !isMobile.any();
if (isPC) { document.body.classList.add('_pc') } else { document.body.classList.add('_touch') };

// медиазапрос
const MIN768 = window.matchMedia('(min-width: 768px)');
const MIN1366 = window.matchMedia('(min-width: 1366px)');

const MAIN_SCREEN_SLIDE = document.querySelectorAll('.main-screen__slide');
const SORT_BODY = document.querySelector('.sort__body');
const UP_BUTTON = document.querySelector('#up');

function throttle(callee, timeout) {
   let timer = null;
   return function perform(...args) {
      if (timer) return;
      timer = setTimeout(() => {
         callee(...args);
         clearTimeout(timer);
         timer = null;
      }, timeout)
   }
}

document.addEventListener('click', (event) => {
   // открывает, закрывает меню в мобильном
   if (event.target.closest('.header__burger-open')) {
      openMenuMobile();
   } else if (event.target.closest('.header__burger-close')) {
      closeMenuMobile();
   }
   // открывает, закрывает поиск в мобильном
   if (event.target.closest('.header__search-mobile-open')) {
      openSearchMobile();
   } else if (event.target.closest('.header__search-mobile-close')) {
      closeSearchMobile();
   }
   // открытие слайдов подписки на главном экране
   if (event.target.closest('.main-screen__slide')) {
      mainScreenSlideActive(event.target.closest('.main-screen__slide'));
   }
   // открывает, закрывает сортировку
   if (SORT_BODY && event.target.closest('.sort__button')) {
      openSort();
   } else if (SORT_BODY && (!event.target.closest('.sort__body') ||
      event.target.closest('.sort__close') ||
      !event.target.closest('.sort__list'))) {
      sloseSort();
   }
   // открыть, закрыть фильтр
   if (event.target.closest('.filter__open')) {
      openFilter()
   } else if (event.target.closest('.filter__close') || !event.target.closest('.filter__form')) {
      closeFilter()
   }
   // вкладки в карточке товара
   if (event.target.closest('.js-button-tab')) {
      let parent = event.target.closest('.js-body-tab');
      if (parent.classList.contains('js-open')) {
         closeProductTab(parent);
      } else {
         openProductTab(parent);
      }
   }
   // отменяет переход по ссылке при экране меньше 1366px
   if (!MIN1366.matches && event.target.closest('.prevent-default-1366')) {
      event.preventDefault();
   }
   if (event.target.closest('.card__favourites')) {
      event.preventDefault();
   }
   // скролл вверх
   if (event.target.closest('.up__item')) {
      window.scrollTo({ top: 0, behavior: "smooth" })
   }

})

const testingScrollThrottle = throttle(testingScroll, 100);
window.addEventListener('scroll', (event) => {
   if (UP_BUTTON) {
      testingScrollThrottle()
   }
})

function testingScroll() {
   if (scrollY < 200) {
      UP_BUTTON.setAttribute('hidden', '');
   } else {
      UP_BUTTON.removeAttribute('hidden');
   }
}

function openProductTab(parent) {
   let height = parent.querySelector('.js-inner-tab').clientHeight;
   parent.classList.add('js-open');
   parent.querySelector('.js-wrapper-tab').style.height = height + 'px';
}

function closeProductTab(parent) {
   parent.classList.remove('js-open');
   parent.querySelector('.js-wrapper-tab').style.height = '';
}

function openMenuMobile() {
   document.body.classList.add('menu-open');
}

function closeMenuMobile() {
   document.body.classList.remove('menu-open');
}

function openSearchMobile() {
   document.body.classList.add('search-open');
}

function closeSearchMobile() {
   document.body.classList.remove('search-open');
}

function mainScreenSlideActive(element) {
   MAIN_SCREEN_SLIDE.forEach((e) => {
      e.classList.toggle('active', e == element)
   })
}

function openSort() {
   if (MIN1366.matches) {
      SORT_BODY.classList.add('sort-active')
   } else {
      document.body.classList.add('sort-open');
   }
}

function sloseSort() {
   SORT_BODY.classList.remove('sort-active')
   document.body.classList.remove('sort-open');
}

function openFilter() {
   document.body.classList.add('filter-open');
}

function closeFilter() {
   document.body.classList.remove('filter-open');
}

// размножение блока для анимации
const RUNNING_LINE = document.querySelector('.brands__block');
if (RUNNING_LINE) {
   const clonElement = RUNNING_LINE.cloneNode(true);
   clonElement.setAttribute('aria-hidden', 'true');
   RUNNING_LINE.parentNode.append(clonElement);
}