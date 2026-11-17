// GitHub Pages only serves real files, so each app route gets a copy of index.html.
// Without this, opening a deep link returns HTTP 404 (the 404.html fallback still renders the app).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const routes = ['services', 'about', 'contact', 'download', 'privacy', 'terms', 'book', 'account', 'admin', 'staff', 'login', 'signup', 'forgot-password', 'reset-password'];
const serviceIds = [...readFileSync('src/data/services.ts', 'utf8').matchAll(/^\s+id: '([a-z0-9-]+)'/gm)].map((m) => m[1]);

for (const route of [...routes, ...serviceIds.map((id) => `services/${id}`)]) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('dist/index.html', `dist/${route}/index.html`);
}
console.log(`Copied index.html to ${routes.length + serviceIds.length} routes`);

// Sitemap of public pages, to submit in Google Search Console.
const site = 'https://lewyjonny.github.io/omegs/';
const publicPages = ['', 'services', ...serviceIds.map((id) => `services/${id}`), 'about', 'contact', 'download', 'book', 'privacy', 'terms'];
const urls = publicPages.map((p) => `  <url><loc>${site}${p ? `${p}/` : ''}</loc></url>`).join('\n');
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`Wrote sitemap.xml with ${publicPages.length} pages`);
