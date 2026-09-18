(function () {
  'use strict';

  const SCROLL_AMOUNT = 700; // مقدار اسکرول (قابل تغییر)

  function findBestScrollable() {
    const all = document.querySelectorAll('*');
    let best = null;
    let maxScrollable = 0;

    for (const el of all) {
      try {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const canScroll = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay');
        const scrollableHeight = el.scrollHeight - el.clientHeight;

        if (canScroll && scrollableHeight > 150 && scrollableHeight > maxScrollable) {
          if (el.clientHeight > window.innerHeight * 0.45) {
            maxScrollable = scrollableHeight;
            best = el;
          }
        }
      } catch (e) {}
    }

    if (!best) {
      if (document.documentElement.scrollHeight > window.innerHeight + 80) {
        return document.documentElement;
      }
      if (document.body.scrollHeight > window.innerHeight + 80) {
        return document.body;
      }
      return window;
    }
    return best;
  }

  // نشانگر جهت
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10px 24px;
    border-radius: 30px;
    font-size: 16px;
    font-family: Vazirmatn, Tahoma, sans-serif;
    z-index: 2147483647;
    display: none;
    pointer-events: none;
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    direction: rtl;
    transition: opacity 0.25s ease;
  `;
  document.documentElement.appendChild(indicator);

  let hideTimer;
  function showIndicator(text, color) {
    indicator.textContent = text;
    indicator.style.background = color;
    indicator.style.display = 'block';
    indicator.style.opacity = '1';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.style.display = 'none', 300);
    }, 800);
  }

  function doScroll(direction) {
    const amount = direction === 'down' ? SCROLL_AMOUNT : -SCROLL_AMOUNT;
    const el = findBestScrollable();

    try {
      if (el === window) {
        window.scrollBy({ top: amount, behavior: 'smooth' });
      } else {
        el.scrollBy({ top: amount, behavior: 'smooth' });
      }
    } catch (e) {
      if (el === window) {
        window.scrollTo(0, window.scrollY + amount);
      } else {
        el.scrollTop += amount;
      }
    }

    // شبیه‌سازی چرخ موس (برای سایت‌های React مثل اسنپ‌فود مهم است)
    const target = el === window ? document.body : el;
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: amount,
      bubbles: true,
      cancelable: true,
      view: window
    });
    target.dispatchEvent(wheelEvent);
  }

  window.addEventListener('keydown', function (e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    // Page Down → اسکرول به پایین
    if (e.key === 'PageDown') {
      e.preventDefault();
      e.stopImmediatePropagation();
      doScroll('down');
      showIndicator('↓ پایین', '#1976D2');
    }

    // Page Up → اسکرول به بالا
    if (e.key === 'PageUp') {
      e.preventDefault();
      e.stopImmediatePropagation();
      doScroll('up');
      showIndicator('↑ بالا', '#2E7D32');
    }
  }, true);

  console.log('%c[Snappfood Scroll Helper] آماده است — PageDown پایین | PageUp بالا', 'color:#4CAF50; font-weight:bold;');
})();