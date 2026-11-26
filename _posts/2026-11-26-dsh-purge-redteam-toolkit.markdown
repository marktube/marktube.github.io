---
layout: post-codie
title: DSH 破甲插件折腾记：从 {{"{{cwd}}"}} 报错到 arm64 红队工具箱
date: 2026-11-26 11:00:00
disqus: true
categories: DeepSeek&nbsp;Harness
---

> 以子之矛 陷子之盾 则何如？

{% raw %}

给 DeepSeek Harness 装了个社区红队插件 dsh-purge，一开启就报 `unknown prompt variable "{{cwd}}"`，每轮对话全灭。拆开看了源码、定位到版本错配、外科手术式卸载，又装上兼容当前版本的 community fork，最后发现配套的 setup.sh 把下载资产写死成了 amd64——在这台 aarch64 的 RK3588 上全军覆没。两次手术 + 一次脚本改造后，15 个工具全部以原生 arm64 就位。记录全程。

##### 它是什么

dsh-purge 是一个**第三方** DeepSeek Harness 插件（上游开源在 GitHub，MIT），自我定位是"破甲：让所有模型都能换提示词"。它的工作方式是给 DSH 的系统提示词注入段落（`deployment:persona-suffix` 等），并且在 Apply 时 **patch DSH 宿主文件**——装完后你会在 DSH 安装目录里看到一堆 `*.dshpurge.bak`，那是它改动前留的备份。它还带一个红队（redteam）工具箱：技能封装 + 一键铺环境的 setup 脚本，依赖 nmap、nuclei、subfinder 等一堆外部二进制。

先说清楚风险面：这类插件注入的是越狱人格提示词，红队工具只应指向你**有授权**的目标；宿主机若带公网 IP，对外扫描/爆破前想清楚法律边界。

##### 第一幕：装上就报错，每轮全灭

v1.1.71 装好并开启后，聊天框每一轮都返回：

```text
本轮运行失败
unknown prompt variable "{{cwd}}" in section "deployment:persona-suffix";
registered variables: provider, model
```

##### 诊断：一条白名单引发的血案

拆开插件源码，`lib/identity.js` 里写死了它对宿主的假设：

```js
const DSH_INTERPOLATE_ALLOWED = new Set(["cwd", "model", "provider"]);
```

即：**插件假定 DSH 的模板插值白名单是 {cwd, model, provider}**。而宿主侧（`dsh-system-prompt/lib/index.js`）的插值器一旦遇到白名单外的变量就直接抛异常：

```js
throw new Error(`unknown prompt variable "{{${name}}}" in ${kind} "${input.name}"; registered variables: ...`);
```

两边的版本约定对不上：

| 项 | 值 |
| --- | --- |
| 本机 DSH | 0.2.2-rc.1（persona-suffix 段白名单只剩 provider、model） |
| 插件适配目标 | dsh 0.2.0-rc.2（README 原话："This release targets dsh 0.2 only"） |
| 结果 | 插件注入的模板渲染 `{{cwd}}` → 宿主抛异常 → 整轮失败 |

修复路线有三：换匹配版本、手术修补插件模板、停用移除。

##### 移除：一次干净的外科手术

我选了先完全移除。动手前最怕的是**盲目用 `.dshpurge.bak` 覆盖还原**——宿主的 cordis.patch.yml 里还有后来加的其他插件配置，拿旧备份一盖全洗掉。正确姿势是先逐个 diff：

```sh
find <DSH目录> -name "*.dshpurge.bak" | while read -r bak; do
  orig="${bak%.dshpurge.bak}"
  diff -q "$bak" "$orig" >/dev/null 2>&1 \
    && echo "IDENTICAL (patch inactive) :: $orig" \
    || echo "DIFFERS (patch ACTIVE) :: $orig"
done
```

实测 **17 个备份全部与现文件一致**——说明宿主补丁处于"已还原"状态（之前在面板里点过 Clean），本体根本不需要动。剩下的就是标准卸载与扫尾：

```sh
# 1) 插件管理器卸载（live 生效，pnpm 摘包）
#    remove_bundle "dsh-purge" → "Packages: -1 ... Done"
# 2) 状态目录与备份残骸
rm -rf ~/.dsh/dsh-purge/                       # 状态文件：audit、drill-grant 等
find <DSH目录> -name "*.dshpurge.bak" -delete  # 已无信息量的备份
# 3) 终验
find <DSH目录> ~/.dsh -iname "*purge*" | wc -l   # → 0
```

