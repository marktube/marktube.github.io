---
layout: post
title: "Blog更新记录"
date: 2023-11-17 10:06
disqus: true
categories: Blog
---

> 欲买桂花同载酒，终不似，少年游



最近打算把之前自己的一些日志整理一下，在其中也发现了一些小bug，暂且记录一下更新的细节。

### Page Cover

在日志里面可以添加一个头图，向下翻页然后查看内容。这里看了一下代码，在index.html里面有一段代码判断：

```html
---
layout: default
title: Home
cover: false
about: 'about.html'
---

<header class="main-header {% if page.cover %}" style="background-image: url({{ page.cover }}) {%else%}no-cover{% endif %}">
```

所以这里直接在里面把cover的值换成图片的URL即可。

### jQuery Update

在push到GitHub上时，经常会在Security里面出现警告，说jquery版本太老，有XSS漏洞被利用的风险。

![alert](../../../../assets/images/vulnerable-alert.png)

为了把这些烦人的警告去掉，还是升级一下jquery的版本吧。直接跑去问ChatGPT，答案如下：

> 升级 jQuery 通常只需替换现有版本的文件或使用包管理工具进行更新。以下是一些常见的方法：
> ##### 方法一：使用 CDN
> 如果您是通过 CDN 引入 jQuery，您只需将引用的版本更改为新的版本。例如，从：
> ```html
> <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
> ```
> 更改为：
> ```html
> <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
> ```
> ##### 方法二：下载最新版本 
> 1. **访问 jQuery 官方网站：** https://jquery.com/download/
> 2. **选择下载版本：** 点击 "Download the compressed, production jQuery 3.6.0" 或类似的按钮，选择您需要的版本。
> 3. **替换文件：** 下载后，将新版本的 jQuery 文件替换您项目中的旧版本。
> ##### 方法三：使用包管理工具
> 如果您的项目使用包管理工具（如 npm、Yarn），您可以使用以下命令来更新 jQuery：
>
> ```bash
> # 使用 npm 更新 jQuery
> npm install jquery@latest
> 
> # 使用 Yarn 更新 jQuery
> yarn add jquery@latest
> ```
> 确保在运行这些命令之后检查您的项目中是否存在问题，因为新版本可能引入了一些不兼容的更改。
> ##### 方法四：使用自动化构建工具
> 如果您使用自动化构建工具（如 Webpack、Parcel），在配置文件中指定最新的 jQuery 版本，然后运行构建命令。
> 请注意，更新 jQuery 版本时，可能需要确保您的代码与新版本兼容。在 jQuery 的[官方升级指南](https://jquery.com/upgrade-guide/)中，您可以找到有关从一个版本迁移到另一个版本的详细信息，以确保平滑的升级过程。

因为这里日志使用了本地的jquery.min.js，我选择方法二，直接去下载最新版本就行，[链接在这里](https://blog.jquery.com/2023/08/28/jquery-3-7-1-released-reliable-table-row-dimensions/)。同时要记得把_layouts/default.html里script标签加载的jquery改了。最后把老版本git rm掉就可以了。

### Sharing Button

因为原来的分享里面只有推特、脸书和Google+，没有国内平台，就打算把微博加上去。实际测试了一下原来的三个分享按钮，推特和脸书还可以用，Google+因为升级接口不可用，就打算把Google+替换成微博了。还是先看代码，位置在_includes/share.html。

```html
<section class="share">
    <h4>Share this post</h4>
    <a class="icon-twitter" href="http://twitter.com/share?text={{page.title}}&amp;url={{site.domain_name}}{{ page.url }}"
        onclick="window.open(this.href, 'twitter-share', 'width=550,height=235');return false;">
        <span class="hidden">Twitter</span>
    </a>
    <a class="icon-facebook" href="https://www.facebook.com/sharer/sharer.php?u={{site.domain_name}}{{page.url}}"
        onclick="window.open(this.href, 'facebook-share','width=580,height=296');return false;">
        <span class="hidden">Facebook</span>
    </a>
    <a class="icon-google-plus" href="https://plus.google.com/share?url={{site.domain_name}}{{page.url}}"
       onclick="window.open(this.href, 'google-plus-share', 'width=490,height=530');return false;">
        <span class="hidden">Google+</span>
    </a>
</section>%       
```

这里只需要把图标和href里的链接替换一下就OK了。

先说链接，网上搜索出来的答案，很多是要注册微博SDK，但是这样的简单功能应该不至于这么大费周章。万能的ChatGPT还是给出了答案：

> 要在网页上添加微博分享按钮，您可以使用微博提供的[官方分享按钮](http://service.weibo.com/share/share.php)。以下是一个基本的示例，演示如何在 HTML 中添加一个微博分享按钮：
>
> ```html
> <!DOCTYPE html>
> <html lang="en">
> <head>
>    <meta charset="UTF-8">
>    <meta name="viewport" content="width=device-width, initial-scale=1.0">
>    <title>微博分享按钮示例</title>
> </head>
> <body>
>    <!-- 微博分享按钮 -->
>    <a href="http://service.weibo.com/share/share.php?url=分享的链接&amp;title=分享的标题&amp;pic=分享的图片地址" target="_blank">
>        <img src="http://service.weibo.com/staticjs/images/icon3.png" alt="分享到微博" style="border:0;" />
>    </a>
> </body>
> </html>
> ```
>  在这个示例中：
> - `http://service.weibo.com/share/share.php` 是微博分享服务的链接。
> - `url` 参数指定要分享的链接。
> - `title` 参数指定分享的标题。
> - `pic` 参数指定分享的图片地址。
> - `<a>` 元素包含一个图片链接，点击这个链接将触发分享到微博。
> 确保您替换 `分享的链接`、`分享的标题` 和 `分享的图片地址` 为您实际的内容。
> 请注意，微博分享服务会自动生成一个窗口，用户需要登录微博来完成分享。如果您希望使用更自定义的分享按钮，您可以使用微博的[开放平台接口](https://open.weibo.com/wiki/%E5%BE%AE%E5%8D%9AJS-SDK)进行更高级的分享集成。

接下来是图标，这个就比较麻烦了。因为它用到一个新的自定义字体，里面包含各种平台的icon。找了好久终于看到了一个[知乎的答案](https://www.zhihu.com/question/29054543/answer/69536716)，里面有提到这个[IcoMoon](https://icomoon.io/app/#/select)的网页，可以免费制作svg字体。这里只要把之前的字体导入然后加入微博的图标就可以了。这里再多啰嗦一点，微博还有微信的图标都可以在Font Awesome里找到，很多简历里会导入它来表示各种联系方式。

### Tipping Section

今年的双十一好像大家都没什么钱了，消费也更加理性了。淘宝还是搞一些有的没的小游戏消耗大家时间然后换点可有可无的优惠券，京东跟李佳琦等主播开撕抢用户，最终还是得看拼多多的便宜低价，口号都打出来了：天天双十一。

![](../../../../assets/images/v2-690b49d67b3a894ab589489fb05e3c5b_b.gif)

但还是那句话，“钱难挣，屎难吃”，话糙理不糙。该省省，该花花，劳动创造价值，这个日志的打赏页面最好还是安排一下。于是简单看了一下网上的各种打赏按钮的实现，感觉不太符合咱的设计风格。这里主打一个简单直接，需求也很简单，放上微信和支付宝二维码，然后各位看官看着给点。

![](../../../../assets/images/WhubtVH62eAKTD4.gif)

为了更好地适配和调整，就把二维码放到table里面，然后在css里面设置style。css位置在assets/css/screen.css。这里用到include的方式，新建一个tip.html，

先放上html的代码：

```html
<section>
  <div>
    <table style="table-layout: fixed; margin:auto; width:100%">
      <tr><center>
        <p class="p_tip_class">如果您觉得该文章对您有用，欢迎打赏作者，激励创作!<br>
        Welcome to tip the author!</p>
      </center></tr>
     <tr>
       <td class="tip_td_class">
         微信（WeChat Pay）
       </td>
       <td class="tip_td_class">
         支付宝（AliPay）
       </td>
     </tr>
      <tr>
        <td class="tip_td_class">
          <img src="../../../../assets/images/WechatPay.png" width="50%">
        </td>
        <td class="tip_td_class">
          <img src="../../../../assets/images/AliPay.png" width="50%">
        </td>
      </tr>
      </table>
  </div>
</section>
```

这个还是比较简单，先把表格画出来就行，然后再用css来慢慢调整样式。同时在_layouts/post.html里添加include的部分。为了让td元素中的图片和文字居中显示，在css中创建新的类tip_td_class

```css
.tip_td_class {
    padding: 8px
    line-height: 20px;
    text-align: center;
    vertical-align: center;
    border-top: #EFEFEF 1px solid;
}
```

同时调整了一下垂直居中和填充。另外再把文字部分强调一下，更改一下颜色和字体：

```css
.p_tip_class {
    font-family: 'Roboto',sans-serif;/* 使用 Google 字体 Roboto 或 sans-serif */
    font-size: 18px;
    font-style: bold;
    color: #FF6666
}
```

搞完收工！

