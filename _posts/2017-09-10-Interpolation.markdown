---
layout: post
title: "Polynomial interpolation"
date: 2017-09-10 22:07
mathjax: true
disqus: true
categories: Math
---

>Polynomial Interpolattion through n points(2 dimensions)

Think about a series of different points in XOY plane, assume $(a_1,b_1),(a_2,b_2),...,(a_n,b_n)$, is there a curve go through all these points? How many curves can satisfy?

On this problem, we can assume there exist a solution as below:

$$
f(x)=c_0+c_1x+c_2x^2+{\cdots}+c_{n-1}x^{n-1}
$$

Then replace $x$ with $a_i$ and $f(x)$ with $b_i$, we can get a group of equations like this:

$$
\begin{cases}
b_1=c_0+c_1a_1+c_2{a_1}^2+{\cdots}+c_{n-1}{a_1}^{n-1}\\
b_2=c_0+c_1a_2+c_2{a_2}^2+{\cdots}+c_{n-1}{a_2}^{n-1}\\
{\vdots}\quad{\cdots}\\
b_1=c_0+c_1a_n+c_2{a_n}^2+{\cdots}+c_{n-1}{a_n}^{n-1}
\end{cases}
$$

In order to solve $c_0,c_1,...,c_{n-1}$ from the equations group, we should first extract the coefficient matrix from it as following:

$$
\begin{bmatrix}
1&{a_1}&{\cdots}&{a_1^{n-1}}\\
1&{a_2}&{\cdots}&{a_2^{n-1}}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
1&{a_n}&{\cdots}&{a_n^{n-1}}
\end{bmatrix}
$$

If you transpose it, you can get the Vandermonde matrix:

$$
\begin{bmatrix}
1&1&{\cdots}&1\\
{a_1}&{a_2}&{\cdots}&{a_n}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
{a_1^{n-1}}&{a_2^{n-1}}&{\cdots}&{a_n^{n-1}}
\end{bmatrix}
$$

its determinant is equal to 

$$
\prod_{1\le j < i \le n}{(a_i-a_j)}
$$

So the determinant is not equal to $0$ while the $a_i$ is different from each other. Now we can derive a conclusion that there is one and only one solution $[ c_0,c_1,\cdots,c_{n-1}]$ for the equations group from the determinant.

There is only one $n-1$ times polynomial function can satisfy interpolation of $n$ diffirent points on $2$ dimension plane.