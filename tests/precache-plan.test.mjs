import assert from 'node:assert/strict';
import test from 'node:test';

import { navigationAliases, precacheUrls } from '../scripts/precache-plan.mjs';

test('prefixes exported files with the Pages base path', () => {
  assert.deepEqual(precacheUrls(['index.html', '_expo/static/js/app.js', 'sw.js', 'app.js.map'], '/promptkit'), [
    '/promptkit/index.html',
    '/promptkit/_expo/static/js/app.js',
  ]);
});

test('adds extensionless aliases for static routes', () => {
  assert.deepEqual(navigationAliases('/promptkit/templates.html'), ['/promptkit/templates.html', '/promptkit/templates']);
  assert.ok(navigationAliases('/promptkit/index.html').includes('/promptkit/'));
  assert.ok(navigationAliases('/promptkit/index.html').includes('/promptkit'));
});
