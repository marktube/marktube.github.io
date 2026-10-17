---
layout: post
title: macOS下latex编译环境搭建
date: 2026-10-16 20:46
mathjax: false
disqus: true
pannellum: flase
categories: Computer
---

> 如无必要，勿增实体

最近因为在使用MacTex自带的TexShop编译bib文件时，出现了下面的错误：
```bash
usage: lipo <input_file> <command> [<options> ...]
  command is one of:
    -create[_album]
    -info
    -detailed_info
    -thin <arch>
    -extract <arch> [-extract <arch> ...]
    -remove <arch> [-remove <arch> ...]
    -replace <arch> <file_name> [-replace <arch> <file_name> ...]
    -verify_arch <arch> ...
    -archs
  options are one or more of:
    -arch <arch> <input_file>
    -o <output_file>
    -segalign <arch> <alignment>
/Library/TeX/texbin/biber: extracting arm64 binary with lipo failed (wstatus=256)
```
一时间以为是未升级依赖的原因。但是折腾升级之后依然如此，才发现这个lipo只是将某个芯片架构的程序提取出来的工具。问了Gemini之后才发现，这个主要是苹果自己的锅。它是跟着xcode-command-line-tools一起安装的。但是它现在无法从biber里面提取arm64架构的程序，可能是我更新了系统版本，导致这个没有适配。附上Gemini的回答：
> 這個錯誤通常發生在 macOS 系統上，當你嘗試執行特地為 Apple Silicon (arm64) 和 Intel (x86_64) 設計的通用二進位檔案（Universal Binary）時，系統底層的 lipo 工具在解包過程中失敗了。
> 錯誤代碼 wstatus=256 通常代表找不到命令（Command not found）或權限被拒絕。最常見的原因是你的系統沒有安裝 Xcode 命令列工具（Command Line Tools），或者執行路徑發生了衝突。
> 請依照以下步驟依序排查與修正：
> 
> 1. 安裝或重設 Xcode 命令列工具（最常見解法）
> 
>   lipo 是由 Xcode 或命令列工具提供的二進位管理工具。如果沒有安裝，系統就無法呼叫它。
>   請開啟「終端機」（Terminal）並執行以下指令：
>   ```bash
>   xcode-select --install
>   ```
>   請謹慎使用程式碼。
>   這會跳出一個視窗提示你安裝，請點選「安裝」並等待完成。
>   如果系統提示已經安裝，但依然報錯，請嘗試重設其路徑：
> ```bash
> sudo xcode-select --reset
> ```
> 請謹慎使用程式碼。
> 
> 2. 檢查 lipo 是否能正常執行
> 
> 安裝或重設完成後，測試 lipo 是否能被系統找到：
> ```bash
> which lipo
> ```
> 請謹慎使用程式碼。
> 正常狀況下，它應該會輸出 /usr/bin/lipo。
> 接著測試隨便看一個資訊：
> ```bash
> lipo -info
> ```
> 請謹慎使用程式碼。
> 如果沒有再跳出錯誤，代表 lipo 已經可以正常運作。
> 
> 3. 如果依然失敗：單獨為 Biber 修正（MacTeX 環境）
> 
>   如果你的 lipo 正常但 biber 依然卡住，可能是 MacTeX 中的 biber 封裝腳本在解包時遇到了路徑或架構識別問題。你可以嘗試以下兩種替代方案：
>   - 方案 A：更新 MacTeX / TeX Live
>   舊版本的 Biber 腳本可能對 Apple Silicon 的相容性較差，建議更新你的 TeX 發行版：
>   ```bash
>     sudo tlmgr update --self
>     sudo tlmgr update biber
>   ```
> 請謹慎使用程式碼。
> - 方案 B：手動下載原生 arm64 的 Biber 二進位檔
> 你可以到 Biber 官方 SourceForge 下載直接支援你的 Mac 架構（如 darwin_arm64）的獨立二進位檔案，將其解壓並替換掉 /Library/TeX/texbin/biber，這樣系統就不需要再透過 lipo 去做動態解包。
> 如果執行 `xcode-select --install` 時遇到了其他錯誤，請告訴我：
> • 你的 Mac 是 M1/M2/M3 (Apple Silicon) 還是 Intel 晶片？
> • 執行 which lipo 後終端機回傳了什麼路徑？
> 我會為你提供更進一步的排查步驟。

反正折腾半天，官方支持不行，那就换个路子——直接找原生arm64的biber二进制。唯一比较气人的是MacTex这个大包足足占了8G空间，还出这么多幺蛾子。思来想去，还是卸载这个庞然大物，转而投靠小而美的BasicTex，搭配VSCode，使用体验直线上升。接下来，就跟着Gemini一起，卸载MacTex，安装BasicTex。

