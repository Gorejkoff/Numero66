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
   // clonElement.setAttribute('aria-hidden', 'true');
   RUNNING_LINE.parentNode.append(clonElement);
}
// перемещение блоков при адаптиве по данным атрибута 
// data-da=".class,3,768" 
// класс родителя куда перемещать
// порядковый номер в родительском блоке куда перемещается начиная с 0 как индексы массива
// ширина экрана min-width
// два перемещения: data-da=".class,3,768,.class2,1,1024"
const ARRAY_DATA_DA = document.querySelectorAll('[data-da]');
ARRAY_DATA_DA.forEach(function (e) {
   const dataArray = e.dataset.da.split(',');
   const addressMove = searchDestination(e, dataArray[0]);
   const addressMoveSecond = dataArray[3] && searchDestination(e, dataArray[3]);
   const addressParent = e.parentElement;
   const listChildren = addressParent.children;
   const mediaQuery = window.matchMedia(`(min-width: ${dataArray[2]}px)`);
   const mediaQuerySecond = dataArray[5] && window.matchMedia(`(min-width: ${dataArray[5]}px)`);
   for (let i = 0; i < listChildren.length; i++) { !listChildren[i].dataset.n && listChildren[i].setAttribute('data-n', `${i}`) };
   mediaQuery.matches && startChange(mediaQuery, addressMove, e, listChildren, addressParent, dataArray);
   if (mediaQuerySecond && mediaQuerySecond.matches) moving(e, dataArray[4], addressMoveSecond);
   mediaQuery.addEventListener('change', () => { startChange(mediaQuery, addressMove, e, listChildren, addressParent, dataArray) });
   if (mediaQuerySecond) mediaQuerySecond.addEventListener('change', () => {
      if (mediaQuerySecond.matches) { moving(e, dataArray[4], addressMoveSecond); return; };
      startChange(mediaQuery, addressMove, e, listChildren, addressParent, dataArray);
   });
});

function startChange(mediaQuery, addressMove, e, listChildren, addressParent, dataArray) {
   if (mediaQuery.matches) { moving(e, dataArray[1], addressMove); return; }
   if (listChildren.length > 0) {
      for (let z = 0; z < listChildren.length; z++) {
         if (listChildren[z].dataset.n > e.dataset.n) {
            listChildren[z].before(e);
            break;
         } else if (z == listChildren.length - 1) {
            addressParent.append(e);
         }
      }
      return;
   }
   addressParent.prepend(e);
};

function searchDestination(e, n) {
   if (e.classList.contains(n.slice(1))) { return e }
   if (e.parentElement.querySelector(n)) { return e.parentElement.querySelector(n) };
   return searchDestination(e.parentElement, n);
}

function moving(e, order, addressMove) {
   if (order == "first") { addressMove.prepend(e); return; };
   if (order == "last") { addressMove.append(e); return; };
   if (addressMove.children[order]) { addressMove.children[order].before(e); return; }
   addressMove.append(e);
}



if (document.querySelector('.filter')) {
   // переменные
   const FORM_FILTER = document.forms.filter;
   const INPUTS_CHECK = FORM_FILTER && FORM_FILTER.querySelectorAll('input[type="checkbox"],input[type="radio"]');
   const INPUTS_NUMBER = FORM_FILTER && FORM_FILTER.querySelectorAll('input[type="number"]')
   const VERTICAL_INDICATOR = document.querySelector('.filter__vertical-indicator');
   const FILTER = document.querySelector('.filter');

   // двойной ползунок
   const INPUT_MAX = document.querySelector('.filter__max');
   const INPUT_MIN = document.querySelector('.filter__min');
   const SPIN_MAX = document.querySelector('.spin-max');
   const SPIN_MIN = document.querySelector('.spin-min');
   const PRICE_RANGE = document.querySelector('.track-range');
   const MAX_VALUE = Number(INPUT_MAX.max);
   const MIN_VALUE = Number(INPUT_MIN.min);
   let mouseX;
   let spinMove = false;
   let spinWidth = SPIN_MAX.offsetWidth;
   let rangeStart = PRICE_RANGE.getBoundingClientRect().left;
   let rangeWidth = PRICE_RANGE.offsetWidth - spinWidth;
   let maxRange = MAX_VALUE - MIN_VALUE;

   (function () {
      INPUT_MAX.value = INPUT_MAX.max;
      INPUT_MIN.value = INPUT_MAX.min;
      SPIN_MAX.ondragstart = function () { return false };
      SPIN_MIN.ondragstart = function () { return false };
      setGradient();
   })();

   isPC && document.addEventListener('mousemove', mousemove);
   isPC && SPIN_MAX.addEventListener('mousedown', startEvent);
   isPC && SPIN_MIN.addEventListener('mousedown', startEvent);
   isPC && document.addEventListener('mouseup', andEvent);
   !isPC && document.addEventListener('touchmove', mousemove);
   !isPC && SPIN_MAX.addEventListener('touchstart', startEvent);
   !isPC && SPIN_MIN.addEventListener('touchstart', startEvent);
   !isPC && document.addEventListener('touchend', andEvent);

   INPUT_MAX.addEventListener('change', () => {
      validationInput(INPUT_MAX);
      setRange(INPUT_MAX, SPIN_MAX);
   });
   INPUT_MIN.addEventListener('change', () => {
      validationInput(INPUT_MIN);
      setRange(INPUT_MIN, SPIN_MIN);
   });

   function startEvent(event) {
      !MIN1366.matches && getProperties(); // MIN... медиазапрос при какой ширине меняется длинна ползунка, необходимо создать эту переменную
      !isPC ? mouseX = event.changedTouches[0].clientX : false;
      if (event.target.closest('.spin-max')) {
         spinMove = true;
         SPIN_MAX.style.zIndex = 2;
         SPIN_MIN.style.zIndex = 1;
         moveRange(SPIN_MAX, INPUT_MAX)
      }
      if (event.target.closest('.spin-min')) {
         spinMove = true;
         SPIN_MIN.style.zIndex = 2;
         SPIN_MAX.style.zIndex = 1;
         moveRange(SPIN_MIN, INPUT_MIN)
      }
   }

   function andEvent() { spinMove = false };
   function mousemove(event) { isPC ? mouseX = event.clientX : mouseX = event.changedTouches[0].clientX };

   function validationInput(input) {
      const val = input.value;
      if (val < MIN_VALUE) input.value = MIN_VALUE;
      if (val > MAX_VALUE) input.value = MAX_VALUE;
      if (INPUT_MAX == input && Number(INPUT_MAX.value) < Number(INPUT_MIN.value)) { input.value = INPUT_MIN.value };
      if (INPUT_MIN == input && Number(INPUT_MIN.value) > Number(INPUT_MAX.value)) { input.value = INPUT_MAX.value };
   }

   function setRange(imput, spin) {
      let offsetSpin = (imput.value - MIN_VALUE) / maxRange;
      spin.style.left = offsetSpin * rangeWidth + 'px';
      setGradient();
      checkClearButton();
   }

   function setGradient() {
      PRICE_RANGE.style.setProperty('--minGradient', ((INPUT_MIN.value - MIN_VALUE) / maxRange * 100).toFixed(1) + '%');
      PRICE_RANGE.style.setProperty('--maxGradient', ((INPUT_MAX.value - MIN_VALUE) / maxRange * 100).toFixed(1) + '%');
   }

   function moveRange(spin, input) {
      if (!spinMove) return;
      let offsetLeft = mouseX - rangeStart - spinWidth / 2;
      if (offsetLeft < 0) { offsetLeft = 0 };
      if (offsetLeft > rangeWidth) { offsetLeft = rangeWidth };
      let value = Number((MIN_VALUE + offsetLeft / rangeWidth * maxRange).toFixed());
      if (INPUT_MAX == input && value < Number(INPUT_MIN.value)) { value = INPUT_MIN.value };
      if (INPUT_MIN == input && value > Number(INPUT_MAX.value)) { value = INPUT_MAX.value };
      input.value = value;
      setRange(input, spin);
      requestAnimationFrame(() => moveRange(spin, input))
   }

   function getProperties() {
      spinWidth = SPIN_MAX.offsetWidth;
      rangeStart = PRICE_RANGE.getBoundingClientRect().left;
      rangeWidth = PRICE_RANGE.offsetWidth - spinWidth;
      maxRange = MAX_VALUE - MIN_VALUE;
      setRange(INPUT_MAX, SPIN_MAX);
      setRange(INPUT_MIN, SPIN_MIN);
   }

   window.addEventListener('resize', () => {
      getProperties();
   })

   function clearFilter() {
      INPUTS_CHECK.forEach((e) => { e.checked = false });
      if (VERTICAL_INDICATOR) { VERTICAL_INDICATOR.style.setProperty('--indicator-height', '0px') };
      INPUTS_NUMBER.forEach((e) => {
         if (e.name == "range_min") { e.value = e.min };
         if (e.name == "range_max") { e.value = e.max };
         getProperties();
      })
      checkClearButton();
   }

   function openFilterCategory(element) {
      const parent = element.closest('.filter__block');
      parent.classList.toggle('open-category');
      if (!parent.querySelector('.filter__list-hidden')) return;
      if (parent.classList.contains('open-category')) {
         setTimeout(() => { parent.querySelector('.filter__list-hidden').style.overflowY = "auto" }, 300)
      } else {
         parent.querySelector('.filter__list-hidden').style.overflowY = "";
      }
   }

   function checkInputIndicator(list) {
      list.forEach((e) => {
         if (e.querySelector('input').checked) {
            VERTICAL_INDICATOR.style.setProperty('--indicator-height', e.clientHeight / 2 + e.offsetTop + 'px')
         }
      })
   }

   if (VERTICAL_INDICATOR) {
      const filter_check = VERTICAL_INDICATOR.querySelectorAll('.filter__check');
      VERTICAL_INDICATOR.addEventListener('click', (event) => {
         checkInputIndicator(filter_check);
      })
   }

   FORM_FILTER.addEventListener('change', (event) => {
      checkClearButton()
   })

   function checkClearButton() {
      FILTER.classList.add('clear-hidden');
      clearMarking();
      INPUTS_CHECK.forEach((e) => {
         if (e.checked) {
            showClearButton();
            addMarking(e);
         }
      });
      INPUTS_NUMBER.forEach((e) => {
         if (e.name == "range_min" && e.value !== e.min) {
            showClearButton();
            addMarking(e);
         };
         if (e.name == "range_max" && e.value !== e.max) {
            showClearButton();
            addMarking(e);
         };
      })
   }
   function showClearButton() {
      FILTER.classList.remove('clear-hidden')
   }
   function addMarking(e) {
      let el = e.closest('.filter__block').querySelector('.filter__category');
      el && el.classList.add('mark');
   }
   function clearMarking() {
      document.querySelectorAll('.mark').forEach((e) => { e.classList.remove('mark') })
   }
   document.addEventListener('click', (event) => {
      // открывает вкладки фильтра
      if (event.target.closest('.filter__category')) {
         openFilterCategory(event.target.closest('.filter__category'))
      }
      // очистка фильтров
      if (event.target.closest('.filter__clear')) {
         clearFilter();
      }
   })


}    

(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
      typeof define === 'function' && define.amd ? define(['exports'], factory) :
         (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.IMask = {}));
})(this, (function (exports) {
   'use strict';

   /** Checks if value is string */
   function isString(str) {
      return typeof str === 'string' || str instanceof String;
   }

   /** Checks if value is object */
   function isObject(obj) {
      var _obj$constructor;
      return typeof obj === 'object' && obj != null && (obj == null || (_obj$constructor = obj.constructor) == null ? void 0 : _obj$constructor.name) === 'Object';
   }
   function pick(obj, keys) {
      if (Array.isArray(keys)) return pick(obj, (_, k) => keys.includes(k));
      return Object.entries(obj).reduce((acc, _ref) => {
         let [k, v] = _ref;
         if (keys(v, k)) acc[k] = v;
         return acc;
      }, {});
   }

   /** Direction */
   const DIRECTION = {
      NONE: 'NONE',
      LEFT: 'LEFT',
      FORCE_LEFT: 'FORCE_LEFT',
      RIGHT: 'RIGHT',
      FORCE_RIGHT: 'FORCE_RIGHT'
   };

   /** Direction */

   function forceDirection(direction) {
      switch (direction) {
         case DIRECTION.LEFT:
            return DIRECTION.FORCE_LEFT;
         case DIRECTION.RIGHT:
            return DIRECTION.FORCE_RIGHT;
         default:
            return direction;
      }
   }

   /** Escapes regular expression control chars */
   function escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
   }

   // cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
   function objectIncludes(b, a) {
      if (a === b) return true;
      const arrA = Array.isArray(a),
         arrB = Array.isArray(b);
      let i;
      if (arrA && arrB) {
         if (a.length != b.length) return false;
         for (i = 0; i < a.length; i++) if (!objectIncludes(a[i], b[i])) return false;
         return true;
      }
      if (arrA != arrB) return false;
      if (a && b && typeof a === 'object' && typeof b === 'object') {
         const dateA = a instanceof Date,
            dateB = b instanceof Date;
         if (dateA && dateB) return a.getTime() == b.getTime();
         if (dateA != dateB) return false;
         const regexpA = a instanceof RegExp,
            regexpB = b instanceof RegExp;
         if (regexpA && regexpB) return a.toString() == b.toString();
         if (regexpA != regexpB) return false;
         const keys = Object.keys(a);
         // if (keys.length !== Object.keys(b).length) return false;

         for (i = 0; i < keys.length; i++) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
         for (i = 0; i < keys.length; i++) if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
         return true;
      } else if (a && b && typeof a === 'function' && typeof b === 'function') {
         return a.toString() === b.toString();
      }
      return false;
   }

   /** Selection range */

   /** Provides details of changing input */
   class ActionDetails {
      /** Current input value */

      /** Current cursor position */

      /** Old input value */

      /** Old selection */

      constructor(opts) {
         Object.assign(this, opts);

         // double check if left part was changed (autofilling, other non-standard input triggers)
         while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
            --this.oldSelection.start;
         }
         if (this.insertedCount) {
            // double check right part
            while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) {
               if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end; else ++this.cursorPos;
            }
         }
      }

      /** Start changing position */
      get startChangePos() {
         return Math.min(this.cursorPos, this.oldSelection.start);
      }

      /** Inserted symbols count */
      get insertedCount() {
         return this.cursorPos - this.startChangePos;
      }

      /** Inserted symbols */
      get inserted() {
         return this.value.substr(this.startChangePos, this.insertedCount);
      }

      /** Removed symbols count */
      get removedCount() {
         // Math.max for opposite operation
         return Math.max(this.oldSelection.end - this.startChangePos ||
            // for Delete
            this.oldValue.length - this.value.length, 0);
      }

      /** Removed symbols */
      get removed() {
         return this.oldValue.substr(this.startChangePos, this.removedCount);
      }

      /** Unchanged head symbols */
      get head() {
         return this.value.substring(0, this.startChangePos);
      }

      /** Unchanged tail symbols */
      get tail() {
         return this.value.substring(this.startChangePos + this.insertedCount);
      }

      /** Remove direction */
      get removeDirection() {
         if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

         // align right if delete at right
         return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) &&
            // if not range removed (event with backspace)
            this.oldSelection.end === this.oldSelection.start ? DIRECTION.RIGHT : DIRECTION.LEFT;
      }
   }

   /** Applies mask on element */
   function IMask(el, opts) {
      // currently available only for input-like elements
      return new IMask.InputMask(el, opts);
   }

   // TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
   // export function maskedClass(mask: string): typeof MaskedPattern;
   // export function maskedClass(mask: DateConstructor): typeof MaskedDate;
   // export function maskedClass(mask: NumberConstructor): typeof MaskedNumber;
   // export function maskedClass(mask: Array<any> | ArrayConstructor): typeof MaskedDynamic;
   // export function maskedClass(mask: MaskedDate): typeof MaskedDate;
   // export function maskedClass(mask: MaskedNumber): typeof MaskedNumber;
   // export function maskedClass(mask: MaskedEnum): typeof MaskedEnum;
   // export function maskedClass(mask: MaskedRange): typeof MaskedRange;
   // export function maskedClass(mask: MaskedRegExp): typeof MaskedRegExp;
   // export function maskedClass(mask: MaskedFunction): typeof MaskedFunction;
   // export function maskedClass(mask: MaskedPattern): typeof MaskedPattern;
   // export function maskedClass(mask: MaskedDynamic): typeof MaskedDynamic;
   // export function maskedClass(mask: Masked): typeof Masked;
   // export function maskedClass(mask: typeof Masked): typeof Masked;
   // export function maskedClass(mask: typeof MaskedDate): typeof MaskedDate;
   // export function maskedClass(mask: typeof MaskedNumber): typeof MaskedNumber;
   // export function maskedClass(mask: typeof MaskedEnum): typeof MaskedEnum;
   // export function maskedClass(mask: typeof MaskedRange): typeof MaskedRange;
   // export function maskedClass(mask: typeof MaskedRegExp): typeof MaskedRegExp;
   // export function maskedClass(mask: typeof MaskedFunction): typeof MaskedFunction;
   // export function maskedClass(mask: typeof MaskedPattern): typeof MaskedPattern;
   // export function maskedClass(mask: typeof MaskedDynamic): typeof MaskedDynamic;
   // export function maskedClass<Mask extends typeof Masked> (mask: Mask): Mask;
   // export function maskedClass(mask: RegExp): typeof MaskedRegExp;
   // export function maskedClass(mask: (value: string, ...args: any[]) => boolean): typeof MaskedFunction;

   /** Get Masked class by mask type */
   function maskedClass(mask) /* TODO */ {
      if (mask == null) throw new Error('mask property should be defined');
      if (mask instanceof RegExp) return IMask.MaskedRegExp;
      if (isString(mask)) return IMask.MaskedPattern;
      if (mask === Date) return IMask.MaskedDate;
      if (mask === Number) return IMask.MaskedNumber;
      if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
      if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask;
      if (IMask.Masked && mask instanceof IMask.Masked) return mask.constructor;
      if (mask instanceof Function) return IMask.MaskedFunction;
      console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
      return IMask.Masked;
   }
   function normalizeOpts(opts) {
      if (!opts) throw new Error('Options in not defined');
      if (IMask.Masked) {
         if (opts.prototype instanceof IMask.Masked) return {
            mask: opts
         };

         /*
           handle cases like:
           1) opts = Masked
           2) opts = { mask: Masked, ...instanceOpts }
         */
         const {
            mask = undefined,
            ...instanceOpts
         } = opts instanceof IMask.Masked ? {
            mask: opts
         } : isObject(opts) && opts.mask instanceof IMask.Masked ? opts : {};
         if (mask) {
            const _mask = mask.mask;
            return {
               ...pick(mask, (_, k) => !k.startsWith('_')),
               mask: mask.constructor,
               _mask,
               ...instanceOpts
            };
         }
      }
      if (!isObject(opts)) return {
         mask: opts
      };
      return {
         ...opts
      };
   }

   // TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754

   // From masked
   // export default function createMask<Opts extends Masked, ReturnMasked=Opts> (opts: Opts): ReturnMasked;
   // // From masked class
   // export default function createMask<Opts extends MaskedOptions<typeof Masked>, ReturnMasked extends Masked=InstanceType<Opts['mask']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedDate>, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedNumber>, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedEnum>, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedRange>, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedRegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedFunction>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedPattern>, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<typeof MaskedDynamic>, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
   // // From mask opts
   // export default function createMask<Opts extends MaskedOptions<Masked>, ReturnMasked=Opts extends MaskedOptions<infer M> ? M : never> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedNumberOptions, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedDateFactoryOptions, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedEnumOptions, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedRangeOptions, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedPatternOptions, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedDynamicOptions, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<RegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
   // export default function createMask<Opts extends MaskedOptions<Function>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;

   /** Creates new {@link Masked} depending on mask type */
   function createMask(opts) {
      if (IMask.Masked && opts instanceof IMask.Masked) return opts;
      const nOpts = normalizeOpts(opts);
      const MaskedClass = maskedClass(nOpts.mask);
      if (!MaskedClass) throw new Error("Masked class is not found for provided mask " + nOpts.mask + ", appropriate module needs to be imported manually before creating mask.");
      if (nOpts.mask === MaskedClass) delete nOpts.mask;
      if (nOpts._mask) {
         nOpts.mask = nOpts._mask;
         delete nOpts._mask;
      }
      return new MaskedClass(nOpts);
   }
   IMask.createMask = createMask;

   /**  Generic element API to use with mask */
   class MaskElement {
      /** */

      /** */

      /** */

      /** Safely returns selection start */
      get selectionStart() {
         let start;
         try {
            start = this._unsafeSelectionStart;
         } catch { }
         return start != null ? start : this.value.length;
      }

      /** Safely returns selection end */
      get selectionEnd() {
         let end;
         try {
            end = this._unsafeSelectionEnd;
         } catch { }
         return end != null ? end : this.value.length;
      }

      /** Safely sets element selection */
      select(start, end) {
         if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;
         try {
            this._unsafeSelect(start, end);
         } catch { }
      }

      /** */
      get isActive() {
         return false;
      }
      /** */

      /** */

      /** */
   }
   IMask.MaskElement = MaskElement;

   const KEY_Z = 90;
   const KEY_Y = 89;

   /** Bridge between HTMLElement and {@link Masked} */
   class HTMLMaskElement extends MaskElement {
      /** HTMLElement to use mask on */

      constructor(input) {
         super();
         this.input = input;
         this._onKeydown = this._onKeydown.bind(this);
         this._onInput = this._onInput.bind(this);
         this._onBeforeinput = this._onBeforeinput.bind(this);
         this._onCompositionEnd = this._onCompositionEnd.bind(this);
      }
      get rootElement() {
         var _this$input$getRootNo, _this$input$getRootNo2, _this$input;
         return (_this$input$getRootNo = (_this$input$getRootNo2 = (_this$input = this.input).getRootNode) == null ? void 0 : _this$input$getRootNo2.call(_this$input)) != null ? _this$input$getRootNo : document;
      }

      /** Is element in focus */
      get isActive() {
         return this.input === this.rootElement.activeElement;
      }

      /** Binds HTMLElement events to mask internal events */
      bindEvents(handlers) {
         this.input.addEventListener('keydown', this._onKeydown);
         this.input.addEventListener('input', this._onInput);
         this.input.addEventListener('beforeinput', this._onBeforeinput);
         this.input.addEventListener('compositionend', this._onCompositionEnd);
         this.input.addEventListener('drop', handlers.drop);
         this.input.addEventListener('click', handlers.click);
         this.input.addEventListener('focus', handlers.focus);
         this.input.addEventListener('blur', handlers.commit);
         this._handlers = handlers;
      }
      _onKeydown(e) {
         if (this._handlers.redo && (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey) || e.keyCode === KEY_Y && e.ctrlKey)) {
            e.preventDefault();
            return this._handlers.redo(e);
         }
         if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            return this._handlers.undo(e);
         }
         if (!e.isComposing) this._handlers.selectionChange(e);
      }
      _onBeforeinput(e) {
         if (e.inputType === 'historyUndo' && this._handlers.undo) {
            e.preventDefault();
            return this._handlers.undo(e);
         }
         if (e.inputType === 'historyRedo' && this._handlers.redo) {
            e.preventDefault();
            return this._handlers.redo(e);
         }
      }
      _onCompositionEnd(e) {
         this._handlers.input(e);
      }
      _onInput(e) {
         if (!e.isComposing) this._handlers.input(e);
      }

      /** Unbinds HTMLElement events to mask internal events */
      unbindEvents() {
         this.input.removeEventListener('keydown', this._onKeydown);
         this.input.removeEventListener('input', this._onInput);
         this.input.removeEventListener('beforeinput', this._onBeforeinput);
         this.input.removeEventListener('compositionend', this._onCompositionEnd);
         this.input.removeEventListener('drop', this._handlers.drop);
         this.input.removeEventListener('click', this._handlers.click);
         this.input.removeEventListener('focus', this._handlers.focus);
         this.input.removeEventListener('blur', this._handlers.commit);
         this._handlers = {};
      }
   }
   IMask.HTMLMaskElement = HTMLMaskElement;

   /** Bridge between InputElement and {@link Masked} */
   class HTMLInputMaskElement extends HTMLMaskElement {
      /** InputElement to use mask on */

      constructor(input) {
         super(input);
         this.input = input;
      }

      /** Returns InputElement selection start */
      get _unsafeSelectionStart() {
         return this.input.selectionStart != null ? this.input.selectionStart : this.value.length;
      }

      /** Returns InputElement selection end */
      get _unsafeSelectionEnd() {
         return this.input.selectionEnd;
      }

      /** Sets InputElement selection */
      _unsafeSelect(start, end) {
         this.input.setSelectionRange(start, end);
      }
      get value() {
         return this.input.value;
      }
      set value(value) {
         this.input.value = value;
      }
   }
   IMask.HTMLMaskElement = HTMLMaskElement;

   class HTMLContenteditableMaskElement extends HTMLMaskElement {
      /** Returns HTMLElement selection start */
      get _unsafeSelectionStart() {
         const root = this.rootElement;
         const selection = root.getSelection && root.getSelection();
         const anchorOffset = selection && selection.anchorOffset;
         const focusOffset = selection && selection.focusOffset;
         if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) {
            return anchorOffset;
         }
         return focusOffset;
      }

      /** Returns HTMLElement selection end */
      get _unsafeSelectionEnd() {
         const root = this.rootElement;
         const selection = root.getSelection && root.getSelection();
         const anchorOffset = selection && selection.anchorOffset;
         const focusOffset = selection && selection.focusOffset;
         if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) {
            return anchorOffset;
         }
         return focusOffset;
      }

      /** Sets HTMLElement selection */
      _unsafeSelect(start, end) {
         if (!this.rootElement.createRange) return;
         const range = this.rootElement.createRange();
         range.setStart(this.input.firstChild || this.input, start);
         range.setEnd(this.input.lastChild || this.input, end);
         const root = this.rootElement;
         const selection = root.getSelection && root.getSelection();
         if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
         }
      }

      /** HTMLElement value */
      get value() {
         return this.input.textContent || '';
      }
      set value(value) {
         this.input.textContent = value;
      }
   }
   IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;

   class InputHistory {
      constructor() {
         this.states = [];
         this.currentIndex = 0;
      }
      get currentState() {
         return this.states[this.currentIndex];
      }
      get isEmpty() {
         return this.states.length === 0;
      }
      push(state) {
         // if current index points before the last element then remove the future
         if (this.currentIndex < this.states.length - 1) this.states.length = this.currentIndex + 1;
         this.states.push(state);
         if (this.states.length > InputHistory.MAX_LENGTH) this.states.shift();
         this.currentIndex = this.states.length - 1;
      }
      go(steps) {
         this.currentIndex = Math.min(Math.max(this.currentIndex + steps, 0), this.states.length - 1);
         return this.currentState;
      }
      undo() {
         return this.go(-1);
      }
      redo() {
         return this.go(+1);
      }
      clear() {
         this.states.length = 0;
         this.currentIndex = 0;
      }
   }
   InputHistory.MAX_LENGTH = 100;

   /** Listens to element events and controls changes between element and {@link Masked} */
   class InputMask {
      /**
        View element
      */

      /** Internal {@link Masked} model */

      constructor(el, opts) {
         this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLInputMaskElement(el);
         this.masked = createMask(opts);
         this._listeners = {};
         this._value = '';
         this._unmaskedValue = '';
         this._rawInputValue = '';
         this.history = new InputHistory();
         this._saveSelection = this._saveSelection.bind(this);
         this._onInput = this._onInput.bind(this);
         this._onChange = this._onChange.bind(this);
         this._onDrop = this._onDrop.bind(this);
         this._onFocus = this._onFocus.bind(this);
         this._onClick = this._onClick.bind(this);
         this._onUndo = this._onUndo.bind(this);
         this._onRedo = this._onRedo.bind(this);
         this.alignCursor = this.alignCursor.bind(this);
         this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
         this._bindEvents();

         // refresh
         this._onChange();
      }
      maskEquals(mask) {
         var _this$masked;
         return mask == null || ((_this$masked = this.masked) == null ? void 0 : _this$masked.maskEquals(mask));
      }

      /** Masked */
      get mask() {
         return this.masked.mask;
      }
      set mask(mask) {
         if (this.maskEquals(mask)) return;
         if (!(mask instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
            // TODO "any" no idea
            this.masked.updateOptions({
               mask
            });
            return;
         }
         const masked = mask instanceof IMask.Masked ? mask : createMask({
            mask
         });
         masked.unmaskedValue = this.masked.unmaskedValue;
         this.masked = masked;
      }

      /** Raw value */
      get value() {
         return this._value;
      }
      set value(str) {
         if (this.value === str) return;
         this.masked.value = str;
         this.updateControl('auto');
      }

      /** Unmasked value */
      get unmaskedValue() {
         return this._unmaskedValue;
      }
      set unmaskedValue(str) {
         if (this.unmaskedValue === str) return;
         this.masked.unmaskedValue = str;
         this.updateControl('auto');
      }

      /** Raw input value */
      get rawInputValue() {
         return this._rawInputValue;
      }
      set rawInputValue(str) {
         if (this.rawInputValue === str) return;
         this.masked.rawInputValue = str;
         this.updateControl();
         this.alignCursor();
      }

      /** Typed unmasked value */
      get typedValue() {
         return this.masked.typedValue;
      }
      set typedValue(val) {
         if (this.masked.typedValueEquals(val)) return;
         this.masked.typedValue = val;
         this.updateControl('auto');
      }

      /** Display value */
      get displayValue() {
         return this.masked.displayValue;
      }

      /** Starts listening to element events */
      _bindEvents() {
         this.el.bindEvents({
            selectionChange: this._saveSelection,
            input: this._onInput,
            drop: this._onDrop,
            click: this._onClick,
            focus: this._onFocus,
            commit: this._onChange,
            undo: this._onUndo,
            redo: this._onRedo
         });
      }

      /** Stops listening to element events */
      _unbindEvents() {
         if (this.el) this.el.unbindEvents();
      }

      /** Fires custom event */
      _fireEvent(ev, e) {
         const listeners = this._listeners[ev];
         if (!listeners) return;
         listeners.forEach(l => l(e));
      }

      /** Current selection start */
      get selectionStart() {
         return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
      }

      /** Current cursor position */
      get cursorPos() {
         return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
      }
      set cursorPos(pos) {
         if (!this.el || !this.el.isActive) return;
         this.el.select(pos, pos);
         this._saveSelection();
      }

      /** Stores current selection */
      _saveSelection( /* ev */
      ) {
         if (this.displayValue !== this.el.value) {
            console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
         }
         this._selection = {
            start: this.selectionStart,
            end: this.cursorPos
         };
      }

      /** Syncronizes model value from view */
      updateValue() {
         this.masked.value = this.el.value;
         this._value = this.masked.value;
         this._unmaskedValue = this.masked.unmaskedValue;
         this._rawInputValue = this.masked.rawInputValue;
      }

      /** Syncronizes view from model value, fires change events */
      updateControl(cursorPos) {
         const newUnmaskedValue = this.masked.unmaskedValue;
         const newValue = this.masked.value;
         const newRawInputValue = this.masked.rawInputValue;
         const newDisplayValue = this.displayValue;
         const isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue || this._rawInputValue !== newRawInputValue;
         this._unmaskedValue = newUnmaskedValue;
         this._value = newValue;
         this._rawInputValue = newRawInputValue;
         if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
         if (cursorPos === 'auto') this.alignCursor(); else if (cursorPos != null) this.cursorPos = cursorPos;
         if (isChanged) this._fireChangeEvents();
         if (!this._historyChanging && (isChanged || this.history.isEmpty)) this.history.push({
            unmaskedValue: newUnmaskedValue,
            selection: {
               start: this.selectionStart,
               end: this.cursorPos
            }
         });
      }

      /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
      updateOptions(opts) {
         const {
            mask,
            ...restOpts
         } = opts; // TODO types, yes, mask is optional

         const updateMask = !this.maskEquals(mask);
         const updateOpts = this.masked.optionsIsChanged(restOpts);
         if (updateMask) this.mask = mask;
         if (updateOpts) this.masked.updateOptions(restOpts); // TODO

         if (updateMask || updateOpts) this.updateControl();
      }

      /** Updates cursor */
      updateCursor(cursorPos) {
         if (cursorPos == null) return;
         this.cursorPos = cursorPos;

         // also queue change cursor for mobile browsers
         this._delayUpdateCursor(cursorPos);
      }

      /** Delays cursor update to support mobile browsers */
      _delayUpdateCursor(cursorPos) {
         this._abortUpdateCursor();
         this._changingCursorPos = cursorPos;
         this._cursorChanging = setTimeout(() => {
            if (!this.el) return; // if was destroyed
            this.cursorPos = this._changingCursorPos;
            this._abortUpdateCursor();
         }, 10);
      }

      /** Fires custom events */
      _fireChangeEvents() {
         this._fireEvent('accept', this._inputEvent);
         if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
      }

      /** Aborts delayed cursor update */
      _abortUpdateCursor() {
         if (this._cursorChanging) {
            clearTimeout(this._cursorChanging);
            delete this._cursorChanging;
         }
      }

      /** Aligns cursor to nearest available position */
      alignCursor() {
         this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
      }

      /** Aligns cursor only if selection is empty */
      alignCursorFriendly() {
         if (this.selectionStart !== this.cursorPos) return; // skip if range is selected
         this.alignCursor();
      }

      /** Adds listener on custom event */
      on(ev, handler) {
         if (!this._listeners[ev]) this._listeners[ev] = [];
         this._listeners[ev].push(handler);
         return this;
      }

      /** Removes custom event listener */
      off(ev, handler) {
         if (!this._listeners[ev]) return this;
         if (!handler) {
            delete this._listeners[ev];
            return this;
         }
         const hIndex = this._listeners[ev].indexOf(handler);
         if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
         return this;
      }

      /** Handles view input event */
      _onInput(e) {
         this._inputEvent = e;
         this._abortUpdateCursor();
         const details = new ActionDetails({
            // new state
            value: this.el.value,
            cursorPos: this.cursorPos,
            // old state
            oldValue: this.displayValue,
            oldSelection: this._selection
         });
         const oldRawValue = this.masked.rawInputValue;
         const offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection, {
            input: true,
            raw: true
         }).offset;

         // force align in remove direction only if no input chars were removed
         // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
         const removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
         let cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
         if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);
         this.updateControl(cursorPos);
         delete this._inputEvent;
      }

      /** Handles view change event and commits model value */
      _onChange() {
         if (this.displayValue !== this.el.value) this.updateValue();
         this.masked.doCommit();
         this.updateControl();
         this._saveSelection();
      }

      /** Handles view drop event, prevents by default */
      _onDrop(ev) {
         ev.preventDefault();
         ev.stopPropagation();
      }

      /** Restore last selection on focus */
      _onFocus(ev) {
         this.alignCursorFriendly();
      }

      /** Restore last selection on focus */
      _onClick(ev) {
         this.alignCursorFriendly();
      }
      _onUndo() {
         this._applyHistoryState(this.history.undo());
      }
      _onRedo() {
         this._applyHistoryState(this.history.redo());
      }
      _applyHistoryState(state) {
         if (!state) return;
         this._historyChanging = true;
         this.unmaskedValue = state.unmaskedValue;
         this.el.select(state.selection.start, state.selection.end);
         this._saveSelection();
         this._historyChanging = false;
      }

      /** Unbind view events and removes element reference */
      destroy() {
         this._unbindEvents();
         this._listeners.length = 0;
         delete this.el;
      }
   }
   IMask.InputMask = InputMask;

   /** Provides details of changing model value */
   class ChangeDetails {
      /** Inserted symbols */

      /** Additional offset if any changes occurred before tail */

      /** Raw inserted is used by dynamic mask */

      /** Can skip chars */

      static normalize(prep) {
         return Array.isArray(prep) ? prep : [prep, new ChangeDetails()];
      }
      constructor(details) {
         Object.assign(this, {
            inserted: '',
            rawInserted: '',
            tailShift: 0,
            skip: false
         }, details);
      }

      /** Aggregate changes */
      aggregate(details) {
         this.inserted += details.inserted;
         this.rawInserted += details.rawInserted;
         this.tailShift += details.tailShift;
         this.skip = this.skip || details.skip;
         return this;
      }

      /** Total offset considering all changes */
      get offset() {
         return this.tailShift + this.inserted.length;
      }
      get consumed() {
         return Boolean(this.rawInserted) || this.skip;
      }
      equals(details) {
         return this.inserted === details.inserted && this.tailShift === details.tailShift && this.rawInserted === details.rawInserted && this.skip === details.skip;
      }
   }
   IMask.ChangeDetails = ChangeDetails;

   /** Provides details of continuous extracted tail */
   class ContinuousTailDetails {
      /** Tail value as string */

      /** Tail start position */

      /** Start position */

      constructor(value, from, stop) {
         if (value === void 0) {
            value = '';
         }
         if (from === void 0) {
            from = 0;
         }
         this.value = value;
         this.from = from;
         this.stop = stop;
      }
      toString() {
         return this.value;
      }
      extend(tail) {
         this.value += String(tail);
      }
      appendTo(masked) {
         return masked.append(this.toString(), {
            tail: true
         }).aggregate(masked._appendPlaceholder());
      }
      get state() {
         return {
            value: this.value,
            from: this.from,
            stop: this.stop
         };
      }
      set state(state) {
         Object.assign(this, state);
      }
      unshift(beforePos) {
         if (!this.value.length || beforePos != null && this.from >= beforePos) return '';
         const shiftChar = this.value[0];
         this.value = this.value.slice(1);
         return shiftChar;
      }
      shift() {
         if (!this.value.length) return '';
         const shiftChar = this.value[this.value.length - 1];
         this.value = this.value.slice(0, -1);
         return shiftChar;
      }
   }

   /** Append flags */

   /** Extract flags */

   // see https://github.com/microsoft/TypeScript/issues/6223

   /** Provides common masking stuff */
   class Masked {
      /** */

      /** */

      /** Transforms value before mask processing */

      /** Transforms each char before mask processing */

      /** Validates if value is acceptable */

      /** Does additional processing at the end of editing */

      /** Format typed value to string */

      /** Parse string to get typed value */

      /** Enable characters overwriting */

      /** */

      /** */

      /** */

      /** */

      constructor(opts) {
         this._value = '';
         this._update({
            ...Masked.DEFAULTS,
            ...opts
         });
         this._initialized = true;
      }

      /** Sets and applies new options */
      updateOptions(opts) {
         if (!this.optionsIsChanged(opts)) return;
         this.withValueRefresh(this._update.bind(this, opts));
      }

      /** Sets new options */
      _update(opts) {
         Object.assign(this, opts);
      }

      /** Mask state */
      get state() {
         return {
            _value: this.value,
            _rawInputValue: this.rawInputValue
         };
      }
      set state(state) {
         this._value = state._value;
      }

      /** Resets value */
      reset() {
         this._value = '';
      }
      get value() {
         return this._value;
      }
      set value(value) {
         this.resolve(value, {
            input: true
         });
      }

      /** Resolve new value */
      resolve(value, flags) {
         if (flags === void 0) {
            flags = {
               input: true
            };
         }
         this.reset();
         this.append(value, flags, '');
         this.doCommit();
      }
      get unmaskedValue() {
         return this.value;
      }
      set unmaskedValue(value) {
         this.resolve(value, {});
      }
      get typedValue() {
         return this.parse ? this.parse(this.value, this) : this.unmaskedValue;
      }
      set typedValue(value) {
         if (this.format) {
            this.value = this.format(value, this);
         } else {
            this.unmaskedValue = String(value);
         }
      }

      /** Value that includes raw user input */
      get rawInputValue() {
         return this.extractInput(0, this.displayValue.length, {
            raw: true
         });
      }
      set rawInputValue(value) {
         this.resolve(value, {
            raw: true
         });
      }
      get displayValue() {
         return this.value;
      }
      get isComplete() {
         return true;
      }
      get isFilled() {
         return this.isComplete;
      }

      /** Finds nearest input position in direction */
      nearestInputPos(cursorPos, direction) {
         return cursorPos;
      }
      totalInputPositions(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         return Math.min(this.displayValue.length, toPos - fromPos);
      }

      /** Extracts value in range considering flags */
      extractInput(fromPos, toPos, flags) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         return this.displayValue.slice(fromPos, toPos);
      }

      /** Extracts tail in range */
      extractTail(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
      }

      /** Appends tail */
      appendTail(tail) {
         if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
         return tail.appendTo(this);
      }

      /** Appends char */
      _appendCharRaw(ch, flags) {
         if (!ch) return new ChangeDetails();
         this._value += ch;
         return new ChangeDetails({
            inserted: ch,
            rawInserted: ch
         });
      }

      /** Appends char */
      _appendChar(ch, flags, checkTail) {
         if (flags === void 0) {
            flags = {};
         }
         const consistentState = this.state;
         let details;
         [ch, details] = this.doPrepareChar(ch, flags);
         if (ch) {
            details = details.aggregate(this._appendCharRaw(ch, flags));

            // TODO handle `skip`?

            // try `autofix` lookahead
            if (!details.rawInserted && this.autofix === 'pad') {
               const noFixState = this.state;
               this.state = consistentState;
               let fixDetails = this.pad(flags);
               const chDetails = this._appendCharRaw(ch, flags);
               fixDetails = fixDetails.aggregate(chDetails);

               // if fix was applied or
               // if details are equal use skip restoring state optimization
               if (chDetails.rawInserted || fixDetails.equals(details)) {
                  details = fixDetails;
               } else {
                  this.state = noFixState;
               }
            }
         }
         if (details.inserted) {
            let consistentTail;
            let appended = this.doValidate(flags) !== false;
            if (appended && checkTail != null) {
               // validation ok, check tail
               const beforeTailState = this.state;
               if (this.overwrite === true) {
                  consistentTail = checkTail.state;
                  for (let i = 0; i < details.rawInserted.length; ++i) {
                     checkTail.unshift(this.displayValue.length - details.tailShift);
                  }
               }
               let tailDetails = this.appendTail(checkTail);
               appended = tailDetails.rawInserted.length === checkTail.toString().length;

               // not ok, try shift
               if (!(appended && tailDetails.inserted) && this.overwrite === 'shift') {
                  this.state = beforeTailState;
                  consistentTail = checkTail.state;
                  for (let i = 0; i < details.rawInserted.length; ++i) {
                     checkTail.shift();
                  }
                  tailDetails = this.appendTail(checkTail);
                  appended = tailDetails.rawInserted.length === checkTail.toString().length;
               }

               // if ok, rollback state after tail
               if (appended && tailDetails.inserted) this.state = beforeTailState;
            }

            // revert all if something went wrong
            if (!appended) {
               details = new ChangeDetails();
               this.state = consistentState;
               if (checkTail && consistentTail) checkTail.state = consistentTail;
            }
         }
         return details;
      }

      /** Appends optional placeholder at the end */
      _appendPlaceholder() {
         return new ChangeDetails();
      }

      /** Appends optional eager placeholder at the end */
      _appendEager() {
         return new ChangeDetails();
      }

      /** Appends symbols considering flags */
      append(str, flags, tail) {
         if (!isString(str)) throw new Error('value should be string');
         const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
         if (flags != null && flags.tail) flags._beforeTailState = this.state;
         let details;
         [str, details] = this.doPrepare(str, flags);
         for (let ci = 0; ci < str.length; ++ci) {
            const d = this._appendChar(str[ci], flags, checkTail);
            if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
            details.aggregate(d);
         }
         if ((this.eager === true || this.eager === 'append') && flags != null && flags.input && str) {
            details.aggregate(this._appendEager());
         }

         // append tail but aggregate only tailShift
         if (checkTail != null) {
            details.tailShift += this.appendTail(checkTail).tailShift;
            // TODO it's a good idea to clear state after appending ends
            // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
            // this._resetBeforeTailState();
         }
         return details;
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         this._value = this.displayValue.slice(0, fromPos) + this.displayValue.slice(toPos);
         return new ChangeDetails();
      }

      /** Calls function and reapplies current value */
      withValueRefresh(fn) {
         if (this._refreshing || !this._initialized) return fn();
         this._refreshing = true;
         const rawInput = this.rawInputValue;
         const value = this.value;
         const ret = fn();
         this.rawInputValue = rawInput;
         // append lost trailing chars at the end
         if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
            this.append(value.slice(this.displayValue.length), {}, '');
            this.doCommit();
         }
         delete this._refreshing;
         return ret;
      }
      runIsolated(fn) {
         if (this._isolated || !this._initialized) return fn(this);
         this._isolated = true;
         const state = this.state;
         const ret = fn(this);
         this.state = state;
         delete this._isolated;
         return ret;
      }
      doSkipInvalid(ch, flags, checkTail) {
         return Boolean(this.skipInvalid);
      }

      /** Prepares string before mask processing */
      doPrepare(str, flags) {
         if (flags === void 0) {
            flags = {};
         }
         return ChangeDetails.normalize(this.prepare ? this.prepare(str, this, flags) : str);
      }

      /** Prepares each char before mask processing */
      doPrepareChar(str, flags) {
         if (flags === void 0) {
            flags = {};
         }
         return ChangeDetails.normalize(this.prepareChar ? this.prepareChar(str, this, flags) : str);
      }

      /** Validates if value is acceptable */
      doValidate(flags) {
         return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
      }

      /** Does additional processing at the end of editing */
      doCommit() {
         if (this.commit) this.commit(this.value, this);
      }
      splice(start, deleteCount, inserted, removeDirection, flags) {
         if (inserted === void 0) {
            inserted = '';
         }
         if (removeDirection === void 0) {
            removeDirection = DIRECTION.NONE;
         }
         if (flags === void 0) {
            flags = {
               input: true
            };
         }
         const tailPos = start + deleteCount;
         const tail = this.extractTail(tailPos);
         const eagerRemove = this.eager === true || this.eager === 'remove';
         let oldRawValue;
         if (eagerRemove) {
            removeDirection = forceDirection(removeDirection);
            oldRawValue = this.extractInput(0, tailPos, {
               raw: true
            });
         }
         let startChangePos = start;
         const details = new ChangeDetails();

         // if it is just deletion without insertion
         if (removeDirection !== DIRECTION.NONE) {
            startChangePos = this.nearestInputPos(start, deleteCount > 1 && start !== 0 && !eagerRemove ? DIRECTION.NONE : removeDirection);

            // adjust tailShift if start was aligned
            details.tailShift = startChangePos - start;
         }
         details.aggregate(this.remove(startChangePos));
         if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) {
            if (removeDirection === DIRECTION.FORCE_LEFT) {
               let valLength;
               while (oldRawValue === this.rawInputValue && (valLength = this.displayValue.length)) {
                  details.aggregate(new ChangeDetails({
                     tailShift: -1
                  })).aggregate(this.remove(valLength - 1));
               }
            } else if (removeDirection === DIRECTION.FORCE_RIGHT) {
               tail.unshift();
            }
         }
         return details.aggregate(this.append(inserted, flags, tail));
      }
      maskEquals(mask) {
         return this.mask === mask;
      }
      optionsIsChanged(opts) {
         return !objectIncludes(this, opts);
      }
      typedValueEquals(value) {
         const tval = this.typedValue;
         return value === tval || Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) || (this.format ? this.format(value, this) === this.format(this.typedValue, this) : false);
      }
      pad(flags) {
         return new ChangeDetails();
      }
   }
   Masked.DEFAULTS = {
      skipInvalid: true
   };
   Masked.EMPTY_VALUES = [undefined, null, ''];
   IMask.Masked = Masked;

   class ChunksTailDetails {
      /** */

      constructor(chunks, from) {
         if (chunks === void 0) {
            chunks = [];
         }
         if (from === void 0) {
            from = 0;
         }
         this.chunks = chunks;
         this.from = from;
      }
      toString() {
         return this.chunks.map(String).join('');
      }
      extend(tailChunk) {
         if (!String(tailChunk)) return;
         tailChunk = isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk;
         const lastChunk = this.chunks[this.chunks.length - 1];
         const extendLast = lastChunk && (
            // if stops are same or tail has no stop
            lastChunk.stop === tailChunk.stop || tailChunk.stop == null) &&
            // if tail chunk goes just after last chunk
            tailChunk.from === lastChunk.from + lastChunk.toString().length;
         if (tailChunk instanceof ContinuousTailDetails) {
            // check the ability to extend previous chunk
            if (extendLast) {
               // extend previous chunk
               lastChunk.extend(tailChunk.toString());
            } else {
               // append new chunk
               this.chunks.push(tailChunk);
            }
         } else if (tailChunk instanceof ChunksTailDetails) {
            if (tailChunk.stop == null) {
               // unwrap floating chunks to parent, keeping `from` pos
               let firstTailChunk;
               while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
                  firstTailChunk = tailChunk.chunks.shift(); // not possible to be `undefined` because length was checked above
                  firstTailChunk.from += tailChunk.from;
                  this.extend(firstTailChunk);
               }
            }

            // if tail chunk still has value
            if (tailChunk.toString()) {
               // if chunks contains stops, then popup stop to container
               tailChunk.stop = tailChunk.blockIndex;
               this.chunks.push(tailChunk);
            }
         }
      }
      appendTo(masked) {
         if (!(masked instanceof IMask.MaskedPattern)) {
            const tail = new ContinuousTailDetails(this.toString());
            return tail.appendTo(masked);
         }
         const details = new ChangeDetails();
         for (let ci = 0; ci < this.chunks.length; ++ci) {
            const chunk = this.chunks[ci];
            const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
            const stop = chunk.stop;
            let chunkBlock;
            if (stop != null && (
               // if block not found or stop is behind lastBlock
               !lastBlockIter || lastBlockIter.index <= stop)) {
               if (chunk instanceof ChunksTailDetails ||
                  // for continuous block also check if stop is exist
                  masked._stops.indexOf(stop) >= 0) {
                  details.aggregate(masked._appendPlaceholder(stop));
               }
               chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
            }
            if (chunkBlock) {
               const tailDetails = chunkBlock.appendTail(chunk);
               details.aggregate(tailDetails);

               // get not inserted chars
               const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
               if (remainChars) details.aggregate(masked.append(remainChars, {
                  tail: true
               }));
            } else {
               details.aggregate(masked.append(chunk.toString(), {
                  tail: true
               }));
            }
         }
         return details;
      }
      get state() {
         return {
            chunks: this.chunks.map(c => c.state),
            from: this.from,
            stop: this.stop,
            blockIndex: this.blockIndex
         };
      }
      set state(state) {
         const {
            chunks,
            ...props
         } = state;
         Object.assign(this, props);
         this.chunks = chunks.map(cstate => {
            const chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails();
            chunk.state = cstate;
            return chunk;
         });
      }
      unshift(beforePos) {
         if (!this.chunks.length || beforePos != null && this.from >= beforePos) return '';
         const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
         let ci = 0;
         while (ci < this.chunks.length) {
            const chunk = this.chunks[ci];
            const shiftChar = chunk.unshift(chunkShiftPos);
            if (chunk.toString()) {
               // chunk still contains value
               // but not shifted - means no more available chars to shift
               if (!shiftChar) break;
               ++ci;
            } else {
               // clean if chunk has no value
               this.chunks.splice(ci, 1);
            }
            if (shiftChar) return shiftChar;
         }
         return '';
      }
      shift() {
         if (!this.chunks.length) return '';
         let ci = this.chunks.length - 1;
         while (0 <= ci) {
            const chunk = this.chunks[ci];
            const shiftChar = chunk.shift();
            if (chunk.toString()) {
               // chunk still contains value
               // but not shifted - means no more available chars to shift
               if (!shiftChar) break;
               --ci;
            } else {
               // clean if chunk has no value
               this.chunks.splice(ci, 1);
            }
            if (shiftChar) return shiftChar;
         }
         return '';
      }
   }

   class PatternCursor {
      constructor(masked, pos) {
         this.masked = masked;
         this._log = [];
         const {
            offset,
            index
         } = masked._mapPosToBlock(pos) || (pos < 0 ?
            // first
            {
               index: 0,
               offset: 0
            } :
            // last
            {
               index: this.masked._blocks.length,
               offset: 0
            });
         this.offset = offset;
         this.index = index;
         this.ok = false;
      }
      get block() {
         return this.masked._blocks[this.index];
      }
      get pos() {
         return this.masked._blockStartPos(this.index) + this.offset;
      }
      get state() {
         return {
            index: this.index,
            offset: this.offset,
            ok: this.ok
         };
      }
      set state(s) {
         Object.assign(this, s);
      }
      pushState() {
         this._log.push(this.state);
      }
      popState() {
         const s = this._log.pop();
         if (s) this.state = s;
         return s;
      }
      bindBlock() {
         if (this.block) return;
         if (this.index < 0) {
            this.index = 0;
            this.offset = 0;
         }
         if (this.index >= this.masked._blocks.length) {
            this.index = this.masked._blocks.length - 1;
            this.offset = this.block.displayValue.length; // TODO this is stupid type error, `block` depends on index that was changed above
         }
      }
      _pushLeft(fn) {
         this.pushState();
         for (this.bindBlock(); 0 <= this.index; --this.index, this.offset = ((_this$block = this.block) == null ? void 0 : _this$block.displayValue.length) || 0) {
            var _this$block;
            if (fn()) return this.ok = true;
         }
         return this.ok = false;
      }
      _pushRight(fn) {
         this.pushState();
         for (this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) {
            if (fn()) return this.ok = true;
         }
         return this.ok = false;
      }
      pushLeftBeforeFilled() {
         return this._pushLeft(() => {
            if (this.block.isFixed || !this.block.value) return;
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
            if (this.offset !== 0) return true;
         });
      }
      pushLeftBeforeInput() {
         // cases:
         // filled input: 00|
         // optional empty input: 00[]|
         // nested block: XX<[]>|
         return this._pushLeft(() => {
            if (this.block.isFixed) return;
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
            return true;
         });
      }
      pushLeftBeforeRequired() {
         return this._pushLeft(() => {
            if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
            return true;
         });
      }
      pushRightBeforeFilled() {
         return this._pushRight(() => {
            if (this.block.isFixed || !this.block.value) return;
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
            if (this.offset !== this.block.value.length) return true;
         });
      }
      pushRightBeforeInput() {
         return this._pushRight(() => {
            if (this.block.isFixed) return;

            // const o = this.offset;
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
            // HACK cases like (STILL DOES NOT WORK FOR NESTED)
            // aa|X
            // aa<X|[]>X_    - this will not work
            // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
            return true;
         });
      }
      pushRightBeforeRequired() {
         return this._pushRight(() => {
            if (this.block.isFixed || this.block.isOptional && !this.block.value) return;

            // TODO check |[*]XX_
            this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
            return true;
         });
      }
   }

   class PatternFixedDefinition {
      /** */

      /** */

      /** */

      /** */

      /** */

      /** */

      constructor(opts) {
         Object.assign(this, opts);
         this._value = '';
         this.isFixed = true;
      }
      get value() {
         return this._value;
      }
      get unmaskedValue() {
         return this.isUnmasking ? this.value : '';
      }
      get rawInputValue() {
         return this._isRawInput ? this.value : '';
      }
      get displayValue() {
         return this.value;
      }
      reset() {
         this._isRawInput = false;
         this._value = '';
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this._value.length;
         }
         this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
         if (!this._value) this._isRawInput = false;
         return new ChangeDetails();
      }
      nearestInputPos(cursorPos, direction) {
         if (direction === void 0) {
            direction = DIRECTION.NONE;
         }
         const minPos = 0;
         const maxPos = this._value.length;
         switch (direction) {
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
               return minPos;
            case DIRECTION.NONE:
            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
            default:
               return maxPos;
         }
      }
      totalInputPositions(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this._value.length;
         }
         return this._isRawInput ? toPos - fromPos : 0;
      }
      extractInput(fromPos, toPos, flags) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this._value.length;
         }
         if (flags === void 0) {
            flags = {};
         }
         return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
      }
      get isComplete() {
         return true;
      }
      get isFilled() {
         return Boolean(this._value);
      }
      _appendChar(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         if (this.isFilled) return new ChangeDetails();
         const appendEager = this.eager === true || this.eager === 'append';
         const appended = this.char === ch;
         const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && (!flags.raw || !appendEager) && !flags.tail;
         const details = new ChangeDetails({
            inserted: this.char,
            rawInserted: isResolved ? this.char : ''
         });
         this._value = this.char;
         this._isRawInput = isResolved && (flags.raw || flags.input);
         return details;
      }
      _appendEager() {
         return this._appendChar(this.char, {
            tail: true
         });
      }
      _appendPlaceholder() {
         const details = new ChangeDetails();
         if (this.isFilled) return details;
         this._value = details.inserted = this.char;
         return details;
      }
      extractTail() {
         return new ContinuousTailDetails('');
      }
      appendTail(tail) {
         if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
         return tail.appendTo(this);
      }
      append(str, flags, tail) {
         const details = this._appendChar(str[0], flags);
         if (tail != null) {
            details.tailShift += this.appendTail(tail).tailShift;
         }
         return details;
      }
      doCommit() { }
      get state() {
         return {
            _value: this._value,
            _rawInputValue: this.rawInputValue
         };
      }
      set state(state) {
         this._value = state._value;
         this._isRawInput = Boolean(state._rawInputValue);
      }
      pad(flags) {
         return this._appendPlaceholder();
      }
   }

   class PatternInputDefinition {
      /** */

      /** */

      /** */

      /** */

      /** */

      /** */

      /** */

      /** */

      constructor(opts) {
         const {
            parent,
            isOptional,
            placeholderChar,
            displayChar,
            lazy,
            eager,
            ...maskOpts
         } = opts;
         this.masked = createMask(maskOpts);
         Object.assign(this, {
            parent,
            isOptional,
            placeholderChar,
            displayChar,
            lazy,
            eager
         });
      }
      reset() {
         this.isFilled = false;
         this.masked.reset();
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.value.length;
         }
         if (fromPos === 0 && toPos >= 1) {
            this.isFilled = false;
            return this.masked.remove(fromPos, toPos);
         }
         return new ChangeDetails();
      }
      get value() {
         return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : '');
      }
      get unmaskedValue() {
         return this.masked.unmaskedValue;
      }
      get rawInputValue() {
         return this.masked.rawInputValue;
      }
      get displayValue() {
         return this.masked.value && this.displayChar || this.value;
      }
      get isComplete() {
         return Boolean(this.masked.value) || this.isOptional;
      }
      _appendChar(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         if (this.isFilled) return new ChangeDetails();
         const state = this.masked.state;
         // simulate input
         let details = this.masked._appendChar(ch, this.currentMaskFlags(flags));
         if (details.inserted && this.doValidate(flags) === false) {
            details = new ChangeDetails();
            this.masked.state = state;
         }
         if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
            details.inserted = this.placeholderChar;
         }
         details.skip = !details.inserted && !this.isOptional;
         this.isFilled = Boolean(details.inserted);
         return details;
      }
      append(str, flags, tail) {
         // TODO probably should be done via _appendChar
         return this.masked.append(str, this.currentMaskFlags(flags), tail);
      }
      _appendPlaceholder() {
         if (this.isFilled || this.isOptional) return new ChangeDetails();
         this.isFilled = true;
         return new ChangeDetails({
            inserted: this.placeholderChar
         });
      }
      _appendEager() {
         return new ChangeDetails();
      }
      extractTail(fromPos, toPos) {
         return this.masked.extractTail(fromPos, toPos);
      }
      appendTail(tail) {
         return this.masked.appendTail(tail);
      }
      extractInput(fromPos, toPos, flags) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.value.length;
         }
         return this.masked.extractInput(fromPos, toPos, flags);
      }
      nearestInputPos(cursorPos, direction) {
         if (direction === void 0) {
            direction = DIRECTION.NONE;
         }
         const minPos = 0;
         const maxPos = this.value.length;
         const boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);
         switch (direction) {
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
               return this.isComplete ? boundPos : minPos;
            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
               return this.isComplete ? boundPos : maxPos;
            case DIRECTION.NONE:
            default:
               return boundPos;
         }
      }
      totalInputPositions(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.value.length;
         }
         return this.value.slice(fromPos, toPos).length;
      }
      doValidate(flags) {
         return this.masked.doValidate(this.currentMaskFlags(flags)) && (!this.parent || this.parent.doValidate(this.currentMaskFlags(flags)));
      }
      doCommit() {
         this.masked.doCommit();
      }
      get state() {
         return {
            _value: this.value,
            _rawInputValue: this.rawInputValue,
            masked: this.masked.state,
            isFilled: this.isFilled
         };
      }
      set state(state) {
         this.masked.state = state.masked;
         this.isFilled = state.isFilled;
      }
      currentMaskFlags(flags) {
         var _flags$_beforeTailSta;
         return {
            ...flags,
            _beforeTailState: (flags == null || (_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.masked) || (flags == null ? void 0 : flags._beforeTailState)
         };
      }
      pad(flags) {
         return new ChangeDetails();
      }
   }
   PatternInputDefinition.DEFAULT_DEFINITIONS = {
      '0': /\d/,
      'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      // http://stackoverflow.com/a/22075070
      '*': /./
   };

   /** Masking by RegExp */
   class MaskedRegExp extends Masked {
      /** */

      /** Enable characters overwriting */

      /** */

      /** */

      /** */

      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         const mask = opts.mask;
         if (mask) opts.validate = value => value.search(mask) >= 0;
         super._update(opts);
      }
   }
   IMask.MaskedRegExp = MaskedRegExp;

   /** Pattern mask */
   class MaskedPattern extends Masked {
      /** */

      /** */

      /** Single char for empty input */

      /** Single char for filled input */

      /** Show placeholder only when needed */

      /** Enable characters overwriting */

      /** */

      /** */

      /** */

      constructor(opts) {
         super({
            ...MaskedPattern.DEFAULTS,
            ...opts,
            definitions: Object.assign({}, PatternInputDefinition.DEFAULT_DEFINITIONS, opts == null ? void 0 : opts.definitions)
         });
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         opts.definitions = Object.assign({}, this.definitions, opts.definitions);
         super._update(opts);
         this._rebuildMask();
      }
      _rebuildMask() {
         const defs = this.definitions;
         this._blocks = [];
         this.exposeBlock = undefined;
         this._stops = [];
         this._maskedBlocks = {};
         const pattern = this.mask;
         if (!pattern || !defs) return;
         let unmaskingBlock = false;
         let optionalBlock = false;
         for (let i = 0; i < pattern.length; ++i) {
            if (this.blocks) {
               const p = pattern.slice(i);
               const bNames = Object.keys(this.blocks).filter(bName => p.indexOf(bName) === 0);
               // order by key length
               bNames.sort((a, b) => b.length - a.length);
               // use block name with max length
               const bName = bNames[0];
               if (bName) {
                  const {
                     expose,
                     repeat,
                     ...bOpts
                  } = normalizeOpts(this.blocks[bName]); // TODO type Opts<Arg & Extra>
                  const blockOpts = {
                     lazy: this.lazy,
                     eager: this.eager,
                     placeholderChar: this.placeholderChar,
                     displayChar: this.displayChar,
                     overwrite: this.overwrite,
                     autofix: this.autofix,
                     ...bOpts,
                     repeat,
                     parent: this
                  };
                  const maskedBlock = repeat != null ? new IMask.RepeatBlock(blockOpts /* TODO */) : createMask(blockOpts);
                  if (maskedBlock) {
                     this._blocks.push(maskedBlock);
                     if (expose) this.exposeBlock = maskedBlock;

                     // store block index
                     if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
                     this._maskedBlocks[bName].push(this._blocks.length - 1);
                  }
                  i += bName.length - 1;
                  continue;
               }
            }
            let char = pattern[i];
            let isInput = (char in defs);
            if (char === MaskedPattern.STOP_CHAR) {
               this._stops.push(this._blocks.length);
               continue;
            }
            if (char === '{' || char === '}') {
               unmaskingBlock = !unmaskingBlock;
               continue;
            }
            if (char === '[' || char === ']') {
               optionalBlock = !optionalBlock;
               continue;
            }
            if (char === MaskedPattern.ESCAPE_CHAR) {
               ++i;
               char = pattern[i];
               if (!char) break;
               isInput = false;
            }
            const def = isInput ? new PatternInputDefinition({
               isOptional: optionalBlock,
               lazy: this.lazy,
               eager: this.eager,
               placeholderChar: this.placeholderChar,
               displayChar: this.displayChar,
               ...normalizeOpts(defs[char]),
               parent: this
            }) : new PatternFixedDefinition({
               char,
               eager: this.eager,
               isUnmasking: unmaskingBlock
            });
            this._blocks.push(def);
         }
      }
      get state() {
         return {
            ...super.state,
            _blocks: this._blocks.map(b => b.state)
         };
      }
      set state(state) {
         if (!state) {
            this.reset();
            return;
         }
         const {
            _blocks,
            ...maskedState
         } = state;
         this._blocks.forEach((b, bi) => b.state = _blocks[bi]);
         super.state = maskedState;
      }
      reset() {
         super.reset();
         this._blocks.forEach(b => b.reset());
      }
      get isComplete() {
         return this.exposeBlock ? this.exposeBlock.isComplete : this._blocks.every(b => b.isComplete);
      }
      get isFilled() {
         return this._blocks.every(b => b.isFilled);
      }
      get isFixed() {
         return this._blocks.every(b => b.isFixed);
      }
      get isOptional() {
         return this._blocks.every(b => b.isOptional);
      }
      doCommit() {
         this._blocks.forEach(b => b.doCommit());
         super.doCommit();
      }
      get unmaskedValue() {
         return this.exposeBlock ? this.exposeBlock.unmaskedValue : this._blocks.reduce((str, b) => str += b.unmaskedValue, '');
      }
      set unmaskedValue(unmaskedValue) {
         if (this.exposeBlock) {
            const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
            this.exposeBlock.unmaskedValue = unmaskedValue;
            this.appendTail(tail);
            this.doCommit();
         } else super.unmaskedValue = unmaskedValue;
      }
      get value() {
         return this.exposeBlock ? this.exposeBlock.value :
            // TODO return _value when not in change?
            this._blocks.reduce((str, b) => str += b.value, '');
      }
      set value(value) {
         if (this.exposeBlock) {
            const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
            this.exposeBlock.value = value;
            this.appendTail(tail);
            this.doCommit();
         } else super.value = value;
      }
      get typedValue() {
         return this.exposeBlock ? this.exposeBlock.typedValue : super.typedValue;
      }
      set typedValue(value) {
         if (this.exposeBlock) {
            const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
            this.exposeBlock.typedValue = value;
            this.appendTail(tail);
            this.doCommit();
         } else super.typedValue = value;
      }
      get displayValue() {
         return this._blocks.reduce((str, b) => str += b.displayValue, '');
      }
      appendTail(tail) {
         return super.appendTail(tail).aggregate(this._appendPlaceholder());
      }
      _appendEager() {
         var _this$_mapPosToBlock;
         const details = new ChangeDetails();
         let startBlockIndex = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index;
         if (startBlockIndex == null) return details;

         // TODO test if it works for nested pattern masks
         if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;
         for (let bi = startBlockIndex; bi < this._blocks.length; ++bi) {
            const d = this._blocks[bi]._appendEager();
            if (!d.inserted) break;
            details.aggregate(d);
         }
         return details;
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const blockIter = this._mapPosToBlock(this.displayValue.length);
         const details = new ChangeDetails();
         if (!blockIter) return details;
         for (let bi = blockIter.index, block; block = this._blocks[bi]; ++bi) {
            var _flags$_beforeTailSta;
            const blockDetails = block._appendChar(ch, {
               ...flags,
               _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
            });
            details.aggregate(blockDetails);
            if (blockDetails.consumed) break; // go next char
         }
         return details;
      }
      extractTail(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         const chunkTail = new ChunksTailDetails();
         if (fromPos === toPos) return chunkTail;
         this._forEachBlocksInRange(fromPos, toPos, (b, bi, bFromPos, bToPos) => {
            const blockChunk = b.extractTail(bFromPos, bToPos);
            blockChunk.stop = this._findStopBefore(bi);
            blockChunk.from = this._blockStartPos(bi);
            if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
            chunkTail.extend(blockChunk);
         });
         return chunkTail;
      }
      extractInput(fromPos, toPos, flags) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         if (flags === void 0) {
            flags = {};
         }
         if (fromPos === toPos) return '';
         let input = '';
         this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
            input += b.extractInput(fromPos, toPos, flags);
         });
         return input;
      }
      _findStopBefore(blockIndex) {
         let stopBefore;
         for (let si = 0; si < this._stops.length; ++si) {
            const stop = this._stops[si];
            if (stop <= blockIndex) stopBefore = stop; else break;
         }
         return stopBefore;
      }

      /** Appends placeholder depending on laziness */
      _appendPlaceholder(toBlockIndex) {
         const details = new ChangeDetails();
         if (this.lazy && toBlockIndex == null) return details;
         const startBlockIter = this._mapPosToBlock(this.displayValue.length);
         if (!startBlockIter) return details;
         const startBlockIndex = startBlockIter.index;
         const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;
         this._blocks.slice(startBlockIndex, endBlockIndex).forEach(b => {
            if (!b.lazy || toBlockIndex != null) {
               var _blocks2;
               details.aggregate(b._appendPlaceholder((_blocks2 = b._blocks) == null ? void 0 : _blocks2.length));
            }
         });
         return details;
      }

      /** Finds block in pos */
      _mapPosToBlock(pos) {
         let accVal = '';
         for (let bi = 0; bi < this._blocks.length; ++bi) {
            const block = this._blocks[bi];
            const blockStartPos = accVal.length;
            accVal += block.displayValue;
            if (pos <= accVal.length) {
               return {
                  index: bi,
                  offset: pos - blockStartPos
               };
            }
         }
      }
      _blockStartPos(blockIndex) {
         return this._blocks.slice(0, blockIndex).reduce((pos, b) => pos += b.displayValue.length, 0);
      }
      _forEachBlocksInRange(fromPos, toPos, fn) {
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         const fromBlockIter = this._mapPosToBlock(fromPos);
         if (fromBlockIter) {
            const toBlockIter = this._mapPosToBlock(toPos);
            // process first block
            const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
            const fromBlockStartPos = fromBlockIter.offset;
            const fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].displayValue.length;
            fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);
            if (toBlockIter && !isSameBlock) {
               // process intermediate blocks
               for (let bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
                  fn(this._blocks[bi], bi, 0, this._blocks[bi].displayValue.length);
               }

               // process last block
               fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
            }
         }
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         const removeDetails = super.remove(fromPos, toPos);
         this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
            removeDetails.aggregate(b.remove(bFromPos, bToPos));
         });
         return removeDetails;
      }
      nearestInputPos(cursorPos, direction) {
         if (direction === void 0) {
            direction = DIRECTION.NONE;
         }
         if (!this._blocks.length) return 0;
         const cursor = new PatternCursor(this, cursorPos);
         if (direction === DIRECTION.NONE) {
            // -------------------------------------------------
            // NONE should only go out from fixed to the right!
            // -------------------------------------------------
            if (cursor.pushRightBeforeInput()) return cursor.pos;
            cursor.popState();
            if (cursor.pushLeftBeforeInput()) return cursor.pos;
            return this.displayValue.length;
         }

         // FORCE is only about a|* otherwise is 0
         if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
            // try to break fast when *|a
            if (direction === DIRECTION.LEFT) {
               cursor.pushRightBeforeFilled();
               if (cursor.ok && cursor.pos === cursorPos) return cursorPos;
               cursor.popState();
            }

            // forward flow
            cursor.pushLeftBeforeInput();
            cursor.pushLeftBeforeRequired();
            cursor.pushLeftBeforeFilled();

            // backward flow
            if (direction === DIRECTION.LEFT) {
               cursor.pushRightBeforeInput();
               cursor.pushRightBeforeRequired();
               if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
               cursor.popState();
               if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
               cursor.popState();
            }
            if (cursor.ok) return cursor.pos;
            if (direction === DIRECTION.FORCE_LEFT) return 0;
            cursor.popState();
            if (cursor.ok) return cursor.pos;
            cursor.popState();
            if (cursor.ok) return cursor.pos;
            return 0;
         }
         if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
            // forward flow
            cursor.pushRightBeforeInput();
            cursor.pushRightBeforeRequired();
            if (cursor.pushRightBeforeFilled()) return cursor.pos;
            if (direction === DIRECTION.FORCE_RIGHT) return this.displayValue.length;

            // backward flow
            cursor.popState();
            if (cursor.ok) return cursor.pos;
            cursor.popState();
            if (cursor.ok) return cursor.pos;
            return this.nearestInputPos(cursorPos, DIRECTION.LEFT);
         }
         return cursorPos;
      }
      totalInputPositions(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         let total = 0;
         this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
            total += b.totalInputPositions(bFromPos, bToPos);
         });
         return total;
      }

      /** Get block by name */
      maskedBlock(name) {
         return this.maskedBlocks(name)[0];
      }

      /** Get all blocks by name */
      maskedBlocks(name) {
         const indices = this._maskedBlocks[name];
         if (!indices) return [];
         return indices.map(gi => this._blocks[gi]);
      }
      pad(flags) {
         const details = new ChangeDetails();
         this._forEachBlocksInRange(0, this.displayValue.length, b => details.aggregate(b.pad(flags)));
         return details;
      }
   }
   MaskedPattern.DEFAULTS = {
      ...Masked.DEFAULTS,
      lazy: true,
      placeholderChar: '_'
   };
   MaskedPattern.STOP_CHAR = '`';
   MaskedPattern.ESCAPE_CHAR = '\\';
   MaskedPattern.InputDefinition = PatternInputDefinition;
   MaskedPattern.FixedDefinition = PatternFixedDefinition;
   IMask.MaskedPattern = MaskedPattern;

   /** Pattern which accepts ranges */
   class MaskedRange extends MaskedPattern {
      /**
        Optionally sets max length of pattern.
        Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
      */

      /** Min bound */

      /** Max bound */

      get _matchFrom() {
         return this.maxLength - String(this.from).length;
      }
      constructor(opts) {
         super(opts); // mask will be created in _update
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         const {
            to = this.to || 0,
            from = this.from || 0,
            maxLength = this.maxLength || 0,
            autofix = this.autofix,
            ...patternOpts
         } = opts;
         this.to = to;
         this.from = from;
         this.maxLength = Math.max(String(to).length, maxLength);
         this.autofix = autofix;
         const fromStr = String(this.from).padStart(this.maxLength, '0');
         const toStr = String(this.to).padStart(this.maxLength, '0');
         let sameCharsCount = 0;
         while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
         patternOpts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(this.maxLength - sameCharsCount);
         super._update(patternOpts);
      }
      get isComplete() {
         return super.isComplete && Boolean(this.value);
      }
      boundaries(str) {
         let minstr = '';
         let maxstr = '';
         const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
         if (num) {
            minstr = '0'.repeat(placeholder.length) + num;
            maxstr = '9'.repeat(placeholder.length) + num;
         }
         minstr = minstr.padEnd(this.maxLength, '0');
         maxstr = maxstr.padEnd(this.maxLength, '9');
         return [minstr, maxstr];
      }
      doPrepareChar(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         let details;
         [ch, details] = super.doPrepareChar(ch.replace(/\D/g, ''), flags);
         if (!ch) details.skip = !this.isComplete;
         return [ch, details];
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         if (!this.autofix || this.value.length + 1 > this.maxLength) return super._appendCharRaw(ch, flags);
         const fromStr = String(this.from).padStart(this.maxLength, '0');
         const toStr = String(this.to).padStart(this.maxLength, '0');
         const [minstr, maxstr] = this.boundaries(this.value + ch);
         if (Number(maxstr) < this.from) return super._appendCharRaw(fromStr[this.value.length], flags);
         if (Number(minstr) > this.to) {
            if (!flags.tail && this.autofix === 'pad' && this.value.length + 1 < this.maxLength) {
               return super._appendCharRaw(fromStr[this.value.length], flags).aggregate(this._appendCharRaw(ch, flags));
            }
            return super._appendCharRaw(toStr[this.value.length], flags);
         }
         return super._appendCharRaw(ch, flags);
      }
      doValidate(flags) {
         const str = this.value;
         const firstNonZero = str.search(/[^0]/);
         if (firstNonZero === -1 && str.length <= this._matchFrom) return true;
         const [minstr, maxstr] = this.boundaries(str);
         return this.from <= Number(maxstr) && Number(minstr) <= this.to && super.doValidate(flags);
      }
      pad(flags) {
         const details = new ChangeDetails();
         if (this.value.length === this.maxLength) return details;
         const value = this.value;
         const padLength = this.maxLength - this.value.length;
         if (padLength) {
            this.reset();
            for (let i = 0; i < padLength; ++i) {
               details.aggregate(super._appendCharRaw('0', flags));
            }

            // append tail
            value.split('').forEach(ch => this._appendCharRaw(ch));
         }
         return details;
      }
   }
   IMask.MaskedRange = MaskedRange;

   /** Date mask */
   class MaskedDate extends MaskedPattern {
      static extractPatternOptions(opts) {
         const {
            mask,
            pattern,
            ...patternOpts
         } = opts;
         return {
            ...patternOpts,
            mask: isString(mask) ? mask : pattern
         };
      }

      /** Pattern mask for date according to {@link MaskedDate#format} */

      /** Start date */

      /** End date */

      /** Format typed value to string */

      /** Parse string to get typed value */

      constructor(opts) {
         super(MaskedDate.extractPatternOptions({
            ...MaskedDate.DEFAULTS,
            ...opts
         }));
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         const {
            mask,
            pattern,
            blocks,
            ...patternOpts
         } = {
            ...MaskedDate.DEFAULTS,
            ...opts
         };
         const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
         // adjust year block
         if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
         if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
         if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to) {
            patternBlocks.m.from = opts.min.getMonth() + 1;
            patternBlocks.m.to = opts.max.getMonth() + 1;
            if (patternBlocks.m.from === patternBlocks.m.to) {
               patternBlocks.d.from = opts.min.getDate();
               patternBlocks.d.to = opts.max.getDate();
            }
         }
         Object.assign(patternBlocks, this.blocks, blocks);
         super._update({
            ...patternOpts,
            mask: isString(mask) ? mask : pattern,
            blocks: patternBlocks
         });
      }
      doValidate(flags) {
         const date = this.date;
         return super.doValidate(flags) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
      }

      /** Checks if date is exists */
      isDateExist(str) {
         return this.format(this.parse(str, this), this).indexOf(str) >= 0;
      }

      /** Parsed Date */
      get date() {
         return this.typedValue;
      }
      set date(date) {
         this.typedValue = date;
      }
      get typedValue() {
         return this.isComplete ? super.typedValue : null;
      }
      set typedValue(value) {
         super.typedValue = value;
      }
      maskEquals(mask) {
         return mask === Date || super.maskEquals(mask);
      }
      optionsIsChanged(opts) {
         return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
      }
   }
   MaskedDate.GET_DEFAULT_BLOCKS = () => ({
      d: {
         mask: MaskedRange,
         from: 1,
         to: 31,
         maxLength: 2
      },
      m: {
         mask: MaskedRange,
         from: 1,
         to: 12,
         maxLength: 2
      },
      Y: {
         mask: MaskedRange,
         from: 1900,
         to: 9999
      }
   });
   MaskedDate.DEFAULTS = {
      ...MaskedPattern.DEFAULTS,
      mask: Date,
      pattern: 'd{.}`m{.}`Y',
      format: (date, masked) => {
         if (!date) return '';
         const day = String(date.getDate()).padStart(2, '0');
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const year = date.getFullYear();
         return [day, month, year].join('.');
      },
      parse: (str, masked) => {
         const [day, month, year] = str.split('.').map(Number);
         return new Date(year, month - 1, day);
      }
   };
   IMask.MaskedDate = MaskedDate;

   /** Dynamic mask for choosing appropriate mask in run-time */
   class MaskedDynamic extends Masked {
      constructor(opts) {
         super({
            ...MaskedDynamic.DEFAULTS,
            ...opts
         });
         this.currentMask = undefined;
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         super._update(opts);
         if ('mask' in opts) {
            this.exposeMask = undefined;
            // mask could be totally dynamic with only `dispatch` option
            this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(m => {
               const {
                  expose,
                  ...maskOpts
               } = normalizeOpts(m);
               const masked = createMask({
                  overwrite: this._overwrite,
                  eager: this._eager,
                  skipInvalid: this._skipInvalid,
                  ...maskOpts
               });
               if (expose) this.exposeMask = masked;
               return masked;
            }) : [];

            // this.currentMask = this.doDispatch(''); // probably not needed but lets see
         }
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const details = this._applyDispatch(ch, flags);
         if (this.currentMask) {
            details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
         }
         return details;
      }
      _applyDispatch(appended, flags, tail) {
         if (appended === void 0) {
            appended = '';
         }
         if (flags === void 0) {
            flags = {};
         }
         if (tail === void 0) {
            tail = '';
         }
         const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
         const inputValue = this.rawInputValue;
         const insertValue = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._rawInputValue : inputValue;
         const tailValue = inputValue.slice(insertValue.length);
         const prevMask = this.currentMask;
         const details = new ChangeDetails();
         const prevMaskState = prevMask == null ? void 0 : prevMask.state;

         // clone flags to prevent overwriting `_beforeTailState`
         this.currentMask = this.doDispatch(appended, {
            ...flags
         }, tail);

         // restore state after dispatch
         if (this.currentMask) {
            if (this.currentMask !== prevMask) {
               // if mask changed reapply input
               this.currentMask.reset();
               if (insertValue) {
                  this.currentMask.append(insertValue, {
                     raw: true
                  });
                  details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
               }
               if (tailValue) {
                  details.tailShift += this.currentMask.append(tailValue, {
                     raw: true,
                     tail: true
                  }).tailShift;
               }
            } else if (prevMaskState) {
               // Dispatch can do something bad with state, so
               // restore prev mask state
               this.currentMask.state = prevMaskState;
            }
         }
         return details;
      }
      _appendPlaceholder() {
         const details = this._applyDispatch();
         if (this.currentMask) {
            details.aggregate(this.currentMask._appendPlaceholder());
         }
         return details;
      }
      _appendEager() {
         const details = this._applyDispatch();
         if (this.currentMask) {
            details.aggregate(this.currentMask._appendEager());
         }
         return details;
      }
      appendTail(tail) {
         const details = new ChangeDetails();
         if (tail) details.aggregate(this._applyDispatch('', {}, tail));
         return details.aggregate(this.currentMask ? this.currentMask.appendTail(tail) : super.appendTail(tail));
      }
      currentMaskFlags(flags) {
         var _flags$_beforeTailSta, _flags$_beforeTailSta2;
         return {
            ...flags,
            _beforeTailState: ((_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.currentMaskRef) === this.currentMask && ((_flags$_beforeTailSta2 = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta2.currentMask) || flags._beforeTailState
         };
      }
      doDispatch(appended, flags, tail) {
         if (flags === void 0) {
            flags = {};
         }
         if (tail === void 0) {
            tail = '';
         }
         return this.dispatch(appended, this, flags, tail);
      }
      doValidate(flags) {
         return super.doValidate(flags) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags)));
      }
      doPrepare(str, flags) {
         if (flags === void 0) {
            flags = {};
         }
         let [s, details] = super.doPrepare(str, flags);
         if (this.currentMask) {
            let currentDetails;
            [s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags));
            details = details.aggregate(currentDetails);
         }
         return [s, details];
      }
      doPrepareChar(str, flags) {
         if (flags === void 0) {
            flags = {};
         }
         let [s, details] = super.doPrepareChar(str, flags);
         if (this.currentMask) {
            let currentDetails;
            [s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags));
            details = details.aggregate(currentDetails);
         }
         return [s, details];
      }
      reset() {
         var _this$currentMask;
         (_this$currentMask = this.currentMask) == null || _this$currentMask.reset();
         this.compiledMasks.forEach(m => m.reset());
      }
      get value() {
         return this.exposeMask ? this.exposeMask.value : this.currentMask ? this.currentMask.value : '';
      }
      set value(value) {
         if (this.exposeMask) {
            this.exposeMask.value = value;
            this.currentMask = this.exposeMask;
            this._applyDispatch();
         } else super.value = value;
      }
      get unmaskedValue() {
         return this.exposeMask ? this.exposeMask.unmaskedValue : this.currentMask ? this.currentMask.unmaskedValue : '';
      }
      set unmaskedValue(unmaskedValue) {
         if (this.exposeMask) {
            this.exposeMask.unmaskedValue = unmaskedValue;
            this.currentMask = this.exposeMask;
            this._applyDispatch();
         } else super.unmaskedValue = unmaskedValue;
      }
      get typedValue() {
         return this.exposeMask ? this.exposeMask.typedValue : this.currentMask ? this.currentMask.typedValue : '';
      }
      set typedValue(typedValue) {
         if (this.exposeMask) {
            this.exposeMask.typedValue = typedValue;
            this.currentMask = this.exposeMask;
            this._applyDispatch();
            return;
         }
         let unmaskedValue = String(typedValue);

         // double check it
         if (this.currentMask) {
            this.currentMask.typedValue = typedValue;
            unmaskedValue = this.currentMask.unmaskedValue;
         }
         this.unmaskedValue = unmaskedValue;
      }
      get displayValue() {
         return this.currentMask ? this.currentMask.displayValue : '';
      }
      get isComplete() {
         var _this$currentMask2;
         return Boolean((_this$currentMask2 = this.currentMask) == null ? void 0 : _this$currentMask2.isComplete);
      }
      get isFilled() {
         var _this$currentMask3;
         return Boolean((_this$currentMask3 = this.currentMask) == null ? void 0 : _this$currentMask3.isFilled);
      }
      remove(fromPos, toPos) {
         const details = new ChangeDetails();
         if (this.currentMask) {
            details.aggregate(this.currentMask.remove(fromPos, toPos))
               // update with dispatch
               .aggregate(this._applyDispatch());
         }
         return details;
      }
      get state() {
         var _this$currentMask4;
         return {
            ...super.state,
            _rawInputValue: this.rawInputValue,
            compiledMasks: this.compiledMasks.map(m => m.state),
            currentMaskRef: this.currentMask,
            currentMask: (_this$currentMask4 = this.currentMask) == null ? void 0 : _this$currentMask4.state
         };
      }
      set state(state) {
         const {
            compiledMasks,
            currentMaskRef,
            currentMask,
            ...maskedState
         } = state;
         if (compiledMasks) this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
         if (currentMaskRef != null) {
            this.currentMask = currentMaskRef;
            this.currentMask.state = currentMask;
         }
         super.state = maskedState;
      }
      extractInput(fromPos, toPos, flags) {
         return this.currentMask ? this.currentMask.extractInput(fromPos, toPos, flags) : '';
      }
      extractTail(fromPos, toPos) {
         return this.currentMask ? this.currentMask.extractTail(fromPos, toPos) : super.extractTail(fromPos, toPos);
      }
      doCommit() {
         if (this.currentMask) this.currentMask.doCommit();
         super.doCommit();
      }
      nearestInputPos(cursorPos, direction) {
         return this.currentMask ? this.currentMask.nearestInputPos(cursorPos, direction) : super.nearestInputPos(cursorPos, direction);
      }
      get overwrite() {
         return this.currentMask ? this.currentMask.overwrite : this._overwrite;
      }
      set overwrite(overwrite) {
         this._overwrite = overwrite;
      }
      get eager() {
         return this.currentMask ? this.currentMask.eager : this._eager;
      }
      set eager(eager) {
         this._eager = eager;
      }
      get skipInvalid() {
         return this.currentMask ? this.currentMask.skipInvalid : this._skipInvalid;
      }
      set skipInvalid(skipInvalid) {
         this._skipInvalid = skipInvalid;
      }
      get autofix() {
         return this.currentMask ? this.currentMask.autofix : this._autofix;
      }
      set autofix(autofix) {
         this._autofix = autofix;
      }
      maskEquals(mask) {
         return Array.isArray(mask) ? this.compiledMasks.every((m, mi) => {
            if (!mask[mi]) return;
            const {
               mask: oldMask,
               ...restOpts
            } = mask[mi];
            return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
         }) : super.maskEquals(mask);
      }
      typedValueEquals(value) {
         var _this$currentMask5;
         return Boolean((_this$currentMask5 = this.currentMask) == null ? void 0 : _this$currentMask5.typedValueEquals(value));
      }
   }
   /** Currently chosen mask */
   /** Currently chosen mask */
   /** Compliled {@link Masked} options */
   /** Chooses {@link Masked} depending on input value */
   MaskedDynamic.DEFAULTS = {
      ...Masked.DEFAULTS,
      dispatch: (appended, masked, flags, tail) => {
         if (!masked.compiledMasks.length) return;
         const inputValue = masked.rawInputValue;

         // simulate input
         const inputs = masked.compiledMasks.map((m, index) => {
            const isCurrent = masked.currentMask === m;
            const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);
            if (m.rawInputValue !== inputValue) {
               m.reset();
               m.append(inputValue, {
                  raw: true
               });
            } else if (!isCurrent) {
               m.remove(startInputPos);
            }
            m.append(appended, masked.currentMaskFlags(flags));
            m.appendTail(tail);
            return {
               index,
               weight: m.rawInputValue.length,
               totalInputPositions: m.totalInputPositions(0, Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)))
            };
         });

         // pop masks with longer values first
         inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);
         return masked.compiledMasks[inputs[0].index];
      }
   };
   IMask.MaskedDynamic = MaskedDynamic;

   /** Pattern which validates enum values */
   class MaskedEnum extends MaskedPattern {
      constructor(opts) {
         super({
            ...MaskedEnum.DEFAULTS,
            ...opts
         }); // mask will be created in _update
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         const {
            enum: enum_,
            ...eopts
         } = opts;
         if (enum_) {
            const lengths = enum_.map(e => e.length);
            const requiredLength = Math.min(...lengths);
            const optionalLength = Math.max(...lengths) - requiredLength;
            eopts.mask = '*'.repeat(requiredLength);
            if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';
            this.enum = enum_;
         }
         super._update(eopts);
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
         const matches = this.enum.filter(e => this.matchValue(e, this.unmaskedValue + ch, matchFrom));
         if (matches.length) {
            if (matches.length === 1) {
               this._forEachBlocksInRange(0, this.value.length, (b, bi) => {
                  const mch = matches[0][bi];
                  if (bi >= this.value.length || mch === b.value) return;
                  b.reset();
                  b._appendChar(mch, flags);
               });
            }
            const d = super._appendCharRaw(matches[0][this.value.length], flags);
            if (matches.length === 1) {
               matches[0].slice(this.unmaskedValue.length).split('').forEach(mch => d.aggregate(super._appendCharRaw(mch)));
            }
            return d;
         }
         return new ChangeDetails({
            skip: !this.isComplete
         });
      }
      extractTail(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         // just drop tail
         return new ContinuousTailDetails('', fromPos);
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         if (fromPos === toPos) return new ChangeDetails();
         const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
         let pos;
         for (pos = fromPos; pos >= 0; --pos) {
            const matches = this.enum.filter(e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom));
            if (matches.length > 1) break;
         }
         const details = super.remove(pos, toPos);
         details.tailShift += pos - fromPos;
         return details;
      }
      get isComplete() {
         return this.enum.indexOf(this.value) >= 0;
      }
   }
   /** Match enum value */
   MaskedEnum.DEFAULTS = {
      ...MaskedPattern.DEFAULTS,
      matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom
   };
   IMask.MaskedEnum = MaskedEnum;

   /** Masking by custom Function */
   class MaskedFunction extends Masked {
      /** */

      /** Enable characters overwriting */

      /** */

      /** */

      /** */

      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         super._update({
            ...opts,
            validate: opts.mask
         });
      }
   }
   IMask.MaskedFunction = MaskedFunction;

   var _MaskedNumber;
   /** Number mask */
   class MaskedNumber extends Masked {
      /** Single char */

      /** Single char */

      /** Array of single chars */

      /** */

      /** */

      /** Digits after point */

      /** Flag to remove leading and trailing zeros in the end of editing */

      /** Flag to pad trailing zeros after point in the end of editing */

      /** Enable characters overwriting */

      /** */

      /** */

      /** */

      /** Format typed value to string */

      /** Parse string to get typed value */

      constructor(opts) {
         super({
            ...MaskedNumber.DEFAULTS,
            ...opts
         });
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         super._update(opts);
         this._updateRegExps();
      }
      _updateRegExps() {
         const start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
         const mid = '\\d*';
         const end = (this.scale ? "(" + escapeRegExp(this.radix) + "\\d{0," + this.scale + "})?" : '') + '$';
         this._numberRegExp = new RegExp(start + mid + end);
         this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(escapeRegExp).join('') + "]", 'g');
         this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
      }
      _removeThousandsSeparators(value) {
         return value.replace(this._thousandsSeparatorRegExp, '');
      }
      _insertThousandsSeparators(value) {
         // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
         const parts = value.split(this.radix);
         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
         return parts.join(this.radix);
      }
      doPrepareChar(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(this.scale && this.mapToRadix.length && (
            /*
              radix should be mapped when
              1) input is done from keyboard = flags.input && flags.raw
              2) unmasked value is set = !flags.input && !flags.raw
              and should not be mapped when
              1) value is set = flags.input && !flags.raw
              2) raw value is set = !flags.input && flags.raw
            */
            flags.input && flags.raw || !flags.input && !flags.raw) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch), flags);
         if (ch && !prepCh) details.skip = true;
         if (prepCh && !this.allowPositive && !this.value && prepCh !== '-') details.aggregate(this._appendChar('-'));
         return [prepCh, details];
      }
      _separatorsCount(to, extendOnSeparators) {
         if (extendOnSeparators === void 0) {
            extendOnSeparators = false;
         }
         let count = 0;
         for (let pos = 0; pos < to; ++pos) {
            if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
               ++count;
               if (extendOnSeparators) to += this.thousandsSeparator.length;
            }
         }
         return count;
      }
      _separatorsCountFromSlice(slice) {
         if (slice === void 0) {
            slice = this._value;
         }
         return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
      }
      extractInput(fromPos, toPos, flags) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
         return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
         const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
         this._value = this._removeThousandsSeparators(this.value);
         const oldValue = this._value;
         this._value += ch;
         const num = this.number;
         let accepted = !isNaN(num);
         let skip = false;
         if (accepted) {
            let fixedNum;
            if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
            if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;
            if (fixedNum != null) {
               if (this.autofix) {
                  this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
                  skip || (skip = oldValue === this._value && !flags.tail); // if not changed on tail it's still ok to proceed
               } else {
                  accepted = false;
               }
            }
            accepted && (accepted = Boolean(this._value.match(this._numberRegExp)));
         }
         let appendDetails;
         if (!accepted) {
            this._value = oldValue;
            appendDetails = new ChangeDetails();
         } else {
            appendDetails = new ChangeDetails({
               inserted: this._value.slice(oldValue.length),
               rawInserted: skip ? '' : ch,
               skip
            });
         }
         this._value = this._insertThousandsSeparators(this._value);
         const beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
         const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);
         appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
         return appendDetails;
      }
      _findSeparatorAround(pos) {
         if (this.thousandsSeparator) {
            const searchFrom = pos - this.thousandsSeparator.length + 1;
            const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
            if (separatorPos <= pos) return separatorPos;
         }
         return -1;
      }
      _adjustRangeWithSeparators(from, to) {
         const separatorAroundFromPos = this._findSeparatorAround(from);
         if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;
         const separatorAroundToPos = this._findSeparatorAround(to);
         if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
         return [from, to];
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
         const valueBeforePos = this.value.slice(0, fromPos);
         const valueAfterPos = this.value.slice(toPos);
         const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
         this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
         const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);
         return new ChangeDetails({
            tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
         });
      }
      nearestInputPos(cursorPos, direction) {
         if (!this.thousandsSeparator) return cursorPos;
         switch (direction) {
            case DIRECTION.NONE:
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
               {
                  const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
                  if (separatorAtLeftPos >= 0) {
                     const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
                     if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
                        return separatorAtLeftPos;
                     }
                  }
                  break;
               }
            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
               {
                  const separatorAtRightPos = this._findSeparatorAround(cursorPos);
                  if (separatorAtRightPos >= 0) {
                     return separatorAtRightPos + this.thousandsSeparator.length;
                  }
               }
         }
         return cursorPos;
      }
      doCommit() {
         if (this.value) {
            const number = this.number;
            let validnum = number;

            // check bounds
            if (this.min != null) validnum = Math.max(validnum, this.min);
            if (this.max != null) validnum = Math.min(validnum, this.max);
            if (validnum !== number) this.unmaskedValue = this.format(validnum, this);
            let formatted = this.value;
            if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
            if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);
            this._value = formatted;
         }
         super.doCommit();
      }
      _normalizeZeros(value) {
         const parts = this._removeThousandsSeparators(value).split(this.radix);

         // remove leading zeros
         parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, (match, sign, zeros, num) => sign + num);
         // add leading zero
         if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';
         if (parts.length > 1) {
            parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros
            if (!parts[1].length) parts.length = 1; // remove fractional
         }
         return this._insertThousandsSeparators(parts.join(this.radix));
      }
      _padFractionalZeros(value) {
         if (!value) return value;
         const parts = value.split(this.radix);
         if (parts.length < 2) parts.push('');
         parts[1] = parts[1].padEnd(this.scale, '0');
         return parts.join(this.radix);
      }
      doSkipInvalid(ch, flags, checkTail) {
         if (flags === void 0) {
            flags = {};
         }
         const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (ch === this.radix || ch === MaskedNumber.UNMASKED_RADIX || this.mapToRadix.includes(ch));
         return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
      }
      get unmaskedValue() {
         return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, MaskedNumber.UNMASKED_RADIX);
      }
      set unmaskedValue(unmaskedValue) {
         super.unmaskedValue = unmaskedValue;
      }
      get typedValue() {
         return this.parse(this.unmaskedValue, this);
      }
      set typedValue(n) {
         this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
      }

      /** Parsed Number */
      get number() {
         return this.typedValue;
      }
      set number(number) {
         this.typedValue = number;
      }
      get allowNegative() {
         return this.min != null && this.min < 0 || this.max != null && this.max < 0;
      }
      get allowPositive() {
         return this.min != null && this.min > 0 || this.max != null && this.max > 0;
      }
      typedValueEquals(value) {
         // handle  0 -> '' case (typed = 0 even if value = '')
         // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
         return (super.typedValueEquals(value) || MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)) && !(value === 0 && this.value === '');
      }
   }
   _MaskedNumber = MaskedNumber;
   MaskedNumber.UNMASKED_RADIX = '.';
   MaskedNumber.EMPTY_VALUES = [...Masked.EMPTY_VALUES, 0];
   MaskedNumber.DEFAULTS = {
      ...Masked.DEFAULTS,
      mask: Number,
      radix: ',',
      thousandsSeparator: '',
      mapToRadix: [_MaskedNumber.UNMASKED_RADIX],
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      scale: 2,
      normalizeZeros: true,
      padFractionalZeros: false,
      parse: Number,
      format: n => n.toLocaleString('en-US', {
         useGrouping: false,
         maximumFractionDigits: 20
      })
   };
   IMask.MaskedNumber = MaskedNumber;

   /** Mask pipe source and destination types */
   const PIPE_TYPE = {
      MASKED: 'value',
      UNMASKED: 'unmaskedValue',
      TYPED: 'typedValue'
   };
   /** Creates new pipe function depending on mask type, source and destination options */
   function createPipe(arg, from, to) {
      if (from === void 0) {
         from = PIPE_TYPE.MASKED;
      }
      if (to === void 0) {
         to = PIPE_TYPE.MASKED;
      }
      const masked = createMask(arg);
      return value => masked.runIsolated(m => {
         m[from] = value;
         return m[to];
      });
   }

   /** Pipes value through mask depending on mask type, source and destination options */
   function pipe(value, mask, from, to) {
      return createPipe(mask, from, to)(value);
   }
   IMask.PIPE_TYPE = PIPE_TYPE;
   IMask.createPipe = createPipe;
   IMask.pipe = pipe;

   /** Pattern mask */
   class RepeatBlock extends MaskedPattern {
      get repeatFrom() {
         var _ref;
         return (_ref = Array.isArray(this.repeat) ? this.repeat[0] : this.repeat === Infinity ? 0 : this.repeat) != null ? _ref : 0;
      }
      get repeatTo() {
         var _ref2;
         return (_ref2 = Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) != null ? _ref2 : Infinity;
      }
      constructor(opts) {
         super(opts);
      }
      updateOptions(opts) {
         super.updateOptions(opts);
      }
      _update(opts) {
         var _ref3, _ref4, _this$_blocks;
         const {
            repeat,
            ...blockOpts
         } = normalizeOpts(opts); // TODO type
         this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
         const block = createMask(this._blockOpts);
         this.repeat = (_ref3 = (_ref4 = repeat != null ? repeat : block.repeat) != null ? _ref4 : this.repeat) != null ? _ref3 : Infinity; // TODO type

         super._update({
            mask: 'm'.repeat(Math.max(this.repeatTo === Infinity && ((_this$_blocks = this._blocks) == null ? void 0 : _this$_blocks.length) || 0, this.repeatFrom)),
            blocks: {
               m: block
            },
            eager: block.eager,
            overwrite: block.overwrite,
            skipInvalid: block.skipInvalid,
            lazy: block.lazy,
            placeholderChar: block.placeholderChar,
            displayChar: block.displayChar
         });
      }
      _allocateBlock(bi) {
         if (bi < this._blocks.length) return this._blocks[bi];
         if (this.repeatTo === Infinity || this._blocks.length < this.repeatTo) {
            this._blocks.push(createMask(this._blockOpts));
            this.mask += 'm';
            return this._blocks[this._blocks.length - 1];
         }
      }
      _appendCharRaw(ch, flags) {
         if (flags === void 0) {
            flags = {};
         }
         const details = new ChangeDetails();
         for (let bi = (_this$_mapPosToBlock$ = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index) != null ? _this$_mapPosToBlock$ : Math.max(this._blocks.length - 1, 0), block, allocated;
            // try to get a block or
            // try to allocate a new block if not allocated already
            block = (_this$_blocks$bi = this._blocks[bi]) != null ? _this$_blocks$bi : allocated = !allocated && this._allocateBlock(bi); ++bi) {
            var _this$_mapPosToBlock$, _this$_mapPosToBlock, _this$_blocks$bi, _flags$_beforeTailSta;
            const blockDetails = block._appendChar(ch, {
               ...flags,
               _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
            });
            if (blockDetails.skip && allocated) {
               // remove the last allocated block and break
               this._blocks.pop();
               this.mask = this.mask.slice(1);
               break;
            }
            details.aggregate(blockDetails);
            if (blockDetails.consumed) break; // go next char
         }
         return details;
      }
      _trimEmptyTail(fromPos, toPos) {
         var _this$_mapPosToBlock2, _this$_mapPosToBlock3;
         if (fromPos === void 0) {
            fromPos = 0;
         }
         const firstBlockIndex = Math.max(((_this$_mapPosToBlock2 = this._mapPosToBlock(fromPos)) == null ? void 0 : _this$_mapPosToBlock2.index) || 0, this.repeatFrom, 0);
         let lastBlockIndex;
         if (toPos != null) lastBlockIndex = (_this$_mapPosToBlock3 = this._mapPosToBlock(toPos)) == null ? void 0 : _this$_mapPosToBlock3.index;
         if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;
         let removeCount = 0;
         for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, ++removeCount) {
            if (this._blocks[blockIndex].unmaskedValue) break;
         }
         if (removeCount) {
            this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
            this.mask = this.mask.slice(removeCount);
         }
      }
      reset() {
         super.reset();
         this._trimEmptyTail();
      }
      remove(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos === void 0) {
            toPos = this.displayValue.length;
         }
         const removeDetails = super.remove(fromPos, toPos);
         this._trimEmptyTail(fromPos, toPos);
         return removeDetails;
      }
      totalInputPositions(fromPos, toPos) {
         if (fromPos === void 0) {
            fromPos = 0;
         }
         if (toPos == null && this.repeatTo === Infinity) return Infinity;
         return super.totalInputPositions(fromPos, toPos);
      }
      get state() {
         return super.state;
      }
      set state(state) {
         this._blocks.length = state._blocks.length;
         this.mask = this.mask.slice(0, this._blocks.length);
         super.state = state;
      }
   }
   IMask.RepeatBlock = RepeatBlock;

   try {
      globalThis.IMask = IMask;
   } catch { }

   exports.ChangeDetails = ChangeDetails;
   exports.ChunksTailDetails = ChunksTailDetails;
   exports.DIRECTION = DIRECTION;
   exports.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
   exports.HTMLInputMaskElement = HTMLInputMaskElement;
   exports.HTMLMaskElement = HTMLMaskElement;
   exports.InputMask = InputMask;
   exports.MaskElement = MaskElement;
   exports.Masked = Masked;
   exports.MaskedDate = MaskedDate;
   exports.MaskedDynamic = MaskedDynamic;
   exports.MaskedEnum = MaskedEnum;
   exports.MaskedFunction = MaskedFunction;
   exports.MaskedNumber = MaskedNumber;
   exports.MaskedPattern = MaskedPattern;
   exports.MaskedRange = MaskedRange;
   exports.MaskedRegExp = MaskedRegExp;
   exports.PIPE_TYPE = PIPE_TYPE;
   exports.PatternFixedDefinition = PatternFixedDefinition;
   exports.PatternInputDefinition = PatternInputDefinition;
   exports.RepeatBlock = RepeatBlock;
   exports.createMask = createMask;
   exports.createPipe = createPipe;
   exports.default = IMask;
   exports.forceDirection = forceDirection;
   exports.normalizeOpts = normalizeOpts;
   exports.pipe = pipe;

   Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=imask.js.map

const LIST_PHONE = document.querySelectorAll('.js-phone');
if (LIST_PHONE.length > 0) {
   const maskOptions = {
      mask: '+{7}(000)-000-00-00',
      placeholderChar: '#',
   };
   LIST_PHONE.forEach((e) => {
      const mask = IMask(e, maskOptions);
      //  e.addEventListener('input', () => console.log(mask.unmaskedValue));// mask.unmaskedValue - введённый номер без маски
   })
}


/* открывает, закрывает модальные окна. */
/*
добавить классы
js-modal-hidden - родительский контейнер модального окна который скрывается и показывается, задать стили скрытия
js-modal-visible - задать стили открытия
js-modal-close - кнопка закрытия модального окна находится внутри js-modal-hidde
кнопка открытия, любая:
js-modal-open - кнопка открытия модального окна
data-modal_open="id" - id модального окна
если надо что бы окно закрывалось при клике на пустое место (фон), добавляется атрибут js-modal-stop-close.
js-modal-stop-close - атрибут указывает на поле, при клике на которое не должно происходить закрытие окна, 
т.е. контейнер контента, при этом внешний родительский контейнет помечается атрибутом js-modal-close.
допускается дополнительно кнопка закрытия внутри js-modal-stop-close.
*/
document.addEventListener('click', (event) => {
   if (event.target.closest('.js-modal-open')) { openModal(event) }
   if (event.target.closest('.js-modal-close')) { testModalStopClose(event) }
})
function openModal(event) {
   let modalElement = event.target.closest('.js-modal-open').dataset.modal_open;
   if (typeof modalElement !== "undefined" && document.querySelector(`#${modalElement}`)) {
      document.querySelector(`#${modalElement}`).classList.add('js-modal-visible');
      document.body.classList.add('body-overflow')
   }
}
function testModalStopClose(event) {
   if (event.target.closest('.js-modal-stop-close') &&
      event.target.closest('.js-modal-close') !==
      event.target.closest('.js-modal-stop-close').querySelector('.js-modal-close')) {
      return
   }
   closeModal(event);
}
function closeModal(event) {
   event.target.closest('.js-modal-hidden').classList.remove('js-modal-visible');
   if (!document.querySelector('.js-modal-visible')) {
      document.body.classList.remove('body-overflow');
   }
}
/**
 * Swiper 10.3.1
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * https://swiperjs.com
 *
 * Copyright 2014-2023 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: September 28, 2023
 */

var Swiper = function () {
   "use strict";
   function e(e) {
      return null !== e && "object" == typeof e && "constructor" in e && e.constructor === Object
   }
   function t(s, a) {
      void 0 === s && (s = {}),
         void 0 === a && (a = {}),
         Object.keys(a).forEach((i => {
            void 0 === s[i] ? s[i] = a[i] : e(a[i]) && e(s[i]) && Object.keys(a[i]).length > 0 && t(s[i], a[i])
         }
         ))
   }
   const s = {
      body: {},
      addEventListener() { },
      removeEventListener() { },
      activeElement: {
         blur() { },
         nodeName: ""
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createEvent: () => ({
         initEvent() { }
      }),
      createElement: () => ({
         children: [],
         childNodes: [],
         style: {},
         setAttribute() { },
         getElementsByTagName: () => []
      }),
      createElementNS: () => ({}),
      importNode: () => null,
      location: {
         hash: "",
         host: "",
         hostname: "",
         href: "",
         origin: "",
         pathname: "",
         protocol: "",
         search: ""
      }
   };
   function a() {
      const e = "undefined" != typeof document ? document : {};
      return t(e, s),
         e
   }
   const i = {
      document: s,
      navigator: {
         userAgent: ""
      },
      location: {
         hash: "",
         host: "",
         hostname: "",
         href: "",
         origin: "",
         pathname: "",
         protocol: "",
         search: ""
      },
      history: {
         replaceState() { },
         pushState() { },
         go() { },
         back() { }
      },
      CustomEvent: function () {
         return this
      },
      addEventListener() { },
      removeEventListener() { },
      getComputedStyle: () => ({
         getPropertyValue: () => ""
      }),
      Image() { },
      Date() { },
      screen: {},
      setTimeout() { },
      clearTimeout() { },
      matchMedia: () => ({}),
      requestAnimationFrame: e => "undefined" == typeof setTimeout ? (e(),
         null) : setTimeout(e, 0),
      cancelAnimationFrame(e) {
         "undefined" != typeof setTimeout && clearTimeout(e)
      }
   };
   function r() {
      const e = "undefined" != typeof window ? window : {};
      return t(e, i),
         e
   }
   function n(e, t) {
      return void 0 === t && (t = 0),
         setTimeout(e, t)
   }
   function l() {
      return Date.now()
   }
   function o(e, t) {
      void 0 === t && (t = "x");
      const s = r();
      let a, i, n;
      const l = function (e) {
         const t = r();
         let s;
         return t.getComputedStyle && (s = t.getComputedStyle(e, null)),
            !s && e.currentStyle && (s = e.currentStyle),
            s || (s = e.style),
            s
      }(e);
      return s.WebKitCSSMatrix ? (i = l.transform || l.webkitTransform,
         i.split(",").length > 6 && (i = i.split(", ").map((e => e.replace(",", "."))).join(", ")),
         n = new s.WebKitCSSMatrix("none" === i ? "" : i)) : (n = l.MozTransform || l.OTransform || l.MsTransform || l.msTransform || l.transform || l.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"),
            a = n.toString().split(",")),
         "x" === t && (i = s.WebKitCSSMatrix ? n.m41 : 16 === a.length ? parseFloat(a[12]) : parseFloat(a[4])),
         "y" === t && (i = s.WebKitCSSMatrix ? n.m42 : 16 === a.length ? parseFloat(a[13]) : parseFloat(a[5])),
         i || 0
   }
   function d(e) {
      return "object" == typeof e && null !== e && e.constructor && "Object" === Object.prototype.toString.call(e).slice(8, -1)
   }
   function c() {
      const e = Object(arguments.length <= 0 ? void 0 : arguments[0])
         , t = ["__proto__", "constructor", "prototype"];
      for (let a = 1; a < arguments.length; a += 1) {
         const i = a < 0 || arguments.length <= a ? void 0 : arguments[a];
         if (null != i && (s = i,
            !("undefined" != typeof window && void 0 !== window.HTMLElement ? s instanceof HTMLElement : s && (1 === s.nodeType || 11 === s.nodeType)))) {
            const s = Object.keys(Object(i)).filter((e => t.indexOf(e) < 0));
            for (let t = 0, a = s.length; t < a; t += 1) {
               const a = s[t]
                  , r = Object.getOwnPropertyDescriptor(i, a);
               void 0 !== r && r.enumerable && (d(e[a]) && d(i[a]) ? i[a].__swiper__ ? e[a] = i[a] : c(e[a], i[a]) : !d(e[a]) && d(i[a]) ? (e[a] = {},
                  i[a].__swiper__ ? e[a] = i[a] : c(e[a], i[a])) : e[a] = i[a])
            }
         }
      }
      var s;
      return e
   }
   function p(e, t, s) {
      e.style.setProperty(t, s)
   }
   function u(e) {
      let { swiper: t, targetPosition: s, side: a } = e;
      const i = r()
         , n = -t.translate;
      let l, o = null;
      const d = t.params.speed;
      t.wrapperEl.style.scrollSnapType = "none",
         i.cancelAnimationFrame(t.cssModeFrameID);
      const c = s > n ? "next" : "prev"
         , p = (e, t) => "next" === c && e >= t || "prev" === c && e <= t
         , u = () => {
            l = (new Date).getTime(),
               null === o && (o = l);
            const e = Math.max(Math.min((l - o) / d, 1), 0)
               , r = .5 - Math.cos(e * Math.PI) / 2;
            let c = n + r * (s - n);
            if (p(c, s) && (c = s),
               t.wrapperEl.scrollTo({
                  [a]: c
               }),
               p(c, s))
               return t.wrapperEl.style.overflow = "hidden",
                  t.wrapperEl.style.scrollSnapType = "",
                  setTimeout((() => {
                     t.wrapperEl.style.overflow = "",
                        t.wrapperEl.scrollTo({
                           [a]: c
                        })
                  }
                  )),
                  void i.cancelAnimationFrame(t.cssModeFrameID);
            t.cssModeFrameID = i.requestAnimationFrame(u)
         }
         ;
      u()
   }
   function m(e) {
      return e.querySelector(".swiper-slide-transform") || e.shadowRoot && e.shadowRoot.querySelector(".swiper-slide-transform") || e
   }
   function h(e, t) {
      return void 0 === t && (t = ""),
         [...e.children].filter((e => e.matches(t)))
   }
   function f(e, t) {
      void 0 === t && (t = []);
      const s = document.createElement(e);
      return s.classList.add(...Array.isArray(t) ? t : [t]),
         s
   }
   function g(e) {
      const t = r()
         , s = a()
         , i = e.getBoundingClientRect()
         , n = s.body
         , l = e.clientTop || n.clientTop || 0
         , o = e.clientLeft || n.clientLeft || 0
         , d = e === t ? t.scrollY : e.scrollTop
         , c = e === t ? t.scrollX : e.scrollLeft;
      return {
         top: i.top + d - l,
         left: i.left + c - o
      }
   }
   function v(e, t) {
      return r().getComputedStyle(e, null).getPropertyValue(t)
   }
   function w(e) {
      let t, s = e;
      if (s) {
         for (t = 0; null !== (s = s.previousSibling);)
            1 === s.nodeType && (t += 1);
         return t
      }
   }
   function b(e, t) {
      const s = [];
      let a = e.parentElement;
      for (; a;)
         t ? a.matches(t) && s.push(a) : s.push(a),
            a = a.parentElement;
      return s
   }
   function y(e, t) {
      t && e.addEventListener("transitionend", (function s(a) {
         a.target === e && (t.call(e, a),
            e.removeEventListener("transitionend", s))
      }
      ))
   }
   function E(e, t, s) {
      const a = r();
      return s ? e["width" === t ? "offsetWidth" : "offsetHeight"] + parseFloat(a.getComputedStyle(e, null).getPropertyValue("width" === t ? "margin-right" : "margin-top")) + parseFloat(a.getComputedStyle(e, null).getPropertyValue("width" === t ? "margin-left" : "margin-bottom")) : e.offsetWidth
   }
   let x, S, T;
   function M() {
      return x || (x = function () {
         const e = r()
            , t = a();
         return {
            smoothScroll: t.documentElement && t.documentElement.style && "scrollBehavior" in t.documentElement.style,
            touch: !!("ontouchstart" in e || e.DocumentTouch && t instanceof e.DocumentTouch)
         }
      }()),
         x
   }
   function C(e) {
      return void 0 === e && (e = {}),
         S || (S = function (e) {
            let { userAgent: t } = void 0 === e ? {} : e;
            const s = M()
               , a = r()
               , i = a.navigator.platform
               , n = t || a.navigator.userAgent
               , l = {
                  ios: !1,
                  android: !1
               }
               , o = a.screen.width
               , d = a.screen.height
               , c = n.match(/(Android);?[\s\/]+([\d.]+)?/);
            let p = n.match(/(iPad).*OS\s([\d_]+)/);
            const u = n.match(/(iPod)(.*OS\s([\d_]+))?/)
               , m = !p && n.match(/(iPhone\sOS|iOS)\s([\d_]+)/)
               , h = "Win32" === i;
            let f = "MacIntel" === i;
            return !p && f && s.touch && ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"].indexOf(`${o}x ${d}`) >= 0 && (p = n.match(/(Version)\/([\d.]+)/),
               p || (p = [0, 1, "13_0_0"]),
               f = !1),
               c && !h && (l.os = "android",
                  l.android = !0),
               (p || m || u) && (l.os = "ios",
                  l.ios = !0),
               l
         }(e)),
         S
   }
   function P() {
      return T || (T = function () {
         const e = r();
         let t = !1;
         function s() {
            const t = e.navigator.userAgent.toLowerCase();
            return t.indexOf("safari") >= 0 && t.indexOf("chrome") < 0 && t.indexOf("android") < 0
         }
         if (s()) {
            const s = String(e.navigator.userAgent);
            if (s.includes("Version/")) {
               const [e, a] = s.split("Version/")[1].split(" ")[0].split(".").map((e => Number(e)));
               t = e < 16 || 16 === e && a < 2
            }
         }
         return {
            isSafari: t || s(),
            needPerspectiveFix: t,
            isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent)
         }
      }()),
         T
   }
   var L = {
      on(e, t, s) {
         const a = this;
         if (!a.eventsListeners || a.destroyed)
            return a;
         if ("function" != typeof t)
            return a;
         const i = s ? "unshift" : "push";
         return e.split(" ").forEach((e => {
            a.eventsListeners[e] || (a.eventsListeners[e] = []),
               a.eventsListeners[e][i](t)
         }
         )),
            a
      },
      once(e, t, s) {
         const a = this;
         if (!a.eventsListeners || a.destroyed)
            return a;
         if ("function" != typeof t)
            return a;
         function i() {
            a.off(e, i),
               i.__emitterProxy && delete i.__emitterProxy;
            for (var s = arguments.length, r = new Array(s), n = 0; n < s; n++)
               r[n] = arguments[n];
            t.apply(a, r)
         }
         return i.__emitterProxy = t,
            a.on(e, i, s)
      },
      onAny(e, t) {
         const s = this;
         if (!s.eventsListeners || s.destroyed)
            return s;
         if ("function" != typeof e)
            return s;
         const a = t ? "unshift" : "push";
         return s.eventsAnyListeners.indexOf(e) < 0 && s.eventsAnyListeners[a](e),
            s
      },
      offAny(e) {
         const t = this;
         if (!t.eventsListeners || t.destroyed)
            return t;
         if (!t.eventsAnyListeners)
            return t;
         const s = t.eventsAnyListeners.indexOf(e);
         return s >= 0 && t.eventsAnyListeners.splice(s, 1),
            t
      },
      off(e, t) {
         const s = this;
         return !s.eventsListeners || s.destroyed ? s : s.eventsListeners ? (e.split(" ").forEach((e => {
            void 0 === t ? s.eventsListeners[e] = [] : s.eventsListeners[e] && s.eventsListeners[e].forEach(((a, i) => {
               (a === t || a.__emitterProxy && a.__emitterProxy === t) && s.eventsListeners[e].splice(i, 1)
            }
            ))
         }
         )),
            s) : s
      },
      emit() {
         const e = this;
         if (!e.eventsListeners || e.destroyed)
            return e;
         if (!e.eventsListeners)
            return e;
         let t, s, a;
         for (var i = arguments.length, r = new Array(i), n = 0; n < i; n++)
            r[n] = arguments[n];
         "string" == typeof r[0] || Array.isArray(r[0]) ? (t = r[0],
            s = r.slice(1, r.length),
            a = e) : (t = r[0].events,
               s = r[0].data,
               a = r[0].context || e),
            s.unshift(a);
         return (Array.isArray(t) ? t : t.split(" ")).forEach((t => {
            e.eventsAnyListeners && e.eventsAnyListeners.length && e.eventsAnyListeners.forEach((e => {
               e.apply(a, [t, ...s])
            }
            )),
               e.eventsListeners && e.eventsListeners[t] && e.eventsListeners[t].forEach((e => {
                  e.apply(a, s)
               }
               ))
         }
         )),
            e
      }
   };
   const z = (e, t) => {
      if (!e || e.destroyed || !e.params)
         return;
      const s = t.closest(e.isElement ? "swiper-slide" : `.${e.params.slideClass}`);
      if (s) {
         let t = s.querySelector(`.${e.params.lazyPreloaderClass}`);
         !t && e.isElement && (s.shadowRoot ? t = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`) : requestAnimationFrame((() => {
            s.shadowRoot && (t = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`),
               t && t.remove())
         }
         ))),
            t && t.remove()
      }
   }
      , A = (e, t) => {
         if (!e.slides[t])
            return;
         const s = e.slides[t].querySelector('[loading="lazy"]');
         s && s.removeAttribute("loading")
      }
      , $ = e => {
         if (!e || e.destroyed || !e.params)
            return;
         let t = e.params.lazyPreloadPrevNext;
         const s = e.slides.length;
         if (!s || !t || t < 0)
            return;
         t = Math.min(t, s);
         const a = "auto" === e.params.slidesPerView ? e.slidesPerViewDynamic() : Math.ceil(e.params.slidesPerView)
            , i = e.activeIndex;
         if (e.params.grid && e.params.grid.rows > 1) {
            const s = i
               , r = [s - t];
            return r.push(...Array.from({
               length: t
            }).map(((e, t) => s + a + t))),
               void e.slides.forEach(((t, s) => {
                  r.includes(t.column) && A(e, s)
               }
               ))
         }
         const r = i + a - 1;
         if (e.params.rewind || e.params.loop)
            for (let a = i - t; a <= r + t; a += 1) {
               const t = (a % s + s) % s;
               (t < i || t > r) && A(e, t)
            }
         else
            for (let a = Math.max(i - t, 0); a <= Math.min(r + t, s - 1); a += 1)
               a !== i && (a > r || a < i) && A(e, a)
      }
      ;
   var I = {
      updateSize: function () {
         const e = this;
         let t, s;
         const a = e.el;
         t = void 0 !== e.params.width && null !== e.params.width ? e.params.width : a.clientWidth,
            s = void 0 !== e.params.height && null !== e.params.height ? e.params.height : a.clientHeight,
            0 === t && e.isHorizontal() || 0 === s && e.isVertical() || (t = t - parseInt(v(a, "padding-left") || 0, 10) - parseInt(v(a, "padding-right") || 0, 10),
               s = s - parseInt(v(a, "padding-top") || 0, 10) - parseInt(v(a, "padding-bottom") || 0, 10),
               Number.isNaN(t) && (t = 0),
               Number.isNaN(s) && (s = 0),
               Object.assign(e, {
                  width: t,
                  height: s,
                  size: e.isHorizontal() ? t : s
               }))
      },
      updateSlides: function () {
         const e = this;
         function t(t) {
            return e.isHorizontal() ? t : {
               width: "height",
               "margin-top": "margin-left",
               "margin-bottom ": "margin-right",
               "margin-left": "margin-top",
               "margin-right": "margin-bottom",
               "padding-left": "padding-top",
               "padding-right": "padding-bottom",
               marginRight: "marginBottom"
            }[t]
         }
         function s(e, s) {
            return parseFloat(e.getPropertyValue(t(s)) || 0)
         }
         const a = e.params
            , { wrapperEl: i, slidesEl: r, size: n, rtlTranslate: l, wrongRTL: o } = e
            , d = e.virtual && a.virtual.enabled
            , c = d ? e.virtual.slides.length : e.slides.length
            , u = h(r, `.${e.params.slideClass}, swiper-slide`)
            , m = d ? e.virtual.slides.length : u.length;
         let f = [];
         const g = []
            , w = [];
         let b = a.slidesOffsetBefore;
         "function" == typeof b && (b = a.slidesOffsetBefore.call(e));
         let y = a.slidesOffsetAfter;
         "function" == typeof y && (y = a.slidesOffsetAfter.call(e));
         const x = e.snapGrid.length
            , S = e.slidesGrid.length;
         let T = a.spaceBetween
            , M = -b
            , C = 0
            , P = 0;
         if (void 0 === n)
            return;
         "string" == typeof T && T.indexOf("%") >= 0 ? T = parseFloat(T.replace("%", "")) / 100 * n : "string" == typeof T && (T = parseFloat(T)),
            e.virtualSize = -T,
            u.forEach((e => {
               l ? e.style.marginLeft = "" : e.style.marginRight = "",
                  e.style.marginBottom = "",
                  e.style.marginTop = ""
            }
            )),
            a.centeredSlides && a.cssMode && (p(i, "--swiper-centered-offset-before", ""),
               p(i, "--swiper-centered-offset-after", ""));
         const L = a.grid && a.grid.rows > 1 && e.grid;
         let z;
         L && e.grid.initSlides(m);
         const A = "auto" === a.slidesPerView && a.breakpoints && Object.keys(a.breakpoints).filter((e => void 0 !== a.breakpoints[e].slidesPerView)).length > 0;
         for (let i = 0; i < m; i += 1) {
            let r;
            if (z = 0,
               u[i] && (r = u[i]),
               L && e.grid.updateSlide(i, r, m, t),
               !u[i] || "none" !== v(r, "display")) {
               if ("auto" === a.slidesPerView) {
                  A && (u[i].style[t("width")] = "");
                  const n = getComputedStyle(r)
                     , l = r.style.transform
                     , o = r.style.webkitTransform;
                  if (l && (r.style.transform = "none"),
                     o && (r.style.webkitTransform = "none"),
                     a.roundLengths)
                     z = e.isHorizontal() ? E(r, "width", !0) : E(r, "height", !0);
                  else {
                     const e = s(n, "width")
                        , t = s(n, "padding-left")
                        , a = s(n, "padding-right")
                        , i = s(n, "margin-left")
                        , l = s(n, "margin-right")
                        , o = n.getPropertyValue("box-sizing");
                     if (o && "border-box" === o)
                        z = e + i + l;
                     else {
                        const { clientWidth: s, offsetWidth: n } = r;
                        z = e + t + a + i + l + (n - s)
                     }
                  }
                  l && (r.style.transform = l),
                     o && (r.style.webkitTransform = o),
                     a.roundLengths && (z = Math.floor(z))
               } else
                  z = (n - (a.slidesPerView - 1) * T) / a.slidesPerView,
                     a.roundLengths && (z = Math.floor(z)),
                     u[i] && (u[i].style[t("width")] = `${z}px`);
               u[i] && (u[i].swiperSlideSize = z),
                  w.push(z),
                  a.centeredSlides ? (M = M + z / 2 + C / 2 + T,
                     0 === C && 0 !== i && (M = M - n / 2 - T),
                     0 === i && (M = M - n / 2 - T),
                     Math.abs(M) < .001 && (M = 0),
                     a.roundLengths && (M = Math.floor(M)),
                     P % a.slidesPerGroup == 0 && f.push(M),
                     g.push(M)) : (a.roundLengths && (M = Math.floor(M)),
                        (P - Math.min(e.params.slidesPerGroupSkip, P)) % e.params.slidesPerGroup == 0 && f.push(M),
                        g.push(M),
                        M = M + z + T),
                  e.virtualSize += z + T,
                  C = z,
                  P += 1
            }
         }
         if (e.virtualSize = Math.max(e.virtualSize, n) + y,
            l && o && ("slide" === a.effect || "coverflow" === a.effect) && (i.style.width = `${e.virtualSize + T}px`),
            a.setWrapperSize && (i.style[t("width")] = `${e.virtualSize + T}px`),
            L && e.grid.updateWrapperSize(z, f, t),
            !a.centeredSlides) {
            const t = [];
            for (let s = 0; s < f.length; s += 1) {
               let i = f[s];
               a.roundLengths && (i = Math.floor(i)),
                  f[s] <= e.virtualSize - n && t.push(i)
            }
            f = t,
               Math.floor(e.virtualSize - n) - Math.floor(f[f.length - 1]) > 1 && f.push(e.virtualSize - n)
         }
         if (d && a.loop) {
            const t = w[0] + T;
            if (a.slidesPerGroup > 1) {
               const s = Math.ceil((e.virtual.slidesBefore + e.virtual.slidesAfter) / a.slidesPerGroup)
                  , i = t * a.slidesPerGroup;
               for (let e = 0; e < s; e += 1)
                  f.push(f[f.length - 1] + i)
            }
            for (let s = 0; s < e.virtual.slidesBefore + e.virtual.slidesAfter; s += 1)
               1 === a.slidesPerGroup && f.push(f[f.length - 1] + t),
                  g.push(g[g.length - 1] + t),
                  e.virtualSize += t
         }
         if (0 === f.length && (f = [0]),
            0 !== T) {
            const s = e.isHorizontal() && l ? "marginLeft" : t("marginRight");
            u.filter(((e, t) => !(a.cssMode && !a.loop) || t !== u.length - 1)).forEach((e => {
               e.style[s] = `${T}px`
            }
            ))
         }
         if (a.centeredSlides && a.centeredSlidesBounds) {
            let e = 0;
            w.forEach((t => {
               e += t + (T || 0)
            }
            )),
               e -= T;
            const t = e - n;
            f = f.map((e => e <= 0 ? -b : e > t ? t + y : e))
         }
         if (a.centerInsufficientSlides) {
            let e = 0;
            if (w.forEach((t => {
               e += t + (T || 0)
            }
            )),
               e -= T,
               e < n) {
               const t = (n - e) / 2;
               f.forEach(((e, s) => {
                  f[s] = e - t
               }
               )),
                  g.forEach(((e, s) => {
                     g[s] = e + t
                  }
                  ))
            }
         }
         if (Object.assign(e, {
            slides: u,
            snapGrid: f,
            slidesGrid: g,
            slidesSizesGrid: w
         }),
            a.centeredSlides && a.cssMode && !a.centeredSlidesBounds) {
            p(i, "--swiper-centered-offset-before", -f[0] + "px"),
               p(i, "--swiper-centered-offset-after", e.size / 2 - w[w.length - 1] / 2 + "px");
            const t = -e.snapGrid[0]
               , s = -e.slidesGrid[0];
            e.snapGrid = e.snapGrid.map((e => e + t)),
               e.slidesGrid = e.slidesGrid.map((e => e + s))
         }
         if (m !== c && e.emit("slidesLengthChange"),
            f.length !== x && (e.params.watchOverflow && e.checkOverflow(),
               e.emit("snapGridLengthChange")),
            g.length !== S && e.emit("slidesGridLengthChange"),
            a.watchSlidesProgress && e.updateSlidesOffset(),
            !(d || a.cssMode || "slide" !== a.effect && "fade" !== a.effect)) {
            const t = `${a.containerModifierClass}backface-hidden`
               , s = e.el.classList.contains(t);
            m <= a.maxBackfaceHiddenSlides ? s || e.el.classList.add(t) : s && e.el.classList.remove(t)
         }
      },
      updateAutoHeight: function (e) {
         const t = this
            , s = []
            , a = t.virtual && t.params.virtual.enabled;
         let i, r = 0;
         "number" == typeof e ? t.setTransition(e) : !0 === e && t.setTransition(t.params.speed);
         const n = e => a ? t.slides[t.getSlideIndexByData(e)] : t.slides[e];
         if ("auto" !== t.params.slidesPerView && t.params.slidesPerView > 1)
            if (t.params.centeredSlides)
               (t.visibleSlides || []).forEach((e => {
                  s.push(e)
               }
               ));
            else
               for (i = 0; i < Math.ceil(t.params.slidesPerView); i += 1) {
                  const e = t.activeIndex + i;
                  if (e > t.slides.length && !a)
                     break;
                  s.push(n(e))
               }
         else
            s.push(n(t.activeIndex));
         for (i = 0; i < s.length; i += 1)
            if (void 0 !== s[i]) {
               const e = s[i].offsetHeight;
               r = e > r ? e : r
            }
         (r || 0 === r) && (t.wrapperEl.style.height = `${r}px`)
      },
      updateSlidesOffset: function () {
         const e = this
            , t = e.slides
            , s = e.isElement ? e.isHorizontal() ? e.wrapperEl.offsetLeft : e.wrapperEl.offsetTop : 0;
         for (let a = 0; a < t.length; a += 1)
            t[a].swiperSlideOffset = (e.isHorizontal() ? t[a].offsetLeft : t[a].offsetTop) - s - e.cssOverflowAdjustment()
      },
      updateSlidesProgress: function (e) {
         void 0 === e && (e = this && this.translate || 0);
         const t = this
            , s = t.params
            , { slides: a, rtlTranslate: i, snapGrid: r } = t;
         if (0 === a.length)
            return;
         void 0 === a[0].swiperSlideOffset && t.updateSlidesOffset();
         let n = -e;
         i && (n = e),
            a.forEach((e => {
               e.classList.remove(s.slideVisibleClass)
            }
            )),
            t.visibleSlidesIndexes = [],
            t.visibleSlides = [];
         let l = s.spaceBetween;
         "string" == typeof l && l.indexOf("%") >= 0 ? l = parseFloat(l.replace("%", "")) / 100 * t.size : "string" == typeof l && (l = parseFloat(l));
         for (let e = 0; e < a.length; e += 1) {
            const o = a[e];
            let d = o.swiperSlideOffset;
            s.cssMode && s.centeredSlides && (d -= a[0].swiperSlideOffset);
            const c = (n + (s.centeredSlides ? t.minTranslate() : 0) - d) / (o.swiperSlideSize + l)
               , p = (n - r[0] + (s.centeredSlides ? t.minTranslate() : 0) - d) / (o.swiperSlideSize + l)
               , u = -(n - d)
               , m = u + t.slidesSizesGrid[e];
            (u >= 0 && u < t.size - 1 || m > 1 && m <= t.size || u <= 0 && m >= t.size) && (t.visibleSlides.push(o),
               t.visibleSlidesIndexes.push(e),
               a[e].classList.add(s.slideVisibleClass)),
               o.progress = i ? -c : c,
               o.originalProgress = i ? -p : p
         }
      },
      updateProgress: function (e) {
         const t = this;
         if (void 0 === e) {
            const s = t.rtlTranslate ? -1 : 1;
            e = t && t.translate && t.translate * s || 0
         }
         const s = t.params
            , a = t.maxTranslate() - t.minTranslate();
         let { progress: i, isBeginning: r, isEnd: n, progressLoop: l } = t;
         const o = r
            , d = n;
         if (0 === a)
            i = 0,
               r = !0,
               n = !0;
         else {
            i = (e - t.minTranslate()) / a;
            const s = Math.abs(e - t.minTranslate()) < 1
               , l = Math.abs(e - t.maxTranslate()) < 1;
            r = s || i <= 0,
               n = l || i >= 1,
               s && (i = 0),
               l && (i = 1)
         }
         if (s.loop) {
            const s = t.getSlideIndexByData(0)
               , a = t.getSlideIndexByData(t.slides.length - 1)
               , i = t.slidesGrid[s]
               , r = t.slidesGrid[a]
               , n = t.slidesGrid[t.slidesGrid.length - 1]
               , o = Math.abs(e);
            l = o >= i ? (o - i) / n : (o + n - r) / n,
               l > 1 && (l -= 1)
         }
         Object.assign(t, {
            progress: i,
            progressLoop: l,
            isBeginning: r,
            isEnd: n
         }),
            (s.watchSlidesProgress || s.centeredSlides && s.autoHeight) && t.updateSlidesProgress(e),
            r && !o && t.emit("reachBeginning toEdge"),
            n && !d && t.emit("reachEnd toEdge"),
            (o && !r || d && !n) && t.emit("fromEdge"),
            t.emit("progress", i)
      },
      updateSlidesClasses: function () {
         const e = this
            , { slides: t, params: s, slidesEl: a, activeIndex: i } = e
            , r = e.virtual && s.virtual.enabled
            , n = e => h(a, `.${s.slideClass}${e}, swiper-slide ${e}`)[0];
         let l;
         if (t.forEach((e => {
            e.classList.remove(s.slideActiveClass, s.slideNextClass, s.slidePrevClass)
         }
         )),
            r)
            if (s.loop) {
               let t = i - e.virtual.slidesBefore;
               t < 0 && (t = e.virtual.slides.length + t),
                  t >= e.virtual.slides.length && (t -= e.virtual.slides.length),
                  l = n(`[data-swiper-slide-index="${t}"]`)
            } else
               l = n(`[data-swiper-slide-index="${i}"]`);
         else
            l = t[i];
         if (l) {
            l.classList.add(s.slideActiveClass);
            let e = function (e, t) {
               const s = [];
               for (; e.nextElementSibling;) {
                  const a = e.nextElementSibling;
                  t ? a.matches(t) && s.push(a) : s.push(a),
                     e = a
               }
               return s
            }(l, `.${s.slideClass}, swiper-slide`)[0];
            s.loop && !e && (e = t[0]),
               e && e.classList.add(s.slideNextClass);
            let a = function (e, t) {
               const s = [];
               for (; e.previousElementSibling;) {
                  const a = e.previousElementSibling;
                  t ? a.matches(t) && s.push(a) : s.push(a),
                     e = a
               }
               return s
            }(l, `.${s.slideClass}, swiper-slide`)[0];
            s.loop && 0 === !a && (a = t[t.length - 1]),
               a && a.classList.add(s.slidePrevClass)
         }
         e.emitSlidesClasses()
      },
      updateActiveIndex: function (e) {
         const t = this
            , s = t.rtlTranslate ? t.translate : -t.translate
            , { snapGrid: a, params: i, activeIndex: r, realIndex: n, snapIndex: l } = t;
         let o, d = e;
         const c = e => {
            let s = e - t.virtual.slidesBefore;
            return s < 0 && (s = t.virtual.slides.length + s),
               s >= t.virtual.slides.length && (s -= t.virtual.slides.length),
               s
         }
            ;
         if (void 0 === d && (d = function (e) {
            const { slidesGrid: t, params: s } = e
               , a = e.rtlTranslate ? e.translate : -e.translate;
            let i;
            for (let e = 0; e < t.length; e += 1)
               void 0 !== t[e + 1] ? a >= t[e] && a < t[e + 1] - (t[e + 1] - t[e]) / 2 ? i = e : a >= t[e] && a < t[e + 1] && (i = e + 1) : a >= t[e] && (i = e);
            return s.normalizeSlideIndex && (i < 0 || void 0 === i) && (i = 0),
               i
         }(t)),
            a.indexOf(s) >= 0)
            o = a.indexOf(s);
         else {
            const e = Math.min(i.slidesPerGroupSkip, d);
            o = e + Math.floor((d - e) / i.slidesPerGroup)
         }
         if (o >= a.length && (o = a.length - 1),
            d === r)
            return o !== l && (t.snapIndex = o,
               t.emit("snapIndexChange")),
               void (t.params.loop && t.virtual && t.params.virtual.enabled && (t.realIndex = c(d)));
         let p;
         p = t.virtual && i.virtual.enabled && i.loop ? c(d) : t.slides[d] ? parseInt(t.slides[d].getAttribute("data-swiper-slide-index") || d, 10) : d,
            Object.assign(t, {
               previousSnapIndex: l,
               snapIndex: o,
               previousRealIndex: n,
               realIndex: p,
               previousIndex: r,
               activeIndex: d
            }),
            t.initialized && $(t),
            t.emit("activeIndexChange"),
            t.emit("snapIndexChange"),
            (t.initialized || t.params.runCallbacksOnInit) && (n !== p && t.emit("realIndexChange"),
               t.emit("slideChange"))
      },
      updateClickedSlide: function (e, t) {
         const s = this
            , a = s.params;
         let i = e.closest(`.${a.slideClass}, swiper-slide`);
         !i && s.isElement && t && t.length > 1 && t.includes(e) && [...t.slice(t.indexOf(e) + 1, t.length)].forEach((e => {
            !i && e.matches && e.matches(`.${a.slideClass}, swiper-slide`) && (i = e)
         }
         ));
         let r, n = !1;
         if (i)
            for (let e = 0; e < s.slides.length; e += 1)
               if (s.slides[e] === i) {
                  n = !0,
                     r = e;
                  break
               }
         if (!i || !n)
            return s.clickedSlide = void 0,
               void (s.clickedIndex = void 0);
         s.clickedSlide = i,
            s.virtual && s.params.virtual.enabled ? s.clickedIndex = parseInt(i.getAttribute("data-swiper-slide-index"), 10) : s.clickedIndex = r,
            a.slideToClickedSlide && void 0 !== s.clickedIndex && s.clickedIndex !== s.activeIndex && s.slideToClickedSlide()
      }
   };
   var k = {
      getTranslate: function (e) {
         void 0 === e && (e = this.isHorizontal() ? "x" : "y");
         const { params: t, rtlTranslate: s, translate: a, wrapperEl: i } = this;
         if (t.virtualTranslate)
            return s ? -a : a;
         if (t.cssMode)
            return a;
         let r = o(i, e);
         return r += this.cssOverflowAdjustment(),
            s && (r = -r),
            r || 0
      },
      setTranslate: function (e, t) {
         const s = this
            , { rtlTranslate: a, params: i, wrapperEl: r, progress: n } = s;
         let l, o = 0, d = 0;
         s.isHorizontal() ? o = a ? -e : e : d = e,
            i.roundLengths && (o = Math.floor(o),
               d = Math.floor(d)),
            s.previousTranslate = s.translate,
            s.translate = s.isHorizontal() ? o : d,
            i.cssMode ? r[s.isHorizontal() ? "scrollLeft" : "scrollTop"] = s.isHorizontal() ? -o : -d : i.virtualTranslate || (s.isHorizontal() ? o -= s.cssOverflowAdjustment() : d -= s.cssOverflowAdjustment(),
               r.style.transform = `translate3d(${o}px, ${d}px, 0px)`);
         const c = s.maxTranslate() - s.minTranslate();
         l = 0 === c ? 0 : (e - s.minTranslate()) / c,
            l !== n && s.updateProgress(e),
            s.emit("setTranslate", s.translate, t)
      },
      minTranslate: function () {
         return -this.snapGrid[0]
      },
      maxTranslate: function () {
         return -this.snapGrid[this.snapGrid.length - 1]
      },
      translateTo: function (e, t, s, a, i) {
         void 0 === e && (e = 0),
            void 0 === t && (t = this.params.speed),
            void 0 === s && (s = !0),
            void 0 === a && (a = !0);
         const r = this
            , { params: n, wrapperEl: l } = r;
         if (r.animating && n.preventInteractionOnTransition)
            return !1;
         const o = r.minTranslate()
            , d = r.maxTranslate();
         let c;
         if (c = a && e > o ? o : a && e < d ? d : e,
            r.updateProgress(c),
            n.cssMode) {
            const e = r.isHorizontal();
            if (0 === t)
               l[e ? "scrollLeft" : "scrollTop"] = -c;
            else {
               if (!r.support.smoothScroll)
                  return u({
                     swiper: r,
                     targetPosition: -c,
                     side: e ? "left" : "top"
                  }),
                     !0;
               l.scrollTo({
                  [e ? "left" : "top"]: -c,
                  behavior: "smooth"
               })
            }
            return !0
         }
         return 0 === t ? (r.setTransition(0),
            r.setTranslate(c),
            s && (r.emit("beforeTransitionStart", t, i),
               r.emit("transitionEnd"))) : (r.setTransition(t),
                  r.setTranslate(c),
                  s && (r.emit("beforeTransitionStart", t, i),
                     r.emit("transitionStart")),
                  r.animating || (r.animating = !0,
                     r.onTranslateToWrapperTransitionEnd || (r.onTranslateToWrapperTransitionEnd = function (e) {
                        r && !r.destroyed && e.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onTranslateToWrapperTransitionEnd),
                           r.onTranslateToWrapperTransitionEnd = null,
                           delete r.onTranslateToWrapperTransitionEnd,
                           s && r.emit("transitionEnd"))
                     }
                     ),
                     r.wrapperEl.addEventListener("transitionend", r.onTranslateToWrapperTransitionEnd))),
            !0
      }
   };
   function O(e) {
      let { swiper: t, runCallbacks: s, direction: a, step: i } = e;
      const { activeIndex: r, previousIndex: n } = t;
      let l = a;
      if (l || (l = r > n ? "next" : r < n ? "prev" : "reset"),
         t.emit(`transition ${i}`),
         s && r !== n) {
         if ("reset" === l)
            return void t.emit(`slideResetTransition ${i}`);
         t.emit(`slideChangeTransition ${i}`),
            "next" === l ? t.emit(`slideNextTransition ${i}`) : t.emit(`slidePrevTransition ${i}`)
      }
   }
   var D = {
      slideTo: function (e, t, s, a, i) {
         void 0 === e && (e = 0),
            void 0 === t && (t = this.params.speed),
            void 0 === s && (s = !0),
            "string" == typeof e && (e = parseInt(e, 10));
         const r = this;
         let n = e;
         n < 0 && (n = 0);
         const { params: l, snapGrid: o, slidesGrid: d, previousIndex: c, activeIndex: p, rtlTranslate: m, wrapperEl: h, enabled: f } = r;
         if (r.animating && l.preventInteractionOnTransition || !f && !a && !i)
            return !1;
         const g = Math.min(r.params.slidesPerGroupSkip, n);
         let v = g + Math.floor((n - g) / r.params.slidesPerGroup);
         v >= o.length && (v = o.length - 1);
         const w = -o[v];
         if (l.normalizeSlideIndex)
            for (let e = 0; e < d.length; e += 1) {
               const t = -Math.floor(100 * w)
                  , s = Math.floor(100 * d[e])
                  , a = Math.floor(100 * d[e + 1]);
               void 0 !== d[e + 1] ? t >= s && t < a - (a - s) / 2 ? n = e : t >= s && t < a && (n = e + 1) : t >= s && (n = e)
            }
         if (r.initialized && n !== p) {
            if (!r.allowSlideNext && (m ? w > r.translate && w > r.minTranslate() : w < r.translate && w < r.minTranslate()))
               return !1;
            if (!r.allowSlidePrev && w > r.translate && w > r.maxTranslate() && (p || 0) !== n)
               return !1
         }
         let b;
         if (n !== (c || 0) && s && r.emit("beforeSlideChangeStart"),
            r.updateProgress(w),
            b = n > p ? "next" : n < p ? "prev" : "reset",
            m && -w === r.translate || !m && w === r.translate)
            return r.updateActiveIndex(n),
               l.autoHeight && r.updateAutoHeight(),
               r.updateSlidesClasses(),
               "slide" !== l.effect && r.setTranslate(w),
               "reset" !== b && (r.transitionStart(s, b),
                  r.transitionEnd(s, b)),
               !1;
         if (l.cssMode) {
            const e = r.isHorizontal()
               , s = m ? w : -w;
            if (0 === t) {
               const t = r.virtual && r.params.virtual.enabled;
               t && (r.wrapperEl.style.scrollSnapType = "none",
                  r._immediateVirtual = !0),
                  t && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0 ? (r._cssModeVirtualInitialSet = !0,
                     requestAnimationFrame((() => {
                        h[e ? "scrollLeft" : "scrollTop"] = s
                     }
                     ))) : h[e ? "scrollLeft" : "scrollTop"] = s,
                  t && requestAnimationFrame((() => {
                     r.wrapperEl.style.scrollSnapType = "",
                        r._immediateVirtual = !1
                  }
                  ))
            } else {
               if (!r.support.smoothScroll)
                  return u({
                     swiper: r,
                     targetPosition: s,
                     side: e ? "left" : "top"
                  }),
                     !0;
               h.scrollTo({
                  [e ? "left" : "top"]: s,
                  behavior: "smooth"
               })
            }
            return !0
         }
         return r.setTransition(t),
            r.setTranslate(w),
            r.updateActiveIndex(n),
            r.updateSlidesClasses(),
            r.emit("beforeTransitionStart", t, a),
            r.transitionStart(s, b),
            0 === t ? r.transitionEnd(s, b) : r.animating || (r.animating = !0,
               r.onSlideToWrapperTransitionEnd || (r.onSlideToWrapperTransitionEnd = function (e) {
                  r && !r.destroyed && e.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onSlideToWrapperTransitionEnd),
                     r.onSlideToWrapperTransitionEnd = null,
                     delete r.onSlideToWrapperTransitionEnd,
                     r.transitionEnd(s, b))
               }
               ),
               r.wrapperEl.addEventListener("transitionend", r.onSlideToWrapperTransitionEnd)),
            !0
      },
      slideToLoop: function (e, t, s, a) {
         if (void 0 === e && (e = 0),
            void 0 === t && (t = this.params.speed),
            void 0 === s && (s = !0),
            "string" == typeof e) {
            e = parseInt(e, 10)
         }
         const i = this;
         let r = e;
         return i.params.loop && (i.virtual && i.params.virtual.enabled ? r += i.virtual.slidesBefore : r = i.getSlideIndexByData(r)),
            i.slideTo(r, t, s, a)
      },
      slideNext: function (e, t, s) {
         void 0 === e && (e = this.params.speed),
            void 0 === t && (t = !0);
         const a = this
            , { enabled: i, params: r, animating: n } = a;
         if (!i)
            return a;
         let l = r.slidesPerGroup;
         "auto" === r.slidesPerView && 1 === r.slidesPerGroup && r.slidesPerGroupAuto && (l = Math.max(a.slidesPerViewDynamic("current", !0), 1));
         const o = a.activeIndex < r.slidesPerGroupSkip ? 1 : l
            , d = a.virtual && r.virtual.enabled;
         if (r.loop) {
            if (n && !d && r.loopPreventsSliding)
               return !1;
            if (a.loopFix({
               direction: "next"
            }),
               a._clientLeft = a.wrapperEl.clientLeft,
               a.activeIndex === a.slides.length - 1 && r.cssMode)
               return requestAnimationFrame((() => {
                  a.slideTo(a.activeIndex + o, e, t, s)
               }
               )),
                  !0
         }
         return r.rewind && a.isEnd ? a.slideTo(0, e, t, s) : a.slideTo(a.activeIndex + o, e, t, s)
      },
      slidePrev: function (e, t, s) {
         void 0 === e && (e = this.params.speed),
            void 0 === t && (t = !0);
         const a = this
            , { params: i, snapGrid: r, slidesGrid: n, rtlTranslate: l, enabled: o, animating: d } = a;
         if (!o)
            return a;
         const c = a.virtual && i.virtual.enabled;
         if (i.loop) {
            if (d && !c && i.loopPreventsSliding)
               return !1;
            a.loopFix({
               direction: "prev"
            }),
               a._clientLeft = a.wrapperEl.clientLeft
         }
         function p(e) {
            return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e)
         }
         const u = p(l ? a.translate : -a.translate)
            , m = r.map((e => p(e)));
         let h = r[m.indexOf(u) - 1];
         if (void 0 === h && i.cssMode) {
            let e;
            r.forEach(((t, s) => {
               u >= t && (e = s)
            }
            )),
               void 0 !== e && (h = r[e > 0 ? e - 1 : e])
         }
         let f = 0;
         if (void 0 !== h && (f = n.indexOf(h),
            f < 0 && (f = a.activeIndex - 1),
            "auto" === i.slidesPerView && 1 === i.slidesPerGroup && i.slidesPerGroupAuto && (f = f - a.slidesPerViewDynamic("previous", !0) + 1,
               f = Math.max(f, 0))),
            i.rewind && a.isBeginning) {
            const i = a.params.virtual && a.params.virtual.enabled && a.virtual ? a.virtual.slides.length - 1 : a.slides.length - 1;
            return a.slideTo(i, e, t, s)
         }
         return i.loop && 0 === a.activeIndex && i.cssMode ? (requestAnimationFrame((() => {
            a.slideTo(f, e, t, s)
         }
         )),
            !0) : a.slideTo(f, e, t, s)
      },
      slideReset: function (e, t, s) {
         return void 0 === e && (e = this.params.speed),
            void 0 === t && (t = !0),
            this.slideTo(this.activeIndex, e, t, s)
      },
      slideToClosest: function (e, t, s, a) {
         void 0 === e && (e = this.params.speed),
            void 0 === t && (t = !0),
            void 0 === a && (a = .5);
         const i = this;
         let r = i.activeIndex;
         const n = Math.min(i.params.slidesPerGroupSkip, r)
            , l = n + Math.floor((r - n) / i.params.slidesPerGroup)
            , o = i.rtlTranslate ? i.translate : -i.translate;
         if (o >= i.snapGrid[l]) {
            const e = i.snapGrid[l];
            o - e > (i.snapGrid[l + 1] - e) * a && (r += i.params.slidesPerGroup)
         } else {
            const e = i.snapGrid[l - 1];
            o - e <= (i.snapGrid[l] - e) * a && (r -= i.params.slidesPerGroup)
         }
         return r = Math.max(r, 0),
            r = Math.min(r, i.slidesGrid.length - 1),
            i.slideTo(r, e, t, s)
      },
      slideToClickedSlide: function () {
         const e = this
            , { params: t, slidesEl: s } = e
            , a = "auto" === t.slidesPerView ? e.slidesPerViewDynamic() : t.slidesPerView;
         let i, r = e.clickedIndex;
         const l = e.isElement ? "swiper-slide" : `.${t.slideClass}`;
         if (t.loop) {
            if (e.animating)
               return;
            i = parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10),
               t.centeredSlides ? r < e.loopedSlides - a / 2 || r > e.slides.length - e.loopedSlides + a / 2 ? (e.loopFix(),
                  r = e.getSlideIndex(h(s, `${l}[data-swiper-slide-index="${i}"]`)[0]),
                  n((() => {
                     e.slideTo(r)
                  }
                  ))) : e.slideTo(r) : r > e.slides.length - a ? (e.loopFix(),
                     r = e.getSlideIndex(h(s, `${l}[data-swiper-slide-index="${i}"]`)[0]),
                     n((() => {
                        e.slideTo(r)
                     }
                     ))) : e.slideTo(r)
         } else
            e.slideTo(r)
      }
   };
   var G = {
      loopCreate: function (e) {
         const t = this
            , { params: s, slidesEl: a } = t;
         if (!s.loop || t.virtual && t.params.virtual.enabled)
            return;
         h(a, `.${s.slideClass}, swiper-slide`).forEach(((e, t) => {
            e.setAttribute("data-swiper-slide-index", t)
         }
         )),
            t.loopFix({
               slideRealIndex: e,
               direction: s.centeredSlides ? void 0 : "next"
            })
      },
      loopFix: function (e) {
         let { slideRealIndex: t, slideTo: s = !0, direction: a, setTranslate: i, activeSlideIndex: r, byController: n, byMousewheel: l } = void 0 === e ? {} : e;
         const o = this;
         if (!o.params.loop)
            return;
         o.emit("beforeLoopFix");
         const { slides: d, allowSlidePrev: c, allowSlideNext: p, slidesEl: u, params: m } = o;
         if (o.allowSlidePrev = !0,
            o.allowSlideNext = !0,
            o.virtual && m.virtual.enabled)
            return s && (m.centeredSlides || 0 !== o.snapIndex ? m.centeredSlides && o.snapIndex < m.slidesPerView ? o.slideTo(o.virtual.slides.length + o.snapIndex, 0, !1, !0) : o.snapIndex === o.snapGrid.length - 1 && o.slideTo(o.virtual.slidesBefore, 0, !1, !0) : o.slideTo(o.virtual.slides.length, 0, !1, !0)),
               o.allowSlidePrev = c,
               o.allowSlideNext = p,
               void o.emit("loopFix");
         const h = "auto" === m.slidesPerView ? o.slidesPerViewDynamic() : Math.ceil(parseFloat(m.slidesPerView, 10));
         let f = m.loopedSlides || h;
         f % m.slidesPerGroup != 0 && (f += m.slidesPerGroup - f % m.slidesPerGroup),
            o.loopedSlides = f;
         const g = []
            , v = [];
         let w = o.activeIndex;
         void 0 === r ? r = o.getSlideIndex(o.slides.filter((e => e.classList.contains(m.slideActiveClass)))[0]) : w = r;
         const b = "next" === a || !a
            , y = "prev" === a || !a;
         let E = 0
            , x = 0;
         if (r < f) {
            E = Math.max(f - r, m.slidesPerGroup);
            for (let e = 0; e < f - r; e += 1) {
               const t = e - Math.floor(e / d.length) * d.length;
               g.push(d.length - t - 1)
            }
         } else if (r > o.slides.length - 2 * f) {
            x = Math.max(r - (o.slides.length - 2 * f), m.slidesPerGroup);
            for (let e = 0; e < x; e += 1) {
               const t = e - Math.floor(e / d.length) * d.length;
               v.push(t)
            }
         }
         if (y && g.forEach((e => {
            o.slides[e].swiperLoopMoveDOM = !0,
               u.prepend(o.slides[e]),
               o.slides[e].swiperLoopMoveDOM = !1
         }
         )),
            b && v.forEach((e => {
               o.slides[e].swiperLoopMoveDOM = !0,
                  u.append(o.slides[e]),
                  o.slides[e].swiperLoopMoveDOM = !1
            }
            )),
            o.recalcSlides(),
            "auto" === m.slidesPerView && o.updateSlides(),
            m.watchSlidesProgress && o.updateSlidesOffset(),
            s)
            if (g.length > 0 && y)
               if (void 0 === t) {
                  const e = o.slidesGrid[w]
                     , t = o.slidesGrid[w + E] - e;
                  l ? o.setTranslate(o.translate - t) : (o.slideTo(w + E, 0, !1, !0),
                     i && (o.touches[o.isHorizontal() ? "startX" : "startY"] += t,
                        o.touchEventsData.currentTranslate = o.translate))
               } else
                  i && (o.slideToLoop(t, 0, !1, !0),
                     o.touchEventsData.currentTranslate = o.translate);
            else if (v.length > 0 && b)
               if (void 0 === t) {
                  const e = o.slidesGrid[w]
                     , t = o.slidesGrid[w - x] - e;
                  l ? o.setTranslate(o.translate - t) : (o.slideTo(w - x, 0, !1, !0),
                     i && (o.touches[o.isHorizontal() ? "startX" : "startY"] += t,
                        o.touchEventsData.currentTranslate = o.translate))
               } else
                  o.slideToLoop(t, 0, !1, !0);
         if (o.allowSlidePrev = c,
            o.allowSlideNext = p,
            o.controller && o.controller.control && !n) {
            const e = {
               slideRealIndex: t,
               direction: a,
               setTranslate: i,
               activeSlideIndex: r,
               byController: !0
            };
            Array.isArray(o.controller.control) ? o.controller.control.forEach((t => {
               !t.destroyed && t.params.loop && t.loopFix({
                  ...e,
                  slideTo: t.params.slidesPerView === m.slidesPerView && s
               })
            }
            )) : o.controller.control instanceof o.constructor && o.controller.control.params.loop && o.controller.control.loopFix({
               ...e,
               slideTo: o.controller.control.params.slidesPerView === m.slidesPerView && s
            })
         }
         o.emit("loopFix")
      },
      loopDestroy: function () {
         const e = this
            , { params: t, slidesEl: s } = e;
         if (!t.loop || e.virtual && e.params.virtual.enabled)
            return;
         e.recalcSlides();
         const a = [];
         e.slides.forEach((e => {
            const t = void 0 === e.swiperSlideIndex ? 1 * e.getAttribute("data-swiper-slide-index") : e.swiperSlideIndex;
            a[t] = e
         }
         )),
            e.slides.forEach((e => {
               e.removeAttribute("data-swiper-slide-index")
            }
            )),
            a.forEach((e => {
               s.append(e)
            }
            )),
            e.recalcSlides(),
            e.slideTo(e.realIndex, 0)
      }
   };
   function H(e) {
      const t = this
         , s = a()
         , i = r()
         , n = t.touchEventsData;
      n.evCache.push(e);
      const { params: o, touches: d, enabled: c } = t;
      if (!c)
         return;
      if (!o.simulateTouch && "mouse" === e.pointerType)
         return;
      if (t.animating && o.preventInteractionOnTransition)
         return;
      !t.animating && o.cssMode && o.loop && t.loopFix();
      let p = e;
      p.originalEvent && (p = p.originalEvent);
      let u = p.target;
      if ("wrapper" === o.touchEventsTarget && !t.wrapperEl.contains(u))
         return;
      if ("which" in p && 3 === p.which)
         return;
      if ("button" in p && p.button > 0)
         return;
      if (n.isTouched && n.isMoved)
         return;
      const m = !!o.noSwipingClass && "" !== o.noSwipingClass
         , h = e.composedPath ? e.composedPath() : e.path;
      m && p.target && p.target.shadowRoot && h && (u = h[0]);
      const f = o.noSwipingSelector ? o.noSwipingSelector : `.${o.noSwipingClass}`
         , g = !(!p.target || !p.target.shadowRoot);
      if (o.noSwiping && (g ? function (e, t) {
         return void 0 === t && (t = this),
            function t(s) {
               if (!s || s === a() || s === r())
                  return null;
               s.assignedSlot && (s = s.assignedSlot);
               const i = s.closest(e);
               return i || s.getRootNode ? i || t(s.getRootNode().host) : null
            }(t)
      }(f, u) : u.closest(f)))
         return void (t.allowClick = !0);
      if (o.swipeHandler && !u.closest(o.swipeHandler))
         return;
      d.currentX = p.pageX,
         d.currentY = p.pageY;
      const v = d.currentX
         , w = d.currentY
         , b = o.edgeSwipeDetection || o.iOSEdgeSwipeDetection
         , y = o.edgeSwipeThreshold || o.iOSEdgeSwipeThreshold;
      if (b && (v <= y || v >= i.innerWidth - y)) {
         if ("prevent" !== b)
            return;
         e.preventDefault()
      }
      Object.assign(n, {
         isTouched: !0,
         isMoved: !1,
         allowTouchCallbacks: !0,
         isScrolling: void 0,
         startMoving: void 0
      }),
         d.startX = v,
         d.startY = w,
         n.touchStartTime = l(),
         t.allowClick = !0,
         t.updateSize(),
         t.swipeDirection = void 0,
         o.threshold > 0 && (n.allowThresholdMove = !1);
      let E = !0;
      u.matches(n.focusableElements) && (E = !1,
         "SELECT" === u.nodeName && (n.isTouched = !1)),
         s.activeElement && s.activeElement.matches(n.focusableElements) && s.activeElement !== u && s.activeElement.blur();
      const x = E && t.allowTouchMove && o.touchStartPreventDefault;
      !o.touchStartForcePreventDefault && !x || u.isContentEditable || p.preventDefault(),
         o.freeMode && o.freeMode.enabled && t.freeMode && t.animating && !o.cssMode && t.freeMode.onTouchStart(),
         t.emit("touchStart", p)
   }
   function X(e) {
      const t = a()
         , s = this
         , i = s.touchEventsData
         , { params: r, touches: n, rtlTranslate: o, enabled: d } = s;
      if (!d)
         return;
      if (!r.simulateTouch && "mouse" === e.pointerType)
         return;
      let c = e;
      if (c.originalEvent && (c = c.originalEvent),
         !i.isTouched)
         return void (i.startMoving && i.isScrolling && s.emit("touchMoveOpposite", c));
      const p = i.evCache.findIndex((e => e.pointerId === c.pointerId));
      p >= 0 && (i.evCache[p] = c);
      const u = i.evCache.length > 1 ? i.evCache[0] : c
         , m = u.pageX
         , h = u.pageY;
      if (c.preventedByNestedSwiper)
         return n.startX = m,
            void (n.startY = h);
      if (!s.allowTouchMove)
         return c.target.matches(i.focusableElements) || (s.allowClick = !1),
            void (i.isTouched && (Object.assign(n, {
               startX: m,
               startY: h,
               prevX: s.touches.currentX,
               prevY: s.touches.currentY,
               currentX: m,
               currentY: h
            }),
               i.touchStartTime = l()));
      if (r.touchReleaseOnEdges && !r.loop)
         if (s.isVertical()) {
            if (h < n.startY && s.translate <= s.maxTranslate() || h > n.startY && s.translate >= s.minTranslate())
               return i.isTouched = !1,
                  void (i.isMoved = !1)
         } else if (m < n.startX && s.translate <= s.maxTranslate() || m > n.startX && s.translate >= s.minTranslate())
            return;
      if (t.activeElement && c.target === t.activeElement && c.target.matches(i.focusableElements))
         return i.isMoved = !0,
            void (s.allowClick = !1);
      if (i.allowTouchCallbacks && s.emit("touchMove", c),
         c.targetTouches && c.targetTouches.length > 1)
         return;
      n.currentX = m,
         n.currentY = h;
      const f = n.currentX - n.startX
         , g = n.currentY - n.startY;
      if (s.params.threshold && Math.sqrt(f ** 2 + g ** 2) < s.params.threshold)
         return;
      if (void 0 === i.isScrolling) {
         let e;
         s.isHorizontal() && n.currentY === n.startY || s.isVertical() && n.currentX === n.startX ? i.isScrolling = !1 : f * f + g * g >= 25 && (e = 180 * Math.atan2(Math.abs(g), Math.abs(f)) / Math.PI,
            i.isScrolling = s.isHorizontal() ? e > r.touchAngle : 90 - e > r.touchAngle)
      }
      if (i.isScrolling && s.emit("touchMoveOpposite", c),
         void 0 === i.startMoving && (n.currentX === n.startX && n.currentY === n.startY || (i.startMoving = !0)),
         i.isScrolling || s.zoom && s.params.zoom && s.params.zoom.enabled && i.evCache.length > 1)
         return void (i.isTouched = !1);
      if (!i.startMoving)
         return;
      s.allowClick = !1,
         !r.cssMode && c.cancelable && c.preventDefault(),
         r.touchMoveStopPropagation && !r.nested && c.stopPropagation();
      let v = s.isHorizontal() ? f : g
         , w = s.isHorizontal() ? n.currentX - n.previousX : n.currentY - n.previousY;
      r.oneWayMovement && (v = Math.abs(v) * (o ? 1 : -1),
         w = Math.abs(w) * (o ? 1 : -1)),
         n.diff = v,
         v *= r.touchRatio,
         o && (v = -v,
            w = -w);
      const b = s.touchesDirection;
      s.swipeDirection = v > 0 ? "prev" : "next",
         s.touchesDirection = w > 0 ? "prev" : "next";
      const y = s.params.loop && !r.cssMode
         , E = "next" === s.swipeDirection && s.allowSlideNext || "prev" === s.swipeDirection && s.allowSlidePrev;
      if (!i.isMoved) {
         if (y && E && s.loopFix({
            direction: s.swipeDirection
         }),
            i.startTranslate = s.getTranslate(),
            s.setTransition(0),
            s.animating) {
            const e = new window.CustomEvent("transitionend", {
               bubbles: !0,
               cancelable: !0
            });
            s.wrapperEl.dispatchEvent(e)
         }
         i.allowMomentumBounce = !1,
            !r.grabCursor || !0 !== s.allowSlideNext && !0 !== s.allowSlidePrev || s.setGrabCursor(!0),
            s.emit("sliderFirstMove", c)
      }
      let x;
      i.isMoved && b !== s.touchesDirection && y && E && Math.abs(v) >= 1 && (s.loopFix({
         direction: s.swipeDirection,
         setTranslate: !0
      }),
         x = !0),
         s.emit("sliderMove", c),
         i.isMoved = !0,
         i.currentTranslate = v + i.startTranslate;
      let S = !0
         , T = r.resistanceRatio;
      if (r.touchReleaseOnEdges && (T = 0),
         v > 0 ? (y && E && !x && i.currentTranslate > (r.centeredSlides ? s.minTranslate() - s.size / 2 : s.minTranslate()) && s.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0
         }),
            i.currentTranslate > s.minTranslate() && (S = !1,
               r.resistance && (i.currentTranslate = s.minTranslate() - 1 + (-s.minTranslate() + i.startTranslate + v) ** T))) : v < 0 && (y && E && !x && i.currentTranslate < (r.centeredSlides ? s.maxTranslate() + s.size / 2 : s.maxTranslate()) && s.loopFix({
                  direction: "next",
                  setTranslate: !0,
                  activeSlideIndex: s.slides.length - ("auto" === r.slidesPerView ? s.slidesPerViewDynamic() : Math.ceil(parseFloat(r.slidesPerView, 10)))
               }),
                  i.currentTranslate < s.maxTranslate() && (S = !1,
                     r.resistance && (i.currentTranslate = s.maxTranslate() + 1 - (s.maxTranslate() - i.startTranslate - v) ** T))),
         S && (c.preventedByNestedSwiper = !0),
         !s.allowSlideNext && "next" === s.swipeDirection && i.currentTranslate < i.startTranslate && (i.currentTranslate = i.startTranslate),
         !s.allowSlidePrev && "prev" === s.swipeDirection && i.currentTranslate > i.startTranslate && (i.currentTranslate = i.startTranslate),
         s.allowSlidePrev || s.allowSlideNext || (i.currentTranslate = i.startTranslate),
         r.threshold > 0) {
         if (!(Math.abs(v) > r.threshold || i.allowThresholdMove))
            return void (i.currentTranslate = i.startTranslate);
         if (!i.allowThresholdMove)
            return i.allowThresholdMove = !0,
               n.startX = n.currentX,
               n.startY = n.currentY,
               i.currentTranslate = i.startTranslate,
               void (n.diff = s.isHorizontal() ? n.currentX - n.startX : n.currentY - n.startY)
      }
      r.followFinger && !r.cssMode && ((r.freeMode && r.freeMode.enabled && s.freeMode || r.watchSlidesProgress) && (s.updateActiveIndex(),
         s.updateSlidesClasses()),
         r.freeMode && r.freeMode.enabled && s.freeMode && s.freeMode.onTouchMove(),
         s.updateProgress(i.currentTranslate),
         s.setTranslate(i.currentTranslate))
   }
   function Y(e) {
      const t = this
         , s = t.touchEventsData
         , a = s.evCache.findIndex((t => t.pointerId === e.pointerId));
      if (a >= 0 && s.evCache.splice(a, 1),
         ["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
         if (!(["pointercancel", "contextmenu"].includes(e.type) && (t.browser.isSafari || t.browser.isWebView)))
            return
      }
      const { params: i, touches: r, rtlTranslate: o, slidesGrid: d, enabled: c } = t;
      if (!c)
         return;
      if (!i.simulateTouch && "mouse" === e.pointerType)
         return;
      let p = e;
      if (p.originalEvent && (p = p.originalEvent),
         s.allowTouchCallbacks && t.emit("touchEnd", p),
         s.allowTouchCallbacks = !1,
         !s.isTouched)
         return s.isMoved && i.grabCursor && t.setGrabCursor(!1),
            s.isMoved = !1,
            void (s.startMoving = !1);
      i.grabCursor && s.isMoved && s.isTouched && (!0 === t.allowSlideNext || !0 === t.allowSlidePrev) && t.setGrabCursor(!1);
      const u = l()
         , m = u - s.touchStartTime;
      if (t.allowClick) {
         const e = p.path || p.composedPath && p.composedPath();
         t.updateClickedSlide(e && e[0] || p.target, e),
            t.emit("tap click", p),
            m < 300 && u - s.lastClickTime < 300 && t.emit("doubleTap doubleClick", p)
      }
      if (s.lastClickTime = l(),
         n((() => {
            t.destroyed || (t.allowClick = !0)
         }
         )),
         !s.isTouched || !s.isMoved || !t.swipeDirection || 0 === r.diff || s.currentTranslate === s.startTranslate)
         return s.isTouched = !1,
            s.isMoved = !1,
            void (s.startMoving = !1);
      let h;
      if (s.isTouched = !1,
         s.isMoved = !1,
         s.startMoving = !1,
         h = i.followFinger ? o ? t.translate : -t.translate : -s.currentTranslate,
         i.cssMode)
         return;
      if (i.freeMode && i.freeMode.enabled)
         return void t.freeMode.onTouchEnd({
            currentPos: h
         });
      let f = 0
         , g = t.slidesSizesGrid[0];
      for (let e = 0; e < d.length; e += e < i.slidesPerGroupSkip ? 1 : i.slidesPerGroup) {
         const t = e < i.slidesPerGroupSkip - 1 ? 1 : i.slidesPerGroup;
         void 0 !== d[e + t] ? h >= d[e] && h < d[e + t] && (f = e,
            g = d[e + t] - d[e]) : h >= d[e] && (f = e,
               g = d[d.length - 1] - d[d.length - 2])
      }
      let v = null
         , w = null;
      i.rewind && (t.isBeginning ? w = i.virtual && i.virtual.enabled && t.virtual ? t.virtual.slides.length - 1 : t.slides.length - 1 : t.isEnd && (v = 0));
      const b = (h - d[f]) / g
         , y = f < i.slidesPerGroupSkip - 1 ? 1 : i.slidesPerGroup;
      if (m > i.longSwipesMs) {
         if (!i.longSwipes)
            return void t.slideTo(t.activeIndex);
         "next" === t.swipeDirection && (b >= i.longSwipesRatio ? t.slideTo(i.rewind && t.isEnd ? v : f + y) : t.slideTo(f)),
            "prev" === t.swipeDirection && (b > 1 - i.longSwipesRatio ? t.slideTo(f + y) : null !== w && b < 0 && Math.abs(b) > i.longSwipesRatio ? t.slideTo(w) : t.slideTo(f))
      } else {
         if (!i.shortSwipes)
            return void t.slideTo(t.activeIndex);
         t.navigation && (p.target === t.navigation.nextEl || p.target === t.navigation.prevEl) ? p.target === t.navigation.nextEl ? t.slideTo(f + y) : t.slideTo(f) : ("next" === t.swipeDirection && t.slideTo(null !== v ? v : f + y),
            "prev" === t.swipeDirection && t.slideTo(null !== w ? w : f))
      }
   }
   function N() {
      const e = this
         , { params: t, el: s } = e;
      if (s && 0 === s.offsetWidth)
         return;
      t.breakpoints && e.setBreakpoint();
      const { allowSlideNext: a, allowSlidePrev: i, snapGrid: r } = e
         , n = e.virtual && e.params.virtual.enabled;
      e.allowSlideNext = !0,
         e.allowSlidePrev = !0,
         e.updateSize(),
         e.updateSlides(),
         e.updateSlidesClasses();
      const l = n && t.loop;
      !("auto" === t.slidesPerView || t.slidesPerView > 1) || !e.isEnd || e.isBeginning || e.params.centeredSlides || l ? e.params.loop && !n ? e.slideToLoop(e.realIndex, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0) : e.slideTo(e.slides.length - 1, 0, !1, !0),
         e.autoplay && e.autoplay.running && e.autoplay.paused && (clearTimeout(e.autoplay.resizeTimeout),
            e.autoplay.resizeTimeout = setTimeout((() => {
               e.autoplay && e.autoplay.running && e.autoplay.paused && e.autoplay.resume()
            }
            ), 500)),
         e.allowSlidePrev = i,
         e.allowSlideNext = a,
         e.params.watchOverflow && r !== e.snapGrid && e.checkOverflow()
   }
   function B(e) {
      const t = this;
      t.enabled && (t.allowClick || (t.params.preventClicks && e.preventDefault(),
         t.params.preventClicksPropagation && t.animating && (e.stopPropagation(),
            e.stopImmediatePropagation())))
   }
   function R() {
      const e = this
         , { wrapperEl: t, rtlTranslate: s, enabled: a } = e;
      if (!a)
         return;
      let i;
      e.previousTranslate = e.translate,
         e.isHorizontal() ? e.translate = -t.scrollLeft : e.translate = -t.scrollTop,
         0 === e.translate && (e.translate = 0),
         e.updateActiveIndex(),
         e.updateSlidesClasses();
      const r = e.maxTranslate() - e.minTranslate();
      i = 0 === r ? 0 : (e.translate - e.minTranslate()) / r,
         i !== e.progress && e.updateProgress(s ? -e.translate : e.translate),
         e.emit("setTranslate", e.translate, !1)
   }
   function q(e) {
      const t = this;
      z(t, e.target),
         t.params.cssMode || "auto" !== t.params.slidesPerView && !t.params.autoHeight || t.update()
   }
   let V = !1;
   function F() { }
   const _ = (e, t) => {
      const s = a()
         , { params: i, el: r, wrapperEl: n, device: l } = e
         , o = !!i.nested
         , d = "on" === t ? "addEventListener" : "removeEventListener"
         , c = t;
      r[d]("pointerdown", e.onTouchStart, {
         passive: !1
      }),
         s[d]("pointermove", e.onTouchMove, {
            passive: !1,
            capture: o
         }),
         s[d]("pointerup", e.onTouchEnd, {
            passive: !0
         }),
         s[d]("pointercancel", e.onTouchEnd, {
            passive: !0
         }),
         s[d]("pointerout", e.onTouchEnd, {
            passive: !0
         }),
         s[d]("pointerleave", e.onTouchEnd, {
            passive: !0
         }),
         s[d]("contextmenu", e.onTouchEnd, {
            passive: !0
         }),
         (i.preventClicks || i.preventClicksPropagation) && r[d]("click", e.onClick, !0),
         i.cssMode && n[d]("scroll", e.onScroll),
         i.updateOnWindowResize ? e[c](l.ios || l.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", N, !0) : e[c]("observerUpdate", N, !0),
         r[d]("load", e.onLoad, {
            capture: !0
         })
   }
      ;
   const j = (e, t) => e.grid && t.grid && t.grid.rows > 1;
   var W = {
      init: !0,
      direction: "horizontal",
      oneWayMovement: !1,
      touchEventsTarget: "wrapper",
      initialSlide: 0,
      speed: 300,
      cssMode: !1,
      updateOnWindowResize: !0,
      resizeObserver: !0,
      nested: !1,
      createElements: !1,
      enabled: !0,
      focusableElements: "input, select, option, textarea, button, video, label",
      width: null,
      height: null,
      preventInteractionOnTransition: !1,
      userAgent: null,
      url: null,
      edgeSwipeDetection: !1,
      edgeSwipeThreshold: 20,
      autoHeight: !1,
      setWrapperSize: !1,
      virtualTranslate: !1,
      effect: "slide",
      breakpoints: void 0,
      breakpointsBase: "window",
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      slidesPerGroupAuto: !1,
      centeredSlides: !1,
      centeredSlidesBounds: !1,
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,
      normalizeSlideIndex: !0,
      centerInsufficientSlides: !1,
      watchOverflow: !0,
      roundLengths: !1,
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: !0,
      shortSwipes: !0,
      longSwipes: !0,
      longSwipesRatio: .5,
      longSwipesMs: 300,
      followFinger: !0,
      allowTouchMove: !0,
      threshold: 5,
      touchMoveStopPropagation: !1,
      touchStartPreventDefault: !0,
      touchStartForcePreventDefault: !1,
      touchReleaseOnEdges: !1,
      uniqueNavElements: !0,
      resistance: !0,
      resistanceRatio: .85,
      watchSlidesProgress: !1,
      grabCursor: !1,
      preventClicks: !0,
      preventClicksPropagation: !0,
      slideToClickedSlide: !1,
      loop: !1,
      loopedSlides: null,
      loopPreventsSliding: !0,
      rewind: !1,
      allowSlidePrev: !0,
      allowSlideNext: !0,
      swipeHandler: null,
      noSwiping: !0,
      noSwipingClass: "swiper-no-swiping",
      noSwipingSelector: null,
      passiveListeners: !0,
      maxBackfaceHiddenSlides: 10,
      containerModifierClass: "swiper-",
      slideClass: "swiper-slide",
      slideActiveClass: "swiper-slide-active",
      slideVisibleClass: "swiper-slide-visible",
      slideNextClass: "swiper-slide-next",
      slidePrevClass: "swiper-slide-prev",
      wrapperClass: "swiper-wrapper",
      lazyPreloaderClass: "swiper-lazy-preloader",
      lazyPreloadPrevNext: 0,
      runCallbacksOnInit: !0,
      _emitClasses: !1
   };
   function U(e, t) {
      return function (s) {
         void 0 === s && (s = {});
         const a = Object.keys(s)[0]
            , i = s[a];
         "object" == typeof i && null !== i ? (!0 === e[a] && (e[a] = {
            enabled: !0
         }),
            "navigation" === a && e[a] && e[a].enabled && !e[a].prevEl && !e[a].nextEl && (e[a].auto = !0),
            ["pagination", "scrollbar"].indexOf(a) >= 0 && e[a] && e[a].enabled && !e[a].el && (e[a].auto = !0),
            a in e && "enabled" in i ? ("object" != typeof e[a] || "enabled" in e[a] || (e[a].enabled = !0),
               e[a] || (e[a] = {
                  enabled: !1
               }),
               c(t, s)) : c(t, s)) : c(t, s)
      }
   }
   const K = {
      eventsEmitter: L,
      update: I,
      translate: k,
      transition: {
         setTransition: function (e, t) {
            const s = this;
            s.params.cssMode || (s.wrapperEl.style.transitionDuration = `${e}ms`,
               s.wrapperEl.style.transitionDelay = 0 === e ? "0ms" : ""),
               s.emit("setTransition", e, t)
         },
         transitionStart: function (e, t) {
            void 0 === e && (e = !0);
            const s = this
               , { params: a } = s;
            a.cssMode || (a.autoHeight && s.updateAutoHeight(),
               O({
                  swiper: s,
                  runCallbacks: e,
                  direction: t,
                  step: "Start"
               }))
         },
         transitionEnd: function (e, t) {
            void 0 === e && (e = !0);
            const s = this
               , { params: a } = s;
            s.animating = !1,
               a.cssMode || (s.setTransition(0),
                  O({
                     swiper: s,
                     runCallbacks: e,
                     direction: t,
                     step: "End"
                  }))
         }
      },
      slide: D,
      loop: G,
      grabCursor: {
         setGrabCursor: function (e) {
            const t = this;
            if (!t.params.simulateTouch || t.params.watchOverflow && t.isLocked || t.params.cssMode)
               return;
            const s = "container" === t.params.touchEventsTarget ? t.el : t.wrapperEl;
            t.isElement && (t.__preventObserver__ = !0),
               s.style.cursor = "move",
               s.style.cursor = e ? "grabbing" : "grab",
               t.isElement && requestAnimationFrame((() => {
                  t.__preventObserver__ = !1
               }
               ))
         },
         unsetGrabCursor: function () {
            const e = this;
            e.params.watchOverflow && e.isLocked || e.params.cssMode || (e.isElement && (e.__preventObserver__ = !0),
               e["container" === e.params.touchEventsTarget ? "el" : "wrapperEl"].style.cursor = "",
               e.isElement && requestAnimationFrame((() => {
                  e.__preventObserver__ = !1
               }
               )))
         }
      },
      events: {
         attachEvents: function () {
            const e = this
               , t = a()
               , { params: s } = e;
            e.onTouchStart = H.bind(e),
               e.onTouchMove = X.bind(e),
               e.onTouchEnd = Y.bind(e),
               s.cssMode && (e.onScroll = R.bind(e)),
               e.onClick = B.bind(e),
               e.onLoad = q.bind(e),
               V || (t.addEventListener("touchstart", F),
                  V = !0),
               _(e, "on")
         },
         detachEvents: function () {
            _(this, "off")
         }
      },
      breakpoints: {
         setBreakpoint: function () {
            const e = this
               , { realIndex: t, initialized: s, params: a, el: i } = e
               , r = a.breakpoints;
            if (!r || r && 0 === Object.keys(r).length)
               return;
            const n = e.getBreakpoint(r, e.params.breakpointsBase, e.el);
            if (!n || e.currentBreakpoint === n)
               return;
            const l = (n in r ? r[n] : void 0) || e.originalParams
               , o = j(e, a)
               , d = j(e, l)
               , p = a.enabled;
            o && !d ? (i.classList.remove(`${a.containerModifierClass}grid`, `${a.containerModifierClass}grid-column`),
               e.emitContainerClasses()) : !o && d && (i.classList.add(`${a.containerModifierClass}grid`),
                  (l.grid.fill && "column" === l.grid.fill || !l.grid.fill && "column" === a.grid.fill) && i.classList.add(`${a.containerModifierClass}grid-column`),
                  e.emitContainerClasses()),
               ["navigation", "pagination", "scrollbar"].forEach((t => {
                  if (void 0 === l[t])
                     return;
                  const s = a[t] && a[t].enabled
                     , i = l[t] && l[t].enabled;
                  s && !i && e[t].disable(),
                     !s && i && e[t].enable()
               }
               ));
            const u = l.direction && l.direction !== a.direction
               , m = a.loop && (l.slidesPerView !== a.slidesPerView || u)
               , h = a.loop;
            u && s && e.changeDirection(),
               c(e.params, l);
            const f = e.params.enabled
               , g = e.params.loop;
            Object.assign(e, {
               allowTouchMove: e.params.allowTouchMove,
               allowSlideNext: e.params.allowSlideNext,
               allowSlidePrev: e.params.allowSlidePrev
            }),
               p && !f ? e.disable() : !p && f && e.enable(),
               e.currentBreakpoint = n,
               e.emit("_beforeBreakpoint", l),
               s && (m ? (e.loopDestroy(),
                  e.loopCreate(t),
                  e.updateSlides()) : !h && g ? (e.loopCreate(t),
                     e.updateSlides()) : h && !g && e.loopDestroy()),
               e.emit("breakpoint", l)
         },
         getBreakpoint: function (e, t, s) {
            if (void 0 === t && (t = "window"),
               !e || "container" === t && !s)
               return;
            let a = !1;
            const i = r()
               , n = "window" === t ? i.innerHeight : s.clientHeight
               , l = Object.keys(e).map((e => {
                  if ("string" == typeof e && 0 === e.indexOf("@")) {
                     const t = parseFloat(e.substr(1));
                     return {
                        value: n * t,
                        point: e
                     }
                  }
                  return {
                     value: e,
                     point: e
                  }
               }
               ));
            l.sort(((e, t) => parseInt(e.value, 10) - parseInt(t.value, 10)));
            for (let e = 0; e < l.length; e += 1) {
               const { point: r, value: n } = l[e];
               "window" === t ? i.matchMedia(`(min-width: ${n}px)`).matches && (a = r) : n <= s.clientWidth && (a = r)
            }
            return a || "max"
         }
      },
      checkOverflow: {
         checkOverflow: function () {
            const e = this
               , { isLocked: t, params: s } = e
               , { slidesOffsetBefore: a } = s;
            if (a) {
               const t = e.slides.length - 1
                  , s = e.slidesGrid[t] + e.slidesSizesGrid[t] + 2 * a;
               e.isLocked = e.size > s
            } else
               e.isLocked = 1 === e.snapGrid.length;
            !0 === s.allowSlideNext && (e.allowSlideNext = !e.isLocked),
               !0 === s.allowSlidePrev && (e.allowSlidePrev = !e.isLocked),
               t && t !== e.isLocked && (e.isEnd = !1),
               t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock")
         }
      },
      classes: {
         addClasses: function () {
            const e = this
               , { classNames: t, params: s, rtl: a, el: i, device: r } = e
               , n = function (e, t) {
                  const s = [];
                  return e.forEach((e => {
                     "object" == typeof e ? Object.keys(e).forEach((a => {
                        e[a] && s.push(t + a)
                     }
                     )) : "string" == typeof e && s.push(t + e)
                  }
                  )),
                     s
               }(["initialized", s.direction, {
                  "free-mode": e.params.freeMode && s.freeMode.enabled
               }, {
                     autoheight: s.autoHeight
                  }, {
                     rtl: a
                  }, {
                     grid: s.grid && s.grid.rows > 1
                  }, {
                     "grid-column": s.grid && s.grid.rows > 1 && "column" === s.grid.fill
                  }, {
                     android: r.android
                  }, {
                     ios: r.ios
                  }, {
                     "css-mode": s.cssMode
                  }, {
                     centered: s.cssMode && s.centeredSlides
                  }, {
                     "watch-progress": s.watchSlidesProgress
                  }], s.containerModifierClass);
            t.push(...n),
               i.classList.add(...t),
               e.emitContainerClasses()
         },
         removeClasses: function () {
            const { el: e, classNames: t } = this;
            e.classList.remove(...t),
               this.emitContainerClasses()
         }
      }
   }
      , Z = {};
   class Q {
      constructor() {
         let e, t;
         for (var s = arguments.length, i = new Array(s), r = 0; r < s; r++)
            i[r] = arguments[r];
         1 === i.length && i[0].constructor && "Object" === Object.prototype.toString.call(i[0]).slice(8, -1) ? t = i[0] : [e, t] = i,
            t || (t = {}),
            t = c({}, t),
            e && !t.el && (t.el = e);
         const n = a();
         if (t.el && "string" == typeof t.el && n.querySelectorAll(t.el).length > 1) {
            const e = [];
            return n.querySelectorAll(t.el).forEach((s => {
               const a = c({}, t, {
                  el: s
               });
               e.push(new Q(a))
            }
            )),
               e
         }
         const l = this;
         l.__swiper__ = !0,
            l.support = M(),
            l.device = C({
               userAgent: t.userAgent
            }),
            l.browser = P(),
            l.eventsListeners = {},
            l.eventsAnyListeners = [],
            l.modules = [...l.__modules__],
            t.modules && Array.isArray(t.modules) && l.modules.push(...t.modules);
         const o = {};
         l.modules.forEach((e => {
            e({
               params: t,
               swiper: l,
               extendParams: U(t, o),
               on: l.on.bind(l),
               once: l.once.bind(l),
               off: l.off.bind(l),
               emit: l.emit.bind(l)
            })
         }
         ));
         const d = c({}, W, o);
         return l.params = c({}, d, Z, t),
            l.originalParams = c({}, l.params),
            l.passedParams = c({}, t),
            l.params && l.params.on && Object.keys(l.params.on).forEach((e => {
               l.on(e, l.params.on[e])
            }
            )),
            l.params && l.params.onAny && l.onAny(l.params.onAny),
            Object.assign(l, {
               enabled: l.params.enabled,
               el: e,
               classNames: [],
               slides: [],
               slidesGrid: [],
               snapGrid: [],
               slidesSizesGrid: [],
               isHorizontal: () => "horizontal" === l.params.direction,
               isVertical: () => "vertical" === l.params.direction,
               activeIndex: 0,
               realIndex: 0,
               isBeginning: !0,
               isEnd: !1,
               translate: 0,
               previousTranslate: 0,
               progress: 0,
               velocity: 0,
               animating: !1,
               cssOverflowAdjustment() {
                  return Math.trunc(this.translate / 2 ** 23) * 2 ** 23
               },
               allowSlideNext: l.params.allowSlideNext,
               allowSlidePrev: l.params.allowSlidePrev,
               touchEventsData: {
                  isTouched: void 0,
                  isMoved: void 0,
                  allowTouchCallbacks: void 0,
                  touchStartTime: void 0,
                  isScrolling: void 0,
                  currentTranslate: void 0,
                  startTranslate: void 0,
                  allowThresholdMove: void 0,
                  focusableElements: l.params.focusableElements,
                  lastClickTime: 0,
                  clickTimeout: void 0,
                  velocities: [],
                  allowMomentumBounce: void 0,
                  startMoving: void 0,
                  evCache: []
               },
               allowClick: !0,
               allowTouchMove: l.params.allowTouchMove,
               touches: {
                  startX: 0,
                  startY: 0,
                  currentX: 0,
                  currentY: 0,
                  diff: 0
               },
               imagesToLoad: [],
               imagesLoaded: 0
            }),
            l.emit("_swiper"),
            l.params.init && l.init(),
            l
      }
      getSlideIndex(e) {
         const { slidesEl: t, params: s } = this
            , a = w(h(t, `.${s.slideClass}, swiper-slide`)[0]);
         return w(e) - a
      }
      getSlideIndexByData(e) {
         return this.getSlideIndex(this.slides.filter((t => 1 * t.getAttribute("data-swiper-slide-index") === e))[0])
      }
      recalcSlides() {
         const { slidesEl: e, params: t } = this;
         this.slides = h(e, `.${t.slideClass}, swiper-slide`)
      }
      enable() {
         const e = this;
         e.enabled || (e.enabled = !0,
            e.params.grabCursor && e.setGrabCursor(),
            e.emit("enable"))
      }
      disable() {
         const e = this;
         e.enabled && (e.enabled = !1,
            e.params.grabCursor && e.unsetGrabCursor(),
            e.emit("disable"))
      }
      setProgress(e, t) {
         const s = this;
         e = Math.min(Math.max(e, 0), 1);
         const a = s.minTranslate()
            , i = (s.maxTranslate() - a) * e + a;
         s.translateTo(i, void 0 === t ? 0 : t),
            s.updateActiveIndex(),
            s.updateSlidesClasses()
      }
      emitContainerClasses() {
         const e = this;
         if (!e.params._emitClasses || !e.el)
            return;
         const t = e.el.className.split(" ").filter((t => 0 === t.indexOf("swiper") || 0 === t.indexOf(e.params.containerModifierClass)));
         e.emit("_containerClasses", t.join(" "))
      }
      getSlideClasses(e) {
         const t = this;
         return t.destroyed ? "" : e.className.split(" ").filter((e => 0 === e.indexOf("swiper-slide") || 0 === e.indexOf(t.params.slideClass))).join(" ")
      }
      emitSlidesClasses() {
         const e = this;
         if (!e.params._emitClasses || !e.el)
            return;
         const t = [];
         e.slides.forEach((s => {
            const a = e.getSlideClasses(s);
            t.push({
               slideEl: s,
               classNames: a
            }),
               e.emit("_slideClass", s, a)
         }
         )),
            e.emit("_slideClasses", t)
      }
      slidesPerViewDynamic(e, t) {
         void 0 === e && (e = "current"),
            void 0 === t && (t = !1);
         const { params: s, slides: a, slidesGrid: i, slidesSizesGrid: r, size: n, activeIndex: l } = this;
         let o = 1;
         if ("number" == typeof s.slidesPerView)
            return s.slidesPerView;
         if (s.centeredSlides) {
            let e, t = a[l] ? a[l].swiperSlideSize : 0;
            for (let s = l + 1; s < a.length; s += 1)
               a[s] && !e && (t += a[s].swiperSlideSize,
                  o += 1,
                  t > n && (e = !0));
            for (let s = l - 1; s >= 0; s -= 1)
               a[s] && !e && (t += a[s].swiperSlideSize,
                  o += 1,
                  t > n && (e = !0))
         } else if ("current" === e)
            for (let e = l + 1; e < a.length; e += 1) {
               (t ? i[e] + r[e] - i[l] < n : i[e] - i[l] < n) && (o += 1)
            }
         else
            for (let e = l - 1; e >= 0; e -= 1) {
               i[l] - i[e] < n && (o += 1)
            }
         return o
      }
      update() {
         const e = this;
         if (!e || e.destroyed)
            return;
         const { snapGrid: t, params: s } = e;
         function a() {
            const t = e.rtlTranslate ? -1 * e.translate : e.translate
               , s = Math.min(Math.max(t, e.maxTranslate()), e.minTranslate());
            e.setTranslate(s),
               e.updateActiveIndex(),
               e.updateSlidesClasses()
         }
         let i;
         if (s.breakpoints && e.setBreakpoint(),
            [...e.el.querySelectorAll('[loading="lazy"]')].forEach((t => {
               t.complete && z(e, t)
            }
            )),
            e.updateSize(),
            e.updateSlides(),
            e.updateProgress(),
            e.updateSlidesClasses(),
            s.freeMode && s.freeMode.enabled && !s.cssMode)
            a(),
               s.autoHeight && e.updateAutoHeight();
         else {
            if (("auto" === s.slidesPerView || s.slidesPerView > 1) && e.isEnd && !s.centeredSlides) {
               const t = e.virtual && s.virtual.enabled ? e.virtual.slides : e.slides;
               i = e.slideTo(t.length - 1, 0, !1, !0)
            } else
               i = e.slideTo(e.activeIndex, 0, !1, !0);
            i || a()
         }
         s.watchOverflow && t !== e.snapGrid && e.checkOverflow(),
            e.emit("update")
      }
      changeDirection(e, t) {
         void 0 === t && (t = !0);
         const s = this
            , a = s.params.direction;
         return e || (e = "horizontal" === a ? "vertical" : "horizontal"),
            e === a || "horizontal" !== e && "vertical" !== e || (s.el.classList.remove(`${s.params.containerModifierClass}${a}`),
               s.el.classList.add(`${s.params.containerModifierClass}${e}`),
               s.emitContainerClasses(),
               s.params.direction = e,
               s.slides.forEach((t => {
                  "vertical" === e ? t.style.width = "" : t.style.height = ""
               }
               )),
               s.emit("changeDirection"),
               t && s.update()),
            s
      }
      changeLanguageDirection(e) {
         const t = this;
         t.rtl && "rtl" === e || !t.rtl && "ltr" === e || (t.rtl = "rtl" === e,
            t.rtlTranslate = "horizontal" === t.params.direction && t.rtl,
            t.rtl ? (t.el.classList.add(`${t.params.containerModifierClass}rtl`),
               t.el.dir = "rtl") : (t.el.classList.remove(`${t.params.containerModifierClass}rtl`),
                  t.el.dir = "ltr"),
            t.update())
      }
      mount(e) {
         const t = this;
         if (t.mounted)
            return !0;
         let s = e || t.params.el;
         if ("string" == typeof s && (s = document.querySelector(s)),
            !s)
            return !1;
         s.swiper = t,
            s.parentNode && s.parentNode.host && "SWIPER-CONTAINER" === s.parentNode.host.nodeName && (t.isElement = !0);
         const a = () => `.${(t.params.wrapperClass || "").trim().split(" ").join(".")}`;
         let i = (() => {
            if (s && s.shadowRoot && s.shadowRoot.querySelector) {
               return s.shadowRoot.querySelector(a())
            }
            return h(s, a())[0]
         }
         )();
         return !i && t.params.createElements && (i = f("div", t.params.wrapperClass),
            s.append(i),
            h(s, `.${t.params.slideClass}`).forEach((e => {
               i.append(e)
            }
            ))),
            Object.assign(t, {
               el: s,
               wrapperEl: i,
               slidesEl: t.isElement && !s.parentNode.host.slideSlots ? s.parentNode.host : i,
               hostEl: t.isElement ? s.parentNode.host : s,
               mounted: !0,
               rtl: "rtl" === s.dir.toLowerCase() || "rtl" === v(s, "direction"),
               rtlTranslate: "horizontal" === t.params.direction && ("rtl" === s.dir.toLowerCase() || "rtl" === v(s, "direction")),
               wrongRTL: "-webkit-box" === v(i, "display")
            }),
            !0
      }
      init(e) {
         const t = this;
         if (t.initialized)
            return t;
         if (!1 === t.mount(e))
            return t;
         t.emit("beforeInit"),
            t.params.breakpoints && t.setBreakpoint(),
            t.addClasses(),
            t.updateSize(),
            t.updateSlides(),
            t.params.watchOverflow && t.checkOverflow(),
            t.params.grabCursor && t.enabled && t.setGrabCursor(),
            t.params.loop && t.virtual && t.params.virtual.enabled ? t.slideTo(t.params.initialSlide + t.virtual.slidesBefore, 0, t.params.runCallbacksOnInit, !1, !0) : t.slideTo(t.params.initialSlide, 0, t.params.runCallbacksOnInit, !1, !0),
            t.params.loop && t.loopCreate(),
            t.attachEvents();
         const s = [...t.el.querySelectorAll('[loading="lazy"]')];
         return t.isElement && s.push(...t.hostEl.querySelectorAll('[loading="lazy"]')),
            s.forEach((e => {
               e.complete ? z(t, e) : e.addEventListener("load", (e => {
                  z(t, e.target)
               }
               ))
            }
            )),
            $(t),
            t.initialized = !0,
            $(t),
            t.emit("init"),
            t.emit("afterInit"),
            t
      }
      destroy(e, t) {
         void 0 === e && (e = !0),
            void 0 === t && (t = !0);
         const s = this
            , { params: a, el: i, wrapperEl: r, slides: n } = s;
         return void 0 === s.params || s.destroyed || (s.emit("beforeDestroy"),
            s.initialized = !1,
            s.detachEvents(),
            a.loop && s.loopDestroy(),
            t && (s.removeClasses(),
               i.removeAttribute("style"),
               r.removeAttribute("style"),
               n && n.length && n.forEach((e => {
                  e.classList.remove(a.slideVisibleClass, a.slideActiveClass, a.slideNextClass, a.slidePrevClass),
                     e.removeAttribute("style"),
                     e.removeAttribute("data-swiper-slide-index")
               }
               ))),
            s.emit("destroy"),
            Object.keys(s.eventsListeners).forEach((e => {
               s.off(e)
            }
            )),
            !1 !== e && (s.el.swiper = null,
               function (e) {
                  const t = e;
                  Object.keys(t).forEach((e => {
                     try {
                        t[e] = null
                     } catch (e) { }
                     try {
                        delete t[e]
                     } catch (e) { }
                  }
                  ))
               }(s)),
            s.destroyed = !0),
            null
      }
      static extendDefaults(e) {
         c(Z, e)
      }
      static get extendedDefaults() {
         return Z
      }
      static get defaults() {
         return W
      }
      static installModule(e) {
         Q.prototype.__modules__ || (Q.prototype.__modules__ = []);
         const t = Q.prototype.__modules__;
         "function" == typeof e && t.indexOf(e) < 0 && t.push(e)
      }
      static use(e) {
         return Array.isArray(e) ? (e.forEach((e => Q.installModule(e))),
            Q) : (Q.installModule(e),
               Q)
      }
   }
   function J(e, t, s, a) {
      return e.params.createElements && Object.keys(a).forEach((i => {
         if (!s[i] && !0 === s.auto) {
            let r = h(e.el, `.${a[i]}`)[0];
            r || (r = f("div", a[i]),
               r.className = a[i],
               e.el.append(r)),
               s[i] = r,
               t[i] = r
         }
      }
      )),
         s
   }
   function ee(e) {
      return void 0 === e && (e = ""),
         `.${e.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`
   }
   function te(e) {
      const t = this
         , { params: s, slidesEl: a } = t;
      s.loop && t.loopDestroy();
      const i = e => {
         if ("string" == typeof e) {
            const t = document.createElement("div");
            t.innerHTML = e,
               a.append(t.children[0]),
               t.innerHTML = ""
         } else
            a.append(e)
      }
         ;
      if ("object" == typeof e && "length" in e)
         for (let t = 0; t < e.length; t += 1)
            e[t] && i(e[t]);
      else
         i(e);
      t.recalcSlides(),
         s.loop && t.loopCreate(),
         s.observer && !t.isElement || t.update()
   }
   function se(e) {
      const t = this
         , { params: s, activeIndex: a, slidesEl: i } = t;
      s.loop && t.loopDestroy();
      let r = a + 1;
      const n = e => {
         if ("string" == typeof e) {
            const t = document.createElement("div");
            t.innerHTML = e,
               i.prepend(t.children[0]),
               t.innerHTML = ""
         } else
            i.prepend(e)
      }
         ;
      if ("object" == typeof e && "length" in e) {
         for (let t = 0; t < e.length; t += 1)
            e[t] && n(e[t]);
         r = a + e.length
      } else
         n(e);
      t.recalcSlides(),
         s.loop && t.loopCreate(),
         s.observer && !t.isElement || t.update(),
         t.slideTo(r, 0, !1)
   }
   function ae(e, t) {
      const s = this
         , { params: a, activeIndex: i, slidesEl: r } = s;
      let n = i;
      a.loop && (n -= s.loopedSlides,
         s.loopDestroy(),
         s.recalcSlides());
      const l = s.slides.length;
      if (e <= 0)
         return void s.prependSlide(t);
      if (e >= l)
         return void s.appendSlide(t);
      let o = n > e ? n + 1 : n;
      const d = [];
      for (let t = l - 1; t >= e; t -= 1) {
         const e = s.slides[t];
         e.remove(),
            d.unshift(e)
      }
      if ("object" == typeof t && "length" in t) {
         for (let e = 0; e < t.length; e += 1)
            t[e] && r.append(t[e]);
         o = n > e ? n + t.length : n
      } else
         r.append(t);
      for (let e = 0; e < d.length; e += 1)
         r.append(d[e]);
      s.recalcSlides(),
         a.loop && s.loopCreate(),
         a.observer && !s.isElement || s.update(),
         a.loop ? s.slideTo(o + s.loopedSlides, 0, !1) : s.slideTo(o, 0, !1)
   }
   function ie(e) {
      const t = this
         , { params: s, activeIndex: a } = t;
      let i = a;
      s.loop && (i -= t.loopedSlides,
         t.loopDestroy());
      let r, n = i;
      if ("object" == typeof e && "length" in e) {
         for (let s = 0; s < e.length; s += 1)
            r = e[s],
               t.slides[r] && t.slides[r].remove(),
               r < n && (n -= 1);
         n = Math.max(n, 0)
      } else
         r = e,
            t.slides[r] && t.slides[r].remove(),
            r < n && (n -= 1),
            n = Math.max(n, 0);
      t.recalcSlides(),
         s.loop && t.loopCreate(),
         s.observer && !t.isElement || t.update(),
         s.loop ? t.slideTo(n + t.loopedSlides, 0, !1) : t.slideTo(n, 0, !1)
   }
   function re() {
      const e = this
         , t = [];
      for (let s = 0; s < e.slides.length; s += 1)
         t.push(s);
      e.removeSlide(t)
   }
   function ne(e) {
      const { effect: t, swiper: s, on: a, setTranslate: i, setTransition: r, overwriteParams: n, perspective: l, recreateShadows: o, getEffectParams: d } = e;
      let c;
      a("beforeInit", (() => {
         if (s.params.effect !== t)
            return;
         s.classNames.push(`${s.params.containerModifierClass}${t}`),
            l && l() && s.classNames.push(`${s.params.containerModifierClass}3d`);
         const e = n ? n() : {};
         Object.assign(s.params, e),
            Object.assign(s.originalParams, e)
      }
      )),
         a("setTranslate", (() => {
            s.params.effect === t && i()
         }
         )),
         a("setTransition", ((e, a) => {
            s.params.effect === t && r(a)
         }
         )),
         a("transitionEnd", (() => {
            if (s.params.effect === t && o) {
               if (!d || !d().slideShadows)
                  return;
               s.slides.forEach((e => {
                  e.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((e => e.remove()))
               }
               )),
                  o()
            }
         }
         )),
         a("virtualUpdate", (() => {
            s.params.effect === t && (s.slides.length || (c = !0),
               requestAnimationFrame((() => {
                  c && s.slides && s.slides.length && (i(),
                     c = !1)
               }
               )))
         }
         ))
   }
   function le(e, t) {
      const s = m(t);
      return s !== t && (s.style.backfaceVisibility = "hidden",
         s.style["-webkit-backface-visibility"] = "hidden"),
         s
   }
   function oe(e) {
      let { swiper: t, duration: s, transformElements: a, allSlides: i } = e;
      const { activeIndex: r } = t;
      if (t.params.virtualTranslate && 0 !== s) {
         let e, s = !1;
         e = i ? a : a.filter((e => {
            const s = e.classList.contains("swiper-slide-transform") ? (e => {
               if (!e.parentElement)
                  return t.slides.filter((t => t.shadowRoot && t.shadowRoot === e.parentNode))[0];
               return e.parentElement
            }
            )(e) : e;
            return t.getSlideIndex(s) === r
         }
         )),
            e.forEach((e => {
               y(e, (() => {
                  if (s)
                     return;
                  if (!t || t.destroyed)
                     return;
                  s = !0,
                     t.animating = !1;
                  const e = new window.CustomEvent("transitionend", {
                     bubbles: !0,
                     cancelable: !0
                  });
                  t.wrapperEl.dispatchEvent(e)
               }
               ))
            }
            ))
      }
   }
   function de(e, t, s) {
      const a = `swiper-slide-shadow ${s ? `-${s}` : ""}${e ? ` swiper-slide-shadow-${e}` : ""}`
         , i = m(t);
      let r = i.querySelector(`.${a.split(" ").join(".")}`);
      return r || (r = f("div", a.split(" ")),
         i.append(r)),
         r
   }
   Object.keys(K).forEach((e => {
      Object.keys(K[e]).forEach((t => {
         Q.prototype[t] = K[e][t]
      }
      ))
   }
   )),
      Q.use([function (e) {
         let { swiper: t, on: s, emit: a } = e;
         const i = r();
         let n = null
            , l = null;
         const o = () => {
            t && !t.destroyed && t.initialized && (a("beforeResize"),
               a("resize"))
         }
            , d = () => {
               t && !t.destroyed && t.initialized && a("orientationchange")
            }
            ;
         s("init", (() => {
            t.params.resizeObserver && void 0 !== i.ResizeObserver ? t && !t.destroyed && t.initialized && (n = new ResizeObserver((e => {
               l = i.requestAnimationFrame((() => {
                  const { width: s, height: a } = t;
                  let i = s
                     , r = a;
                  e.forEach((e => {
                     let { contentBoxSize: s, contentRect: a, target: n } = e;
                     n && n !== t.el || (i = a ? a.width : (s[0] || s).inlineSize,
                        r = a ? a.height : (s[0] || s).blockSize)
                  }
                  )),
                     i === s && r === a || o()
               }
               ))
            }
            )),
               n.observe(t.el)) : (i.addEventListener("resize", o),
                  i.addEventListener("orientationchange", d))
         }
         )),
            s("destroy", (() => {
               l && i.cancelAnimationFrame(l),
                  n && n.unobserve && t.el && (n.unobserve(t.el),
                     n = null),
                  i.removeEventListener("resize", o),
                  i.removeEventListener("orientationchange", d)
            }
            ))
      }
         , function (e) {
            let { swiper: t, extendParams: s, on: a, emit: i } = e;
            const n = []
               , l = r()
               , o = function (e, s) {
                  void 0 === s && (s = {});
                  const a = new (l.MutationObserver || l.WebkitMutationObserver)((e => {
                     if (t.__preventObserver__)
                        return;
                     if (1 === e.length)
                        return void i("observerUpdate", e[0]);
                     const s = function () {
                        i("observerUpdate", e[0])
                     };
                     l.requestAnimationFrame ? l.requestAnimationFrame(s) : l.setTimeout(s, 0)
                  }
                  ));
                  a.observe(e, {
                     attributes: void 0 === s.attributes || s.attributes,
                     childList: void 0 === s.childList || s.childList,
                     characterData: void 0 === s.characterData || s.characterData
                  }),
                     n.push(a)
               };
            s({
               observer: !1,
               observeParents: !1,
               observeSlideChildren: !1
            }),
               a("init", (() => {
                  if (t.params.observer) {
                     if (t.params.observeParents) {
                        const e = b(t.hostEl);
                        for (let t = 0; t < e.length; t += 1)
                           o(e[t])
                     }
                     o(t.hostEl, {
                        childList: t.params.observeSlideChildren
                     }),
                        o(t.wrapperEl, {
                           attributes: !1
                        })
                  }
               }
               )),
               a("destroy", (() => {
                  n.forEach((e => {
                     e.disconnect()
                  }
                  )),
                     n.splice(0, n.length)
               }
               ))
         }
      ]);
   const ce = [function (e) {
      let t, { swiper: s, extendParams: i, on: r, emit: n } = e;
      i({
         virtual: {
            enabled: !1,
            slides: [],
            cache: !0,
            renderSlide: null,
            renderExternal: null,
            renderExternalUpdate: !0,
            addSlidesBefore: 0,
            addSlidesAfter: 0
         }
      });
      const l = a();
      s.virtual = {
         cache: {},
         from: void 0,
         to: void 0,
         slides: [],
         offset: 0,
         slidesGrid: []
      };
      const o = l.createElement("div");
      function d(e, t) {
         const a = s.params.virtual;
         if (a.cache && s.virtual.cache[t])
            return s.virtual.cache[t];
         let i;
         return a.renderSlide ? (i = a.renderSlide.call(s, e, t),
            "string" == typeof i && (o.innerHTML = i,
               i = o.children[0])) : i = s.isElement ? f("swiper-slide") : f("div", s.params.slideClass),
            i.setAttribute("data-swiper-slide-index", t),
            a.renderSlide || (i.innerHTML = e),
            a.cache && (s.virtual.cache[t] = i),
            i
      }
      function c(e) {
         const { slidesPerView: t, slidesPerGroup: a, centeredSlides: i, loop: r } = s.params
            , { addSlidesBefore: l, addSlidesAfter: o } = s.params.virtual
            , { from: c, to: p, slides: u, slidesGrid: m, offset: f } = s.virtual;
         s.params.cssMode || s.updateActiveIndex();
         const g = s.activeIndex || 0;
         let v, w, b;
         v = s.rtlTranslate ? "right" : s.isHorizontal() ? "left" : "top",
            i ? (w = Math.floor(t / 2) + a + o,
               b = Math.floor(t / 2) + a + l) : (w = t + (a - 1) + o,
                  b = (r ? t : a) + l);
         let y = g - b
            , E = g + w;
         r || (y = Math.max(y, 0),
            E = Math.min(E, u.length - 1));
         let x = (s.slidesGrid[y] || 0) - (s.slidesGrid[0] || 0);
         function S() {
            s.updateSlides(),
               s.updateProgress(),
               s.updateSlidesClasses(),
               n("virtualUpdate")
         }
         if (r && g >= b ? (y -= b,
            i || (x += s.slidesGrid[0])) : r && g < b && (y = -b,
               i && (x += s.slidesGrid[0])),
            Object.assign(s.virtual, {
               from: y,
               to: E,
               offset: x,
               slidesGrid: s.slidesGrid,
               slidesBefore: b,
               slidesAfter: w
            }),
            c === y && p === E && !e)
            return s.slidesGrid !== m && x !== f && s.slides.forEach((e => {
               e.style[v] = x - Math.abs(s.cssOverflowAdjustment()) + "px"
            }
            )),
               s.updateProgress(),
               void n("virtualUpdate");
         if (s.params.virtual.renderExternal)
            return s.params.virtual.renderExternal.call(s, {
               offset: x,
               from: y,
               to: E,
               slides: function () {
                  const e = [];
                  for (let t = y; t <= E; t += 1)
                     e.push(u[t]);
                  return e
               }()
            }),
               void (s.params.virtual.renderExternalUpdate ? S() : n("virtualUpdate"));
         const T = []
            , M = []
            , C = e => {
               let t = e;
               return e < 0 ? t = u.length + e : t >= u.length && (t -= u.length),
                  t
            }
            ;
         if (e)
            s.slides.filter((e => e.matches(`.${s.params.slideClass}, swiper-slide`))).forEach((e => {
               e.remove()
            }
            ));
         else
            for (let e = c; e <= p; e += 1)
               if (e < y || e > E) {
                  const t = C(e);
                  s.slides.filter((e => e.matches(`.${s.params.slideClass}[data-swiper-slide-index="${t}"], swiper-slide[data-swiper-slide-index="${t}"]`))).forEach((e => {
                     e.remove()
                  }
                  ))
               }
         const P = r ? -u.length : 0
            , L = r ? 2 * u.length : u.length;
         for (let t = P; t < L; t += 1)
            if (t >= y && t <= E) {
               const s = C(t);
               void 0 === p || e ? M.push(s) : (t > p && M.push(s),
                  t < c && T.push(s))
            }
         if (M.forEach((e => {
            s.slidesEl.append(d(u[e], e))
         }
         )),
            r)
            for (let e = T.length - 1; e >= 0; e -= 1) {
               const t = T[e];
               s.slidesEl.prepend(d(u[t], t))
            }
         else
            T.sort(((e, t) => t - e)),
               T.forEach((e => {
                  s.slidesEl.prepend(d(u[e], e))
               }
               ));
         h(s.slidesEl, ".swiper-slide, swiper-slide").forEach((e => {
            e.style[v] = x - Math.abs(s.cssOverflowAdjustment()) + "px"
         }
         )),
            S()
      }
      r("beforeInit", (() => {
         if (!s.params.virtual.enabled)
            return;
         let e;
         if (void 0 === s.passedParams.virtual.slides) {
            const t = [...s.slidesEl.children].filter((e => e.matches(`.${s.params.slideClass}, swiper-slide`)));
            t && t.length && (s.virtual.slides = [...t],
               e = !0,
               t.forEach(((e, t) => {
                  e.setAttribute("data-swiper-slide-index", t),
                     s.virtual.cache[t] = e,
                     e.remove()
               }
               )))
         }
         e || (s.virtual.slides = s.params.virtual.slides),
            s.classNames.push(`${s.params.containerModifierClass}virtual`),
            s.params.watchSlidesProgress = !0,
            s.originalParams.watchSlidesProgress = !0,
            c()
      }
      )),
         r("setTranslate", (() => {
            s.params.virtual.enabled && (s.params.cssMode && !s._immediateVirtual ? (clearTimeout(t),
               t = setTimeout((() => {
                  c()
               }
               ), 100)) : c())
         }
         )),
         r("init update resize", (() => {
            s.params.virtual.enabled && s.params.cssMode && p(s.wrapperEl, "--swiper-virtual-size", `${s.virtualSize}px`)
         }
         )),
         Object.assign(s.virtual, {
            appendSlide: function (e) {
               if ("object" == typeof e && "length" in e)
                  for (let t = 0; t < e.length; t += 1)
                     e[t] && s.virtual.slides.push(e[t]);
               else
                  s.virtual.slides.push(e);
               c(!0)
            },
            prependSlide: function (e) {
               const t = s.activeIndex;
               let a = t + 1
                  , i = 1;
               if (Array.isArray(e)) {
                  for (let t = 0; t < e.length; t += 1)
                     e[t] && s.virtual.slides.unshift(e[t]);
                  a = t + e.length,
                     i = e.length
               } else
                  s.virtual.slides.unshift(e);
               if (s.params.virtual.cache) {
                  const e = s.virtual.cache
                     , t = {};
                  Object.keys(e).forEach((s => {
                     const a = e[s]
                        , r = a.getAttribute("data-swiper-slide-index");
                     r && a.setAttribute("data-swiper-slide-index", parseInt(r, 10) + i),
                        t[parseInt(s, 10) + i] = a
                  }
                  )),
                     s.virtual.cache = t
               }
               c(!0),
                  s.slideTo(a, 0)
            },
            removeSlide: function (e) {
               if (null == e)
                  return;
               let t = s.activeIndex;
               if (Array.isArray(e))
                  for (let a = e.length - 1; a >= 0; a -= 1)
                     s.params.virtual.cache && (delete s.virtual.cache[e[a]],
                        Object.keys(s.virtual.cache).forEach((t => {
                           t > e && (s.virtual.cache[t - 1] = s.virtual.cache[t],
                              s.virtual.cache[t - 1].setAttribute("data-swiper-slide-index", t - 1),
                              delete s.virtual.cache[t])
                        }
                        ))),
                        s.virtual.slides.splice(e[a], 1),
                        e[a] < t && (t -= 1),
                        t = Math.max(t, 0);
               else
                  s.params.virtual.cache && (delete s.virtual.cache[e],
                     Object.keys(s.virtual.cache).forEach((t => {
                        t > e && (s.virtual.cache[t - 1] = s.virtual.cache[t],
                           s.virtual.cache[t - 1].setAttribute("data-swiper-slide-index", t - 1),
                           delete s.virtual.cache[t])
                     }
                     ))),
                     s.virtual.slides.splice(e, 1),
                     e < t && (t -= 1),
                     t = Math.max(t, 0);
               c(!0),
                  s.slideTo(t, 0)
            },
            removeAllSlides: function () {
               s.virtual.slides = [],
                  s.params.virtual.cache && (s.virtual.cache = {}),
                  c(!0),
                  s.slideTo(0, 0)
            },
            update: c
         })
   }
      , function (e) {
         let { swiper: t, extendParams: s, on: i, emit: n } = e;
         const l = a()
            , o = r();
         function d(e) {
            if (!t.enabled)
               return;
            const { rtlTranslate: s } = t;
            let a = e;
            a.originalEvent && (a = a.originalEvent);
            const i = a.keyCode || a.charCode
               , r = t.params.keyboard.pageUpDown
               , d = r && 33 === i
               , c = r && 34 === i
               , p = 37 === i
               , u = 39 === i
               , m = 38 === i
               , h = 40 === i;
            if (!t.allowSlideNext && (t.isHorizontal() && u || t.isVertical() && h || c))
               return !1;
            if (!t.allowSlidePrev && (t.isHorizontal() && p || t.isVertical() && m || d))
               return !1;
            if (!(a.shiftKey || a.altKey || a.ctrlKey || a.metaKey || l.activeElement && l.activeElement.nodeName && ("input" === l.activeElement.nodeName.toLowerCase() || "textarea" === l.activeElement.nodeName.toLowerCase()))) {
               if (t.params.keyboard.onlyInViewport && (d || c || p || u || m || h)) {
                  let e = !1;
                  if (b(t.el, `.${t.params.slideClass}, swiper-slide`).length > 0 && 0 === b(t.el, `.${t.params.slideActiveClass}`).length)
                     return;
                  const a = t.el
                     , i = a.clientWidth
                     , r = a.clientHeight
                     , n = o.innerWidth
                     , l = o.innerHeight
                     , d = g(a);
                  s && (d.left -= a.scrollLeft);
                  const c = [[d.left, d.top], [d.left + i, d.top], [d.left, d.top + r], [d.left + i, d.top + r]];
                  for (let t = 0; t < c.length; t += 1) {
                     const s = c[t];
                     if (s[0] >= 0 && s[0] <= n && s[1] >= 0 && s[1] <= l) {
                        if (0 === s[0] && 0 === s[1])
                           continue;
                        e = !0
                     }
                  }
                  if (!e)
                     return
               }
               t.isHorizontal() ? ((d || c || p || u) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1),
                  ((c || u) && !s || (d || p) && s) && t.slideNext(),
                  ((d || p) && !s || (c || u) && s) && t.slidePrev()) : ((d || c || m || h) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1),
                     (c || h) && t.slideNext(),
                     (d || m) && t.slidePrev()),
                  n("keyPress", i)
            }
         }
         function c() {
            t.keyboard.enabled || (l.addEventListener("keydown", d),
               t.keyboard.enabled = !0)
         }
         function p() {
            t.keyboard.enabled && (l.removeEventListener("keydown", d),
               t.keyboard.enabled = !1)
         }
         t.keyboard = {
            enabled: !1
         },
            s({
               keyboard: {
                  enabled: !1,
                  onlyInViewport: !0,
                  pageUpDown: !0
               }
            }),
            i("init", (() => {
               t.params.keyboard.enabled && c()
            }
            )),
            i("destroy", (() => {
               t.keyboard.enabled && p()
            }
            )),
            Object.assign(t.keyboard, {
               enable: c,
               disable: p
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a, emit: i } = e;
         const o = r();
         let d;
         s({
            mousewheel: {
               enabled: !1,
               releaseOnEdges: !1,
               invert: !1,
               forceToAxis: !1,
               sensitivity: 1,
               eventsTarget: "container",
               thresholdDelta: null,
               thresholdTime: null,
               noMousewheelClass: "swiper-no-mousewheel"
            }
         }),
            t.mousewheel = {
               enabled: !1
            };
         let c, p = l();
         const u = [];
         function m() {
            t.enabled && (t.mouseEntered = !0)
         }
         function h() {
            t.enabled && (t.mouseEntered = !1)
         }
         function f(e) {
            return !(t.params.mousewheel.thresholdDelta && e.delta < t.params.mousewheel.thresholdDelta) && (!(t.params.mousewheel.thresholdTime && l() - p < t.params.mousewheel.thresholdTime) && (e.delta >= 6 && l() - p < 60 || (e.direction < 0 ? t.isEnd && !t.params.loop || t.animating || (t.slideNext(),
               i("scroll", e.raw)) : t.isBeginning && !t.params.loop || t.animating || (t.slidePrev(),
                  i("scroll", e.raw)),
               p = (new o.Date).getTime(),
               !1)))
         }
         function g(e) {
            let s = e
               , a = !0;
            if (!t.enabled)
               return;
            if (e.target.closest(`.${t.params.mousewheel.noMousewheelClass}`))
               return;
            const r = t.params.mousewheel;
            t.params.cssMode && s.preventDefault();
            let o = t.el;
            "container" !== t.params.mousewheel.eventsTarget && (o = document.querySelector(t.params.mousewheel.eventsTarget));
            const p = o && o.contains(s.target);
            if (!t.mouseEntered && !p && !r.releaseOnEdges)
               return !0;
            s.originalEvent && (s = s.originalEvent);
            let m = 0;
            const h = t.rtlTranslate ? -1 : 1
               , g = function (e) {
                  let t = 0
                     , s = 0
                     , a = 0
                     , i = 0;
                  return "detail" in e && (s = e.detail),
                     "wheelDelta" in e && (s = -e.wheelDelta / 120),
                     "wheelDeltaY" in e && (s = -e.wheelDeltaY / 120),
                     "wheelDeltaX" in e && (t = -e.wheelDeltaX / 120),
                     "axis" in e && e.axis === e.HORIZONTAL_AXIS && (t = s,
                        s = 0),
                     a = 10 * t,
                     i = 10 * s,
                     "deltaY" in e && (i = e.deltaY),
                     "deltaX" in e && (a = e.deltaX),
                     e.shiftKey && !a && (a = i,
                        i = 0),
                     (a || i) && e.deltaMode && (1 === e.deltaMode ? (a *= 40,
                        i *= 40) : (a *= 800,
                           i *= 800)),
                     a && !t && (t = a < 1 ? -1 : 1),
                     i && !s && (s = i < 1 ? -1 : 1),
                  {
                     spinX: t,
                     spinY: s,
                     pixelX: a,
                     pixelY: i
                  }
               }(s);
            if (r.forceToAxis)
               if (t.isHorizontal()) {
                  if (!(Math.abs(g.pixelX) > Math.abs(g.pixelY)))
                     return !0;
                  m = -g.pixelX * h
               } else {
                  if (!(Math.abs(g.pixelY) > Math.abs(g.pixelX)))
                     return !0;
                  m = -g.pixelY
               }
            else
               m = Math.abs(g.pixelX) > Math.abs(g.pixelY) ? -g.pixelX * h : -g.pixelY;
            if (0 === m)
               return !0;
            r.invert && (m = -m);
            let v = t.getTranslate() + m * r.sensitivity;
            if (v >= t.minTranslate() && (v = t.minTranslate()),
               v <= t.maxTranslate() && (v = t.maxTranslate()),
               a = !!t.params.loop || !(v === t.minTranslate() || v === t.maxTranslate()),
               a && t.params.nested && s.stopPropagation(),
               t.params.freeMode && t.params.freeMode.enabled) {
               const e = {
                  time: l(),
                  delta: Math.abs(m),
                  direction: Math.sign(m)
               }
                  , a = c && e.time < c.time + 500 && e.delta <= c.delta && e.direction === c.direction;
               if (!a) {
                  c = void 0;
                  let l = t.getTranslate() + m * r.sensitivity;
                  const o = t.isBeginning
                     , p = t.isEnd;
                  if (l >= t.minTranslate() && (l = t.minTranslate()),
                     l <= t.maxTranslate() && (l = t.maxTranslate()),
                     t.setTransition(0),
                     t.setTranslate(l),
                     t.updateProgress(),
                     t.updateActiveIndex(),
                     t.updateSlidesClasses(),
                     (!o && t.isBeginning || !p && t.isEnd) && t.updateSlidesClasses(),
                     t.params.loop && t.loopFix({
                        direction: e.direction < 0 ? "next" : "prev",
                        byMousewheel: !0
                     }),
                     t.params.freeMode.sticky) {
                     clearTimeout(d),
                        d = void 0,
                        u.length >= 15 && u.shift();
                     const s = u.length ? u[u.length - 1] : void 0
                        , a = u[0];
                     if (u.push(e),
                        s && (e.delta > s.delta || e.direction !== s.direction))
                        u.splice(0);
                     else if (u.length >= 15 && e.time - a.time < 500 && a.delta - e.delta >= 1 && e.delta <= 6) {
                        const s = m > 0 ? .8 : .2;
                        c = e,
                           u.splice(0),
                           d = n((() => {
                              t.slideToClosest(t.params.speed, !0, void 0, s)
                           }
                           ), 0)
                     }
                     d || (d = n((() => {
                        c = e,
                           u.splice(0),
                           t.slideToClosest(t.params.speed, !0, void 0, .5)
                     }
                     ), 500))
                  }
                  if (a || i("scroll", s),
                     t.params.autoplay && t.params.autoplayDisableOnInteraction && t.autoplay.stop(),
                     r.releaseOnEdges && (l === t.minTranslate() || l === t.maxTranslate()))
                     return !0
               }
            } else {
               const s = {
                  time: l(),
                  delta: Math.abs(m),
                  direction: Math.sign(m),
                  raw: e
               };
               u.length >= 2 && u.shift();
               const a = u.length ? u[u.length - 1] : void 0;
               if (u.push(s),
                  a ? (s.direction !== a.direction || s.delta > a.delta || s.time > a.time + 150) && f(s) : f(s),
                  function (e) {
                     const s = t.params.mousewheel;
                     if (e.direction < 0) {
                        if (t.isEnd && !t.params.loop && s.releaseOnEdges)
                           return !0
                     } else if (t.isBeginning && !t.params.loop && s.releaseOnEdges)
                        return !0;
                     return !1
                  }(s))
                  return !0
            }
            return s.preventDefault ? s.preventDefault() : s.returnValue = !1,
               !1
         }
         function v(e) {
            let s = t.el;
            "container" !== t.params.mousewheel.eventsTarget && (s = document.querySelector(t.params.mousewheel.eventsTarget)),
               s[e]("mouseenter", m),
               s[e]("mouseleave", h),
               s[e]("wheel", g)
         }
         function w() {
            return t.params.cssMode ? (t.wrapperEl.removeEventListener("wheel", g),
               !0) : !t.mousewheel.enabled && (v("addEventListener"),
                  t.mousewheel.enabled = !0,
                  !0)
         }
         function b() {
            return t.params.cssMode ? (t.wrapperEl.addEventListener(event, g),
               !0) : !!t.mousewheel.enabled && (v("removeEventListener"),
                  t.mousewheel.enabled = !1,
                  !0)
         }
         a("init", (() => {
            !t.params.mousewheel.enabled && t.params.cssMode && b(),
               t.params.mousewheel.enabled && w()
         }
         )),
            a("destroy", (() => {
               t.params.cssMode && w(),
                  t.mousewheel.enabled && b()
            }
            )),
            Object.assign(t.mousewheel, {
               enable: w,
               disable: b
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a, emit: i } = e;
         s({
            navigation: {
               nextEl: null,
               prevEl: null,
               hideOnClick: !1,
               disabledClass: "swiper-button-disabled",
               hiddenClass: "swiper-button-hidden",
               lockClass: "swiper-button-lock",
               navigationDisabledClass: "swiper-navigation-disabled"
            }
         }),
            t.navigation = {
               nextEl: null,
               prevEl: null
            };
         const r = e => (Array.isArray(e) ? e : [e]).filter((e => !!e));
         function n(e) {
            let s;
            return e && "string" == typeof e && t.isElement && (s = t.el.querySelector(e),
               s) ? s : (e && ("string" == typeof e && (s = [...document.querySelectorAll(e)]),
                  t.params.uniqueNavElements && "string" == typeof e && s.length > 1 && 1 === t.el.querySelectorAll(e).length && (s = t.el.querySelector(e))),
                  e && !s ? e : s)
         }
         function l(e, s) {
            const a = t.params.navigation;
            (e = r(e)).forEach((e => {
               e && (e.classList[s ? "add" : "remove"](...a.disabledClass.split(" ")),
                  "BUTTON" === e.tagName && (e.disabled = s),
                  t.params.watchOverflow && t.enabled && e.classList[t.isLocked ? "add" : "remove"](a.lockClass))
            }
            ))
         }
         function o() {
            const { nextEl: e, prevEl: s } = t.navigation;
            if (t.params.loop)
               return l(s, !1),
                  void l(e, !1);
            l(s, t.isBeginning && !t.params.rewind),
               l(e, t.isEnd && !t.params.rewind)
         }
         function d(e) {
            e.preventDefault(),
               (!t.isBeginning || t.params.loop || t.params.rewind) && (t.slidePrev(),
                  i("navigationPrev"))
         }
         function c(e) {
            e.preventDefault(),
               (!t.isEnd || t.params.loop || t.params.rewind) && (t.slideNext(),
                  i("navigationNext"))
         }
         function p() {
            const e = t.params.navigation;
            if (t.params.navigation = J(t, t.originalParams.navigation, t.params.navigation, {
               nextEl: "swiper-button-next",
               prevEl: "swiper-button-prev"
            }),
               !e.nextEl && !e.prevEl)
               return;
            let s = n(e.nextEl)
               , a = n(e.prevEl);
            Object.assign(t.navigation, {
               nextEl: s,
               prevEl: a
            }),
               s = r(s),
               a = r(a);
            const i = (s, a) => {
               s && s.addEventListener("click", "next" === a ? c : d),
                  !t.enabled && s && s.classList.add(...e.lockClass.split(" "))
            }
               ;
            s.forEach((e => i(e, "next"))),
               a.forEach((e => i(e, "prev")))
         }
         function u() {
            let { nextEl: e, prevEl: s } = t.navigation;
            e = r(e),
               s = r(s);
            const a = (e, s) => {
               e.removeEventListener("click", "next" === s ? c : d),
                  e.classList.remove(...t.params.navigation.disabledClass.split(" "))
            }
               ;
            e.forEach((e => a(e, "next"))),
               s.forEach((e => a(e, "prev")))
         }
         a("init", (() => {
            !1 === t.params.navigation.enabled ? m() : (p(),
               o())
         }
         )),
            a("toEdge fromEdge lock unlock", (() => {
               o()
            }
            )),
            a("destroy", (() => {
               u()
            }
            )),
            a("enable disable", (() => {
               let { nextEl: e, prevEl: s } = t.navigation;
               e = r(e),
                  s = r(s),
                  t.enabled ? o() : [...e, ...s].filter((e => !!e)).forEach((e => e.classList.add(t.params.navigation.lockClass)))
            }
            )),
            a("click", ((e, s) => {
               let { nextEl: a, prevEl: n } = t.navigation;
               a = r(a),
                  n = r(n);
               const l = s.target;
               if (t.params.navigation.hideOnClick && !n.includes(l) && !a.includes(l)) {
                  if (t.pagination && t.params.pagination && t.params.pagination.clickable && (t.pagination.el === l || t.pagination.el.contains(l)))
                     return;
                  let e;
                  a.length ? e = a[0].classList.contains(t.params.navigation.hiddenClass) : n.length && (e = n[0].classList.contains(t.params.navigation.hiddenClass)),
                     i(!0 === e ? "navigationShow" : "navigationHide"),
                     [...a, ...n].filter((e => !!e)).forEach((e => e.classList.toggle(t.params.navigation.hiddenClass)))
               }
            }
            ));
         const m = () => {
            t.el.classList.add(...t.params.navigation.navigationDisabledClass.split(" ")),
               u()
         }
            ;
         Object.assign(t.navigation, {
            enable: () => {
               t.el.classList.remove(...t.params.navigation.navigationDisabledClass.split(" ")),
                  p(),
                  o()
            }
            ,
            disable: m,
            update: o,
            init: p,
            destroy: u
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a, emit: i } = e;
         const r = "swiper-pagination";
         let n;
         s({
            pagination: {
               el: null,
               bulletElement: "span",
               clickable: !1,
               hideOnClick: !1,
               renderBullet: null,
               renderProgressbar: null,
               renderFraction: null,
               renderCustom: null,
               progressbarOpposite: !1,
               type: "bullets",
               dynamicBullets: !1,
               dynamicMainBullets: 1,
               formatFractionCurrent: e => e,
               formatFractionTotal: e => e,
               bulletClass: `${r}-bullet`,
               bulletActiveClass: `${r}-bullet-active`,
               modifierClass: `${r}-`,
               currentClass: `${r}-current`,
               totalClass: `${r}-total`,
               hiddenClass: `${r}-hidden`,
               progressbarFillClass: `${r}-progressbar-fill`,
               progressbarOppositeClass: `${r}-progressbar-opposite`,
               clickableClass: `${r}-clickable`,
               lockClass: `${r}-lock`,
               horizontalClass: `${r}-horizontal`,
               verticalClass: `${r}-vertical`,
               paginationDisabledClass: `${r}-disabled`
            }
         }),
            t.pagination = {
               el: null,
               bullets: []
            };
         let l = 0;
         const o = e => (Array.isArray(e) ? e : [e]).filter((e => !!e));
         function d() {
            return !t.params.pagination.el || !t.pagination.el || Array.isArray(t.pagination.el) && 0 === t.pagination.el.length
         }
         function c(e, s) {
            const { bulletActiveClass: a } = t.params.pagination;
            e && (e = e[("prev" === s ? "previous" : "next") + "ElementSibling"]) && (e.classList.add(`${a}-${s}`),
               (e = e[("prev" === s ? "previous" : "next") + "ElementSibling"]) && e.classList.add(`${a}-${s}-${s}`))
         }
         function p(e) {
            const s = e.target.closest(ee(t.params.pagination.bulletClass));
            if (!s)
               return;
            e.preventDefault();
            const a = w(s) * t.params.slidesPerGroup;
            if (t.params.loop) {
               if (t.realIndex === a)
                  return;
               const e = t.realIndex
                  , s = t.getSlideIndexByData(a)
                  , i = t.getSlideIndexByData(t.realIndex)
                  , r = a => {
                     const i = t.activeIndex;
                     t.loopFix({
                        direction: a,
                        activeSlideIndex: s,
                        slideTo: !1
                     });
                     i === t.activeIndex && t.slideToLoop(e, 0, !1, !0)
                  }
                  ;
               if (s > t.slides.length - t.loopedSlides)
                  r(s > i ? "next" : "prev");
               else if (t.params.centeredSlides) {
                  const e = "auto" === t.params.slidesPerView ? t.slidesPerViewDynamic() : Math.ceil(parseFloat(t.params.slidesPerView, 10));
                  s < Math.floor(e / 2) && r("prev")
               }
               t.slideToLoop(a)
            } else
               t.slideTo(a)
         }
         function u() {
            const e = t.rtl
               , s = t.params.pagination;
            if (d())
               return;
            let a, r, p = t.pagination.el;
            p = o(p);
            const u = t.virtual && t.params.virtual.enabled ? t.virtual.slides.length : t.slides.length
               , m = t.params.loop ? Math.ceil(u / t.params.slidesPerGroup) : t.snapGrid.length;
            if (t.params.loop ? (r = t.previousRealIndex || 0,
               a = t.params.slidesPerGroup > 1 ? Math.floor(t.realIndex / t.params.slidesPerGroup) : t.realIndex) : void 0 !== t.snapIndex ? (a = t.snapIndex,
                  r = t.previousSnapIndex) : (r = t.previousIndex || 0,
                     a = t.activeIndex || 0),
               "bullets" === s.type && t.pagination.bullets && t.pagination.bullets.length > 0) {
               const i = t.pagination.bullets;
               let o, d, u;
               if (s.dynamicBullets && (n = E(i[0], t.isHorizontal() ? "width" : "height", !0),
                  p.forEach((e => {
                     e.style[t.isHorizontal() ? "width" : "height"] = n * (s.dynamicMainBullets + 4) + "px"
                  }
                  )),
                  s.dynamicMainBullets > 1 && void 0 !== r && (l += a - (r || 0),
                     l > s.dynamicMainBullets - 1 ? l = s.dynamicMainBullets - 1 : l < 0 && (l = 0)),
                  o = Math.max(a - l, 0),
                  d = o + (Math.min(i.length, s.dynamicMainBullets) - 1),
                  u = (d + o) / 2),
                  i.forEach((e => {
                     const t = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map((e => `${s.bulletActiveClass}${e}`))].map((e => "string" == typeof e && e.includes(" ") ? e.split(" ") : e)).flat();
                     e.classList.remove(...t)
                  }
                  )),
                  p.length > 1)
                  i.forEach((e => {
                     const i = w(e);
                     i === a ? e.classList.add(...s.bulletActiveClass.split(" ")) : t.isElement && e.setAttribute("part", "bullet"),
                        s.dynamicBullets && (i >= o && i <= d && e.classList.add(...`${s.bulletActiveClass}-main`.split(" ")),
                           i === o && c(e, "prev"),
                           i === d && c(e, "next"))
                  }
                  ));
               else {
                  const e = i[a];
                  if (e && e.classList.add(...s.bulletActiveClass.split(" ")),
                     t.isElement && i.forEach(((e, t) => {
                        e.setAttribute("part", t === a ? "bullet-active" : "bullet")
                     }
                     )),
                     s.dynamicBullets) {
                     const e = i[o]
                        , t = i[d];
                     for (let e = o; e <= d; e += 1)
                        i[e] && i[e].classList.add(...`${s.bulletActiveClass}-main`.split(" "));
                     c(e, "prev"),
                        c(t, "next")
                  }
               }
               if (s.dynamicBullets) {
                  const a = Math.min(i.length, s.dynamicMainBullets + 4)
                     , r = (n * a - n) / 2 - u * n
                     , l = e ? "right" : "left";
                  i.forEach((e => {
                     e.style[t.isHorizontal() ? l : "top"] = `${r}px`
                  }
                  ))
               }
            }
            p.forEach(((e, r) => {
               if ("fraction" === s.type && (e.querySelectorAll(ee(s.currentClass)).forEach((e => {
                  e.textContent = s.formatFractionCurrent(a + 1)
               }
               )),
                  e.querySelectorAll(ee(s.totalClass)).forEach((e => {
                     e.textContent = s.formatFractionTotal(m)
                  }
                  ))),
                  "progressbar" === s.type) {
                  let i;
                  i = s.progressbarOpposite ? t.isHorizontal() ? "vertical" : "horizontal" : t.isHorizontal() ? "horizontal" : "vertical";
                  const r = (a + 1) / m;
                  let n = 1
                     , l = 1;
                  "horizontal" === i ? n = r : l = r,
                     e.querySelectorAll(ee(s.progressbarFillClass)).forEach((e => {
                        e.style.transform = `translate3d(0,0,0) scaleX(${n}) scaleY(${l})`,
                           e.style.transitionDuration = `${t.params.speed}ms`
                     }
                     ))
               }
               "custom" === s.type && s.renderCustom ? (e.innerHTML = s.renderCustom(t, a + 1, m),
                  0 === r && i("paginationRender", e)) : (0 === r && i("paginationRender", e),
                     i("paginationUpdate", e)),
                  t.params.watchOverflow && t.enabled && e.classList[t.isLocked ? "add" : "remove"](s.lockClass)
            }
            ))
         }
         function m() {
            const e = t.params.pagination;
            if (d())
               return;
            const s = t.virtual && t.params.virtual.enabled ? t.virtual.slides.length : t.slides.length;
            let a = t.pagination.el;
            a = o(a);
            let r = "";
            if ("bullets" === e.type) {
               let a = t.params.loop ? Math.ceil(s / t.params.slidesPerGroup) : t.snapGrid.length;
               t.params.freeMode && t.params.freeMode.enabled && a > s && (a = s);
               for (let s = 0; s < a; s += 1)
                  e.renderBullet ? r += e.renderBullet.call(t, s, e.bulletClass) : r += `<${e.bulletElement} ${t.isElement ? 'part="bullet"' : ""} class="${e.bulletClass}"></${e.bulletElement}>`
            }
            "fraction" === e.type && (r = e.renderFraction ? e.renderFraction.call(t, e.currentClass, e.totalClass) : `<span class="${e.currentClass}"></span> / <span class="${e.totalClass}"></span>`),
               "progressbar" === e.type && (r = e.renderProgressbar ? e.renderProgressbar.call(t, e.progressbarFillClass) : `<span class="${e.progressbarFillClass}"></span>`),
               t.pagination.bullets = [],
               a.forEach((s => {
                  "custom" !== e.type && (s.innerHTML = r || ""),
                     "bullets" === e.type && t.pagination.bullets.push(...s.querySelectorAll(ee(e.bulletClass)))
               }
               )),
               "custom" !== e.type && i("paginationRender", a[0])
         }
         function h() {
            t.params.pagination = J(t, t.originalParams.pagination, t.params.pagination, {
               el: "swiper-pagination"
            });
            const e = t.params.pagination;
            if (!e.el)
               return;
            let s;
            "string" == typeof e.el && t.isElement && (s = t.el.querySelector(e.el)),
               s || "string" != typeof e.el || (s = [...document.querySelectorAll(e.el)]),
               s || (s = e.el),
               s && 0 !== s.length && (t.params.uniqueNavElements && "string" == typeof e.el && Array.isArray(s) && s.length > 1 && (s = [...t.el.querySelectorAll(e.el)],
                  s.length > 1 && (s = s.filter((e => b(e, ".swiper")[0] === t.el))[0])),
                  Array.isArray(s) && 1 === s.length && (s = s[0]),
                  Object.assign(t.pagination, {
                     el: s
                  }),
                  s = o(s),
                  s.forEach((s => {
                     "bullets" === e.type && e.clickable && s.classList.add(...(e.clickableClass || "").split(" ")),
                        s.classList.add(e.modifierClass + e.type),
                        s.classList.add(t.isHorizontal() ? e.horizontalClass : e.verticalClass),
                        "bullets" === e.type && e.dynamicBullets && (s.classList.add(`${e.modifierClass}${e.type}-dynamic`),
                           l = 0,
                           e.dynamicMainBullets < 1 && (e.dynamicMainBullets = 1)),
                        "progressbar" === e.type && e.progressbarOpposite && s.classList.add(e.progressbarOppositeClass),
                        e.clickable && s.addEventListener("click", p),
                        t.enabled || s.classList.add(e.lockClass)
                  }
                  )))
         }
         function f() {
            const e = t.params.pagination;
            if (d())
               return;
            let s = t.pagination.el;
            s && (s = o(s),
               s.forEach((s => {
                  s.classList.remove(e.hiddenClass),
                     s.classList.remove(e.modifierClass + e.type),
                     s.classList.remove(t.isHorizontal() ? e.horizontalClass : e.verticalClass),
                     e.clickable && (s.classList.remove(...(e.clickableClass || "").split(" ")),
                        s.removeEventListener("click", p))
               }
               ))),
               t.pagination.bullets && t.pagination.bullets.forEach((t => t.classList.remove(...e.bulletActiveClass.split(" "))))
         }
         a("changeDirection", (() => {
            if (!t.pagination || !t.pagination.el)
               return;
            const e = t.params.pagination;
            let { el: s } = t.pagination;
            s = o(s),
               s.forEach((s => {
                  s.classList.remove(e.horizontalClass, e.verticalClass),
                     s.classList.add(t.isHorizontal() ? e.horizontalClass : e.verticalClass)
               }
               ))
         }
         )),
            a("init", (() => {
               !1 === t.params.pagination.enabled ? g() : (h(),
                  m(),
                  u())
            }
            )),
            a("activeIndexChange", (() => {
               void 0 === t.snapIndex && u()
            }
            )),
            a("snapIndexChange", (() => {
               u()
            }
            )),
            a("snapGridLengthChange", (() => {
               m(),
                  u()
            }
            )),
            a("destroy", (() => {
               f()
            }
            )),
            a("enable disable", (() => {
               let { el: e } = t.pagination;
               e && (e = o(e),
                  e.forEach((e => e.classList[t.enabled ? "remove" : "add"](t.params.pagination.lockClass))))
            }
            )),
            a("lock unlock", (() => {
               u()
            }
            )),
            a("click", ((e, s) => {
               const a = s.target
                  , r = o(t.pagination.el);
               if (t.params.pagination.el && t.params.pagination.hideOnClick && r && r.length > 0 && !a.classList.contains(t.params.pagination.bulletClass)) {
                  if (t.navigation && (t.navigation.nextEl && a === t.navigation.nextEl || t.navigation.prevEl && a === t.navigation.prevEl))
                     return;
                  const e = r[0].classList.contains(t.params.pagination.hiddenClass);
                  i(!0 === e ? "paginationShow" : "paginationHide"),
                     r.forEach((e => e.classList.toggle(t.params.pagination.hiddenClass)))
               }
            }
            ));
         const g = () => {
            t.el.classList.add(t.params.pagination.paginationDisabledClass);
            let { el: e } = t.pagination;
            e && (e = o(e),
               e.forEach((e => e.classList.add(t.params.pagination.paginationDisabledClass)))),
               f()
         }
            ;
         Object.assign(t.pagination, {
            enable: () => {
               t.el.classList.remove(t.params.pagination.paginationDisabledClass);
               let { el: e } = t.pagination;
               e && (e = o(e),
                  e.forEach((e => e.classList.remove(t.params.pagination.paginationDisabledClass)))),
                  h(),
                  m(),
                  u()
            }
            ,
            disable: g,
            render: m,
            update: u,
            init: h,
            destroy: f
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: i, emit: r } = e;
         const l = a();
         let o, d, c, p, u = !1, m = null, h = null;
         function v() {
            if (!t.params.scrollbar.el || !t.scrollbar.el)
               return;
            const { scrollbar: e, rtlTranslate: s } = t
               , { dragEl: a, el: i } = e
               , r = t.params.scrollbar
               , n = t.params.loop ? t.progressLoop : t.progress;
            let l = d
               , o = (c - d) * n;
            s ? (o = -o,
               o > 0 ? (l = d - o,
                  o = 0) : -o + d > c && (l = c + o)) : o < 0 ? (l = d + o,
                     o = 0) : o + d > c && (l = c - o),
               t.isHorizontal() ? (a.style.transform = `translate3d(${o}px, 0, 0)`,
                  a.style.width = `${l}px`) : (a.style.transform = `translate3d(0px, ${o}px, 0)`,
                     a.style.height = `${l}px`),
               r.hide && (clearTimeout(m),
                  i.style.opacity = 1,
                  m = setTimeout((() => {
                     i.style.opacity = 0,
                        i.style.transitionDuration = "400ms"
                  }
                  ), 1e3))
         }
         function w() {
            if (!t.params.scrollbar.el || !t.scrollbar.el)
               return;
            const { scrollbar: e } = t
               , { dragEl: s, el: a } = e;
            s.style.width = "",
               s.style.height = "",
               c = t.isHorizontal() ? a.offsetWidth : a.offsetHeight,
               p = t.size / (t.virtualSize + t.params.slidesOffsetBefore - (t.params.centeredSlides ? t.snapGrid[0] : 0)),
               d = "auto" === t.params.scrollbar.dragSize ? c * p : parseInt(t.params.scrollbar.dragSize, 10),
               t.isHorizontal() ? s.style.width = `${d}px` : s.style.height = `${d}px`,
               a.style.display = p >= 1 ? "none" : "",
               t.params.scrollbar.hide && (a.style.opacity = 0),
               t.params.watchOverflow && t.enabled && e.el.classList[t.isLocked ? "add" : "remove"](t.params.scrollbar.lockClass)
         }
         function b(e) {
            return t.isHorizontal() ? e.clientX : e.clientY
         }
         function y(e) {
            const { scrollbar: s, rtlTranslate: a } = t
               , { el: i } = s;
            let r;
            r = (b(e) - g(i)[t.isHorizontal() ? "left" : "top"] - (null !== o ? o : d / 2)) / (c - d),
               r = Math.max(Math.min(r, 1), 0),
               a && (r = 1 - r);
            const n = t.minTranslate() + (t.maxTranslate() - t.minTranslate()) * r;
            t.updateProgress(n),
               t.setTranslate(n),
               t.updateActiveIndex(),
               t.updateSlidesClasses()
         }
         function E(e) {
            const s = t.params.scrollbar
               , { scrollbar: a, wrapperEl: i } = t
               , { el: n, dragEl: l } = a;
            u = !0,
               o = e.target === l ? b(e) - e.target.getBoundingClientRect()[t.isHorizontal() ? "left" : "top"] : null,
               e.preventDefault(),
               e.stopPropagation(),
               i.style.transitionDuration = "100ms",
               l.style.transitionDuration = "100ms",
               y(e),
               clearTimeout(h),
               n.style.transitionDuration = "0ms",
               s.hide && (n.style.opacity = 1),
               t.params.cssMode && (t.wrapperEl.style["scroll-snap-type"] = "none"),
               r("scrollbarDragStart", e)
         }
         function x(e) {
            const { scrollbar: s, wrapperEl: a } = t
               , { el: i, dragEl: n } = s;
            u && (e.preventDefault ? e.preventDefault() : e.returnValue = !1,
               y(e),
               a.style.transitionDuration = "0ms",
               i.style.transitionDuration = "0ms",
               n.style.transitionDuration = "0ms",
               r("scrollbarDragMove", e))
         }
         function S(e) {
            const s = t.params.scrollbar
               , { scrollbar: a, wrapperEl: i } = t
               , { el: l } = a;
            u && (u = !1,
               t.params.cssMode && (t.wrapperEl.style["scroll-snap-type"] = "",
                  i.style.transitionDuration = ""),
               s.hide && (clearTimeout(h),
                  h = n((() => {
                     l.style.opacity = 0,
                        l.style.transitionDuration = "400ms"
                  }
                  ), 1e3)),
               r("scrollbarDragEnd", e),
               s.snapOnRelease && t.slideToClosest())
         }
         function T(e) {
            const { scrollbar: s, params: a } = t
               , i = s.el;
            if (!i)
               return;
            const r = i
               , n = !!a.passiveListeners && {
                  passive: !1,
                  capture: !1
               }
               , o = !!a.passiveListeners && {
                  passive: !0,
                  capture: !1
               };
            if (!r)
               return;
            const d = "on" === e ? "addEventListener" : "removeEventListener";
            r[d]("pointerdown", E, n),
               l[d]("pointermove", x, n),
               l[d]("pointerup", S, o)
         }
         function M() {
            const { scrollbar: e, el: s } = t;
            t.params.scrollbar = J(t, t.originalParams.scrollbar, t.params.scrollbar, {
               el: "swiper-scrollbar"
            });
            const a = t.params.scrollbar;
            if (!a.el)
               return;
            let i, r;
            "string" == typeof a.el && t.isElement && (i = t.el.querySelector(a.el)),
               i || "string" != typeof a.el ? i || (i = a.el) : i = l.querySelectorAll(a.el),
               t.params.uniqueNavElements && "string" == typeof a.el && i.length > 1 && 1 === s.querySelectorAll(a.el).length && (i = s.querySelector(a.el)),
               i.length > 0 && (i = i[0]),
               i.classList.add(t.isHorizontal() ? a.horizontalClass : a.verticalClass),
               i && (r = i.querySelector(`.${t.params.scrollbar.dragClass}`),
                  r || (r = f("div", t.params.scrollbar.dragClass),
                     i.append(r))),
               Object.assign(e, {
                  el: i,
                  dragEl: r
               }),
               a.draggable && t.params.scrollbar.el && t.scrollbar.el && T("on"),
               i && i.classList[t.enabled ? "remove" : "add"](t.params.scrollbar.lockClass)
         }
         function C() {
            const e = t.params.scrollbar
               , s = t.scrollbar.el;
            s && s.classList.remove(t.isHorizontal() ? e.horizontalClass : e.verticalClass),
               t.params.scrollbar.el && t.scrollbar.el && T("off")
         }
         s({
            scrollbar: {
               el: null,
               dragSize: "auto",
               hide: !1,
               draggable: !1,
               snapOnRelease: !0,
               lockClass: "swiper-scrollbar-lock",
               dragClass: "swiper-scrollbar-drag",
               scrollbarDisabledClass: "swiper-scrollbar-disabled",
               horizontalClass: "swiper-scrollbar-horizontal",
               verticalClass: "swiper-scrollbar-vertical"
            }
         }),
            t.scrollbar = {
               el: null,
               dragEl: null
            },
            i("init", (() => {
               !1 === t.params.scrollbar.enabled ? P() : (M(),
                  w(),
                  v())
            }
            )),
            i("update resize observerUpdate lock unlock", (() => {
               w()
            }
            )),
            i("setTranslate", (() => {
               v()
            }
            )),
            i("setTransition", ((e, s) => {
               !function (e) {
                  t.params.scrollbar.el && t.scrollbar.el && (t.scrollbar.dragEl.style.transitionDuration = `${e}ms`)
               }(s)
            }
            )),
            i("enable disable", (() => {
               const { el: e } = t.scrollbar;
               e && e.classList[t.enabled ? "remove" : "add"](t.params.scrollbar.lockClass)
            }
            )),
            i("destroy", (() => {
               C()
            }
            ));
         const P = () => {
            t.el.classList.add(t.params.scrollbar.scrollbarDisabledClass),
               t.scrollbar.el && t.scrollbar.el.classList.add(t.params.scrollbar.scrollbarDisabledClass),
               C()
         }
            ;
         Object.assign(t.scrollbar, {
            enable: () => {
               t.el.classList.remove(t.params.scrollbar.scrollbarDisabledClass),
                  t.scrollbar.el && t.scrollbar.el.classList.remove(t.params.scrollbar.scrollbarDisabledClass),
                  M(),
                  w(),
                  v()
            }
            ,
            disable: P,
            updateSize: w,
            setTranslate: v,
            init: M,
            destroy: C
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            parallax: {
               enabled: !1
            }
         });
         const i = "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]"
            , r = (e, s) => {
               const { rtl: a } = t
                  , i = a ? -1 : 1
                  , r = e.getAttribute("data-swiper-parallax") || "0";
               let n = e.getAttribute("data-swiper-parallax-x")
                  , l = e.getAttribute("data-swiper-parallax-y");
               const o = e.getAttribute("data-swiper-parallax-scale")
                  , d = e.getAttribute("data-swiper-parallax-opacity")
                  , c = e.getAttribute("data-swiper-parallax-rotate");
               if (n || l ? (n = n || "0",
                  l = l || "0") : t.isHorizontal() ? (n = r,
                     l = "0") : (l = r,
                        n = "0"),
                  n = n.indexOf("%") >= 0 ? parseInt(n, 10) * s * i + "%" : n * s * i + "px",
                  l = l.indexOf("%") >= 0 ? parseInt(l, 10) * s + "%" : l * s + "px",
                  null != d) {
                  const t = d - (d - 1) * (1 - Math.abs(s));
                  e.style.opacity = t
               }
               let p = `translate3d(${n}, ${l}, 0px)`;
               if (null != o) {
                  p += ` scale(${o - (o - 1) * (1 - Math.abs(s))})`
               }
               if (c && null != c) {
                  p += ` rotate(${c * s * -1}deg)`
               }
               e.style.transform = p
            }
            , n = () => {
               const { el: e, slides: s, progress: a, snapGrid: n, isElement: l } = t
                  , o = h(e, i);
               t.isElement && o.push(...h(t.hostEl, i)),
                  o.forEach((e => {
                     r(e, a)
                  }
                  )),
                  s.forEach(((e, s) => {
                     let l = e.progress;
                     t.params.slidesPerGroup > 1 && "auto" !== t.params.slidesPerView && (l += Math.ceil(s / 2) - a * (n.length - 1)),
                        l = Math.min(Math.max(l, -1), 1),
                        e.querySelectorAll(`${i}, [data-swiper-parallax-rotate]`).forEach((e => {
                           r(e, l)
                        }
                        ))
                  }
                  ))
            }
            ;
         a("beforeInit", (() => {
            t.params.parallax.enabled && (t.params.watchSlidesProgress = !0,
               t.originalParams.watchSlidesProgress = !0)
         }
         )),
            a("init", (() => {
               t.params.parallax.enabled && n()
            }
            )),
            a("setTranslate", (() => {
               t.params.parallax.enabled && n()
            }
            )),
            a("setTransition", ((e, s) => {
               t.params.parallax.enabled && function (e) {
                  void 0 === e && (e = t.params.speed);
                  const { el: s, hostEl: a } = t
                     , r = [...s.querySelectorAll(i)];
                  t.isElement && r.push(...a.querySelectorAll(i)),
                     r.forEach((t => {
                        let s = parseInt(t.getAttribute("data-swiper-parallax-duration"), 10) || e;
                        0 === e && (s = 0),
                           t.style.transitionDuration = `${s}ms`
                     }
                     ))
               }(s)
            }
            ))
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a, emit: i } = e;
         const n = r();
         s({
            zoom: {
               enabled: !1,
               maxRatio: 3,
               minRatio: 1,
               toggle: !0,
               containerClass: "swiper-zoom-container",
               zoomedSlideClass: "swiper-slide-zoomed"
            }
         }),
            t.zoom = {
               enabled: !1
            };
         let l, d, c = 1, p = !1;
         const u = []
            , m = {
               originX: 0,
               originY: 0,
               slideEl: void 0,
               slideWidth: void 0,
               slideHeight: void 0,
               imageEl: void 0,
               imageWrapEl: void 0,
               maxRatio: 3
            }
            , f = {
               isTouched: void 0,
               isMoved: void 0,
               currentX: void 0,
               currentY: void 0,
               minX: void 0,
               minY: void 0,
               maxX: void 0,
               maxY: void 0,
               width: void 0,
               height: void 0,
               startX: void 0,
               startY: void 0,
               touchesStart: {},
               touchesCurrent: {}
            }
            , v = {
               x: void 0,
               y: void 0,
               prevPositionX: void 0,
               prevPositionY: void 0,
               prevTime: void 0
            };
         let w = 1;
         function y() {
            if (u.length < 2)
               return 1;
            const e = u[0].pageX
               , t = u[0].pageY
               , s = u[1].pageX
               , a = u[1].pageY;
            return Math.sqrt((s - e) ** 2 + (a - t) ** 2)
         }
         function E(e) {
            const s = t.isElement ? "swiper-slide" : `.${t.params.slideClass}`;
            return !!e.target.matches(s) || t.slides.filter((t => t.contains(e.target))).length > 0
         }
         function x(e) {
            if ("mouse" === e.pointerType && u.splice(0, u.length),
               !E(e))
               return;
            const s = t.params.zoom;
            if (l = !1,
               d = !1,
               u.push(e),
               !(u.length < 2)) {
               if (l = !0,
                  m.scaleStart = y(),
                  !m.slideEl) {
                  m.slideEl = e.target.closest(`.${t.params.slideClass}, swiper-slide`),
                     m.slideEl || (m.slideEl = t.slides[t.activeIndex]);
                  let a = m.slideEl.querySelector(`.${s.containerClass}`);
                  if (a && (a = a.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),
                     m.imageEl = a,
                     m.imageWrapEl = a ? b(m.imageEl, `.${s.containerClass}`)[0] : void 0,
                     !m.imageWrapEl)
                     return void (m.imageEl = void 0);
                  m.maxRatio = m.imageWrapEl.getAttribute("data-swiper-zoom") || s.maxRatio
               }
               if (m.imageEl) {
                  const [e, t] = function () {
                     if (u.length < 2)
                        return {
                           x: null,
                           y: null
                        };
                     const e = m.imageEl.getBoundingClientRect();
                     return [(u[0].pageX + (u[1].pageX - u[0].pageX) / 2 - e.x - n.scrollX) / c, (u[0].pageY + (u[1].pageY - u[0].pageY) / 2 - e.y - n.scrollY) / c]
                  }();
                  m.originX = e,
                     m.originY = t,
                     m.imageEl.style.transitionDuration = "0ms"
               }
               p = !0
            }
         }
         function S(e) {
            if (!E(e))
               return;
            const s = t.params.zoom
               , a = t.zoom
               , i = u.findIndex((t => t.pointerId === e.pointerId));
            i >= 0 && (u[i] = e),
               u.length < 2 || (d = !0,
                  m.scaleMove = y(),
                  m.imageEl && (a.scale = m.scaleMove / m.scaleStart * c,
                     a.scale > m.maxRatio && (a.scale = m.maxRatio - 1 + (a.scale - m.maxRatio + 1) ** .5),
                     a.scale < s.minRatio && (a.scale = s.minRatio + 1 - (s.minRatio - a.scale + 1) ** .5),
                     m.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`))
         }
         function T(e) {
            if (!E(e))
               return;
            if ("mouse" === e.pointerType && "pointerout" === e.type)
               return;
            const s = t.params.zoom
               , a = t.zoom
               , i = u.findIndex((t => t.pointerId === e.pointerId));
            i >= 0 && u.splice(i, 1),
               l && d && (l = !1,
                  d = !1,
                  m.imageEl && (a.scale = Math.max(Math.min(a.scale, m.maxRatio), s.minRatio),
                     m.imageEl.style.transitionDuration = `${t.params.speed}ms`,
                     m.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`,
                     c = a.scale,
                     p = !1,
                     a.scale > 1 && m.slideEl ? m.slideEl.classList.add(`${s.zoomedSlideClass}`) : a.scale <= 1 && m.slideEl && m.slideEl.classList.remove(`${s.zoomedSlideClass}`),
                     1 === a.scale && (m.originX = 0,
                        m.originY = 0,
                        m.slideEl = void 0)))
         }
         function M(e) {
            if (!E(e) || !function (e) {
               const s = `.${t.params.zoom.containerClass}`;
               return !!e.target.matches(s) || [...t.hostEl.querySelectorAll(s)].filter((t => t.contains(e.target))).length > 0
            }(e))
               return;
            const s = t.zoom;
            if (!m.imageEl)
               return;
            if (!f.isTouched || !m.slideEl)
               return;
            f.isMoved || (f.width = m.imageEl.offsetWidth,
               f.height = m.imageEl.offsetHeight,
               f.startX = o(m.imageWrapEl, "x") || 0,
               f.startY = o(m.imageWrapEl, "y") || 0,
               m.slideWidth = m.slideEl.offsetWidth,
               m.slideHeight = m.slideEl.offsetHeight,
               m.imageWrapEl.style.transitionDuration = "0ms");
            const a = f.width * s.scale
               , i = f.height * s.scale;
            if (a < m.slideWidth && i < m.slideHeight)
               return;
            f.minX = Math.min(m.slideWidth / 2 - a / 2, 0),
               f.maxX = -f.minX,
               f.minY = Math.min(m.slideHeight / 2 - i / 2, 0),
               f.maxY = -f.minY,
               f.touchesCurrent.x = u.length > 0 ? u[0].pageX : e.pageX,
               f.touchesCurrent.y = u.length > 0 ? u[0].pageY : e.pageY;
            if (Math.max(Math.abs(f.touchesCurrent.x - f.touchesStart.x), Math.abs(f.touchesCurrent.y - f.touchesStart.y)) > 5 && (t.allowClick = !1),
               !f.isMoved && !p) {
               if (t.isHorizontal() && (Math.floor(f.minX) === Math.floor(f.startX) && f.touchesCurrent.x < f.touchesStart.x || Math.floor(f.maxX) === Math.floor(f.startX) && f.touchesCurrent.x > f.touchesStart.x))
                  return void (f.isTouched = !1);
               if (!t.isHorizontal() && (Math.floor(f.minY) === Math.floor(f.startY) && f.touchesCurrent.y < f.touchesStart.y || Math.floor(f.maxY) === Math.floor(f.startY) && f.touchesCurrent.y > f.touchesStart.y))
                  return void (f.isTouched = !1)
            }
            e.cancelable && e.preventDefault(),
               e.stopPropagation(),
               f.isMoved = !0;
            const r = (s.scale - c) / (m.maxRatio - t.params.zoom.minRatio)
               , { originX: n, originY: l } = m;
            f.currentX = f.touchesCurrent.x - f.touchesStart.x + f.startX + r * (f.width - 2 * n),
               f.currentY = f.touchesCurrent.y - f.touchesStart.y + f.startY + r * (f.height - 2 * l),
               f.currentX < f.minX && (f.currentX = f.minX + 1 - (f.minX - f.currentX + 1) ** .8),
               f.currentX > f.maxX && (f.currentX = f.maxX - 1 + (f.currentX - f.maxX + 1) ** .8),
               f.currentY < f.minY && (f.currentY = f.minY + 1 - (f.minY - f.currentY + 1) ** .8),
               f.currentY > f.maxY && (f.currentY = f.maxY - 1 + (f.currentY - f.maxY + 1) ** .8),
               v.prevPositionX || (v.prevPositionX = f.touchesCurrent.x),
               v.prevPositionY || (v.prevPositionY = f.touchesCurrent.y),
               v.prevTime || (v.prevTime = Date.now()),
               v.x = (f.touchesCurrent.x - v.prevPositionX) / (Date.now() - v.prevTime) / 2,
               v.y = (f.touchesCurrent.y - v.prevPositionY) / (Date.now() - v.prevTime) / 2,
               Math.abs(f.touchesCurrent.x - v.prevPositionX) < 2 && (v.x = 0),
               Math.abs(f.touchesCurrent.y - v.prevPositionY) < 2 && (v.y = 0),
               v.prevPositionX = f.touchesCurrent.x,
               v.prevPositionY = f.touchesCurrent.y,
               v.prevTime = Date.now(),
               m.imageWrapEl.style.transform = `translate3d(${f.currentX}px, ${f.currentY}px,0)`
         }
         function C() {
            const e = t.zoom;
            m.slideEl && t.activeIndex !== t.slides.indexOf(m.slideEl) && (m.imageEl && (m.imageEl.style.transform = "translate3d(0,0,0) scale(1)"),
               m.imageWrapEl && (m.imageWrapEl.style.transform = "translate3d(0,0,0)"),
               m.slideEl.classList.remove(`${t.params.zoom.zoomedSlideClass}`),
               e.scale = 1,
               c = 1,
               m.slideEl = void 0,
               m.imageEl = void 0,
               m.imageWrapEl = void 0,
               m.originX = 0,
               m.originY = 0)
         }
         function P(e) {
            const s = t.zoom
               , a = t.params.zoom;
            if (!m.slideEl) {
               e && e.target && (m.slideEl = e.target.closest(`.${t.params.slideClass}, swiper-slide`)),
                  m.slideEl || (t.params.virtual && t.params.virtual.enabled && t.virtual ? m.slideEl = h(t.slidesEl, `.${t.params.slideActiveClass}`)[0] : m.slideEl = t.slides[t.activeIndex]);
               let s = m.slideEl.querySelector(`.${a.containerClass}`);
               s && (s = s.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),
                  m.imageEl = s,
                  m.imageWrapEl = s ? b(m.imageEl, `.${a.containerClass}`)[0] : void 0
            }
            if (!m.imageEl || !m.imageWrapEl)
               return;
            let i, r, l, o, d, p, u, v, w, y, E, x, S, T, M, C, P, L;
            t.params.cssMode && (t.wrapperEl.style.overflow = "hidden",
               t.wrapperEl.style.touchAction = "none"),
               m.slideEl.classList.add(`${a.zoomedSlideClass}`),
               void 0 === f.touchesStart.x && e ? (i = e.pageX,
                  r = e.pageY) : (i = f.touchesStart.x,
                     r = f.touchesStart.y);
            const z = "number" == typeof e ? e : null;
            1 === c && z && (i = void 0,
               r = void 0),
               s.scale = z || m.imageWrapEl.getAttribute("data-swiper-zoom") || a.maxRatio,
               c = z || m.imageWrapEl.getAttribute("data-swiper-zoom") || a.maxRatio,
               !e || 1 === c && z ? (u = 0,
                  v = 0) : (P = m.slideEl.offsetWidth,
                     L = m.slideEl.offsetHeight,
                     l = g(m.slideEl).left + n.scrollX,
                     o = g(m.slideEl).top + n.scrollY,
                     d = l + P / 2 - i,
                     p = o + L / 2 - r,
                     w = m.imageEl.offsetWidth,
                     y = m.imageEl.offsetHeight,
                     E = w * s.scale,
                     x = y * s.scale,
                     S = Math.min(P / 2 - E / 2, 0),
                     T = Math.min(L / 2 - x / 2, 0),
                     M = -S,
                     C = -T,
                     u = d * s.scale,
                     v = p * s.scale,
                     u < S && (u = S),
                     u > M && (u = M),
                     v < T && (v = T),
                     v > C && (v = C)),
               z && 1 === s.scale && (m.originX = 0,
                  m.originY = 0),
               m.imageWrapEl.style.transitionDuration = "300ms",
               m.imageWrapEl.style.transform = `translate3d(${u}px, ${v}px,0)`,
               m.imageEl.style.transitionDuration = "300ms",
               m.imageEl.style.transform = `translate3d(0,0,0) scale(${s.scale})`
         }
         function L() {
            const e = t.zoom
               , s = t.params.zoom;
            if (!m.slideEl) {
               t.params.virtual && t.params.virtual.enabled && t.virtual ? m.slideEl = h(t.slidesEl, `.${t.params.slideActiveClass}`)[0] : m.slideEl = t.slides[t.activeIndex];
               let e = m.slideEl.querySelector(`.${s.containerClass}`);
               e && (e = e.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),
                  m.imageEl = e,
                  m.imageWrapEl = e ? b(m.imageEl, `.${s.containerClass}`)[0] : void 0
            }
            m.imageEl && m.imageWrapEl && (t.params.cssMode && (t.wrapperEl.style.overflow = "",
               t.wrapperEl.style.touchAction = ""),
               e.scale = 1,
               c = 1,
               m.imageWrapEl.style.transitionDuration = "300ms",
               m.imageWrapEl.style.transform = "translate3d(0,0,0)",
               m.imageEl.style.transitionDuration = "300ms",
               m.imageEl.style.transform = "translate3d(0,0,0) scale(1)",
               m.slideEl.classList.remove(`${s.zoomedSlideClass}`),
               m.slideEl = void 0,
               m.originX = 0,
               m.originY = 0)
         }
         function z(e) {
            const s = t.zoom;
            s.scale && 1 !== s.scale ? L() : P(e)
         }
         function A() {
            return {
               passiveListener: !!t.params.passiveListeners && {
                  passive: !0,
                  capture: !1
               },
               activeListenerWithCapture: !t.params.passiveListeners || {
                  passive: !1,
                  capture: !0
               }
            }
         }
         function $() {
            const e = t.zoom;
            if (e.enabled)
               return;
            e.enabled = !0;
            const { passiveListener: s, activeListenerWithCapture: a } = A();
            t.wrapperEl.addEventListener("pointerdown", x, s),
               t.wrapperEl.addEventListener("pointermove", S, a),
               ["pointerup", "pointercancel", "pointerout"].forEach((e => {
                  t.wrapperEl.addEventListener(e, T, s)
               }
               )),
               t.wrapperEl.addEventListener("pointermove", M, a)
         }
         function I() {
            const e = t.zoom;
            if (!e.enabled)
               return;
            e.enabled = !1;
            const { passiveListener: s, activeListenerWithCapture: a } = A();
            t.wrapperEl.removeEventListener("pointerdown", x, s),
               t.wrapperEl.removeEventListener("pointermove", S, a),
               ["pointerup", "pointercancel", "pointerout"].forEach((e => {
                  t.wrapperEl.removeEventListener(e, T, s)
               }
               )),
               t.wrapperEl.removeEventListener("pointermove", M, a)
         }
         Object.defineProperty(t.zoom, "scale", {
            get: () => w,
            set(e) {
               if (w !== e) {
                  const t = m.imageEl
                     , s = m.slideEl;
                  i("zoomChange", e, t, s)
               }
               w = e
            }
         }),
            a("init", (() => {
               t.params.zoom.enabled && $()
            }
            )),
            a("destroy", (() => {
               I()
            }
            )),
            a("touchStart", ((e, s) => {
               t.zoom.enabled && function (e) {
                  const s = t.device;
                  if (!m.imageEl)
                     return;
                  if (f.isTouched)
                     return;
                  s.android && e.cancelable && e.preventDefault(),
                     f.isTouched = !0;
                  const a = u.length > 0 ? u[0] : e;
                  f.touchesStart.x = a.pageX,
                     f.touchesStart.y = a.pageY
               }(s)
            }
            )),
            a("touchEnd", ((e, s) => {
               t.zoom.enabled && function () {
                  const e = t.zoom;
                  if (!m.imageEl)
                     return;
                  if (!f.isTouched || !f.isMoved)
                     return f.isTouched = !1,
                        void (f.isMoved = !1);
                  f.isTouched = !1,
                     f.isMoved = !1;
                  let s = 300
                     , a = 300;
                  const i = v.x * s
                     , r = f.currentX + i
                     , n = v.y * a
                     , l = f.currentY + n;
                  0 !== v.x && (s = Math.abs((r - f.currentX) / v.x)),
                     0 !== v.y && (a = Math.abs((l - f.currentY) / v.y));
                  const o = Math.max(s, a);
                  f.currentX = r,
                     f.currentY = l;
                  const d = f.width * e.scale
                     , c = f.height * e.scale;
                  f.minX = Math.min(m.slideWidth / 2 - d / 2, 0),
                     f.maxX = -f.minX,
                     f.minY = Math.min(m.slideHeight / 2 - c / 2, 0),
                     f.maxY = -f.minY,
                     f.currentX = Math.max(Math.min(f.currentX, f.maxX), f.minX),
                     f.currentY = Math.max(Math.min(f.currentY, f.maxY), f.minY),
                     m.imageWrapEl.style.transitionDuration = `${o}ms`,
                     m.imageWrapEl.style.transform = `translate3d(${f.currentX}px, ${f.currentY}px,0)`
               }()
            }
            )),
            a("doubleTap", ((e, s) => {
               !t.animating && t.params.zoom.enabled && t.zoom.enabled && t.params.zoom.toggle && z(s)
            }
            )),
            a("transitionEnd", (() => {
               t.zoom.enabled && t.params.zoom.enabled && C()
            }
            )),
            a("slideChange", (() => {
               t.zoom.enabled && t.params.zoom.enabled && t.params.cssMode && C()
            }
            )),
            Object.assign(t.zoom, {
               enable: $,
               disable: I,
               in: P,
               out: L,
               toggle: z
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         function i(e, t) {
            const s = function () {
               let e, t, s;
               return (a, i) => {
                  for (t = -1,
                     e = a.length; e - t > 1;)
                     s = e + t >> 1,
                        a[s] <= i ? t = s : e = s;
                  return e
               }
            }();
            let a, i;
            return this.x = e,
               this.y = t,
               this.lastIndex = e.length - 1,
               this.interpolate = function (e) {
                  return e ? (i = s(this.x, e),
                     a = i - 1,
                     (e - this.x[a]) * (this.y[i] - this.y[a]) / (this.x[i] - this.x[a]) + this.y[a]) : 0
               }
               ,
               this
         }
         function r() {
            t.controller.control && t.controller.spline && (t.controller.spline = void 0,
               delete t.controller.spline)
         }
         s({
            controller: {
               control: void 0,
               inverse: !1,
               by: "slide"
            }
         }),
            t.controller = {
               control: void 0
            },
            a("beforeInit", (() => {
               if ("undefined" != typeof window && ("string" == typeof t.params.controller.control || t.params.controller.control instanceof HTMLElement)) {
                  const e = document.querySelector(t.params.controller.control);
                  if (e && e.swiper)
                     t.controller.control = e.swiper;
                  else if (e) {
                     const s = a => {
                        t.controller.control = a.detail[0],
                           t.update(),
                           e.removeEventListener("init", s)
                     }
                        ;
                     e.addEventListener("init", s)
                  }
               } else
                  t.controller.control = t.params.controller.control
            }
            )),
            a("update", (() => {
               r()
            }
            )),
            a("resize", (() => {
               r()
            }
            )),
            a("observerUpdate", (() => {
               r()
            }
            )),
            a("setTranslate", ((e, s, a) => {
               t.controller.control && !t.controller.control.destroyed && t.controller.setTranslate(s, a)
            }
            )),
            a("setTransition", ((e, s, a) => {
               t.controller.control && !t.controller.control.destroyed && t.controller.setTransition(s, a)
            }
            )),
            Object.assign(t.controller, {
               setTranslate: function (e, s) {
                  const a = t.controller.control;
                  let r, n;
                  const l = t.constructor;
                  function o(e) {
                     if (e.destroyed)
                        return;
                     const s = t.rtlTranslate ? -t.translate : t.translate;
                     "slide" === t.params.controller.by && (!function (e) {
                        t.controller.spline = t.params.loop ? new i(t.slidesGrid, e.slidesGrid) : new i(t.snapGrid, e.snapGrid)
                     }(e),
                        n = -t.controller.spline.interpolate(-s)),
                        n && "container" !== t.params.controller.by || (r = (e.maxTranslate() - e.minTranslate()) / (t.maxTranslate() - t.minTranslate()),
                           !Number.isNaN(r) && Number.isFinite(r) || (r = 1),
                           n = (s - t.minTranslate()) * r + e.minTranslate()),
                        t.params.controller.inverse && (n = e.maxTranslate() - n),
                        e.updateProgress(n),
                        e.setTranslate(n, t),
                        e.updateActiveIndex(),
                        e.updateSlidesClasses()
                  }
                  if (Array.isArray(a))
                     for (let e = 0; e < a.length; e += 1)
                        a[e] !== s && a[e] instanceof l && o(a[e]);
                  else
                     a instanceof l && s !== a && o(a)
               },
               setTransition: function (e, s) {
                  const a = t.constructor
                     , i = t.controller.control;
                  let r;
                  function l(s) {
                     s.destroyed || (s.setTransition(e, t),
                        0 !== e && (s.transitionStart(),
                           s.params.autoHeight && n((() => {
                              s.updateAutoHeight()
                           }
                           )),
                           y(s.wrapperEl, (() => {
                              i && s.transitionEnd()
                           }
                           ))))
                  }
                  if (Array.isArray(i))
                     for (r = 0; r < i.length; r += 1)
                        i[r] !== s && i[r] instanceof a && l(i[r]);
                  else
                     i instanceof a && s !== i && l(i)
               }
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            a11y: {
               enabled: !0,
               notificationClass: "swiper-notification",
               prevSlideMessage: "Previous slide",
               nextSlideMessage: "Next slide",
               firstSlideMessage: "This is the first slide",
               lastSlideMessage: "This is the last slide",
               paginationBulletMessage: "Go to slide {{index}}",
               slideLabelMessage: "{{index}} / {{slidesLength}}",
               containerMessage: null,
               containerRoleDescriptionMessage: null,
               itemRoleDescriptionMessage: null,
               slideRole: "group",
               id: null
            }
         }),
            t.a11y = {
               clicked: !1
            };
         let i = null;
         function r(e) {
            const t = i;
            0 !== t.length && (t.innerHTML = "",
               t.innerHTML = e)
         }
         const n = e => (Array.isArray(e) ? e : [e]).filter((e => !!e));
         function l(e) {
            (e = n(e)).forEach((e => {
               e.setAttribute("tabIndex", "0")
            }
            ))
         }
         function o(e) {
            (e = n(e)).forEach((e => {
               e.setAttribute("tabIndex", "-1")
            }
            ))
         }
         function d(e, t) {
            (e = n(e)).forEach((e => {
               e.setAttribute("role", t)
            }
            ))
         }
         function c(e, t) {
            (e = n(e)).forEach((e => {
               e.setAttribute("aria-roledescription", t)
            }
            ))
         }
         function p(e, t) {
            (e = n(e)).forEach((e => {
               e.setAttribute("aria-label", t)
            }
            ))
         }
         function u(e) {
            (e = n(e)).forEach((e => {
               e.setAttribute("aria-disabled", !0)
            }
            ))
         }
         function m(e) {
            (e = n(e)).forEach((e => {
               e.setAttribute("aria-disabled", !1)
            }
            ))
         }
         function h(e) {
            if (13 !== e.keyCode && 32 !== e.keyCode)
               return;
            const s = t.params.a11y
               , a = e.target;
            t.pagination && t.pagination.el && (a === t.pagination.el || t.pagination.el.contains(e.target)) && !e.target.matches(ee(t.params.pagination.bulletClass)) || (t.navigation && t.navigation.nextEl && a === t.navigation.nextEl && (t.isEnd && !t.params.loop || t.slideNext(),
               t.isEnd ? r(s.lastSlideMessage) : r(s.nextSlideMessage)),
               t.navigation && t.navigation.prevEl && a === t.navigation.prevEl && (t.isBeginning && !t.params.loop || t.slidePrev(),
                  t.isBeginning ? r(s.firstSlideMessage) : r(s.prevSlideMessage)),
               t.pagination && a.matches(ee(t.params.pagination.bulletClass)) && a.click())
         }
         function g() {
            return t.pagination && t.pagination.bullets && t.pagination.bullets.length
         }
         function v() {
            return g() && t.params.pagination.clickable
         }
         const b = (e, t, s) => {
            l(e),
               "BUTTON" !== e.tagName && (d(e, "button"),
                  e.addEventListener("keydown", h)),
               p(e, s),
               function (e, t) {
                  (e = n(e)).forEach((e => {
                     e.setAttribute("aria-controls", t)
                  }
                  ))
               }(e, t)
         }
            , y = () => {
               t.a11y.clicked = !0
            }
            , E = () => {
               requestAnimationFrame((() => {
                  requestAnimationFrame((() => {
                     t.destroyed || (t.a11y.clicked = !1)
                  }
                  ))
               }
               ))
            }
            , x = e => {
               if (t.a11y.clicked)
                  return;
               const s = e.target.closest(`.${t.params.slideClass}, swiper-slide`);
               if (!s || !t.slides.includes(s))
                  return;
               const a = t.slides.indexOf(s) === t.activeIndex
                  , i = t.params.watchSlidesProgress && t.visibleSlides && t.visibleSlides.includes(s);
               a || i || e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents || (t.isHorizontal() ? t.el.scrollLeft = 0 : t.el.scrollTop = 0,
                  t.slideTo(t.slides.indexOf(s), 0))
            }
            , S = () => {
               const e = t.params.a11y;
               e.itemRoleDescriptionMessage && c(t.slides, e.itemRoleDescriptionMessage),
                  e.slideRole && d(t.slides, e.slideRole);
               const s = t.slides.length;
               e.slideLabelMessage && t.slides.forEach(((a, i) => {
                  const r = t.params.loop ? parseInt(a.getAttribute("data-swiper-slide-index"), 10) : i;
                  p(a, e.slideLabelMessage.replace(/\{\{index\}\}/, r + 1).replace(/\{\{slidesLength\}\}/, s))
               }
               ))
            }
            , T = () => {
               const e = t.params.a11y;
               t.el.append(i);
               const s = t.el;
               e.containerRoleDescriptionMessage && c(s, e.containerRoleDescriptionMessage),
                  e.containerMessage && p(s, e.containerMessage);
               const a = t.wrapperEl
                  , r = e.id || a.getAttribute("id") || `swiper-wrapper-${l = 16,
                     void 0 === l && (l = 16),
                     "x".repeat(l).replace(/x/g, (() => Math.round(16 * Math.random()).toString(16)))}`;
               var l;
               const o = t.params.autoplay && t.params.autoplay.enabled ? "off" : "polite";
               var d;
               d = r,
                  n(a).forEach((e => {
                     e.setAttribute("id", d)
                  }
                  )),
                  function (e, t) {
                     (e = n(e)).forEach((e => {
                        e.setAttribute("aria-live", t)
                     }
                     ))
                  }(a, o),
                  S();
               let { nextEl: u, prevEl: m } = t.navigation ? t.navigation : {};
               if (u = n(u),
                  m = n(m),
                  u && u.forEach((t => b(t, r, e.nextSlideMessage))),
                  m && m.forEach((t => b(t, r, e.prevSlideMessage))),
                  v()) {
                  (Array.isArray(t.pagination.el) ? t.pagination.el : [t.pagination.el]).forEach((e => {
                     e.addEventListener("keydown", h)
                  }
                  ))
               }
               t.el.addEventListener("focus", x, !0),
                  t.el.addEventListener("pointerdown", y, !0),
                  t.el.addEventListener("pointerup", E, !0)
            }
            ;
         a("beforeInit", (() => {
            i = f("span", t.params.a11y.notificationClass),
               i.setAttribute("aria-live", "assertive"),
               i.setAttribute("aria-atomic", "true")
         }
         )),
            a("afterInit", (() => {
               t.params.a11y.enabled && T()
            }
            )),
            a("slidesLengthChange snapGridLengthChange slidesGridLengthChange", (() => {
               t.params.a11y.enabled && S()
            }
            )),
            a("fromEdge toEdge afterInit lock unlock", (() => {
               t.params.a11y.enabled && function () {
                  if (t.params.loop || t.params.rewind || !t.navigation)
                     return;
                  const { nextEl: e, prevEl: s } = t.navigation;
                  s && (t.isBeginning ? (u(s),
                     o(s)) : (m(s),
                        l(s))),
                     e && (t.isEnd ? (u(e),
                        o(e)) : (m(e),
                           l(e)))
               }()
            }
            )),
            a("paginationUpdate", (() => {
               t.params.a11y.enabled && function () {
                  const e = t.params.a11y;
                  g() && t.pagination.bullets.forEach((s => {
                     t.params.pagination.clickable && (l(s),
                        t.params.pagination.renderBullet || (d(s, "button"),
                           p(s, e.paginationBulletMessage.replace(/\{\{index\}\}/, w(s) + 1)))),
                        s.matches(ee(t.params.pagination.bulletActiveClass)) ? s.setAttribute("aria-current", "true") : s.removeAttribute("aria-current")
                  }
                  ))
               }()
            }
            )),
            a("destroy", (() => {
               t.params.a11y.enabled && function () {
                  i && i.remove();
                  let { nextEl: e, prevEl: s } = t.navigation ? t.navigation : {};
                  e = n(e),
                     s = n(s),
                     e && e.forEach((e => e.removeEventListener("keydown", h))),
                     s && s.forEach((e => e.removeEventListener("keydown", h))),
                     v() && (Array.isArray(t.pagination.el) ? t.pagination.el : [t.pagination.el]).forEach((e => {
                        e.removeEventListener("keydown", h)
                     }
                     ));
                  t.el.removeEventListener("focus", x, !0),
                     t.el.removeEventListener("pointerdown", y, !0),
                     t.el.removeEventListener("pointerup", E, !0)
               }()
            }
            ))
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            history: {
               enabled: !1,
               root: "",
               replaceState: !1,
               key: "slides",
               keepQuery: !1
            }
         });
         let i = !1
            , n = {};
         const l = e => e.toString().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+/, "").replace(/-+$/, "")
            , o = e => {
               const t = r();
               let s;
               s = e ? new URL(e) : t.location;
               const a = s.pathname.slice(1).split("/").filter((e => "" !== e))
                  , i = a.length;
               return {
                  key: a[i - 2],
                  value: a[i - 1]
               }
            }
            , d = (e, s) => {
               const a = r();
               if (!i || !t.params.history.enabled)
                  return;
               let n;
               n = t.params.url ? new URL(t.params.url) : a.location;
               const o = t.slides[s];
               let d = l(o.getAttribute("data-history"));
               if (t.params.history.root.length > 0) {
                  let s = t.params.history.root;
                  "/" === s[s.length - 1] && (s = s.slice(0, s.length - 1)),
                     d = `${s}/${e ? `${e}/` : ""}${d}`
               } else
                  n.pathname.includes(e) || (d = `${e ? `${e}/` : ""}${d}`);
               t.params.history.keepQuery && (d += n.search);
               const c = a.history.state;
               c && c.value === d || (t.params.history.replaceState ? a.history.replaceState({
                  value: d
               }, null, d) : a.history.pushState({
                  value: d
               }, null, d))
            }
            , c = (e, s, a) => {
               if (s)
                  for (let i = 0, r = t.slides.length; i < r; i += 1) {
                     const r = t.slides[i];
                     if (l(r.getAttribute("data-history")) === s) {
                        const s = t.getSlideIndex(r);
                        t.slideTo(s, e, a)
                     }
                  }
               else
                  t.slideTo(0, e, a)
            }
            , p = () => {
               n = o(t.params.url),
                  c(t.params.speed, n.value, !1)
            }
            ;
         a("init", (() => {
            t.params.history.enabled && (() => {
               const e = r();
               if (t.params.history) {
                  if (!e.history || !e.history.pushState)
                     return t.params.history.enabled = !1,
                        void (t.params.hashNavigation.enabled = !0);
                  i = !0,
                     n = o(t.params.url),
                     n.key || n.value ? (c(0, n.value, t.params.runCallbacksOnInit),
                        t.params.history.replaceState || e.addEventListener("popstate", p)) : t.params.history.replaceState || e.addEventListener("popstate", p)
               }
            }
            )()
         }
         )),
            a("destroy", (() => {
               t.params.history.enabled && (() => {
                  const e = r();
                  t.params.history.replaceState || e.removeEventListener("popstate", p)
               }
               )()
            }
            )),
            a("transitionEnd _freeModeNoMomentumRelease", (() => {
               i && d(t.params.history.key, t.activeIndex)
            }
            )),
            a("slideChange", (() => {
               i && t.params.cssMode && d(t.params.history.key, t.activeIndex)
            }
            ))
      }
      , function (e) {
         let { swiper: t, extendParams: s, emit: i, on: n } = e
            , l = !1;
         const o = a()
            , d = r();
         s({
            hashNavigation: {
               enabled: !1,
               replaceState: !1,
               watchState: !1,
               getSlideIndex(e, s) {
                  if (t.virtual && t.params.virtual.enabled) {
                     const e = t.slides.filter((e => e.getAttribute("data-hash") === s))[0];
                     if (!e)
                        return 0;
                     return parseInt(e.getAttribute("data-swiper-slide-index"), 10)
                  }
                  return t.getSlideIndex(h(t.slidesEl, `.${t.params.slideClass}[data-hash="${s}"], swiper-slide[data-hash="${s}"]`)[0])
               }
            }
         });
         const c = () => {
            i("hashChange");
            const e = o.location.hash.replace("#", "")
               , s = t.virtual && t.params.virtual.enabled ? t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`) : t.slides[t.activeIndex];
            if (e !== (s ? s.getAttribute("data-hash") : "")) {
               const s = t.params.hashNavigation.getSlideIndex(t, e);
               if (void 0 === s || Number.isNaN(s))
                  return;
               t.slideTo(s)
            }
         }
            , p = () => {
               if (!l || !t.params.hashNavigation.enabled)
                  return;
               const e = t.virtual && t.params.virtual.enabled ? t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`) : t.slides[t.activeIndex]
                  , s = e ? e.getAttribute("data-hash") || e.getAttribute("data-history") : "";
               t.params.hashNavigation.replaceState && d.history && d.history.replaceState ? (d.history.replaceState(null, null, `#${s}` || ""),
                  i("hashSet")) : (o.location.hash = s || "",
                     i("hashSet"))
            }
            ;
         n("init", (() => {
            t.params.hashNavigation.enabled && (() => {
               if (!t.params.hashNavigation.enabled || t.params.history && t.params.history.enabled)
                  return;
               l = !0;
               const e = o.location.hash.replace("#", "");
               if (e) {
                  const s = 0
                     , a = t.params.hashNavigation.getSlideIndex(t, e);
                  t.slideTo(a || 0, s, t.params.runCallbacksOnInit, !0)
               }
               t.params.hashNavigation.watchState && d.addEventListener("hashchange", c)
            }
            )()
         }
         )),
            n("destroy", (() => {
               t.params.hashNavigation.enabled && t.params.hashNavigation.watchState && d.removeEventListener("hashchange", c)
            }
            )),
            n("transitionEnd _freeModeNoMomentumRelease", (() => {
               l && p()
            }
            )),
            n("slideChange", (() => {
               l && t.params.cssMode && p()
            }
            ))
      }
      , function (e) {
         let t, s, { swiper: i, extendParams: r, on: n, emit: l, params: o } = e;
         i.autoplay = {
            running: !1,
            paused: !1,
            timeLeft: 0
         },
            r({
               autoplay: {
                  enabled: !1,
                  delay: 3e3,
                  waitForTransition: !0,
                  disableOnInteraction: !0,
                  stopOnLastSlide: !1,
                  reverseDirection: !1,
                  pauseOnMouseEnter: !1
               }
            });
         let d, c, p, u, m, h, f, g = o && o.autoplay ? o.autoplay.delay : 3e3, v = o && o.autoplay ? o.autoplay.delay : 3e3, w = (new Date).getTime;
         function b(e) {
            i && !i.destroyed && i.wrapperEl && e.target === i.wrapperEl && (i.wrapperEl.removeEventListener("transitionend", b),
               M())
         }
         const y = () => {
            if (i.destroyed || !i.autoplay.running)
               return;
            i.autoplay.paused ? c = !0 : c && (v = d,
               c = !1);
            const e = i.autoplay.paused ? d : w + v - (new Date).getTime();
            i.autoplay.timeLeft = e,
               l("autoplayTimeLeft", e, e / g),
               s = requestAnimationFrame((() => {
                  y()
               }
               ))
         }
            , E = e => {
               if (i.destroyed || !i.autoplay.running)
                  return;
               cancelAnimationFrame(s),
                  y();
               let a = void 0 === e ? i.params.autoplay.delay : e;
               g = i.params.autoplay.delay,
                  v = i.params.autoplay.delay;
               const r = (() => {
                  let e;
                  if (e = i.virtual && i.params.virtual.enabled ? i.slides.filter((e => e.classList.contains("swiper-slide-active")))[0] : i.slides[i.activeIndex],
                     !e)
                     return;
                  return parseInt(e.getAttribute("data-swiper-autoplay"), 10)
               }
               )();
               !Number.isNaN(r) && r > 0 && void 0 === e && (a = r,
                  g = r,
                  v = r),
                  d = a;
               const n = i.params.speed
                  , o = () => {
                     i && !i.destroyed && (i.params.autoplay.reverseDirection ? !i.isBeginning || i.params.loop || i.params.rewind ? (i.slidePrev(n, !0, !0),
                        l("autoplay")) : i.params.autoplay.stopOnLastSlide || (i.slideTo(i.slides.length - 1, n, !0, !0),
                           l("autoplay")) : !i.isEnd || i.params.loop || i.params.rewind ? (i.slideNext(n, !0, !0),
                              l("autoplay")) : i.params.autoplay.stopOnLastSlide || (i.slideTo(0, n, !0, !0),
                                 l("autoplay")),
                        i.params.cssMode && (w = (new Date).getTime(),
                           requestAnimationFrame((() => {
                              E()
                           }
                           ))))
                  }
                  ;
               return a > 0 ? (clearTimeout(t),
                  t = setTimeout((() => {
                     o()
                  }
                  ), a)) : requestAnimationFrame((() => {
                     o()
                  }
                  )),
                  a
            }
            , x = () => {
               i.autoplay.running = !0,
                  E(),
                  l("autoplayStart")
            }
            , S = () => {
               i.autoplay.running = !1,
                  clearTimeout(t),
                  cancelAnimationFrame(s),
                  l("autoplayStop")
            }
            , T = (e, s) => {
               if (i.destroyed || !i.autoplay.running)
                  return;
               clearTimeout(t),
                  e || (f = !0);
               const a = () => {
                  l("autoplayPause"),
                     i.params.autoplay.waitForTransition ? i.wrapperEl.addEventListener("transitionend", b) : M()
               }
                  ;
               if (i.autoplay.paused = !0,
                  s)
                  return h && (d = i.params.autoplay.delay),
                     h = !1,
                     void a();
               const r = d || i.params.autoplay.delay;
               d = r - ((new Date).getTime() - w),
                  i.isEnd && d < 0 && !i.params.loop || (d < 0 && (d = 0),
                     a())
            }
            , M = () => {
               i.isEnd && d < 0 && !i.params.loop || i.destroyed || !i.autoplay.running || (w = (new Date).getTime(),
                  f ? (f = !1,
                     E(d)) : E(),
                  i.autoplay.paused = !1,
                  l("autoplayResume"))
            }
            , C = () => {
               if (i.destroyed || !i.autoplay.running)
                  return;
               const e = a();
               "hidden" === e.visibilityState && (f = !0,
                  T(!0)),
                  "visible" === e.visibilityState && M()
            }
            , P = e => {
               "mouse" === e.pointerType && (f = !0,
                  i.animating || i.autoplay.paused || T(!0))
            }
            , L = e => {
               "mouse" === e.pointerType && i.autoplay.paused && M()
            }
            ;
         n("init", (() => {
            i.params.autoplay.enabled && (i.params.autoplay.pauseOnMouseEnter && (i.el.addEventListener("pointerenter", P),
               i.el.addEventListener("pointerleave", L)),
               a().addEventListener("visibilitychange", C),
               w = (new Date).getTime(),
               x())
         }
         )),
            n("destroy", (() => {
               i.el.removeEventListener("pointerenter", P),
                  i.el.removeEventListener("pointerleave", L),
                  a().removeEventListener("visibilitychange", C),
                  i.autoplay.running && S()
            }
            )),
            n("beforeTransitionStart", ((e, t, s) => {
               !i.destroyed && i.autoplay.running && (s || !i.params.autoplay.disableOnInteraction ? T(!0, !0) : S())
            }
            )),
            n("sliderFirstMove", (() => {
               !i.destroyed && i.autoplay.running && (i.params.autoplay.disableOnInteraction ? S() : (p = !0,
                  u = !1,
                  f = !1,
                  m = setTimeout((() => {
                     f = !0,
                        u = !0,
                        T(!0)
                  }
                  ), 200)))
            }
            )),
            n("touchEnd", (() => {
               if (!i.destroyed && i.autoplay.running && p) {
                  if (clearTimeout(m),
                     clearTimeout(t),
                     i.params.autoplay.disableOnInteraction)
                     return u = !1,
                        void (p = !1);
                  u && i.params.cssMode && M(),
                     u = !1,
                     p = !1
               }
            }
            )),
            n("slideChange", (() => {
               !i.destroyed && i.autoplay.running && (h = !0)
            }
            )),
            Object.assign(i.autoplay, {
               start: x,
               stop: S,
               pause: T,
               resume: M
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: i } = e;
         s({
            thumbs: {
               swiper: null,
               multipleActiveThumbs: !0,
               autoScrollOffset: 0,
               slideThumbActiveClass: "swiper-slide-thumb-active",
               thumbsContainerClass: "swiper-thumbs"
            }
         });
         let r = !1
            , n = !1;
         function l() {
            const e = t.thumbs.swiper;
            if (!e || e.destroyed)
               return;
            const s = e.clickedIndex
               , a = e.clickedSlide;
            if (a && a.classList.contains(t.params.thumbs.slideThumbActiveClass))
               return;
            if (null == s)
               return;
            let i;
            i = e.params.loop ? parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10) : s,
               t.params.loop ? t.slideToLoop(i) : t.slideTo(i)
         }
         function o() {
            const { thumbs: e } = t.params;
            if (r)
               return !1;
            r = !0;
            const s = t.constructor;
            if (e.swiper instanceof s)
               t.thumbs.swiper = e.swiper,
                  Object.assign(t.thumbs.swiper.originalParams, {
                     watchSlidesProgress: !0,
                     slideToClickedSlide: !1
                  }),
                  Object.assign(t.thumbs.swiper.params, {
                     watchSlidesProgress: !0,
                     slideToClickedSlide: !1
                  }),
                  t.thumbs.swiper.update();
            else if (d(e.swiper)) {
               const a = Object.assign({}, e.swiper);
               Object.assign(a, {
                  watchSlidesProgress: !0,
                  slideToClickedSlide: !1
               }),
                  t.thumbs.swiper = new s(a),
                  n = !0
            }
            return t.thumbs.swiper.el.classList.add(t.params.thumbs.thumbsContainerClass),
               t.thumbs.swiper.on("tap", l),
               !0
         }
         function c(e) {
            const s = t.thumbs.swiper;
            if (!s || s.destroyed)
               return;
            const a = "auto" === s.params.slidesPerView ? s.slidesPerViewDynamic() : s.params.slidesPerView;
            let i = 1;
            const r = t.params.thumbs.slideThumbActiveClass;
            if (t.params.slidesPerView > 1 && !t.params.centeredSlides && (i = t.params.slidesPerView),
               t.params.thumbs.multipleActiveThumbs || (i = 1),
               i = Math.floor(i),
               s.slides.forEach((e => e.classList.remove(r))),
               s.params.loop || s.params.virtual && s.params.virtual.enabled)
               for (let e = 0; e < i; e += 1)
                  h(s.slidesEl, `[data-swiper-slide-index="${t.realIndex + e}"]`).forEach((e => {
                     e.classList.add(r)
                  }
                  ));
            else
               for (let e = 0; e < i; e += 1)
                  s.slides[t.realIndex + e] && s.slides[t.realIndex + e].classList.add(r);
            const n = t.params.thumbs.autoScrollOffset
               , l = n && !s.params.loop;
            if (t.realIndex !== s.realIndex || l) {
               const i = s.activeIndex;
               let r, o;
               if (s.params.loop) {
                  const e = s.slides.filter((e => e.getAttribute("data-swiper-slide-index") === `${t.realIndex}`))[0];
                  r = s.slides.indexOf(e),
                     o = t.activeIndex > t.previousIndex ? "next" : "prev"
               } else
                  r = t.realIndex,
                     o = r > t.previousIndex ? "next" : "prev";
               l && (r += "next" === o ? n : -1 * n),
                  s.visibleSlidesIndexes && s.visibleSlidesIndexes.indexOf(r) < 0 && (s.params.centeredSlides ? r = r > i ? r - Math.floor(a / 2) + 1 : r + Math.floor(a / 2) - 1 : r > i && s.params.slidesPerGroup,
                     s.slideTo(r, e ? 0 : void 0))
            }
         }
         t.thumbs = {
            swiper: null
         },
            i("beforeInit", (() => {
               const { thumbs: e } = t.params;
               if (e && e.swiper)
                  if ("string" == typeof e.swiper || e.swiper instanceof HTMLElement) {
                     const s = a()
                        , i = () => {
                           const a = "string" == typeof e.swiper ? s.querySelector(e.swiper) : e.swiper;
                           if (a && a.swiper)
                              e.swiper = a.swiper,
                                 o(),
                                 c(!0);
                           else if (a) {
                              const s = i => {
                                 e.swiper = i.detail[0],
                                    a.removeEventListener("init", s),
                                    o(),
                                    c(!0),
                                    e.swiper.update(),
                                    t.update()
                              }
                                 ;
                              a.addEventListener("init", s)
                           }
                           return a
                        }
                        , r = () => {
                           if (t.destroyed)
                              return;
                           i() || requestAnimationFrame(r)
                        }
                        ;
                     requestAnimationFrame(r)
                  } else
                     o(),
                        c(!0)
            }
            )),
            i("slideChange update resize observerUpdate", (() => {
               c()
            }
            )),
            i("setTransition", ((e, s) => {
               const a = t.thumbs.swiper;
               a && !a.destroyed && a.setTransition(s)
            }
            )),
            i("beforeDestroy", (() => {
               const e = t.thumbs.swiper;
               e && !e.destroyed && n && e.destroy()
            }
            )),
            Object.assign(t.thumbs, {
               init: o,
               update: c
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, emit: a, once: i } = e;
         s({
            freeMode: {
               enabled: !1,
               momentum: !0,
               momentumRatio: 1,
               momentumBounce: !0,
               momentumBounceRatio: 1,
               momentumVelocityRatio: 1,
               sticky: !1,
               minimumVelocity: .02
            }
         }),
            Object.assign(t, {
               freeMode: {
                  onTouchStart: function () {
                     if (t.params.cssMode)
                        return;
                     const e = t.getTranslate();
                     t.setTranslate(e),
                        t.setTransition(0),
                        t.touchEventsData.velocities.length = 0,
                        t.freeMode.onTouchEnd({
                           currentPos: t.rtl ? t.translate : -t.translate
                        })
                  },
                  onTouchMove: function () {
                     if (t.params.cssMode)
                        return;
                     const { touchEventsData: e, touches: s } = t;
                     0 === e.velocities.length && e.velocities.push({
                        position: s[t.isHorizontal() ? "startX" : "startY"],
                        time: e.touchStartTime
                     }),
                        e.velocities.push({
                           position: s[t.isHorizontal() ? "currentX" : "currentY"],
                           time: l()
                        })
                  },
                  onTouchEnd: function (e) {
                     let { currentPos: s } = e;
                     if (t.params.cssMode)
                        return;
                     const { params: r, wrapperEl: n, rtlTranslate: o, snapGrid: d, touchEventsData: c } = t
                        , p = l() - c.touchStartTime;
                     if (s < -t.minTranslate())
                        t.slideTo(t.activeIndex);
                     else if (s > -t.maxTranslate())
                        t.slides.length < d.length ? t.slideTo(d.length - 1) : t.slideTo(t.slides.length - 1);
                     else {
                        if (r.freeMode.momentum) {
                           if (c.velocities.length > 1) {
                              const e = c.velocities.pop()
                                 , s = c.velocities.pop()
                                 , a = e.position - s.position
                                 , i = e.time - s.time;
                              t.velocity = a / i,
                                 t.velocity /= 2,
                                 Math.abs(t.velocity) < r.freeMode.minimumVelocity && (t.velocity = 0),
                                 (i > 150 || l() - e.time > 300) && (t.velocity = 0)
                           } else
                              t.velocity = 0;
                           t.velocity *= r.freeMode.momentumVelocityRatio,
                              c.velocities.length = 0;
                           let e = 1e3 * r.freeMode.momentumRatio;
                           const s = t.velocity * e;
                           let p = t.translate + s;
                           o && (p = -p);
                           let u, m = !1;
                           const h = 20 * Math.abs(t.velocity) * r.freeMode.momentumBounceRatio;
                           let f;
                           if (p < t.maxTranslate())
                              r.freeMode.momentumBounce ? (p + t.maxTranslate() < -h && (p = t.maxTranslate() - h),
                                 u = t.maxTranslate(),
                                 m = !0,
                                 c.allowMomentumBounce = !0) : p = t.maxTranslate(),
                                 r.loop && r.centeredSlides && (f = !0);
                           else if (p > t.minTranslate())
                              r.freeMode.momentumBounce ? (p - t.minTranslate() > h && (p = t.minTranslate() + h),
                                 u = t.minTranslate(),
                                 m = !0,
                                 c.allowMomentumBounce = !0) : p = t.minTranslate(),
                                 r.loop && r.centeredSlides && (f = !0);
                           else if (r.freeMode.sticky) {
                              let e;
                              for (let t = 0; t < d.length; t += 1)
                                 if (d[t] > -p) {
                                    e = t;
                                    break
                                 }
                              p = Math.abs(d[e] - p) < Math.abs(d[e - 1] - p) || "next" === t.swipeDirection ? d[e] : d[e - 1],
                                 p = -p
                           }
                           if (f && i("transitionEnd", (() => {
                              t.loopFix()
                           }
                           )),
                              0 !== t.velocity) {
                              if (e = o ? Math.abs((-p - t.translate) / t.velocity) : Math.abs((p - t.translate) / t.velocity),
                                 r.freeMode.sticky) {
                                 const s = Math.abs((o ? -p : p) - t.translate)
                                    , a = t.slidesSizesGrid[t.activeIndex];
                                 e = s < a ? r.speed : s < 2 * a ? 1.5 * r.speed : 2.5 * r.speed
                              }
                           } else if (r.freeMode.sticky)
                              return void t.slideToClosest();
                           r.freeMode.momentumBounce && m ? (t.updateProgress(u),
                              t.setTransition(e),
                              t.setTranslate(p),
                              t.transitionStart(!0, t.swipeDirection),
                              t.animating = !0,
                              y(n, (() => {
                                 t && !t.destroyed && c.allowMomentumBounce && (a("momentumBounce"),
                                    t.setTransition(r.speed),
                                    setTimeout((() => {
                                       t.setTranslate(u),
                                          y(n, (() => {
                                             t && !t.destroyed && t.transitionEnd()
                                          }
                                          ))
                                    }
                                    ), 0))
                              }
                              ))) : t.velocity ? (a("_freeModeNoMomentumRelease"),
                                 t.updateProgress(p),
                                 t.setTransition(e),
                                 t.setTranslate(p),
                                 t.transitionStart(!0, t.swipeDirection),
                                 t.animating || (t.animating = !0,
                                    y(n, (() => {
                                       t && !t.destroyed && t.transitionEnd()
                                    }
                                    )))) : t.updateProgress(p),
                              t.updateActiveIndex(),
                              t.updateSlidesClasses()
                        } else {
                           if (r.freeMode.sticky)
                              return void t.slideToClosest();
                           r.freeMode && a("_freeModeNoMomentumRelease")
                        }
                        (!r.freeMode.momentum || p >= r.longSwipesMs) && (t.updateProgress(),
                           t.updateActiveIndex(),
                           t.updateSlidesClasses())
                     }
                  }
               }
            })
      }
      , function (e) {
         let t, s, a, i, { swiper: r, extendParams: n, on: l } = e;
         n({
            grid: {
               rows: 1,
               fill: "column"
            }
         });
         const o = () => {
            let e = r.params.spaceBetween;
            return "string" == typeof e && e.indexOf("%") >= 0 ? e = parseFloat(e.replace("%", "")) / 100 * r.size : "string" == typeof e && (e = parseFloat(e)),
               e
         }
            ;
         l("init", (() => {
            i = r.params.grid && r.params.grid.rows > 1
         }
         )),
            l("update", (() => {
               const { params: e, el: t } = r
                  , s = e.grid && e.grid.rows > 1;
               i && !s ? (t.classList.remove(`${e.containerModifierClass}grid`, `${e.containerModifierClass}grid-column`),
                  a = 1,
                  r.emitContainerClasses()) : !i && s && (t.classList.add(`${e.containerModifierClass}grid`),
                     "column" === e.grid.fill && t.classList.add(`${e.containerModifierClass}grid-column`),
                     r.emitContainerClasses()),
                  i = s
            }
            )),
            r.grid = {
               initSlides: e => {
                  const { slidesPerView: i } = r.params
                     , { rows: n, fill: l } = r.params.grid;
                  a = Math.floor(e / n),
                     t = Math.floor(e / n) === e / n ? e : Math.ceil(e / n) * n,
                     "auto" !== i && "row" === l && (t = Math.max(t, i * n)),
                     s = t / n
               }
               ,
               updateSlide: (e, i, n, l) => {
                  const { slidesPerGroup: d } = r.params
                     , c = o()
                     , { rows: p, fill: u } = r.params.grid;
                  let m, h, f;
                  if ("row" === u && d > 1) {
                     const s = Math.floor(e / (d * p))
                        , a = e - p * d * s
                        , r = 0 === s ? d : Math.min(Math.ceil((n - s * p * d) / p), d);
                     f = Math.floor(a / r),
                        h = a - f * r + s * d,
                        m = h + f * t / p,
                        i.style.order = m
                  } else
                     "column" === u ? (h = Math.floor(e / p),
                        f = e - h * p,
                        (h > a || h === a && f === p - 1) && (f += 1,
                           f >= p && (f = 0,
                              h += 1))) : (f = Math.floor(e / s),
                                 h = e - f * s);
                  i.row = f,
                     i.column = h,
                     i.style[l("margin-top")] = 0 !== f ? c && `${c}px` : ""
               }
               ,
               updateWrapperSize: (e, s, a) => {
                  const { centeredSlides: i, roundLengths: n } = r.params
                     , l = o()
                     , { rows: d } = r.params.grid;
                  if (r.virtualSize = (e + l) * t,
                     r.virtualSize = Math.ceil(r.virtualSize / d) - l,
                     r.wrapperEl.style[a("width")] = `${r.virtualSize + l}px`,
                     i) {
                     const e = [];
                     for (let t = 0; t < s.length; t += 1) {
                        let a = s[t];
                        n && (a = Math.floor(a)),
                           s[t] < r.virtualSize + s[0] && e.push(a)
                     }
                     s.splice(0, s.length),
                        s.push(...e)
                  }
               }
            }
      }
      , function (e) {
         let { swiper: t } = e;
         Object.assign(t, {
            appendSlide: te.bind(t),
            prependSlide: se.bind(t),
            addSlide: ae.bind(t),
            removeSlide: ie.bind(t),
            removeAllSlides: re.bind(t)
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            fadeEffect: {
               crossFade: !1
            }
         }),
            ne({
               effect: "fade",
               swiper: t,
               on: a,
               setTranslate: () => {
                  const { slides: e } = t;
                  t.params.fadeEffect;
                  for (let s = 0; s < e.length; s += 1) {
                     const e = t.slides[s];
                     let a = -e.swiperSlideOffset;
                     t.params.virtualTranslate || (a -= t.translate);
                     let i = 0;
                     t.isHorizontal() || (i = a,
                        a = 0);
                     const r = t.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(e.progress), 0) : 1 + Math.min(Math.max(e.progress, -1), 0)
                        , n = le(0, e);
                     n.style.opacity = r,
                        n.style.transform = `translate3d(${a}px, ${i}px, 0px)`
                  }
               }
               ,
               setTransition: e => {
                  const s = t.slides.map((e => m(e)));
                  s.forEach((t => {
                     t.style.transitionDuration = `${e}ms`
                  }
                  )),
                     oe({
                        swiper: t,
                        duration: e,
                        transformElements: s,
                        allSlides: !0
                     })
               }
               ,
               overwriteParams: () => ({
                  slidesPerView: 1,
                  slidesPerGroup: 1,
                  watchSlidesProgress: !0,
                  spaceBetween: 0,
                  virtualTranslate: !t.params.cssMode
               })
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            cubeEffect: {
               slideShadows: !0,
               shadow: !0,
               shadowOffset: 20,
               shadowScale: .94
            }
         });
         const i = (e, t, s) => {
            let a = s ? e.querySelector(".swiper-slide-shadow-left") : e.querySelector(".swiper-slide-shadow-top")
               , i = s ? e.querySelector(".swiper-slide-shadow-right") : e.querySelector(".swiper-slide-shadow-bottom");
            a || (a = f("div", ("swiper-slide-shadow-cube swiper-slide-shadow-" + (s ? "left" : "top")).split(" ")),
               e.append(a)),
               i || (i = f("div", ("swiper-slide-shadow-cube swiper-slide-shadow-" + (s ? "right" : "bottom")).split(" ")),
                  e.append(i)),
               a && (a.style.opacity = Math.max(-t, 0)),
               i && (i.style.opacity = Math.max(t, 0))
         }
            ;
         ne({
            effect: "cube",
            swiper: t,
            on: a,
            setTranslate: () => {
               const { el: e, wrapperEl: s, slides: a, width: r, height: n, rtlTranslate: l, size: o, browser: d } = t
                  , c = t.params.cubeEffect
                  , p = t.isHorizontal()
                  , u = t.virtual && t.params.virtual.enabled;
               let m, h = 0;
               c.shadow && (p ? (m = t.wrapperEl.querySelector(".swiper-cube-shadow"),
                  m || (m = f("div", "swiper-cube-shadow"),
                     t.wrapperEl.append(m)),
                  m.style.height = `${r}px`) : (m = e.querySelector(".swiper-cube-shadow"),
                     m || (m = f("div", "swiper-cube-shadow"),
                        e.append(m))));
               for (let e = 0; e < a.length; e += 1) {
                  const t = a[e];
                  let s = e;
                  u && (s = parseInt(t.getAttribute("data-swiper-slide-index"), 10));
                  let r = 90 * s
                     , n = Math.floor(r / 360);
                  l && (r = -r,
                     n = Math.floor(-r / 360));
                  const d = Math.max(Math.min(t.progress, 1), -1);
                  let m = 0
                     , f = 0
                     , g = 0;
                  s % 4 == 0 ? (m = 4 * -n * o,
                     g = 0) : (s - 1) % 4 == 0 ? (m = 0,
                        g = 4 * -n * o) : (s - 2) % 4 == 0 ? (m = o + 4 * n * o,
                           g = o) : (s - 3) % 4 == 0 && (m = -o,
                              g = 3 * o + 4 * o * n),
                     l && (m = -m),
                     p || (f = m,
                        m = 0);
                  const v = `rotateX(${p ? 0 : -r}deg) rotateY(${p ? r : 0}deg) translate3d(${m}px, ${f}px, ${g}px)`;
                  d <= 1 && d > -1 && (h = 90 * s + 90 * d,
                     l && (h = 90 * -s - 90 * d)),
                     t.style.transform = v,
                     c.slideShadows && i(t, d, p)
               }
               if (s.style.transformOrigin = `50% 50% -${o / 2}px`,
                  s.style["-webkit-transform-origin"] = `50% 50% -${o / 2}px`,
                  c.shadow)
                  if (p)
                     m.style.transform = `translate3d(0px, ${r / 2 + c.shadowOffset}px, ${-r / 2}px) rotateX(90deg) rotateZ(0deg) scale(${c.shadowScale})`;
                  else {
                     const e = Math.abs(h) - 90 * Math.floor(Math.abs(h) / 90)
                        , t = 1.5 - (Math.sin(2 * e * Math.PI / 360) / 2 + Math.cos(2 * e * Math.PI / 360) / 2)
                        , s = c.shadowScale
                        , a = c.shadowScale / t
                        , i = c.shadowOffset;
                     m.style.transform = `scale3d(${s}, 1, ${a}) translate3d(0px, ${n / 2 + i}px, ${-n / 2 / a}px) rotateX(-90deg)`
                  }
               const g = (d.isSafari || d.isWebView) && d.needPerspectiveFix ? -o / 2 : 0;
               s.style.transform = `translate3d(0px,0,${g}px) rotateX(${t.isHorizontal() ? 0 : h}deg) rotateY(${t.isHorizontal() ? -h : 0}deg)`,
                  s.style.setProperty("--swiper-cube-translate-z", `${g}px`)
            }
            ,
            setTransition: e => {
               const { el: s, slides: a } = t;
               if (a.forEach((t => {
                  t.style.transitionDuration = `${e}ms`,
                     t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t => {
                        t.style.transitionDuration = `${e}ms`
                     }
                     ))
               }
               )),
                  t.params.cubeEffect.shadow && !t.isHorizontal()) {
                  const t = s.querySelector(".swiper-cube-shadow");
                  t && (t.style.transitionDuration = `${e}ms`)
               }
            }
            ,
            recreateShadows: () => {
               const e = t.isHorizontal();
               t.slides.forEach((t => {
                  const s = Math.max(Math.min(t.progress, 1), -1);
                  i(t, s, e)
               }
               ))
            }
            ,
            getEffectParams: () => t.params.cubeEffect,
            perspective: () => !0,
            overwriteParams: () => ({
               slidesPerView: 1,
               slidesPerGroup: 1,
               watchSlidesProgress: !0,
               resistanceRatio: 0,
               spaceBetween: 0,
               centeredSlides: !1,
               virtualTranslate: !0
            })
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            flipEffect: {
               slideShadows: !0,
               limitRotation: !0
            }
         });
         const i = (e, s) => {
            let a = t.isHorizontal() ? e.querySelector(".swiper-slide-shadow-left") : e.querySelector(".swiper-slide-shadow-top")
               , i = t.isHorizontal() ? e.querySelector(".swiper-slide-shadow-right") : e.querySelector(".swiper-slide-shadow-bottom");
            a || (a = de("flip", e, t.isHorizontal() ? "left" : "top")),
               i || (i = de("flip", e, t.isHorizontal() ? "right" : "bottom")),
               a && (a.style.opacity = Math.max(-s, 0)),
               i && (i.style.opacity = Math.max(s, 0))
         }
            ;
         ne({
            effect: "flip",
            swiper: t,
            on: a,
            setTranslate: () => {
               const { slides: e, rtlTranslate: s } = t
                  , a = t.params.flipEffect;
               for (let r = 0; r < e.length; r += 1) {
                  const n = e[r];
                  let l = n.progress;
                  t.params.flipEffect.limitRotation && (l = Math.max(Math.min(n.progress, 1), -1));
                  const o = n.swiperSlideOffset;
                  let d = -180 * l
                     , c = 0
                     , p = t.params.cssMode ? -o - t.translate : -o
                     , u = 0;
                  t.isHorizontal() ? s && (d = -d) : (u = p,
                     p = 0,
                     c = -d,
                     d = 0),
                     n.style.zIndex = -Math.abs(Math.round(l)) + e.length,
                     a.slideShadows && i(n, l);
                  const m = `translate3d(${p}px, ${u}px, 0px) rotateX(${c}deg) rotateY(${d}deg)`;
                  le(0, n).style.transform = m
               }
            }
            ,
            setTransition: e => {
               const s = t.slides.map((e => m(e)));
               s.forEach((t => {
                  t.style.transitionDuration = `${e}ms`,
                     t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t => {
                        t.style.transitionDuration = `${e}ms`
                     }
                     ))
               }
               )),
                  oe({
                     swiper: t,
                     duration: e,
                     transformElements: s
                  })
            }
            ,
            recreateShadows: () => {
               t.params.flipEffect,
                  t.slides.forEach((e => {
                     let s = e.progress;
                     t.params.flipEffect.limitRotation && (s = Math.max(Math.min(e.progress, 1), -1)),
                        i(e, s)
                  }
                  ))
            }
            ,
            getEffectParams: () => t.params.flipEffect,
            perspective: () => !0,
            overwriteParams: () => ({
               slidesPerView: 1,
               slidesPerGroup: 1,
               watchSlidesProgress: !0,
               spaceBetween: 0,
               virtualTranslate: !t.params.cssMode
            })
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            coverflowEffect: {
               rotate: 50,
               stretch: 0,
               depth: 100,
               scale: 1,
               modifier: 1,
               slideShadows: !0
            }
         }),
            ne({
               effect: "coverflow",
               swiper: t,
               on: a,
               setTranslate: () => {
                  const { width: e, height: s, slides: a, slidesSizesGrid: i } = t
                     , r = t.params.coverflowEffect
                     , n = t.isHorizontal()
                     , l = t.translate
                     , o = n ? e / 2 - l : s / 2 - l
                     , d = n ? r.rotate : -r.rotate
                     , c = r.depth;
                  for (let e = 0, t = a.length; e < t; e += 1) {
                     const t = a[e]
                        , s = i[e]
                        , l = (o - t.swiperSlideOffset - s / 2) / s
                        , p = "function" == typeof r.modifier ? r.modifier(l) : l * r.modifier;
                     let u = n ? d * p : 0
                        , m = n ? 0 : d * p
                        , h = -c * Math.abs(p)
                        , f = r.stretch;
                     "string" == typeof f && -1 !== f.indexOf("%") && (f = parseFloat(r.stretch) / 100 * s);
                     let g = n ? 0 : f * p
                        , v = n ? f * p : 0
                        , w = 1 - (1 - r.scale) * Math.abs(p);
                     Math.abs(v) < .001 && (v = 0),
                        Math.abs(g) < .001 && (g = 0),
                        Math.abs(h) < .001 && (h = 0),
                        Math.abs(u) < .001 && (u = 0),
                        Math.abs(m) < .001 && (m = 0),
                        Math.abs(w) < .001 && (w = 0);
                     const b = `translate3d(${v}px,${g}px,${h}px)  rotateX(${m}deg) rotateY(${u}deg) scale(${w})`;
                     if (le(0, t).style.transform = b,
                        t.style.zIndex = 1 - Math.abs(Math.round(p)),
                        r.slideShadows) {
                        let e = n ? t.querySelector(".swiper-slide-shadow-left") : t.querySelector(".swiper-slide-shadow-top")
                           , s = n ? t.querySelector(".swiper-slide-shadow-right") : t.querySelector(".swiper-slide-shadow-bottom");
                        e || (e = de("coverflow", t, n ? "left" : "top")),
                           s || (s = de("coverflow", t, n ? "right" : "bottom")),
                           e && (e.style.opacity = p > 0 ? p : 0),
                           s && (s.style.opacity = -p > 0 ? -p : 0)
                     }
                  }
               }
               ,
               setTransition: e => {
                  t.slides.map((e => m(e))).forEach((t => {
                     t.style.transitionDuration = `${e}ms`,
                        t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t => {
                           t.style.transitionDuration = `${e}ms`
                        }
                        ))
                  }
                  ))
               }
               ,
               perspective: () => !0,
               overwriteParams: () => ({
                  watchSlidesProgress: !0
               })
            })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            creativeEffect: {
               limitProgress: 1,
               shadowPerProgress: !1,
               progressMultiplier: 1,
               perspective: !0,
               prev: {
                  translate: [0, 0, 0],
                  rotate: [0, 0, 0],
                  opacity: 1,
                  scale: 1
               },
               next: {
                  translate: [0, 0, 0],
                  rotate: [0, 0, 0],
                  opacity: 1,
                  scale: 1
               }
            }
         });
         const i = e => "string" == typeof e ? e : `${e}px`;
         ne({
            effect: "creative",
            swiper: t,
            on: a,
            setTranslate: () => {
               const { slides: e, wrapperEl: s, slidesSizesGrid: a } = t
                  , r = t.params.creativeEffect
                  , { progressMultiplier: n } = r
                  , l = t.params.centeredSlides;
               if (l) {
                  const e = a[0] / 2 - t.params.slidesOffsetBefore || 0;
                  s.style.transform = `translateX(calc(50% - ${e}px))`
               }
               for (let s = 0; s < e.length; s += 1) {
                  const a = e[s]
                     , o = a.progress
                     , d = Math.min(Math.max(a.progress, -r.limitProgress), r.limitProgress);
                  let c = d;
                  l || (c = Math.min(Math.max(a.originalProgress, -r.limitProgress), r.limitProgress));
                  const p = a.swiperSlideOffset
                     , u = [t.params.cssMode ? -p - t.translate : -p, 0, 0]
                     , m = [0, 0, 0];
                  let h = !1;
                  t.isHorizontal() || (u[1] = u[0],
                     u[0] = 0);
                  let f = {
                     translate: [0, 0, 0],
                     rotate: [0, 0, 0],
                     scale: 1,
                     opacity: 1
                  };
                  d < 0 ? (f = r.next,
                     h = !0) : d > 0 && (f = r.prev,
                        h = !0),
                     u.forEach(((e, t) => {
                        u[t] = `calc(${e}px + (${i(f.translate[t])} * ${Math.abs(d * n)}))`
                     }
                     )),
                     m.forEach(((e, t) => {
                        m[t] = f.rotate[t] * Math.abs(d * n)
                     }
                     )),
                     a.style.zIndex = -Math.abs(Math.round(o)) + e.length;
                  const g = u.join(", ")
                     , v = `rotateX(${m[0]}deg) rotateY(${m[1]}deg) rotateZ(${m[2]}deg)`
                     , w = c < 0 ? `scale(${1 + (1 - f.scale) * c * n})` : `scale(${1 - (1 - f.scale) * c * n})`
                     , b = c < 0 ? 1 + (1 - f.opacity) * c * n : 1 - (1 - f.opacity) * c * n
                     , y = `translate3d(${g}) ${v} ${w}`;
                  if (h && f.shadow || !h) {
                     let e = a.querySelector(".swiper-slide-shadow");
                     if (!e && f.shadow && (e = de("creative", a)),
                        e) {
                        const t = r.shadowPerProgress ? d * (1 / r.limitProgress) : d;
                        e.style.opacity = Math.min(Math.max(Math.abs(t), 0), 1)
                     }
                  }
                  const E = le(0, a);
                  E.style.transform = y,
                     E.style.opacity = b,
                     f.origin && (E.style.transformOrigin = f.origin)
               }
            }
            ,
            setTransition: e => {
               const s = t.slides.map((e => m(e)));
               s.forEach((t => {
                  t.style.transitionDuration = `${e}ms`,
                     t.querySelectorAll(".swiper-slide-shadow").forEach((t => {
                        t.style.transitionDuration = `${e}ms`
                     }
                     ))
               }
               )),
                  oe({
                     swiper: t,
                     duration: e,
                     transformElements: s,
                     allSlides: !0
                  })
            }
            ,
            perspective: () => t.params.creativeEffect.perspective,
            overwriteParams: () => ({
               watchSlidesProgress: !0,
               virtualTranslate: !t.params.cssMode
            })
         })
      }
      , function (e) {
         let { swiper: t, extendParams: s, on: a } = e;
         s({
            cardsEffect: {
               slideShadows: !0,
               rotate: !0,
               perSlideRotate: 2,
               perSlideOffset: 8
            }
         }),
            ne({
               effect: "cards",
               swiper: t,
               on: a,
               setTranslate: () => {
                  const { slides: e, activeIndex: s, rtlTranslate: a } = t
                     , i = t.params.cardsEffect
                     , { startTranslate: r, isTouched: n } = t.touchEventsData
                     , l = a ? -t.translate : t.translate;
                  for (let o = 0; o < e.length; o += 1) {
                     const d = e[o]
                        , c = d.progress
                        , p = Math.min(Math.max(c, -4), 4);
                     let u = d.swiperSlideOffset;
                     t.params.centeredSlides && !t.params.cssMode && (t.wrapperEl.style.transform = `translateX(${t.minTranslate()}px)`),
                        t.params.centeredSlides && t.params.cssMode && (u -= e[0].swiperSlideOffset);
                     let m = t.params.cssMode ? -u - t.translate : -u
                        , h = 0;
                     const f = -100 * Math.abs(p);
                     let g = 1
                        , v = -i.perSlideRotate * p
                        , w = i.perSlideOffset - .75 * Math.abs(p);
                     const b = t.virtual && t.params.virtual.enabled ? t.virtual.from + o : o
                        , y = (b === s || b === s - 1) && p > 0 && p < 1 && (n || t.params.cssMode) && l < r
                        , E = (b === s || b === s + 1) && p < 0 && p > -1 && (n || t.params.cssMode) && l > r;
                     if (y || E) {
                        const e = (1 - Math.abs((Math.abs(p) - .5) / .5)) ** .5;
                        v += -28 * p * e,
                           g += -.5 * e,
                           w += 96 * e,
                           h = -25 * e * Math.abs(p) + "%"
                     }
                     if (m = p < 0 ? `calc(${m}px ${a ? "-" : "+"} (${w * Math.abs(p)}%))` : p > 0 ? `calc(${m}px ${a ? "-" : "+"} (-${w * Math.abs(p)}%))` : `${m}px`,
                        !t.isHorizontal()) {
                        const e = h;
                        h = m,
                           m = e
                     }
                     const x = p < 0 ? "" + (1 + (1 - g) * p) : "" + (1 - (1 - g) * p)
                        , S = `\n        translate3d(${m}, ${h}, ${f}px)\n        rotateZ(${i.rotate ? a ? -v : v : 0}deg)\n        scale(${x})\n      `;
                     if (i.slideShadows) {
                        let e = d.querySelector(".swiper-slide-shadow");
                        e || (e = de("cards", d)),
                           e && (e.style.opacity = Math.min(Math.max((Math.abs(p) - .5) / .5, 0), 1))
                     }
                     d.style.zIndex = -Math.abs(Math.round(c)) + e.length;
                     le(0, d).style.transform = S
                  }
               }
               ,
               setTransition: e => {
                  const s = t.slides.map((e => m(e)));
                  s.forEach((t => {
                     t.style.transitionDuration = `${e}ms`,
                        t.querySelectorAll(".swiper-slide-shadow").forEach((t => {
                           t.style.transitionDuration = `${e}ms`
                        }
                        ))
                  }
                  )),
                     oe({
                        swiper: t,
                        duration: e,
                        transformElements: s
                     })
               }
               ,
               perspective: () => !0,
               overwriteParams: () => ({
                  watchSlidesProgress: !0,
                  virtualTranslate: !t.params.cssMode
               })
            })
      }
   ];
   return Q.use(ce),
      Q
}();

let swiperStateMain;
let mainScreenSwiper;
if (document.querySelector('.main-screen__swiper')) {
   changeSliderMain();
   window.addEventListener('resize', () => {
      changeSliderMain();
   })
}

function initSwiperMain() {
   mainScreenSwiper = new Swiper('.main-screen__swiper', {
      keyboard: {
         enabled: true,
         onlyInViewport: true,
      },
      allowTouchMove: true,
      loop: false,
      speed: 300,
      slidesPerView: 1,
      spaceBetween: 10,
      direction: "vertical",
      pagination: {
         el: '.main-screen__pagination',
         clickable: true,
      },
   });
}

function changeSliderMain() {
   if (!MIN768.matches) {
      if (!swiperStateMain) {
         swiperStateMain = true;
         initSwiperMain();
      }
   } else {
      if (swiperStateMain) {
         swiperStateMain = false;
         mainScreenSwiper.destroy(true, true);
      }
   }
}


if (document.querySelector('.product__swiper')) {
   const swiper2 = new Swiper('.product__swiper-thumbs', {
      keyboard: {
         enabled: true,
         onlyInViewport: true,
      },
      direction: "vertical",
      loop: true,
      speed: 300,
      slidesPerView: 3,
      spaceBetween: 20,
      breakpoints: {
         768: {
            slidesPerView: 4,
            direction: "horizontal",
         },
         1920: {
            slidesPerView: 4,
            direction: "vertical",
         }
      }
   });
   const swiper1 = new Swiper('.product__swiper-main', {
      keyboard: {
         enabled: true,
         onlyInViewport: true,
      },
      loop: true,
      speed: 300,
      slidesPerView: 1,
      spaceBetween: 24,
      watchSlidesProgress: true,
      thumbs: {
         swiper: swiper2,
      },
   });
}
class TabsOpen {
   constructor(element, hover) {
      this.tabsButtons = document.querySelectorAll(element);
      this.resizeHeightTab = this.throttle(this.resizeHeight, 16.7);
      this.isPC;
      this.hover = hover == false ? false : true;
   }
   tabsInit = () => {
      document.body.classList.contains('_pc') ? this.isPC = true : this.isPC = false;
      !this.isPC && window.addEventListener('resize', this.resizeHeightTab);
      this.events();
   }
   open = (event) => {
      if (event.target.closest('.js-tab-body')) {
         this.tabsButtons.forEach(e => {
            if (event.target.closest('.js-tab-body') == e && (!this.isPC ? !e.classList.contains('js-tab-open') : true)) {
               e.classList.add('js-tab-open');
               e.querySelector('.js-tab-content').style.height = `${e.querySelector('.js-tab-content-text').clientHeight}px`;
            } else { this.close(e) }
         })
      } else { this.tabsButtons.forEach(e => { this.close(e) }) }
   }
   close = (e) => { e.classList.remove('js-tab-open'), e.querySelector('.js-tab-content').style.height = '' }
   events = () => { (this.isPC && this.hover) ? window.addEventListener('mouseover', this.open) : window.addEventListener('click', this.open) }
   resizeHeight = () => {
      this.tabsButtons.forEach(e => {
         if (e.classList.contains('js-tab-open')) {
            e.querySelector('.js-tab-content').style.height = `${e.querySelector('.js-tab-content-text').clientHeight}px`
         }
      })
   }
   throttle = (callee, timeout) => {
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
}
// второй параметр "false" отключает hover. Отсутствие или true - hover включен.
new TabsOpen('.header__menu', true).tabsInit();
