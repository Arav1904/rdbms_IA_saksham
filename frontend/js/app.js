(function() {
  const currentPath = window.location.pathname.split('/').pop().split('?')[0];
  const currentPage = currentPath === '' ? 'index.html' : currentPath;

  window.__API_BASE__ = window.__API_BASE__ || '/api';

  if (currentPage !== 'login.html') {
    const auth = requireAuth();
    if (!auth) return;
    buildSidebar(currentPage);

    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
    }

    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
      const hour = new Date().getHours();
      greetingEl.textContent = `Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'} — here's your shelter at a glance`;
    }

    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('sidebarToggleBtn')) {
      const button = document.createElement('button');
      button.id = 'sidebarToggleBtn';
      button.className = 'icon-btn';
      button.type = 'button';
      button.innerHTML = Icons.bar;
      button.style.marginRight = '8px';
      button.onclick = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      };
      topbar.querySelector('.topbar-actions')?.prepend(button);
    }
  }
})();
