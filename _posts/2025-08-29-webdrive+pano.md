---
layout: post
title: 给r2存储桶的个人网盘添加全景图预览功能
date: 2025-08-29 17:05
mathjax: false
disqus: true
pannellum: true
categories: Web
---

> 天阶夜色凉如水，卧看牵牛织女星

继上一次搭建个人网盘后，又有了新的需求：**给网盘添加全景图预览功能**。结合之前pannellum的功能，可以直接集成到网盘的预览功能中。但是由于目前我的无人机合成的全景图都是jpg格式，所以考虑将预览控制栏中加入新按钮，点击后进入全景图模式，如下图所示。

![pic_btn](../../../../assets/images/show_pano_pic_btn.jpg)

大致的逻辑如下：
1. 用户点击图片进入预览模式
2. 预览模式点击按钮进入全景图预览模式
3. 隐藏原有的控制组件加载全景图控制组件
4. 预览完成关闭预览模式

因为项目都是基于vue进行搭建的，首先找到预览模式的文件`assets/MediaPreview.vue`查看内容。第一部分是template，找到底部控制栏按钮，可以添加新的按钮：
```html
<button class="control-btn" @click="panoImage" title="全景模式">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M5 5 L15 5 L15 15 L5 15 Z" />
    </svg>
</button>
```
该按钮的svg随便找了一个代码，后期可以优化图标显示。其中绑定了下面的一个js函数`panoImage`，这里可以通过点击触发该函数加载全景模式。参考之前博客，需要在`index.html`的header部分加入：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
```
在template中将预览的div元素加上id为：`pr-img-view`，然后在下面添加一个函数：
```javascript
panoImage() {
    this.controlsAutoHide = true;
    pannellum.viewer('pr-img-view', {
        "type": "equirectangular",
        "panorama": this.currentMedia.url,
        "showFullscreenCtrl": true,
        "autoLoad": true
    });
},
```
这样就实现了基本的加载全景图的功能啦！因为pannellum有自己的控制组件，在开启时需要隐藏原有的预览组件。接下来就来实现隐藏功能。在全景预览之前先移除原有div元素的content，这个很简单，可以直接getElementByID设置和清空：
```javascript
document.getElementById("pr-img-view").innerHTML = "";
```
这样在加载时就不会出现背景两边有空白边逼死强迫症的情况了。

然后是隐藏底部控制栏，这里直接利用vue里面条件控制，具体代码如下：
```vue
<div v-if="isImage && isShowBottom" class="bottom-controls">
```
只有当`isImage`和`isShowBottom`都是`true`时才会渲染，同时需要在对应的位置设置`isShowBottom`变量，具体请看代码仓库。最后需要在左右切换按钮处理和加载图片的过程中对`isShowBottom`变量设置为`true`，避免打开或切换其它图片预览时不显示底部控制栏。

---

最后放上去嘉善县缪家村参观拿无人机拍的全景图:

50米高程：

<center><div id="panorama50" class="panoramax"></div></center>
<script>
pannellum.viewer('panorama50', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250828115607_0003_D.jpg",
    "showFullscreenCtrl": true
});
</script>

300米高程：

<center><div id="panorama300" class="panoramax"></div></center>
<script>
pannellum.viewer('panorama300', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250828115852_0004_D.jpg",
    "showFullscreenCtrl": true
});
</script>

500米高程：

<center><div id="panorama500" class="panoramax"></div></center>
<script>
pannellum.viewer('panorama500', {
    "type": "equirectangular",
    "panorama": "../../../../assets/images/DJI_20250828120051_0005_D.jpg",
    "showFullscreenCtrl": true
});
</script>