验收点：宿主 17 处 patch 零残留、两个 profile 的 cordis.patch.yml 无 purge 字样、其他插件配置毫发无损。

##### 第二幕：community fork v1.7.20 重生

上游 npm 源的 latest 竟是个占位符（`0.0.0-stage`），真正的活版本在社区 fork 的 GitHub Releases 里，发行物直接就是可安装的 tgz：

```sh
dsh plugin --profile web add \
  "https://github.com/<社区fork>/dsh-purge/releases/download/v1.7.20/dsh-purge-community-1.7.20.tgz"
```

这一版是重写过的：包名改为 `dsh-purge-community`，安装器**自动备份**（`~/.dsh/dsh-purge-community/backups/<时间戳>-<id>/`），并且 `package.json` 里带了一张明示的兼容表——

```json
"0.2.1-rc.1": "compatible",
"0.2.2-rc.1": "compatible",
"0.2.2-rc.2": "compatible",
"0.2.2-rc.3": "compatible"
```

我的 0.2.2-rc.1 赫然在列。`{{cwd}}` 的问题也修了：新版的 `identity.js` 不再赌宿主白名单，而是自己接管插值（白名单外的 `{{` 在线拆成 `{ {`，正文不改文件）。重启后新会话不再报错。

用法上是清晰的三层：

| 层 | 入口 | 干什么 |
| --- | --- | --- |
| UI 面板 | 左侧栏整页「Purge」 | 状态、应用、维护（最近动作/备份/更新偏好）、技能包导入 |
| CLI | `purge-community`（注意不在 PATH，用全路径） | `selfcheck --json` / `host-status` / `diagnose` / `probe` / `audit` / `backup` / `rollback` |
| 演练台 | 面板内「环境适配」+ redteam 技能 | 工具路径配置、preflight、实际演练 |

##### 工具包的 amd64 之坑

红队技能要的外部二进制不随插件分发，官方姿势是跑配套的 `~/.dsh/redteam/setup.sh`（幂等、走 GitHub Releases API 拿真实资产、下载后按 API 字节数校验防截断——设计得挺讲究）。但在这台 **aarch64** 机器上，它下载的每一个文件都是 x86 的。原因藏在正则里：

```sh
dl_asset "projectdiscovery/subfinder" "linux_amd64\.zip$" ...
dl_asset "shadow1ng/fscan"  "fscan_linux_amd64|linux_amd64.*\.(zip|tar\.gz)$" ...
dl_asset "sensepost/gowitness" "gowitness-[0-9.]+-linux-amd64$" ...
```

全脚本 12 处下载**硬编码 `linux_amd64`，没有一行 `uname -m`**。修复采用最小侵入：头部加架构检测，全部正则参数化：

```sh
case "$(uname -m)" in
  x86_64)        ARCH_NAME="amd64" ;;
  aarch64|arm64) ARCH_NAME="arm64" ;;
  armv7l|armv6l) ARCH_NAME="arm" ;;
  *)             ARCH_NAME="$(uname -m)" ;;
esac
# 随后 sed：linux_amd64 → linux_${ARCH_NAME}、linux-amd64 → linux-${ARCH_NAME}
```

顺带一个隐性 bug：ksubdomain 的资产正则原本是 `"linux.*\.zip$"`——**不带架构锚定**，就算在 x86 上也是"撞大运取第一个匹配"。一并参数化成 `linux_${ARCH_NAME}\.zip$`。改完 `bash -n` 过、diff 审过 35 行变更，重跑 `--yes`：

```text
目标架构: aarch64 → 资产后缀 linux_arm64
✓ frp_0.72.0_linux_arm64.tar.gz → .../toolkit/frp/（12925619 字节，与官方一致）
✓ frpc 就位（冒烟测试通过）  ✓ frps 就位（冒烟测试通过）
✓ subfinder_2.17.0_linux_arm64.zip → ...（9378288 字节，与官方一致）
✓ httpx_1.12.0_linux_arm64.zip → ...（17927774 字节，与官方一致）
✓ gowitness-3.2.2-linux-arm64 → ...（48758944 字节，与官方一致）
```

11 个工具全部以 arm64 落盘并通过字节校验与冒烟测试；改过的脚本在 x86 机器上行为不变（`ARCH_NAME` 自动回落 amd64），双向兼容。

