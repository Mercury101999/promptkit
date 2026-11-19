/** Turn exported files into the URLs a subpath service worker should precache. */

export function precacheUrls(relativeFiles, basePath) {
  const base = basePath.replace(/\/$/, '');
  return relativeFiles
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
    .map((file) => `${base}/${file.split('/').map(encodeURIComponent).join('/')}`);
}

/** Extra cache keys so a refresh of /promptkit/templates hits templates.html. */
export function navigationAliases(url) {
  const aliases = new Set([url]);
  if (url.endsWith('/index.html')) {
    const directory = url.slice(0, -'index.html'.length);
    aliases.add(directory);
    if (directory.endsWith('/')) aliases.add(directory.slice(0, -1));
  } else if (url.endsWith('.html')) {
    aliases.add(url.slice(0, -'.html'.length));
  }
  return [...aliases];
}
