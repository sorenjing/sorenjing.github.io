import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'dist');
const site = JSON.parse(await readFile(resolve(root, 'content/site.json'), 'utf8'));
const projects = JSON.parse(await readFile(resolve(root, 'content/projects.json'), 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const https = value => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`Expected an HTTPS URL: ${value}`);
  return esc(url.href);
};
https(site.url); https(site.github);
for (const key of ['heading', 'text']) {
  if (typeof site.intro?.[key] !== 'string' || !site.intro[key].trim()) throw new Error(`Missing intro ${key}`);
}
const slugs = new Set();
for (const p of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error(`Invalid or duplicate project slug: ${p.slug}`);
  slugs.add(p.slug);
  for (const key of ['name','short','category','status','intro','boundary']) {
    if (typeof p[key] !== 'string' || !p[key]) throw new Error(`Missing ${key} on ${p.slug}`);
  }
  if (p.repo) https(p.repo);
  if (p.website) https(p.website);
}
for (const link of site.links) { https(link.url); if (!link.label) throw new Error('A social link needs a label'); }

const themeButton = `<button class="theme-toggle" type="button" data-theme-toggle aria-label="切换颜色模式" aria-pressed="false"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 3a7 7 0 0 1 0 14V3Z" fill="currentColor"/></svg></button>`;
function layout({ title, description, body, depth = 0, route = '' }) {
  const prefix = '../'.repeat(depth);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title === site.title ? title : `${title} · ${site.title}`)}</title>
<link rel="canonical" href="${https(`${site.url}/${route}`)}">
<link rel="icon" type="image/svg+xml" href="${prefix}assets/favicon.svg">
<link rel="stylesheet" href="${prefix}assets/styles.css">
<script src="${prefix}assets/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<div class="shell">
<header class="header">
<a class="home-link" href="${prefix}index.html"${depth === 0 && !route ? ' aria-current="page"' : ''}>主页</a>
<nav class="nav" aria-label="主导航"><a class="home-projects-link" href="${prefix}index.html#projects">项目</a><a href="${https(site.github)}">GitHub</a>${themeButton}</nav>
</header>
<main id="main">${body}</main>
<footer class="footer"><span>${esc(site.title)}</span><div class="footer-links">${site.links.map(link => `<a class="text-link" href="${https(link.url)}">${esc(link.label)}</a>`).join('')}<a class="text-link" href="${https(site.github)}">GitHub</a></div></footer>
</div>
</body></html>\n`;
}
function home() {
  return layout({ title: site.title, description: site.description, body: `
<section class="profile-intro" aria-labelledby="intro-title">
<h1 id="intro-title">${esc(site.intro.heading)}</h1>
<p>${esc(site.intro.text)}</p>
<nav class="profile-links" aria-label="个人平台"><a class="text-link" href="${https(site.github)}">GitHub</a>${site.links.map(link => `<a class="text-link" href="${https(link.url)}">${esc(link.label)}</a>`).join('')}</nav>
</section>
<section id="projects" aria-labelledby="projects-title">
<div class="intro"><h2 id="projects-title">项目</h2><span class="index-note">${projects.filter(p => p.repo).length} 个公开项目 · ${projects.filter(p => !p.repo).length} 个筹备中</span></div>
<div class="project-grid">${projects.map(p => `<article class="project">
<a class="cover-link" href="projects/${p.slug}.html" aria-label="查看 ${esc(p.name)} 项目介绍"><img src="assets/${p.slug}.svg" alt="" width="640" height="360"></a>
<div class="project-head"><h3><a href="projects/${p.slug}.html">${esc(p.name)}</a></h3>${!p.repo ? `<span class="status">${esc(p.status)}</span>` : ''}</div>
<p>${esc(p.short)}</p>
<div class="project-foot"><span class="category">${esc(p.category)}</span><div class="project-links"><a class="text-link" href="projects/${p.slug}.html">项目介绍</a>${p.website ? `<a class="text-link" href="${https(p.website)}" aria-label="访问 ${esc(p.name)} 站点">访问站点</a>` : ''}${p.repo ? `<a class="text-link" href="${https(p.repo)}" aria-label="${esc(p.name)} 的 GitHub 仓库">GitHub</a>` : ''}</div></div>
</article>`).join('')}</div>
</section>` });
}
function detail(p, index) {
  const next = projects[(index + 1) % projects.length];
  return layout({ title: p.name, description: p.short, depth: 1, route: `projects/${p.slug}.html`, body: `
<div class="detail-top"><a class="back" href="../index.html#projects"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 4-6 6 6 6" stroke="currentColor" stroke-width="1.5"/></svg>所有项目</a></div>
<section class="detail-hero" aria-labelledby="project-title">
<div class="detail-title"><span class="eyebrow">${esc(p.category)}</span><h1 id="project-title">${esc(p.name)}</h1><p class="lead">${esc(p.short)}</p><div class="detail-action">${p.website ? `<a class="button" href="${https(p.website)}">访问站点</a>` : ''}${p.repo ? `<a class="button${p.website ? ' button-secondary' : ''}" href="${https(p.repo)}">查看 GitHub 仓库</a>` : `<span class="status">${esc(p.status)}</span>`}</div></div>
<figure class="detail-cover"><img src="../assets/${p.slug}.svg" alt="${esc(p.name)} ${p.repo ? '流程概念示意' : '项目封面'}" width="640" height="360"><figcaption>${p.repo ? '流程概念示意' : '筹备中的项目'}</figcaption></figure>
</section>
<div class="detail-body">
<section class="detail-section"><h2>项目介绍</h2><p>${esc(p.intro)}</p></section>
${p.problem ? `<section class="detail-section"><h2>解决的问题</h2><p>${esc(p.problem)}</p></section>` : ''}
${p.steps.length ? `<section class="detail-section"><h2>工作方式</h2><ol class="step-list">${p.steps.map(([title, copy], i) => `<li><span class="step-num" aria-hidden="true">0${i + 1}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div></li>`).join('')}</ol></section>` : ''}
<section class="detail-section"><h2>当前状态</h2><p>${esc(p.boundary)}</p></section>
</div>
<nav class="related" aria-label="项目导航"><a class="text-link" href="../index.html#projects"><span>项目索引</span>所有项目</a><a class="text-link" href="${next.slug}.html"><span>下一个项目</span>${esc(next.name)}</a></nav>` });
}

await rm(out, { recursive: true, force: true });
await mkdir(resolve(out, 'assets'), { recursive: true });
await cp(resolve(root, 'src'), resolve(out, 'assets'), { recursive: true });
const save = async (path, content) => { const dest = resolve(out, path); await mkdir(dirname(dest), { recursive: true }); await writeFile(dest, content); };
await save('index.html', home());
for (const [index, project] of projects.entries()) await save(`projects/${project.slug}.html`, detail(project, index));
await save('404.html', layout({ title: '页面不存在', description: '回到主页查看项目。', body: '<div class="not-found"><span class="eyebrow">404</span><h1>页面不存在</h1><p>这个地址没有对应的页面。</p><a class="button" href="index.html">返回主页</a></div>' }).replaceAll('href="index.html', 'href="/index.html').replaceAll('href="assets/', 'href="/assets/').replaceAll('src="assets/', 'src="/assets/'));
console.log(`Built homepage, ${projects.length} project pages and 404 page in dist/`);
