---
layout: post
title: 重生之我是前端大佬
date: 2025-04-24 20:56:32
mathjax: false
disqus: true
categories: Web
---

> vibe coding针不戳

前段时间用streamlit来写前后端一体的大模型网页，见[之前的blog](https://marktube.github.io/2025/02/10/deepseek-local-deploy)，但是实际使用上加载很慢。为了加快访问速度，同时支持curl命令行直接调用，我决定换回FASTAPI，同时自行编写html文件。因为FASTAPI支持返回文件作为响应，在后端部分就很容易实现了。只需要在原有的FASTAPI基础上加入下面的代码：

```python
@app.get("/", response_class=FileResponse)
async def read_root():
    # 假设 index.html 文件位于当前目录
    file_path = os.path.join(os.path.dirname(__file__), "index.html")
    return FileResponse(file_path)
```

同时需要在当前目录下面加入`index.html`文件。接下来就到大模型大展身手的时候了，直接告诉deepseek你的需求，然后让它自己生成html文件即可。当然有些部分还需要修改，这时候可以一步步来让deepseek进行修改。为了实现某些界面功能，css样式和javascript需要同时修改，这里大模型可能会出现搞不定的情况，就需要开发者对css和javascript有一定的了解。例如，我想在搭建的大模型网页上实现一个在生成时出现转圈圈的效果。需要在特定的位置放置该元素，另外还要调整大小以适合当前页面布局。从css选择器到样式动态效果，再到页面添加时到逻辑，这些一连串的组成部分目前并不能通过大模型的one-shot来完成，还是需要人为地拆解和处理，
下面就来介绍一下具体实现。

### 对话框内的效果
因为页面上大模型进行回答时，对话框体内是先添加了包含对话头像的div元素，然后在div内加入回答。需求是在开始回答时就在头像后面加入转圈圈，流式回答不断更新对话框回答内容，回答完毕时移除转圈圈的元素。所以首先要获取到对话框体的div，这里我直接在创建对话框体时返回了对应的div，如下：
```javascript
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = renderMarkdownAndLatex(message);

    ...

    // 将消息添加到聊天框中
    chatBox.appendChild(messageDiv);
    // 触发KaTeX渲染和代码高亮
    renderMathInElement(contentDiv);
    hljs.highlightAll();
    chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
    return contentDiv;
```
这样的话，就可以通过修改`contentDiv.innerHTML`来对流式回答的内容进行实时更新。另外因为deepseek有思考的过程，思考时的内容文字需要不一样的样式，为了方便，我直接将思考的内容每行前加入一个`> `来变成类似于markdown里面引用的效果。但是经过marked.js转换之后，就会变成`blockquote`元素，那就直接用css来修改一下样式就行，如下：
```css
blockquote{
    color:#a6a6a6;
    border-left:2px solid #e5e5e5;
    height:calc(100% - 10px);
    margin-top: 5px;
    margin-left: 0px;
    padding-left: 10px;
}
```
接下来说说转圈圈。定义一个loader的效果，又是需要css来
```css
/* 加载动画 */
.loader {
    width: 20px;
    height: 20px;
    margin: 10px 10px 10px 0px;
    border: 3px solid rgba(255,255,255,0.2);
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* 旋转动画 */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
```
然后就是添加的位置和移除的时间：在一开始生成回答时添加，在生成完成时移除。这就涉及到javascript中创建和移除html元素的函数了，如下：
```javascript
// 添加加载动画
if (isloading) {
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('loader');
    messageDiv.appendChild(loaderDiv);
}

...

// 获取所有loader元素
const elements = document.getElementsByClassName('loader');
// 倒序循环避免实时集合问题
while(elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
}
```
通过`document.createElement`来创建元素和修改class，需要删除时可以通过`document.getElementsByClassName`或`document.getElementsById`来获取元素，然后从`parentNode`删除对应元素。

### 访问控制
UI交互页面上，开发者其实很多时候没有给用户很多自由性，因为会损坏到系统的安全性。从MVC模型的角度，就是对应了一个自动状态机。当然自动状态机是一个很强大的模型，但是实际上，为了某一个功能而实现的页面，状态数量可以很少，所以用户就在这些状态集合里打转转。在前端部分，可以对用户的操作加以限制，但是真正最有效的控制离不开后端的实现。例如，对某些API接口限制访问上限：
```python
import asyncio

# 使用信号量进行限流
semaphore = asyncio.Semaphore(5)

...

@app.post("/generate")
async def generate_text(request: Request, api_key: str = Depends(api_key_header)):
    async with semaphore:
        if api_key not in auth_keys:
            raise HTTPException(status_code=403, detail="Invalid API Key")
        
        # 编码输入
        inputs = tokenizer(request.prompt, return_tensors="pt").to(model.device)
        
```
在前端部分，也需要对相应的按钮加以限制。例如，在发送了一个prompt后，发送按钮就变灰色了，暂时阻塞了继续请求。同时，在回答生成完毕后，按钮也要恢复，如下：
```javascript
// 获取按钮元素
async function sendMessage() {
    // 获取按钮元素
    const btn = document.getElementById('btn-send');
    if(btn.disabled){
        alert('请等待上一个对话结果完成！');
        return;
    }
    // 禁用按钮
    btn.disabled = true;
    btn.style.backgroundColor = "#ccc";

    ...

    // 回答完成后恢复按钮
    btn.disabled = false;
    btn.style.backgroundColor = "#007bff";
```
最后分享一下我的[简易版deepseek仓库](https://github.com/marktube/Deepseek-deploy)和[页面](https://deepseek.liuyc.uk)。