---
layout: post
title: Cloudns域名托管到Cloudflare并双向解析
date: 2025-02-23 21:57:06
mathjax: false
disqus: true
categories: Network
---

> 狡兔三窟

由于最近us.kg滥用的问题，本人之前部署的一批Cloudflare应用全都无法访问了。所以想到要找一个备用域名以防不测，该域名最好具有下面的特性： 

+ 可托管到大善人
+ 尽可能较低费用
+ 能够稳定长时间使用


### 注册ClouDNS域名

首先来说一说能托管到小黄云的域名后缀有哪些。**PSL(Public Suffix List)**是一个由 Mozilla 维护的开放列表，包含互联网中的公共后缀域名（public suffixes）。这些后缀是不同组织共享的，比如顶级域名（TLD）、国家代码顶级域名（ccTLD）以及某些允许用户注册子域的二级或三级域名。


🔹 **为什么需要 Public Suffix List？**

通常，浏览器和安全策略会认为 "example.com" 和 "sub.example.com" 属于同一个所有者，但在某些情况下，这种假设是不对的。例如：

- `github.io`：GitHub Pages 允许用户创建 `user.github.io`，但这些是不同用户的独立网站。
- `co.uk`：在英国，`example.co.uk` 和 `test.co.uk` 并不属于同一个组织。
PSL 解决了这个问题，它帮助应用程序正确识别哪些域名是公共的，哪些是私人注册的。

🚀 **Public Suffix List 的主要用途**

1. 🍪 Cookie 安全管理（浏览器 SameSite 机制）
- 防止网站在 *.github.io 这样的公共域上设置跨用户 Cookie，防止潜在的 CSRF 攻击。

2. 🔑 浏览器存储隔离
- 避免 eviluser.github.io 读取 legituser.github.io 的 LocalStorage 数据，提高安全性。

3. 📧 电子邮件验证（防止钓鱼）
- 电子邮件提供商可以使用 PSL 检查域名，避免 paypal.secure-login.com 伪装成 paypal.com。

4. 🌍 域名解析
- 确保 example.co.uk 和 example.com 这样不同级别的域名被正确识别。

