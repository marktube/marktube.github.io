---
layout: post
title: 利用cloudflare的r2存储打造个人网盘
date: 2025-07-22 23:26
mathjax: false
disqus: true
pannellum: true
categories: Web
---

> 荷风送香气，竹露滴清响

继上一次拍摄后，无人机一直家在吃灰。最近拿出来飞了一下，拍了一圈全景图，发现还是需要一个好用的图床或者网盘。于是开始研究了下“赛博大善人”的r2存储服务，比较之后发现主流兼容r2的开源仓库主要有r2 explorer、cloudreve、flaredrive。先问问chatgpt这三个怎么样吧。

## chatgpt的回答
你想了解如何使用 R2-Explorer、Cloudreve 和 FlareDrive 三种方案为 Cloudflare R2 搭建 Web 访问接口，我为你整理了它们的特色、优缺点，以及适合的使用场景。

---

### 1. R2-Explorer

**特色亮点**：

* 提供类似 Google Drive 的界面，支持文件或文件夹上传、预览和编辑（如 PDF、图片、文本、Markdown、CSV、Logpush 等）([GitHub][1], [r2explorer.com][2])。
* 支持使用 Basic Auth 或 Cloudflare Access 做授权控制，默认可设置为只读模式，通过 Workers 部署且支持自定义域名([r2explorer.com][2])。
* 可接收并浏览通过 Cloudflare Email Routing 存储进 R2 的邮件附件([r2explorer.com][2])。

**优点**：

* 界面友好，功能完整，操作直观，适合管理员维护和用户操作。
* 安全机制成熟，部署多选项（GitHub Actions / Wrangler CLI /模板仓库），适合生产环境使用。

**缺点**：

* 功能全面可能带来一定的部署复杂度，对新手略显挑战。
* 部分高级功能仍在开发中（如自动生成缩略图、文件搜索、重命名等）([GitHub][1])。

---

### 2. Cloudreve 集成（Cloudflare R2 支持）

**特色亮点**：

* Cloudreve 是一款自部署的文件管理与分享系统，原生支持 Cloudflare R2 作为存储后端([cloudreve.org][3], [docs.cloudreve.org][4])。
* 提供直观存储策略配置，包括 S3 接口、路径风格、区域设定等，并自动配置 CORS([docs.cloudreve.org][4])。
* 支持公共桶访问、反向代理、CDN 加速等多种部署方式([docs.cloudreve.org][4])。

**优点**：

* 功能丰富且成熟，提供缩略图、元数据提取、office 文档协作、支付支持等多模块功能([cloudreve.org][3])。
* 自部署灵活度高，适合需要构建完整存储平台的用户。

**缺点**：

* 系统庞大，部署与维护成本较高，尤其如果只需简单 Web 浏览接口，有些“杀鸡用牛刀”。
* 配置过程需要一定技术积累，社区支持相比更轻量方案可能弱一些。

---

### 3. FlareDrive

**特色亮点**：

* 基于 Cloudflare Pages + Workers + R2，提供 Web UI、WebDAV 访问、支持上传、文件夹管理、搜索、媒体/文档缩略图、拖拽上传等功能([GitHub][5], [CodeSandbox][6], [NETSEC][7])。
* 免费额度：10 GB 存储，加上每日至多 100 K 次函数调用限制([GitHub][5], [NETSEC][7])。
* 提供 WebDAV 接口，方便桌面端/移动端通过支持 WebDAV 的文件管理器访问([GitHub][5])。

**优点**：

* 快速部署，无需配置后端，只需 fork 并部署到 Pages，非常适合个人或小团队使用。
* 界面现代且集成 WebDAV，非常适合方便使用已有客户端访问和共享。

**缺点**：

* 存储与调用有限制，不适合高并发或大容量用途。
* WebDAV 不支持超大文件（≥128 MB），大文件需通过 Web UI chunk 上传([GitHub][5])。

---

### 总结对比表

