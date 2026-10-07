import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve('dist');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);

test('every project introduction is reachable from the homepage', () => {
  assert.ok(existsSync(join(root, 'index.html')), 'build must produce a homepage');
  const home = readFileSync(join(root, 'index.html'), 'utf8');
  for (const slug of ['evolvetrace', 'ai-context-kit', 'smart-email-notifier', 'otlet']) {
    assert.ok(home.includes(`href="projects/${slug}.html"`), `${slug} must have a homepage entry`);
    assert.ok(existsSync(join(root, `projects/${slug}.html`)), `${slug} entry must resolve`);
  }
});

test('generated local links and assets resolve, including fragment targets', () => {
  assert.ok(existsSync(root), 'build must produce the static output');
  for (const path of walk(root).filter(p => p.endsWith('.html'))) {
    const html = readFileSync(path, 'utf8');
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|data:|mailto:)/.test(href)) continue;
      const [file, fragment] = href.split('#');
      const target = file ? (file.startsWith('/') ? resolve(root, `.${file}`) : resolve(dirname(path), file)) : path;
      assert.ok(target.startsWith(`${root}/`) && existsSync(target), `${path}: broken link ${href}`);
      if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${path}: missing #${fragment}`);
    }
  }
});

test('the upcoming project has an introduction without an unpublished repository link', () => {
  assert.ok(existsSync(join(root, 'projects/otlet.html')), 'Otlet must have an introduction');
  const page = readFileSync(join(root, 'projects/otlet.html'), 'utf8');
  assert.match(page, /筹备中/);
  assert.doesNotMatch(page, /github\.com\/sorenjing\/otlet/i);
});
