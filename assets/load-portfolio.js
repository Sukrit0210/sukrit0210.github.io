(() => {
  const container = document.querySelector('[data-portfolio-sections]');
  const status = container.querySelector('[role="status"]');
  const files = container.dataset.portfolioSections.split(' ');
  const readSection = async name => {
    const response = await fetch('sections/' + name + '.html');
    if (!response.ok) throw Error('Could not load ' + name);
    return response.text();
  };
  const runScript = source => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
  Promise.all(files.map(readSection)).then(async sections => {
    container.innerHTML = sections.join('\n');
    await runScript('assets/portfolio.js');
    await runScript('assets/portfolio-pages.js');
    await runScript('assets/reel.js');
    const id = location.hash.slice(1);
    const section = id && document.getElementById(id);
    if (id && section && container.contains(section)) {
      document.getElementById('reel-skip-btn').click();
      section.scrollIntoView();
    }
  }).catch(error => {
    console.error(error);
    status.textContent = 'The portfolio files could not be loaded. Open the hosted site and reload the page.';
    const reel = document.getElementById('intro-reel');
    if (reel) reel.hidden = true;
    document.body.classList.remove('reel-active', 'reel-dark');
    if (!status.isConnected) container.prepend(status);
    status.scrollIntoView();
  });
})();
