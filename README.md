# 设计艺术学研究

设计艺术学研究方法交互背诵网站，仓库为 [design-art-studies](https://github.com/a278457521-sys/design-art-studies)。

[手机／电脑在线访问](https://a278457521-sys.github.io/design-art-studies/)

## 使用

- 七段主线、十二个专题、69 个分组和 254 条细分背诵点。
- 254 个小点进一步拆成 567 个专属细点，包含逐条解释、记忆抓手、易错提醒和复述参考句。
- 小点卡支持“记骨架 → 讲清楚 → 连成句”三轮背诵，以及先回答、再点开核对的闭卷自测。
- 点击专题进入导图，点击分组或小点打开对应的编号背诵卡。
- 电脑上背诵卡固定在右侧；手机上直接打开背诵卡，点“返回导图”继续浏览。
- 支持搜索、缩放、配色、闭卷背诵、已背标记和 Markdown 导出。
- Markdown 导出同时保留资料原句、567 个细点及记忆与易错提示。
- 进度保存在当前浏览器；不同手机和电脑之间不会自动同步。

## 本地构建

需要 Node.js 24 和 npm。

```sh
npm ci
npm test
npm run build
npm run verify:portable
```

生成的 `dist/index.html` 为完整的离线网页。在线网站也使用同一构建，无外部字体或页面运行依赖。

## GitHub Pages

仓库启用 Settings → Pages → GitHub Actions 后，推送到 `main` 会自动测试、构建和发布。工作流文件为 `.github/workflows/pages.yml`，采用 [GitHub Pages 官方部署流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。首次发布成功后，可在仓库 Pages 设置中查看实际网站链接。

## 资料

主干来自《设计艺术学研究方法》总背诵框架，细分内容根据已有设计艺术学总复习导图与章节笔记整理。定性范型、资料收集、编码、分析与检验补查《05 定性研究》章节笔记。

页面保留原有资料句。细分解释、记忆抓手、易错提醒、辅助例子、自测与复述参考句均为学习整理，不是课件逐字引文；关键词数量等写作要求实际提交时服从学校或期刊模板。

原 PDF、Obsidian 资料库、电脑端截图和本机工作记录不在发布文件中。网站中的 Obsidian 链接需要本机安装 Obsidian 并具有对应资料库；在线背诵本身不依赖它。

