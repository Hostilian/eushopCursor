/**
 * Reads `config.json` written by `.github/workflows/pages.yml` at deploy time.
 */
(function () {
  const docs = document.getElementById('repo-docs');
  const root = document.getElementById('repo-root');
  if (!docs || !root) return;

  fetch(new URL('config.json', window.location.href).href)
    .then((r) => (r.ok ? r.json() : null))
    .then((cfg) => {
      if (!cfg || typeof cfg.githubRepo !== 'string') return;
      const base = cfg.githubRepo.replace(/\/$/, '');
      docs.href = `${base}/blob/main/docs/README.md`;
      root.href = base;
    })
    .catch(() => {
      /* static preview without config.json */
    });
})();
