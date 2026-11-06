---
layout: post-codie
title: 给FlareDrive-R2加上D1登录并做一轮安全加固
date: 2026-11-06 07:00:00
disqus: true
categories: Cloudflare
---

> Cache for cache

##### 整体架构
先看一眼改造后的结构。所有请求都经过 Pages Functions 鉴权，D1 存账户，R2 只通过 binding 访问，不再开放公开 URL。

![architecture](../../../../assets/images/flaredrive-architecture.png)

| 组件            | 作用                               | 备注                              |
| --------------- |:----------------------------------:|:---------------------------------:|
| Pages Functions | 路由、鉴权、读写 R2/D1             | `functions/` 目录下按路径自动映射 |
| D1              | 账户表 `users`                     | SQLite 语法，参数化查询           |
| R2              | 文件本体、缩略图                   | 没有原生的重命名/移动             |
| vue3-sfc-loader | 浏览器里直接编译 `.vue`            | 免构建，但组件是异步挂载的        |

##### 用D1做登录和修改密码
原来的账户是 `user:pass` 这样的环境变量，读写权限靠后缀区分（`:r` 表示只读）。问题很明显：密码明文、改一次就要重新部署、用户自己不能改密码。

新建一张表：

{% highlight sql %}
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- PBKDF2-SHA256 的十六进制结果
  salt          TEXT NOT NULL,   -- 每个用户独立的随机盐
  permissions   TEXT NOT NULL,   -- 逗号分隔的目录前缀，或 "*"
  is_readonly   INTEGER NOT NULL DEFAULT 0,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
{% endhighlight %}

密码用 Workers 原生支持的 Web Crypto 做 PBKDF2，10 万次迭代、256 位输出，比较时用定长比较，避免时间侧信道：

{% highlight javascript %}
const bits = await crypto.subtle.deriveBits(
  { name: "PBKDF2", salt: hexToBuf(saltHex), iterations: 100000, hash: "SHA-256" },
  keyMaterial,
  256
);
{% endhighlight %}

校验入口统一成一个 `resolveAccount()`：先查 D1，查不到再回退到旧的环境变量账户，这样老部署不会一升级就登不进去。

![login flow](../../../../assets/images/login-flow.png)

建库和建表：

{% highlight sh %}
wrangler d1 create flaredrive-users
wrangler d1 execute flaredrive-users --file=./migrations/0001_create_users.sql --remote
{% endhighlight %}

然后在 Pages 项目设置里把这个库绑定成 `DB`。修改密码接口要求先验证旧密码，注册接口遇到重名会返回 409，前端据此提示"用户名已存在"。

##### 一个很危险的越权漏洞
测试时发现 D1 里所有账户的 `is_admin` 都是 0，可管理接口照样能调。原因是判断逻辑写成了：

{% highlight javascript %}
isAdmin: !!user.is_admin || permissions.includes("*")
{% endhighlight %}

也就是说，只要一个账户有 `"*"` 目录权限，哪怕它是**只读**账户，也被当成管理员，可以直接用 curl 调 `/api/auth/register` 给自己造一个新账户。修法是把"管理员"和"目录权限"彻底拆开：

- `isAdmin` 只看 D1 的 `is_admin` 列；
- 环境变量账户的 `isAdmin` 恒为 `false`，不再具备任何账户管理能力；
- 注册接口只有管理员能调，并且显式接收 `isAdmin` 字段。

那第一个管理员怎么来？数据库里存的是加盐哈希，没法手写 INSERT。仓库里加了个 Node 小脚本，用和后端完全相同的参数算哈希，生成 SQL 再交给 wrangler：

{% highlight sh %}
node scripts/create-admin-sql.js admin "一个强密码" > admin.sql
wrangler d1 execute flaredrive-users --file=./admin.sql --remote
rm admin.sql   # 里面有密码哈希，用完删掉
{% endhighlight %}

顺带把所有 D1 查询过了一遍，全部是 `prepare().bind()` 参数化，没有字符串拼接，SQL 注入是干净的。

##### XSS和CSRF
这个项目用的是 HTTP Basic 认证，不是 Cookie。一般来说浏览器不会给跨站请求自动带上 `Authorization` 头，**除非**服务端曾经返回过 `WWW-Authenticate: Basic`，让浏览器弹出原生登录框并缓存了凭据。之后浏览器会对这个域名的所有请求自动带上凭据，包括别的网站发起的请求，CSRF 就又回来了。所以做了两层：

1. 写接口（PUT/POST/DELETE）的 401 响应不再带 `WWW-Authenticate`；
2. 再加一道 Origin 校验：带了 `Origin` 头且和本站不一致就 403。不带 Origin 的请求（curl、脚本）照常放行。

{% highlight javascript %}
export function isCrossOriginRequest(context) {
  const origin = context.request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(context.request.url).host;
  } catch {
    return true;
  }
}
{% endhighlight %}

