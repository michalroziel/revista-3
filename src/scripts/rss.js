function handlePageLoad() {
  const collections = new Set(['/short_form', '/long_form', '/moments', '/zeitweilig']);
  const currentPath = window.location.pathname;

  // Remove base path from current path for comparison
  const baseUrl = document.querySelector('base')?.getAttribute('href') || '/';
  const normalizedPath =
    baseUrl !== '/' ? currentPath.replace(baseUrl.replace(/\/$/, ''), '') : currentPath;
  const cleanPath = normalizedPath.replace(/\/+$/, '') || '/';

  if (collections.has(cleanPath)) {
    const rssLink = document.getElementById('rss-link');
    rssLink.href = `${cleanPath}/rss.xml`;
    rssLink.style.visibility = 'visible';
    rssLink.style.width = 'auto';
    rssLink.style.height = 'auto';
  }
}

document.addEventListener('astro:page-load', handlePageLoad);
// document.addEventListener('astro:after-swap', handlePageLoad);
