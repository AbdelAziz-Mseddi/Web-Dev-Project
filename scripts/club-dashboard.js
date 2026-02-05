document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const panels = Array.from(document.querySelectorAll('[data-panel]'));

  function showPanel(name) {
    panels.forEach(p => {
      p.hidden = p.dataset.panel !== name;
    });
    
    sidebar?.querySelectorAll('.sidebar_link').forEach(link => {
      link.classList.toggle('active', link.dataset.target === name);
    });
  }

  sidebar?.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar_link');
    if (!link) return;
    const target = link.dataset.target;
    if (!target) return;
    showPanel(target);
  });

  const first = sidebar?.querySelector('.sidebar_link[data-target]');
  if (first?.dataset.target) showPanel(first.dataset.target);
});