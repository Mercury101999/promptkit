import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { navigationAliases, precacheUrls } from './precache-plan.mjs';

const dist = path.resolve('dist');
const app = JSON.parse(await readFile(path.resolve('app.json'), 'utf8'));
const basePath = app.expo?.experiments?.baseUrl;
if (basePath !== '/promptkit') {
  throw new Error(`Expected experiments.baseUrl to be /promptkit, got ${basePath}`);
}

await cp(path.resolve('public'), dist, { recursive: true });

// GitHub Pages serves a directory's index.html, and serves 404.html for unknown paths.
// Expo emits templates.html while the router uses /templates, so publish both shapes.
const htmlFiles = (await readdir(dist)).filter((name) => name.endsWith('.html') && name !== 'index.html' && name !== '404.html');
for (const name of htmlFiles) {
  const route = name.slice(0, -'.html'.length);
  if (route.startsWith('+') || route.startsWith('_') || route.includes('(')) continue;
  const directory = path.join(dist, route);
  await mkdir(directory, { recursive: true });
  await cp(path.join(dist, name), path.join(directory, 'index.html'));
}
await writeFile(
  path.join(dist, '404.html'),
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PromptKit</title>
    <script>
      (function () {
        var path = location.pathname;
        var leaf = path.split('/').pop();
        if (!path.endsWith('/') && leaf.indexOf('.') === -1) {
          location.replace(path + '/' + location.search + location.hash);
          return;
        }
        if (path.endsWith('/') && path !== '/promptkit/') {
          location.replace('/promptkit/');
        }
      })();
    </script>
  </head>
  <body></body>
</html>
`,
);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const files = await walk(dist);
const relative = files
  .map((file) => path.relative(dist, file))
  .filter((file) => path.basename(file) !== 'sw.js');

const hash = createHash('sha256');
for (const file of relative.sort()) {
  hash.update(file);
  hash.update(await readFile(path.join(dist, file)));
}
const version = hash.digest('hex').slice(0, 12);
const urls = precacheUrls(relative, basePath);

const aliasPairs = urls.flatMap((url) =>
  navigationAliases(url)
    .filter((alias) => alias !== url)
    .map((alias) => [url, alias]),
);

const source = `/* PromptKit ${version}. Generated. Do not edit by hand. */
const CACHE = 'promptkit-${version}';
const BASE = ${JSON.stringify(basePath)};
const PRECACHE = ${JSON.stringify(urls, null, 2)};
const ALIASES = ${JSON.stringify(aliasPairs)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        PRECACHE.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to precache ' + url);
          await cache.put(url, response.clone());
          for (const [from, alias] of ALIASES) {
            if (from === url) await cache.put(alias, response.clone());
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, url));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) await cache.put(request, fresh.clone());
  return fresh;
}

async function networkFirstNavigation(request, url) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await matchNavigation(cache, url);
    if (cached) return cached;
    throw error;
  }
}

async function matchNavigation(cache, url) {
  const path = url.pathname;
  const keys = [path];
  if (path.endsWith('/')) {
    keys.push(path + 'index.html', path.slice(0, -1), path.slice(0, -1) + '.html');
  } else {
    keys.push(path + '/', path + '.html', path + '/index.html');
  }
  keys.push(BASE + '/', BASE + '/index.html', BASE);
  for (const key of keys) {
    const hit = (await cache.match(key)) || (await cache.match(self.location.origin + key));
    if (hit) return hit;
  }
  return null;
}
`;

await writeFile(path.join(dist, 'sw.js'), source);
const manifest = JSON.parse(await readFile(path.join(dist, 'manifest.json'), 'utf8'));
if (manifest.name !== 'PromptKit' || manifest.display !== 'standalone' || manifest.scope !== '/promptkit/') {
  throw new Error('dist/manifest.json is missing the PromptKit install settings');
}
if (!urls.includes('/promptkit/index.html') && !urls.some((url) => url.endsWith('/index.html'))) {
  throw new Error('The export did not include an index.html to precache');
}
console.log(`Wrote dist/sw.js with ${urls.length} precached URLs (${version})`);
