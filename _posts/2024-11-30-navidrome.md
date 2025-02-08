---
layout: post
title: 搭建私人云音乐平台
date: 2024-11-30 21:00
mathjax: false
disqus: true
categories: Web
---

> 琴瑟在御，莫不静好。

因为QQ音乐和网易云的广告被恶心到了，于是打算自己搭建一个mini音乐nas。回想十几年前的时代，有个老爸带回来的MP4播放器，就上网下载mp3后带耳机听。现在的硬盘上还有当时的一些遗存，顺便让这些资源发挥一下用处。

### Navidrome开源项目

> [Navidrome](https://www.navidrome.org)是一款高性能、跨平台、开源的音乐流媒体服务器。它允许用户将本地音乐库转化为个人云端音乐服务，类似于自建版的 Spotify。通过 Navidrome，用户可以随时随地通过 Web 界面或兼容的客户端应用访问、播放、管理自己的音乐库。
>
> ---
>
> #### **主要特点**
>
> 1. **轻量高效**
>   - 占用资源少，即使在低配置设备（如树莓派）上也能流畅运行。
>
> 2. **跨平台支持**
>   - 支持 Windows、Linux、macOS 等多种操作系统。
>
> 3. **兼容 Subsonic API**
>   - 支持多种第三方客户端（DSub、Ultrasonic 等）访问。
>
> 4. **丰富的音乐管理功能**
>   - 自动扫描和管理音乐库。
>   - 支持播放列表、专辑封面等元数据展示。
>
> 5. **多用户支持**
>   - 可以创建多个用户账户，每个用户都有独立的播放记录和收藏。
>
> 6. **Web 界面友好**
>   - 提供现代化、响应式的 Web 界面，支持 PC 和移动端访问。
>
>---
>
> #### **安装方式**
>
> 1. **Docker 安装**
>   ```bash
>   docker run -d \
>     --name=navidrome \
>     -p 4533:4533 \
>     -v /path/to/music:/music \
>     -v /path/to/data:/data \
>     --restart unless-stopped \
>     deluan/navidrome
>   ```
>
> 2. **手动安装**
>   - 前往 [Navidrome 官方 GitHub](https://github.com/navidrome/navidrome) 下载可执行文件。
>   - 解压并运行：
>     ```bash
>     ./navidrome
>     ```
>
> ---
>
> #### **使用方法**
>
> 1. **访问 Web 界面**
>   - 默认地址：`http://localhost:4533`
>   
> 2. **配置音乐库**
>   - 指定本地音乐目录，Navidrome 会自动扫描并索引音乐文件。
>
> 3. **第三方客户端**
>   - 在支持 Subsonic API 的客户端中输入服务器地址和登录信息即可播放音乐。
>
> ---
>
> ### **常见应用场景**
>
> - **个人云音乐平台**
>  - 在家中部署后，通过手机或电脑随时访问音乐库。
>  
> - **家庭共享**
>  - 为家人创建独立账户，共享音乐库。
>  
> - **低成本自建音乐服务**
>   - 替代商业音乐流媒体服务。
>
> ---
>
> #### **与 Jellyfin、Plex 的对比**
>
> | 特性          | Navidrome | Jellyfin | Plex |
> |---------------|-----------|---------|------|
> | **专注领域**  | 音乐流媒体 | 音视频流媒体 | 音视频流媒体 |
> | **资源占用**  | 低         | 中       | 高   |
> | **开源免费**  | 是         | 是       | 否   |
> | **第三方支持**| 强         | 一般     | 一般 |
> | **UI 设计**   | 简洁现代   | 丰富     | 商业化 |
>
> ---

#### Cloudflare接入

为了能够随时随地访问自建的音乐服务，就需要大善人Cloudflare出场了。因为Navidrome的资源占用较低，我直接部署在树莓派上了。因为之前已经安装了Cloudflared，所以这次只需要在Zero Trust中添加一个Tunnel就可以了。所需的只有：
- Cloudflare账号
- 托管在Cloudflare上的域名
- docker安装Navidrome服务

#### 客户端推荐
经过个人一段时间的使用，针对不同平台推荐以下客户端：

| 平台         |    客户端 | 
|:-----------:|:---------:|
| iOS         |  [Amperfy](https://github.com/BLeeEZ/amperfy#readme) | 
| 安卓 |[音流(StreamMusic)](https://music.aqzscn.cn/docs/versions/latest/)| 
| PC          | 浏览器    | 


### 资源和标记

在我整理旧硬盘资源上传navidrome时，出现很多乱码的问题，而且很多歌曲没有Artwork封面和歌词。在网上搜索了一下之后，发现了几个编辑元数据的软件可以解决。因为资源都是之前下载好的，我这里用[MusicTag](https://www.cnblogs.com/vinlxc/p/11347744.html)对资源进行了标记，包括**标题、专辑、作者、封面、歌词**。可以批量自动校对标签后再一个个检查一遍，对于有些老歌可以使用[Shazam](https://www.shazam.com)进行识别。Apple Music也可以手动查找和修改标签，但是相比MusicTag工作量更大。

根据我的实测，Navidrome支持`mp3,m4a,wav,wma,ogg,flac,ape`格式的音频文件。其中`wav,wma,flac,ape`文件不支持标签封面。但可以通过上传图片的方式进行修改。乱码问题主要是原文件标签采用的GBK编码，而Navidrome是UTF-8编码，使用MusicTag编辑后一般能解决。还有另一个直接和Navidrome一起部署的标签工具[Music Tag Web](https://github.com/xhongc/music-tag-web)，有需要的可以尝试。处理之后的网页如下：

![navidrome-web](../../../../assets/images/navidrome-web.png)

最后是一些资源网站：
- [qq音乐链接提取网页工具](https://3g.gljlw.com/music/qq/index.php)
- [Gimhoy音乐盘](https://music.gimhoy.com/list?page=1)