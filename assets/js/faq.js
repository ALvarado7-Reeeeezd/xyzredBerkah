// FILE: assets/js/faq.js

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
});

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // kalau mau hanya satu yang terbuka, tutup semua dulu
      items.forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-answer');
        if (a) a.hidden = true;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.hidden = false;
      } else {
        item.classList.remove('open');
        answer.hidden = true;
      }
    });
  });
}