> 要完全移除 MacTeX 並換成輕量化的 BasicTeX（約 100+ MB，相比 MacTeX 的 5GB+ 大幅瘦身），同時在 M4 Mac 上搭配 VS Code 順暢運行，請按照以下步驟操作：
> 
> 第一步：完全乾淨移除舊的 MacTeX
> 
> 請開啟終端機（Terminal），依序複製並執行以下指令，徹底刪除舊的發行版與路徑殘留：
> 1. 刪除主要發行版目錄及軟連結：
> ```bash
>   sudo rm -rf /usr/local/texlive
>   sudo rm -rf /Library/TeX
> ```
> 請謹慎使用程式碼。
> 
> 2. 刪除 GUI 應用程式（如 TeXShop、BibDesk 等）：
> ```bash
>   sudo rm -rf /Applications/TeX
> ```
> 請謹慎使用程式碼。
> 
> 3. 刪除偏好設定與快取殘留（選填，確保乾淨）：
> ```bash
>   rm -rf ~/Library/Preferences/org.tug.mactex.plist
>   rm -rf ~/Library/Application\ Support/TeXLive
> ```
> 請謹慎使用程式碼。
> 
> 第二步：安裝輕量化 BasicTeX
> 
> 建議直接使用 Homebrew 安裝，它會自動處理 M4 晶片的環境變數與路徑：
> ```bash
>   brew install --cask basictex
> ```
> 請謹慎使用程式碼。
> (安裝完成後，請重啟你的終端機，或者執行 `source ~/.zshrc` 讓環境變數生效。)
> 
> ⚠️ 關鍵補給：安裝常用的基礎套件
> 
> BasicTeX 因為極度精簡，預設沒有包含中文字型處理（ctex）及文獻檢索（biber）。為了避免等一下編譯報錯，請直接執行以下指令補齊常用套件：
> ```bash
>   sudo tlmgr update --self
>   sudo tlmgr install ctex environ collection-fontsrecommended biber biblatex
> ```
> 請謹慎使用程式碼。
> 註：透過此方式安裝的 biber 為適應新系統的最新版本，不會再觸發先前 lipo 的錯誤。
> 
> 第三步：配置 VS Code 開發環境
> 
> 1. 在 VS Code 的 Extensions（擴充功能）市場中，搜尋並安裝 LaTeX Workshop 插件。
> 2. 按下 Cmd + , 打開設定，點擊右上角的 Open Settings (JSON) 圖示，將以下基礎配置加入你的 settings.json 中：
> ```json
> {
>     "latex-workshop.latex.tools": [
>         {
>             "name": "xelatex",
>             "command": "xelatex",
>             "args": [
>                 "-synctex=1",
>                 "-interaction=nonstopmode",
>                 "-file-line-error",
>                 "%DOC%"
>             ]
>         },
>         {
>             "name": "pdflatex",
>             "command": "pdflatex",
>             "args": [
>                 "-synctex=1",
>                 "-interaction=nonstopmode",
>                 "-file-line-error",
>                 "%DOC%"
>             ]
>         },
>         {
>             "name": "biber",
>             "command": "biber",
>             "args": [
>                 "%DOCFILE%"
>             ]
>         }
>     ],
>     "latex-workshop.latex.recipes": [
>         {
>             "name": "xe->bib->xe->xe (中文+文獻首選)",
>             "tools": [
>                 "xelatex",
>                 "biber",
>                 "xelatex",
>                 "xelatex"
>             ]
>         },
>         {
>             "name": "pdflatex",
>             "tools": [
>                 "pdflatex"
>             ]
>         }
>     ],
>     "latex-workshop.view.pdf.viewer": "tab",
>     "latex-workshop.latex.autoBuild.run": "onSave"
> }
> ```
> 請謹慎使用程式碼。
> 
> 驗證編譯
> 
> 設定完成後，新建一個 .tex 檔案並儲存（例如 test.tex）。按下 Cmd + Option + B 進行編譯，或者點擊 VS Code 左側 LaTeX 面板的 Build LaTeX project。
> 如果編譯時右下角跳出 Package fontspec Error: The font "..." cannot be found（例如找不到 STHeiti 楷體等系統字型），或者提示缺少其他 .sty 檔案，請把錯誤訊息貼給我，我會告訴你對應要補裝的字型設定或套件指令。

最后是一些需要安装的包
```bash
sudo tlmgr install etoolbox luainputenc titlesec multirow pgfplots algorithms chngcntr makecell arydshln biblatex-gb7714-2015 xstring
```

> 接著，我們執行最後一次全域格式更新，確保所有剛安裝的巨集包與字型都被系統抓到：
> ```bash
>   sudo mktexlsr
>   sudo fmtutil-sys --all
> ```
> 請謹慎使用程式碼。

然后编译就大功告成了！

--------------------

附上一个windows上装[Clash verge rev的小技巧](https://github.com/clash-verge-rev/clash-verge-rev/discussions/6666)，只要把exe后缀改为7z，然后解压就行。