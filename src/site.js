(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let stored;
  try { stored = localStorage.getItem('color-theme'); } catch {}
  const update = theme => {
    root.dataset.theme = theme;
    button?.setAttribute('aria-pressed', String(theme === 'dark'));
    button?.setAttribute('aria-label', theme === 'dark' ? '切换为浅色模式' : '切换为深色模式');
  };
  update(stored === 'dark' || stored === 'light' ? stored : media.matches ? 'dark' : 'light');
  button?.addEventListener('click', () => {
    stored = root.dataset.theme === 'dark' ? 'light' : 'dark';
    update(stored);
    try { localStorage.setItem('color-theme', stored); } catch {}
  });
  media.addEventListener('change', event => {
    if (stored !== 'dark' && stored !== 'light') update(event.matches ? 'dark' : 'light');
  });
})();