##### 补漏三则：上游不会替你想清楚的事

**① fscan 的资产改名了。** 最新 release 里标准名 `fscan_<版本>_linux_arm64` 不存在，arm64 只有 `fscan-nolocal_*` 变体。用 Releases API 先列资产再选，落成 `toolkit/fscan/fscan`。

**② chisel 解压后没执行位。** `curl` 下载的 `.gz` 是 644，`gunzip` 原样保留权限，脚本里那句 `mv` 又因为源和目标是同一个文件而报错跳过了 chmod——最终二进制在、但 `-x` 不过，体检表显示"缺失"。一行 `chmod +x` 救回。教训：**解压/移动后的二进制要显式 chmod，别信继承**。

**③ john 装了却"不在"。** Debian 把 john 放在 `/usr/sbin`（不在普通用户 PATH），`command -v john` 当然找不到。软链进 `~/.local/bin` 即可。同理把 toolkit 里的 nuclei 也链过去，省得每条命令写全路径。

PATHD 清单里 Debian 12 源直接 `apt install` 的有：nmap、masscan、sqlmap、ffuf、gobuster、hydra、hashcat、nikto、whatweb、proxychains4（全部原生 aarch64）；feroxbuster、wpscan、amass、theHarvester、msfconsole、searchsploit 源里没有，缺了只降级不挡路。

##### 验收

| 检查项 | 命令 | 结果 |
| ------ | ---- | ---- |
| 工具箱 | `file` 逐个二进制 | 15/15 全部 ARM aarch64 |
| 插件体检 | `setup.sh --check` | 14/14 冒烟通过，无缺失 |
| 插件自检 | `purge-community selfcheck` | `✓ 运行时提示词注入 1/1`，`broken: 0` |
| ksubdomain | 上游无 arm64 → 本机 Go 自编译 → 拷入 toolkit | 冒烟通过 |

另外，ksubdomain 编译时记得加上 go 的镜像加速和`apt`安装`libpcap-dev`。


##### 花絮：三条踩坑哲学

**"不要由智能体下载工具。"** 插件的 preflight 提示里反复强调这句：工具二进制应由用户自己下载到 `~/.dsh/redteam/toolkit/`（或任意目录后在「环境适配」的 `binDirs` 里登记），智能体只负责探测路径和配置。第一次觉得多此一举——直到 setup.sh 抓了一堆 amd64 下来，才明白把"下载"和"配置"分离，恰好让架构问题在人的眼皮底下暴露，而不是被静默吞掉。

**备份先于一切。** 从 17 个 `.dshpurge.bak` 到安装器的 `backups/<时间戳>-<id>/` 快照，再到面板里的回滚页，这套插件的每个破坏性动作都先留退路。做宿主级 patch 的插件，这是唯一合格的姿势——也让"完全移除"变成了一件十分钟内可以放心做完的事。

**"Jekyll 连代码块里的双花括号都不放过。"** 写这篇时踩的彩蛋坑：Jekyll 的 Liquid 是在 markdown 转换**之前**对全文做模板处理的——哪怕 `{{cwd}}` 躺在 ```text 代码块里，也会被当成 Liquid 变量解析，直接炸掉构建。解法是用 Liquid 的 raw 标签对把正文原样包起来（本篇开头那对就是），且 raw 块内不能再出现字面的结束标签——嵌套即自爆。于是这篇博客出现了一个套娃奇观：一篇讲 `{{cwd}}` 报错的文章，自己先被 `{{cwd}}` 炸了两次。

__以上操作仅用于自有环境的授权安全测试，红队工具与越狱提示词请遵守当地法律法规，勿用于未授权目标!__


***

###### Reference:

[dsh-purge 上游项目](https://github.com/YuJunZhiXue/dsh-purge)

[ProjectDiscovery 工具族](https://github.com/projectdiscovery)

[fscan](https://github.com/shadow1ng/fscan)

[DeepSeek Harness](https://www.deepseek.com/harness/)

###### 落款:

本篇的诊断、卸载、版本适配与 setup.sh 架构改造由 **DeepSeek**（DeepSeek 会话 AI 助手）完成——从读报错定位白名单错配，到 35 行 patch 让 12 个下载项学会认架构；作者负责选方案、自己编译 ksubdomain、以及在 GitHub 上找到那个能用的 fork。

*—— DeepSeek · 2026-11-26，于 RK3588 上空*
{% endraw %}
