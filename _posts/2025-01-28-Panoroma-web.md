---
layout: post
title: 使用Pannellum搭建网页版全景图查看器
date: 2025-01-27 10:51:48
mathjax: false
pannellum: true
disqus: true
categories: Web
---

> 新年快乐，巳巳如意

最近天气变暖，临近年关，拿出我的无人机飞一下，拍一下家乡的全景图，留作纪念。拍完之后发现大疆无人机自带全景图拼接功能，可以把360度的全景图拼接成矩形。但是由于全景图是将图片贴到球形或圆柱形上，矩形并不适合用户交互和查看，所以需要一些工具辅助。好在已有开源工具将全景图转换成web view来查看，于是我找到了[Pannellum](https://github.com/mpetroff/pannellum)，下面就实际部署试试看。

### iframe方式

直接使用iframe加载图片，其它参数可以根据实际全景图参数进行设置，例如自动加载图片，自动旋转等。
```html
<iframe width="600" height="400" allowfullscreen style="border-style:none;" src="https://cdn.pannellum.org/2.5/pannellum.htm#panorama=https://pannellum.org/images/cerro-toco-0.jpg&amp;autoLoad=true"></iframe>
```
<center><iframe width="300" height="200" allowfullscreen style="border-style:none;" src="https://cdn.pannellum.org/2.5/pannellum.htm#panorama=https://pannellum.org/images/cerro-toco-0.jpg&amp;autoLoad=true"></iframe></center>

该方式需要上传图片到支持[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)的图床, 例如[Imgur](https://imgur.com/).可以通过[官方的教程](https://pannellum.org/documentation/overview/tutorial/)生成iframe标签进行嵌入。

### API方式

使用js请求处理全景图，加载样式，通过json数据对参数进行设置。官方给出的示例如下：
```html
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto load</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
    <style>
    #panorama {
        width: 600px;
        height: 400px;
    }
    </style>
</head>
<body>

<div id="panorama"></div>
<script>
pannellum.viewer('panorama', {
    "type": "equirectangular",
    "panorama": "https://pannellum.org/images/cerro-toco-0.jpg",
    "autoLoad": true
});
</script>

</body>
</html>
```
该文件先引入了相关的css和js文件。然后通过style标签设定id为panorama的样式。接下来定义了对应id的div，最后使用js脚本发送请求加载视图。由于这里是单个网页版本，需要修改一些东西才能在自己的页面嵌入。这里先将css选择器中的id选择改为类选择器，然后将该类的样式设置成官方的样子。
```html
<div id="example_panorama" class="panorama"></div>
<script>
pannellum.viewer('example_panorama', {
    "type": "equirectangular",
    "panorama": "https://pannellum.org/images/alma.jpg",
    "autoLoad": true
});
</script>
```

<center><div id="example_panorama" class="panoramax"></div></center>
<script>
pannellum.viewer('example_panorama', {
    "type": "equirectangular",
    "panorama": "https://pannellum.org/images/alma.jpg",
    "autoLoad": true
});
</script>

这里“example_panorama”的id参数需要和pannellum.viewer里的参数一致。其它部分就是通过json去设置，和iframe里的参数相似，具体看[这里](https://pannellum.org/documentation/reference/)。

最后通过这种方式放上我拍摄的家乡全景图，100米高度版本：

<center><div id="panorama100" class="panoramax"></div></center>
<script>
pannellum.viewer('panorama100', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250127165331_0007_D.JPG",
    "showFullscreenCtrl": true
});
</script>

300米高度版本：
<center><div id="panorama300" class="panoramax"></div></center>
<script>
pannellum.viewer('panorama300', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250127164746_0003_D.JPG",
    "showFullscreenCtrl": true
});
</script>

如果想要更清晰和高精度的数据，还是需要进行三维重建和标注。由于拼接的全景图文件较大，很多平台无法支持存储。我在尝试部署过程中就遇到了Cloudflare Page的错误提醒：“ ✘ [ERROR] Error: Pages only supports files up to 25 MiB in size”。只能通过压缩图片和使用图床来解决。


### 图床服务
目前已有很多图床服务，但是我还是决定使用大善人cloudflare的R2 Storage，因为很多免费图床支持的最大图片文件只有6MB。使用[Piclist](https://github.com/Kuingsmile/PicList)或者[PicGo](https://github.com/Molunerfinn/PicGo)，可以方便的上传和修改，可以参考一些[教程](https://www.cnblogs.com/hopeblaze/articles/18644716)来部署。
最后祝大家新年快乐！