简单来说，在PSL中的域名都可以托管到大善人上。[PSL](https://publicsuffix.org/list/) 可以在[这里](https://publicsuffix.org/list/public_suffix_list.dat)查看，该文件同时在Github上开源。这里面最值得注意的就是可以创建一个免费域名的[ClouDNS](http://www.cloudns.net)：
```txt
// Cloud DNS Ltd : http://www.cloudns.net
// Submitted by Aleksander Hristov <noc@cloudns.net> & Boyan Peychev <boyan@cloudns.net>
cloudns.asia
cloudns.be
cloud-ip.biz
cloudns.biz
cloudns.cc
cloudns.ch
cloudns.cl
cloudns.club
dnsabr.com
ip-ddns.com
cloudns.cx
cloudns.eu
cloudns.in
cloudns.info
ddns-ip.net
dns-cloud.net
dns-dynamic.net
cloudns.nz
cloudns.org
ip-dynamic.org
cloudns.ph
cloudns.pro
cloudns.pw
cloudns.us
```
免费域名支持最多50条DNS记录，这对于普通用户已经足够了~~如果不够就再注册一个ClouDNS账户~~。建议选短一点的.com或者.net域名。

### 托管到大善人
托管的方式和之前的us.kg类似，但是多了其它一些步骤，时间可能也久一点，亲测大概24h后才能正常使用。
##### 1.配置nameserver
在[大善人](https://cloudflare.com)面板上点击蓝色的添加域名(Add a domain)按钮，填入刚才注册好的cloudns域名。之后Cloudflare就会弹出两个NS记录让你添加：
![nameserver](../../../../assets/images/cf_nameserver.jpg)
这时候需要切到cloudns，先清空之前所有的dns记录。然后需要在cloudns的面板中点击“+ Add new record”，按照大善人的指引，分别填入两个ns记录即可。等待30min，出去买瓶水或者刷刷知乎b站小红书，回来应该可以看到已经在大善人上出现域名了。

##### 2.配置双向解析
后续步骤参考[这里](https://www.zhadu.com/programming/cloudflare1.html)。这里简单总结一下，并对一些名称进行解释。

1. 在大善人中添加优选域名cname
2. 在cloudns中添加两个ns记录实现优选域名的cname解析
3. 在cloudns中使用通配符将解析请求转到大善人

为了更好地理解这些操作，我们先来看看DNS记录中几种常见的类型。通常来说，DNS记录是一个从域名到IP地址的映射，这就是最基本的A记录。DNS 记录（DNS Record）是域名系统（DNS）用来解析和管理域名的方式。以下是 NS、CNAME、A、TXT 这四种常见 DNS 记录的含义和作用：
1. NS 记录（Name Server 记录）
- 作用：指定该域名的 权威 DNS 服务器，决定 DNS 解析交给哪个服务器处理。
- 典型用途：通常用于将域名解析管理交给云服务商（如 Cloudflare、阿里云等）。
- 示例：
```txt
example.com.    IN NS    ns1.dnsprovider.com.
example.com.    IN NS    ns2.dnsprovider.com.
```
这表示`example.com`的DNS解析由`ns1.dnsprovider.com`和`ns2.dnsprovider.com`负责。

2. A 记录（Address 记录）
- 作用：将域名映射到 IPv4 地址，是最常见的 DNS 记录类型。

- 典型用途：用于指向网站服务器的 IP 地址。

- 示例：

```txt
example.com.    IN A    192.168.1.1
```
这表示`example.com`解析到`192.168.1.1`这个 IPv4 地址。

⚠️ 注意：

- IPv6 使用 AAAA 记录（类似 A 记录，但指向 IPv6 地址）。
例如：
```txt
example.com.    IN AAAA  2400:cb00:2048:1::c629:d7a2
```

3. CNAME 记录（Canonical Name 记录）
- 作用：将一个域名 别名（Alias） 指向另一个域名，最终解析结果由目标域名决定。

- 典型用途：

用于将`www.example.com`指向`example.com`，避免修改多个 A 记录。
用于 CDN 解析，指向 `cdn.example.com` 而非固定 IP。

- 示例：

```txt
www.example.com.    IN CNAME    example.com.
blog.example.com.   IN CNAME    host.provider.com.
```
这表示：

`www.example.com` 解析到 `example.com`，最终由 `example.com` 的 A 记录决定 IP。
`blog.example.com` 解析到 `host.provider.com`，IP 由 `host.provider.com` 的 A 记录决定。

⚠️ 注意：

- 不能对根域（example.com）直接设置 CNAME，因为根域需要 A 记录解析到 IP。
- 但部分 DNS 提供商（如 Cloudflare）提供 CNAME Flattening，可在根域使用 CNAME。

4. TXT 记录（Text 记录）
- 作用：存储 文本信息，通常用于验证域名所有权、安全策略等。

- 典型用途：

    + 域名验证（如 Google Search Console、AWS、Cloudflare）
    + SPF 记录（邮件发信策略，防止垃圾邮件）
    + DKIM 记录（邮件签名，防止伪造邮件）
    + DMARC 记录（邮件安全策略）

- 示例：

```txt
example.com.    IN TXT   "google-site-verification=abc123"
example.com.    IN TXT    "v=spf1 include:_spf.google.com ~all"
```
这些 TXT 记录的作用：

- 第一条用于 Google 搜索验证。
- 第二条 SPF 记录允许 Google 服务器发送 example.com 邮件，防止垃圾邮件。

最后说一下优选域名的作用，个人理解不对请轻喷。因为国内没有域名根服务器，大多数dns注册和解析依靠外面的服务器。而因为GFW的存在，不得不对一些dns的请求放行。因为大善人有很多cdn服务器，国际和国内的业务也都有，不能完全一刀切把它封死。所以会有一些大厂的dns服务能够在国内也可以访问和解析，这些大厂的存在使得我们可以通过他们的dns服务器域名进行转发和解析，这就是优选域名的作用，为了国内能够更快地访问和解析域名。
对于某些特殊的大善人自己的服务站点，它会阻断来自大善人自己服务的请求，这时候就需要反代IP来进行转发，也就是经常说的ProxyIP，具体参考[这里](https://upsangel.com/security/vpn/cloudflare-worker-vless%E7%BF%BB%E7%89%86%E4%BB%A3%E7%90%86%E5%8E%9F%E7%90%86-proxyip%E7%B4%B0%E7%AF%80%E7%A0%94%E7%A9%B6/)。

##### 3.配置边缘证书
同样按照上面的[参考](https://www.zhadu.com/programming/cloudflare1.html)进行配置，主要步骤就是**在cloudns中添加两条ns记录“_acme-challenge.你的域名”指向cloudflare的nameserver**。也可以手动去添加txt记录验证证书，参考[这里](https://blog.csdn.net/techshrimp/article/details/140561335)。

---
2025年3月14日更新

us.kg寄了，不到一年，免费域名因为滥用被投诉，迁移到dpdns.org了。。。以下是官方通告：
> 📢 Important Notice: US.KG Suspension & Migration to DPDNS.ORG
Dear User,
>
> We regret to inform you that due to domain abuse and other related issues, after extensive discussions with the .KG registry, ccltd.kg will no longer be allowed to receive any complaint reports—otherwise, the .KG registry will permanently disable domain resolution.
>
> US.KG Domains: Current Situation
> Although US.KG DNS resolution has been temporarily re-enabled, please be aware that if any further complaints are received, the .KG registry will immediately revoke DNS resolution again. This restriction is beyond our control, as it is an official policy of the .KG registry, not a decision made by us.
>
> As a result, we are forced to suspend all US.KG domain resolutions, and the ability to register new US.KG domains has been disabled. We, DigitalPlat FreeDomain, are also victims of this policy change and understand the inconvenience this may cause. Despite this setback, we are actively seeking better and more stable alternatives to continue providing free domain services.
>
> Migration to a New Domain: DPDNS.ORG
> To ensure service continuity, we are introducing a new domain: dpdns.org.
>
> For example: If your previous domain was example.us.kg, your account will be automatically switched to example.dpdns.org once the new system is ready.
> 🚧 Important Notice:
> dpdns.org is still under testing and is NOT available for resolution, management, or new registrations yet.
> Please wait for our official announcement before making any changes.
> Why DPDNS.ORG?
> ✅ .ORG TLD (regulated by ICANN, meaning it cannot be arbitrarily banned).
> ✅ Registered via Gandi.net (a reputable domain registrar, same as eu.org).
> ✅ Stronger security and anti-abuse measures to prevent misuse and ensure long-term stability.
> Future Plans & Next Steps
> We are actively working on debugging the dpdns.org DNS system to ensure it is stable, secure, and reliable for future use. This process will take some time, and dpdns.org will remain unavailable until we make an official announcement.
>
> 🚧 This situation was caused by the policies of the .KG registry, not by us. We, DigitalPlat FreeDomain, are also affected by this decision.
>
> 💡 However, we are committed to finding a better and more stable solution for all users.
>
> 📅 A new update will be released in the coming days with more details on our progress.
>
> We sincerely apologize for any inconvenience this may cause and appreciate your patience and support.
>
> We understand your frustration and confusion—we are also victims of this situation 😞. This was not our decision; it was a policy enforced by the .KG registry. We are actively working to find a better and more stable solution to keep your services running smoothly. Thank you for your understanding ❤️.
>
> 🙏 Thank you for your understanding and support!
>
> — DigitalPlat FreeDomain Team
