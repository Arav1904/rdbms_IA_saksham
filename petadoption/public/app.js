const navToggle = document.querySelector('[data-nav-toggle]');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

const speciesSelect = document.querySelector('[data-species-select]');
if (speciesSelect) {
  const panels = Array.from(document.querySelectorAll('[data-species-panel]'));
  const syncSpeciesPanels = () => {
    const value = speciesSelect.value;
    for (const panel of panels) {
      panel.hidden = panel.getAttribute('data-species-panel') !== value;
    }
  };
  speciesSelect.addEventListener('change', syncSpeciesPanels);
  syncSpeciesPanels();
}
