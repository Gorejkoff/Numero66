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