| 方案                 | 优势                    | 局限               | 适用场景                  |
| ------------------ | --------------------- | ---------------- | --------------------- |
| **R2-Explorer**    | 界面友好、文件编辑、邮件整合、安全可控   | 功能重、部署稍繁琐        | 对 Web 功能要求高、需要安全控制的场合 |
| **Cloudreve + R2** | 功能丰富、自部署灵活、平台成熟       | 系统复杂、部署成本高       | 架设完整的文件分享平台或企业级使用     |
| **FlareDrive**     | 部署极简、支持 WebDAV、适合轻量用途 | 存储量和调用受限、大文件上传有限 | 快速搭建个人文件库、小型共享场景      |

---

如你需要进一步比较某个方案的具体部署步骤、安全配置、UI 逻辑或如何结合 Cloudflare Workers 定制等细节，我很乐意继续帮你深入分析！

[1]: https://github.com/G4brym/R2-Explorer?utm_source=chatgpt.com "G4brym/R2-Explorer: A Google Drive Interface for your ... - GitHub"
[2]: https://r2explorer.com/?utm_source=chatgpt.com "R2 Explorer"
[3]: https://cloudreve.org/?utm_source=chatgpt.com "Cloudreve - Self-hosted file manage and sharing system"
[4]: https://docs.cloudreve.org/en/usage/storage/r2?utm_source=chatgpt.com "Cloudflare R2 (S3 Compatible) - Cloudreve"
[5]: https://github.com/longern/FlareDrive?utm_source=chatgpt.com "longern/FlareDrive: Free file hosting service (WebUI & WebDAV ..."
[6]: https://codesandbox.io/p/github/dragon-fish/FlareDrive?utm_source=chatgpt.com "FlareDrive - Codesandbox"
[7]: https://blog.51sec.org/2024/10/use-cloudflare-pages-and-r2-storage-to.html?m=0&utm_source=chatgpt.com "Use Cloudflare Pages and R2 Storage to Create Free Online Drive"

---

## R2 Explorer

赛博大善人官方推荐，但是实际用起来感觉略显简陋。主要是用户权限管理这块，只开了多用户，但是没有对各个用户的权限加以限制。也没有公共目录用来作为图床挂载点。cloudflare access和邮箱这块倒是做得还可以，就是目前用的较少。下面简单说说部署的情况，官方推荐的步骤较为麻烦，直接打开github[仓库页面](https://github.com/G4brym/R2-Explorer)，然后点击下图的红框：

![deploy](../../../../assets/images/r2-explorer-deploy.jpg)

接着设置名称和选择亚太地区的r2存储服务：

![deploy2](../../../../assets/images/r2-explorer-deploy2.jpg)

一路确定即可。最后就是按照官方文档添加用户和修改只读状态。

---

## FlareDrive

综合考虑还是等我有钱买硬盘了再上cloudreve，先拿FlareDrive玩玩哈哈哈。FlareDrive最初版本的功能比较简单，后续有针对界面进行优化的[版本](https://github.com/ljxi/Cloudflare-R2-oss)，以及加入用户管理和文件分享的[版本](https://github.com/willow-god/FlareDrive-R2)，还有更加完善的[版本](https://github.com/52op/FlareDrive-R2)。

下面也简单说说部署的方法。先打开上面更加完善的版本，点击fork，创建自己的分支仓库。接下来打开cloudflare的页面，进入Workers & Pages。点击Create创建一个Pages，选择Import an existing Git repository，接着选择刚才fork的仓库就行。**注意按照下图继续设置，不要选择其它的framework！！！**

![deploy3](../../../../assets/images/flaredrive-deploy.jpg)

然后Save and Deploy就行，后面设置和改动参考仓库的说明即可。

---

最后放上最近拿无人机拍的全景图:

南山竹海：

<center><div id="panoramaliyang" class="panoramax"></div></center>
<script>
pannellum.viewer('panoramaliyang', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250722091531_0027_D.jpg",
    "showFullscreenCtrl": true
});
</script>

三桥俯瞰：

<center><div id="panoramadawu" class="panoramax"></div></center>
<script>
pannellum.viewer('panoramadawu', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250807185217_0053_D.jpg",
    "showFullscreenCtrl": true
});
</script>

---

更新网盘仓库功能，只读用户只能查看权限目录和公共目录，[仓库在这](https://github.com/marktube/FlareDrive-R2)