XSS 方面，别人上传一个 `.html` 或 `.svg`，如果在本站域名下直接渲染，里面的脚本就能读到当前页面的上下文。`/raw/` 现在统一加上：

- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: sandbox`
- html/svg/xml 强制 `Content-Disposition: attachment`

另外还发现分片上传的 POST 之前完全没做鉴权，等于任何人都能往任意路径写文件，一并补上了。

##### 用R2 binding替代公开URL
原版下载走的是 R2 的公开访问地址（环境变量 `PUBURL`）。这个地址虽然只配在 Pages 的环境变量里，但页面要用它拼图片和视频地址，所以任何人打开网页都能看到；拿到域名后就可以绕过所有权限直接下载文件。

改成 `/raw/[[path]].ts` 里直接用 binding 读 R2，同时把视频播放需要的 Range 和缓存需要的条件请求都实现了：

{% highlight javascript %}
const object = await bucket.get(path, {
  range: request.headers,
  onlyIf: request.headers,
});
if (!object) return notFound();
if (!("body" in object)) return new Response(null, { status: 304, headers });
if (object.range) {
  headers.set("Content-Range", formatContentRange(object.range, object.size));
  return new Response(object.body, { headers, status: 206 });
}
{% endhighlight %}

改完之后就可以在 R2 控制台里关掉存储桶的公开访问了。有人担心 Workers 的请求体限制会影响大文件，其实上传本来就是 100MB 一片的 multipart，下载是流式返回，都不受影响。

至于 `/raw/` 要不要也做读权限校验，目前还没定。`<img>`、`<video>` 和全景图查看器都没法带自定义请求头，分享链接也要求不登录能打开，所以比较合适的方向是带过期时间的 HMAC 签名 URL，后面再做。

##### 视频缩略图为什么总是不显示
缩略图本身其实生成成功了，存在 `customMetadata.thumbnail` 里。真正的原因是普通 PUT 上传从来没有保存 `content-type`，只有超过分片阈值的大文件才有。列表接口拿到的类型是 `undefined`，前端就当成 `application/octet-stream`，自然不会去显示缩略图。

修复分三步：

- PUT 时把请求头里的 `Content-Type` 写进 `httpMetadata`，复制/移动时沿用源文件的类型；
- `MimeIcon.vue` 对 `video/*` 也显示缩略图；
- 为已有文件加了"重新生成缩略图"。

![thumbnail](../../../../assets/images/thumbnail-flow.png)

第一版重新生成是把整个视频下载成 Blob 再截帧，几百 MB 的视频要等很久，有时候还解码失败。后来改成直接把 `/raw/` 的地址交给 `<video>`，浏览器会自己发 Range 请求，只拉取元数据和目标帧附近的数据；`seeked` 之后用 canvas 截一帧。补元数据走一个新的 `POST ?fixMetadata`，在 R2 内部读回写同一个 key，不用把原视频再上传一遍。进度也从右上角的小提示改到了屏幕中央。

##### 递归删除文件夹
R2 里没有真正的目录，文件夹只是一个 `路径/_$folder$` 的空标记对象。原来删文件夹只删这个标记，里面的文件全变成了孤儿。现在先用 `getAllItems(prefix)` 递归列出前缀下的所有对象，逐个删除，最后删标记。

##### 访问统计Vercount不工作
`index.html` 里引入的 Vercount 脚本只在页面 `load` 的时候扫描一次 DOM，找 `vercount_value_site_pv` 这类 id 填数字。可是 Footer 是 vue3-sfc-loader 异步编译后才挂载的，脚本执行时那几个 `<span>` 根本还不存在，它也不会重试。解决办法是去掉 script 标签，在 `Footer.vue` 的 `mounted()` 里自己调用统计接口，再把返回的数字写进去。

##### 文件夹重命名：做了，然后又删了
本来加了文件夹重命名，测试时发现一个 bug：重命名成一个已经存在的文件夹名，会把所有文件合并进那个文件夹。查了 R2 的文档，它确实**没有**原生的 rename/move 操作，只能"复制到新 key 再删除旧 key"，没有原子性。要做对就得处理重名冲突、中途失败回滚、以及"把自己有权限的目录改名成没权限的目录名"这类权限问题，代价不小。最后决定先把这个功能拿掉，回退那次提交：

{% highlight sh %}
# 还没 push：直接丢掉最近一次提交
git reset --hard HEAD~1

# 已经 push：用一个反向提交撤销，不改写远端历史
git revert HEAD
git push
{% endhighlight %}

##### 安卓上文件名溢出边框
在一些安卓手机上，文件列表里的图标和文字会超出圆角边框，文件名还会掉到下边框外面。原因叠了好几层：

![android](../../../../assets/images/android-overflow.png)

- 文字容器是 `width: 100%`，旁边的图标又不收缩，加起来比整行宽；
- `.file-name` 没写字号，继承浏览器默认的 16px，再被系统"字体大小"设置放大；
- 列表项是固定的 `height: 64px`，字一变大就从下边溢出；
- 部分安卓浏览器还会自动放大文字（font boosting）；
- 旧版 WebView 不支持 `:has()`，回退规则用了 `~` 选择器，给复选框后面的所有元素都加了 32px 左边距。

对应的 CSS：

{% highlight css %}
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
.file-item {
  height: auto;
  min-height: 64px;
  padding: 6px 8px;
}
.file-info-container {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
}
.file-name {
  font-size: clamp(13px, 3.8vw, 15px);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
{% endhighlight %}

第一次修的时候只在 480px 以下的屏幕把高度放开，结果手机宽度刚好大于这个值，问题依旧。教训是：**不要用固定高度去装会随系统设置变化的文字**，用 `min-height`。

##### 用curl上传文件
接口就是普通的 HTTP + Basic 认证，curl 不发 `Origin` 头，CSRF 校验不会拦它。小文件一条命令：

{% highlight sh %}
curl -u "$USER:$FLARE_PASS" -X PUT \
  -H "Content-Type: image/png" \
  --data-binary @photo.png \
  "https://your-site.pages.dev/api/write/items/photos/photo.png"
{% endhighlight %}

`Content-Type` 一定要带，缩略图和预览图标都靠它。路径里有空格或中文要先做百分号编码，下面是一个只用 bash 的小函数：

{% highlight sh %}
urlenc() {
  local LC_ALL=C s="$1" i c out=""
  for ((i=0; i<${#s}; i++)); do
    c="${s:i:1}"
    case "$c" in [a-zA-Z0-9.~_/-]) out+="$c" ;; *) out+="$(printf '%%%02X' "'$c")" ;; esac
  done
  printf '%s' "$out"
}
{% endhighlight %}

超过 100MB 的文件要走和网页端一样的三步 multipart：

{% highlight sh %}
#!/usr/bin/env bash
set -euo pipefail
SITE="https://your-site.pages.dev"; USER="user"; PASS="${FLARE_PASS:?}"
FILE="$1"; KEY="$2"; CHUNK=100000000
URL="$SITE/api/write/items/$(urlenc "$KEY")"
MIME="$(file --mime-type -b "$FILE")"
HDR="$(mktemp)"; trap 'rm -f "$HDR"' EXIT

# 1) 创建分片上传，拿到 uploadId
UPLOAD_ID="$(curl -fsS -u "$USER:$PASS" -X POST -H "Content-Type: $MIME" "$URL?uploads" \
  | sed -n 's/.*"uploadId":"\([^"]*\)".*/\1/p')"

