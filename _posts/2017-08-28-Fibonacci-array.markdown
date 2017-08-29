---
layout: post-mathjax
title: "斐波那契数列通项公式推导"
date: 2017-08-28 19:07
categories: Math
---

>斐波那契数列（Fibonacci sequence），又称黄金分割数列、因数学家列昂纳多·斐波那契（Leonardoda Fibonacci）以兔子繁殖为例子而引入，故又称为“兔子数列”。

斐波那契数列的递推公式为$a_{n+1}=a_n+a_{n-1},(n=2,3,...)$，初值$a_1=a_2=1$，求通项。

#### 幂级数方法
令

$$
S(x)=\sum_{n=1}^{\infty}a_nx^n
$$

则有

$$
S(x)=x+x^2+\sum_{n=3}^{\infty}a_nx^n
$$

$$\Downarrow$$

$$
S(x)=x+x^2+\sum_{n=1}^{\infty}a_{n+2}x^{n+2}
$$

$$\Downarrow$$

$$
S(x)=x+x^2+\sum_{n=1}^{\infty}a_{n+1}x^{n+2}+\sum_{n=1}^{\infty}a_{n}x^{n+2}
$$

$$\Downarrow$$

$$
S(x)=x+\sum_{n=0}^{\infty}a_{n+1}x^{n+2}+x^2S(x)
$$

$$\Downarrow$$

$$
S(x)=x+xS(x)+x^2S(x)
$$

$$\Downarrow$$

$$
S(x)= \frac{x}{1-x-x^2}=\frac{x}{(1-\frac{1-\sqrt{5}}2x)(1-\frac{1+\sqrt{5}}2x)}
$$

$$\Downarrow$$

$$
S(x)=\frac1{\sqrt{5}}(\frac{1}{1-\frac{1+\sqrt{5}}2x}-\frac{1}{1-\frac{1-\sqrt{5}}2x})
$$

对$S(x)$麦克劳林展开得到：

$$
S(x)=\frac1{\sqrt{5}}\sum_{n=1}^{\infty}[(\frac{1+\sqrt{5}}2)^n-(\frac{1-\sqrt{5}}2)^n]x^n
$$

所以求得通项$a_n$得：

$$
a_n=\frac1{\sqrt{5}}[(\frac{1+\sqrt{5}}2)^n-(\frac{1-\sqrt{5}}2)^n]
$$

#### 特征方程方法

由递推公式得到特征方程$x^2=x+1$解特征方程得到两实根$\frac{1+\sqrt{5}}2,\frac{1-\sqrt{5}}2$设数列
$$
a_n=k_1(\frac{1+\sqrt{5}}2)^n+k_2(\frac{1-\sqrt{5}}2)^n
$$

代入$a_1=1,a_2=2$即可求得$k_1,k_2$得到通项公式：

$$
a_n=\frac1{\sqrt{5}}[(\frac{1+\sqrt{5}}2)^n-(\frac{1-\sqrt{5}}2)^n]
$$
