// GitHub Pages only serves real files, so each app route gets a copy of index.html.
// Without this, opening a deep link returns HTTP 404 (the 404.html fallback still renders the app).
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';

const routes = ['services', 'about', 'contact', 'download', 'privacy', 'terms', 'book', 'account', 'admin', 'staff', 'login', 'signup', 'forgot-password', 'reset-password'];
const serviceIds = [...readFileSync('src/data/services.ts', 'utf8').matchAll(/^\s+id: '([a-z0-9-]+)'/gm)].map((m) => m[1]);

for (const route of [...routes, ...serviceIds.map((id) => `services/${id}`)]) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('dist/index.html', `dist/${route}/index.html`);
}
console.log(`Copied index.html to ${routes.length + serviceIds.length} routes`);
