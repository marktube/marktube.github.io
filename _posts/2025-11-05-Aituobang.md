---
layout: post
title: 记录一下艾托邦笔试里有意思的题
date: 2025-08-29 17:05
mathjax: true
disqus: true
pannellum: flase
categories: Math
---

> 死去的回忆又开始攻击我

起因是收到友人的内推，说HR追着要人，还搞专业歧视。“是可忍，孰不可忍？”于是就参加了一下笔试。随缘记录一下笔试里两个有意思的题目。其它都是pandas和一些基本的代码问题，笔试时间设置为2小时，看完题我感觉我多待1分钟都要睡着了，水水赶紧下线。

### 1. 求投掷骰子次数的期望
原题大概意思如下：

> 有一n个面的均匀骰子，现在开始进行多次投掷，每次投掷结束后，计算之前所有投掷出的点数之和，若能被n整除则停止，否则继续投掷。求投掷次数的期望。

根据题目意思先列出一个投掷结束次数和概率的表格，如下：

| 投掷结束时的次数 | 概率 |
|:------------:|:--:|
|1|$\frac1n$|
|2|$\frac1n(1-\frac1n)$|
|3|$\frac1n(1-\frac1n)^2$|
|$\vdots$|$\vdots$|
|k|$\frac1n(1-\frac1n)^{k-1}$|

那么期望可以很简单地通过将上面表格的每行相乘再累加：

$$
\begin{aligned}
\mathcal{E}=&\lim_{k\to +\infty} 1\cdot\frac1n+2\cdot\frac1n(1-\frac1n)+\cdots+k\cdot \frac1n(1-\frac1n)^{k-1}\\
=&\sum_{k=1}^{\infty}k\cdot\frac1n(1-\frac1n)^{k-1}
\end{aligned}
$$

为了求解上式，将等号两边同时乘以$(1-\frac1n)$得到：

$$
(1-\frac1n)\mathcal{E}=\sum_{k=1}^{\infty}k\cdot\frac1n(1-\frac1n)^{k}
$$

两式相减可得：

$$
\frac1n\mathcal{E}=\lim_{k\to \infty}\frac1n-\frac1n(1-\frac1n)^{k}+\sum_{i=1}^{k-1}\frac1n(1-\frac1n)^{i}
$$

可以看到最右项的等比数列求和能够直接计算出来，所以可以得到下面的等式：

$$
\begin{gathered}
\frac1n\mathcal{E}=\lim_{k\to \infty}\frac1n-\frac1n(1-\frac1n)^{k}+[1-\frac1n-(1-\frac1n)^k]\\
\Downarrow\\
\mathcal{E}=n
\end{gathered}
$$

这就是大名鼎鼎的几何分布期望！

#### 2. 关于蒙特卡罗模拟的应用
原题大概意思如下：
> 一根固定长度的木条被随机分成四段，求任意取其中三段都能组成三角形的概率是多少？

根据题意，假设木条长度为1，四段分别为$a,b,c,d\in [0,1]$，且$a+b+c+d=1$，即服从狄利克雷分布（1,1,1,1）。任取三段都能组成三角形的充分必要条件是两边之和大于第三边。正向推导很难得到闭式解，那就换个思路，反向模拟，蒙特卡罗！
下面是用AI得到的代码，模拟结果大概为$\frac{2}{30}$。

```python
# Monte Carlo for the interpretations
import random, itertools

def is_triangle(triple):
    m = max(triple)
    return m < (sum(triple) - m)  # max < sum of other two

def simulate(n=200000):
    cnt_all_triples = 0        # interpretation B

    for _ in range(n):
        cuts = sorted([random.random() for _ in range(3)])
        a = cuts[0]
        b = cuts[1] - cuts[0]
        c = cuts[2] - cuts[1]
        d = 1 - cuts[2]
        pieces = [a,b,c,d]

        # Interpretation B: check all 4 triples (every choice of 3 out of 4)
        all_tri = True
        for comb in itertools.combinations(pieces, 3):
            if not is_triangle(comb):
                all_tri = False
                break
        if all_tri:
            cnt_all_triples += 1

    return cnt_all_triples / n

if __name__ == "__main__":
    rB = simulate(200000)
    print("Interpretation B (all triples):   ", rB)

```
