# 个人主页

个人介绍、平台入口与项目展示。首页展示 EvolveTrace、AI Context Kit、Smart Email Notifier，以及筹备中的 Otlet。每个项目有独立的静态介绍页。

访问地址：<https://sorenjing.github.io>。

## 本地运行

需要 Node.js 22 或更新版本。没有第三方依赖，无需安装包。

```sh
npm run check
npm run preview
```

打开 <http://localhost:4173>。修改后重新运行 `npm run build`。

## 维护内容

| 文件 | 用途 |
| --- | --- |
| `content/projects.json` | 项目名称、简短说明、详细介绍与仓库地址 |
| `content/site.json` | 页面标题、个人介绍、站点地址、GitHub 与自媒体链接 |
| `src/*.svg` | 项目流程示意和封面 |
| `src/styles.css` | 页面样式及手机布局 |
| `src/site.js` | 深浅色模式切换 |
| `scripts/build.mjs` | 生成首页、项目页和 404 页面 |

新增项目时，添加一项项目数据及同名 SVG 封面，例如 `slug: "my-project"` 对应 `src/my-project.svg`。构建会自动生成 `projects/my-project.html`，并加入首页和项目导航。

个人介绍在 `content/site.json` 的 `intro` 中修改，不需要填写姓名。自媒体地址可添加到 `links` 中，显示在首页介绍下方及各页页脚：

```json
{ "label": "平台名称", "url": "https://example.com/profile" }
```

没有确认的链接保持为空。Otlet 的 `repo` 保持 `null`，公开后再填写。流程图是概念示意，页面能力说明应与各项目实际状态保持一致。

## GitHub Pages

当前仓库已将发布来源设为 GitHub Actions。日常更新只需向 `main` 提交修改，构建通过后会自动发布。

重新配置站点时：

1. 在仓库 **Settings → Pages → Build and deployment** 中，将 **Source** 设为 **GitHub Actions**。
2. 打开 **Actions → Build and deploy Pages → Run workflow**，选择 `main`。
3. 后续向 `main` 提交修改，会自动检查、构建并发布。

`dist/` 为生成目录，不提交到仓库。构建失败或站内链接检查失败时不会发布。Pull request 只运行构建检查。

## 设计参考

参考了 [vCard Personal Portfolio](https://github.com/codewithsadee/vcard-personal-portfolio) 的项目画廊布局、[Magic UI Portfolio](https://github.com/magicuidesign/portfolio) 的简洁内容组织，以及 [lvy010](https://github.com/lvy010) 的短介绍与平台链接布局。没有使用参考页面的个人资料、文案或源码。本站使用原生 HTML、CSS、JavaScript 与 Node.js 静态构建。