# 2) 逐片上传，记下每片的 ETag
SIZE=$(wc -c < "$FILE"); N=$(( (SIZE + CHUNK - 1) / CHUNK )); PARTS=""
for ((i=1; i<=N; i++)); do
  tail -c +$(( (i-1)*CHUNK + 1 )) "$FILE" | head -c "$CHUNK" \
    | curl -fsS -u "$USER:$PASS" -X PUT --data-binary @- -D "$HDR" -o /dev/null \
        "$URL?uploadId=$UPLOAD_ID&partNumber=$i"
  ETAG="$(tr -d '\r' < "$HDR" | sed -n 's/^[Ee][Tt][Aa][Gg]: //p')"
  PARTS+="${PARTS:+,}{\"partNumber\":$i,\"etag\":\"${ETAG//\"/\\\"}\"}"
done

# 3) 合并
curl -fsS -u "$USER:$PASS" -X POST -H "Content-Type: application/json" \
  -d "{\"parts\":[$PARTS]}" "$URL?uploadId=$UPLOAD_ID"
{% endhighlight %}

几点注意：密码放环境变量里，别直接写在命令行（`ps` 能看到）；想让新目录在网页上显示出来，需要额外上传一个空的 `目录/_$folder$` 标记；脚本上传的视频没有缩略图，可以回网页上点"重新生成缩略图"。

##### 还没做的
- `/raw/` 的读权限：打算用带过期时间的 HMAC 签名 URL，兼顾分享链接、缩略图和全景图；
- WebDAV：可以沿用 `_$folder$` 约定和现有的目录权限检查；
- 视频截帧固定 seek 到 0.1 秒，有些视频开头是黑屏，可以改成多取几帧选最亮的一张。

###### Reference:
[1] [FlareDrive-R2](https://github.com/marktube/FlareDrive-R2)

[2] [FlareDrive (upstream)](https://github.com/longern/FlareDrive)

[3] [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)

[4] [Cloudflare D1](https://developers.cloudflare.com/d1/)

[5] [MDN: SubtleCrypto.deriveBits()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits)

[6] [MDN: text-size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust)
