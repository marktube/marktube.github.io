---
layout: post
title: "Random variables and their distribution"
date: 2017-10-12 16:03
mathjax: true
disqus: true
categories: Math
---

>Useful random variable distribution

#### 0-1 Distribution
If random variable $X$ has distribution below:

|       $X$     | $0$ |$1$|
|:-------------:|:---:|:-:|
|$\mathrm{P}(X)$|$1-p$|$p$|

$0<p<1$, then $X$ obey 0-1 distribution. The expectation of $X$ is $\mathrm{E}(X)=p$. The square deviation of $X$ is $\mathrm{D}(X)=p(1-p)$.

#### Binomial Distribution
If random variable $X$ obeys distribution law:

$$
\mathrm{P}(X=k)=\mathrm{C}_n^kp^kq^{n-k},k=0,1,2,\cdots,n
$$

$0<p<1$, $\mathrm{C}_n^k$ refers to combination number $\frac{n!}{k!(n-k)!}$, then $X$ obeys binomial distribution, wrote as $X \sim \mathrm{B}(n,p)$, especially when $n=1$, $X$ obey 0-1 distribution: $X \sim \mathrm{B}(1,p)$.

The expectation of $X$ is $\mathrm{E}(X)=np$. The square deviation of $X$ is $\mathrm{D}(X)=np(1-p)$. You can regard it as the sum of $n$ independent random variables which obey 0-1 distribution.

#### Geometric Distribution
If random variable $X$ obeys distribution law:

$$
\mathrm{P}\{X=k\}=pq^{k-1},k=1,2,\cdots,
$$

where $0<p<1,q=1-p$, then $X$ follows the Geometric Distribution. The expectation of $X$ is 

$$
\mathrm{E}(X)=\sum_{k=1}^{\infty}kpq^{k-1}=p\sum_{k=1}^{\infty}kq^{k-1}=\frac p{(1-q)^2}=\frac1p 
$$

and the deviation of $X$ is 

$$
\mathrm{D}(X)=\sum_{k=1}^{\infty}(k-\frac1p)^2pq^{k-1}=\sum_{k=1}^{\infty}(k^2-\frac{2k}p+\frac1{p^2})pq^{k-1}=\frac{1-p}{p^2}
$$

#### Hypergeometric Distribution
If random variable $X$ obeys distribution law:

$$
\mathrm{P}\{X=k\}=\frac{\mathrm{C}_M^k\mathrm{C}_{N-M}^{n-k}}{\mathrm{C}_N^n}, k=l_1,\cdots,l_2
$$

where $l_1=\mathrm{max}(0, n-N+M), l_2=\mathrm{min}(M,n)$, then $X$ follows Hypergeometric Distribution.

#### Poisson Distribution
If random variable $X$ obeys distribution law:

$$
\mathrm{P}\{X=k\}=\frac{\lambda^k}{k!}\mathrm{e}^{-\lambda},k=0,1,2,\cdots,
$$

$\lambda>0$ is a constant, then the $X$ obeys Poisson Distribution with parameter $\lambda$, wrote as $X \sim \mathrm{P}(\lambda)$. The expectation of $X$ is 

$$
\mathrm{E}(X)=\sum_{k=0}^{\infty}k\frac{\lambda^k}{k!}\mathrm{e}^{-\lambda}=\lambda \mathrm{e}^{-\lambda}\sum_{k=0}^{\infty}\frac{\lambda^k}{k!}=\lambda.
$$

The deviation of $X$ is 

$$
\mathrm{D}(X)=\sum_{k=0}^{\infty}(k-\lambda)^2\frac{\lambda^k}{k!}\mathrm{e}^{-\lambda}=\sum_{k=0}^{\infty}(k^2-2k\lambda+\lambda^2)\frac{\lambda^k}{k!}\mathrm{e}^{-\lambda}=\lambda.
$$

. Especially, if $X \sim P(\lambda),Y \sim P(\lambda)$, and $X,Y$ are independent of each other, then $X+Y \sim P(2\lambda)$.

#### Uniform Disrtibution

If continuous random variable $X$ has possibility density function like below:

$$
f(x)=
\begin{cases}
\frac1{b-a}& a\le x\le b, \\
\\0 & others,
\end{cases}
$$

, then we claim that $X$ obeys Uniform Distribution in range $[a, b]$, wrote as $X \sim \mathrm{U}[a,b]$.

If continuous random variable $X$ has possibility density function like below:

$$
f(x)=
\begin{cases}
\frac1{b-a} & a< x< b, \\
\\0 & others,
\end{cases}
$$

, then we claim that $X$ obeys Uniform Distribution in range $(a, b)$, wrote as $X \sim \mathrm{U}(a,b)$.

No matter $X \sim \mathrm{U}(a,b)$ or $X \sim \mathrm{U}[a,b]$, their distribution functions both are

$$
F(x)=
\begin{cases}
0 & x<a,\\
\\ \frac{x-a}{b-a} &a\le x <b,\\
\\ 1 &b\le x
\end{cases}
$$

. So the expectation of $X$ is 

$$
\mathrm{E}(X)=\int_a^b\frac x{b-a}\mathrm{d}x=\frac{a+b}2
$$

, and the deviation of $X$ is 

$$
\mathrm{D}(X)=\int_a^b\frac{(x-\frac{a+b}2)^2}{b-a}\mathrm{d}x=\frac{(b-a)^2}{12}
$$

#### Exponential Distribution

If continuous random variable $X$ has possibility density like below:

$$
f(x)=
\begin{cases}
\lambda \mathrm{e}^{-\lambda x} & x>0, \\
0 & x\le0,
\end{cases}
$$

$\lambda > 0$, then $X$ follows Exponential Distribution with parameter $\lambda$, wrote as $X \sim E(\lambda)$. So the distribution function is 

$$
F(x)=
\begin{cases}
1-\mathrm{e}^{-\lambda x} & x>0,
\\0 & x \le 0,
\end{cases}
$$

. Easily we can get $\mathrm{P} \{ X>t \}=\mathrm{e}^{-\lambda t}$, so the conditional possibility 

$$
\mathrm{P}\{X>t+s\big|X>t\}=\frac{\mathrm{P}\{X>t+s\}}{\mathrm{P}\{X>s\}}=\frac{\mathrm{e}^{-\lambda(t+s)}}{\mathrm{e}^{-\lambda s}}=\mathrm{e}^{-\lambda t}=\mathrm{P}\{X>t\} 
$$

which is regarded as the "lack in memory" character of exponential distribution. The expectation of $X$ is 

$$
\mathrm{E}(X)=\int_0^{+\infty}x\lambda \mathrm{e}^{-\lambda x}\mathrm{d}x=-x\mathrm{e}^{-\lambda x}\bigg|_0^{+\infty}+\int_0^{+\infty}\mathrm{e}^{-\lambda x}\mathrm{d}x=\frac1{\lambda}
$$

. And the deviation of $X$ is 

$$
\mathrm{D}(X)=\int_0^{+\infty}(x-\frac1{\lambda})^2\lambda \mathrm{e}^{-\lambda x}\mathrm{d}x=\frac1{\lambda ^2}
$$

#### Normal Distribution

If continuous random variable $X$ has possibility density function like below:

$$
f(x)=\frac1{\sqrt{2\pi}\sigma}\mathrm{e}^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

$$
(i.e. \int_{-\infty}^{+\infty}\mathrm{e}^{-x^2}\mathrm{d}x=\sqrt{\int_{-\infty}^{+\infty}\mathrm{e}^{-x^2}\mathrm{d}x\int_{-\infty}^{+\infty}\mathrm{e}^{-y^2}\mathrm{d}y}=\sqrt{\int_0^{2\pi}\mathrm{d}\theta\int_0^{+\infty}\mathrm{e}^{-r^2}r\mathrm{d}r}=\sqrt{\pi})
$$

$,-\infty<x<+\infty$, then we say that the $X$ obeys Normal Distribution, wrote as $X \sim \mathrm{N}(\mu,\sigma^2)$, where its distribution function is

$$
F(x)=\frac1{\sqrt{2\pi}\sigma}\int_{-\infty}^x \mathrm{e}^{-\frac{(t-\mu)^2}{2\sigma^2}}\mathrm{d}t
$$

. Especially when $\mu=0,\sigma=1$, as $X \sim \mathrm{N}(0,1)$, $X$ obeys standard normal distribution, we often use $\varphi(x)=\frac1{\sqrt{2\pi}}\mathrm{e}^{-\frac{x^2}2}$ to represent its possibility density, and $\Phi(x)=\frac1{\sqrt{2\pi}}\int_{-\infty}^x \mathrm{e}^{-\frac{t^2}2}\mathrm{d}t$ to denote its distribution. It can be demonstrated that if $Y \sim \mathrm{N}(\mu,\sigma^2)$, then $Y$'s distribution function is $\Phi(\frac{x-\mu}{\sigma})$. Also we can find that the possibility density function is even, the left and right parts of $x=\mu$ are symmetric. So the conclusion below is explicit:

$$
\Phi(-x)=1-\Phi(x),\Phi(0)=\frac12,\mathrm{P}\{|X|\le a\}=2\Phi(a)-1,X \sim \mathrm{N}(0,1)
$$

. Finally the expectation and deviation of $X \sim \mathrm{N}(\mu,\sigma^2)$ are:

$$
\mathrm{E}(x)=\mu,\mathrm{D}(X)=\sigma^2.
$$

#### 2-Dimensional Normal Distribution

If 2-dimensional continuous random variables $(X,Y)$ has possibility density function like:

$$
f(x,y)=\frac1{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}}\exp\{ {-\frac1{2(1-\rho^2)}[\frac{(x-\mu_1)^2}{\sigma_1^2}-\frac{2\rho(x-\mu_1)(y-\mu_2)}{\sigma_1\sigma_2}+\frac{(y-\mu_2)^2}{\sigma_2^2}]\} }
$$

where $\mu_1,\mu_2,\sigma_1>0,\sigma_2>0,-1<\rho<1$ are all constants, then $(X,Y)$ follows 2-Dimensional Normal Distribution with parameters $\mu_1,\mu_2,\sigma_1,\sigma_2,\rho$, wrote as $(X,Y) \sim \mathrm{N}(\mu_1,\mu_2;\sigma_1^2,\sigma_2^2;\rho)$. The sufficient and necessary condition of $\rho=0$ is that $X$ and $Y$ are independent of each other. There is a significant property of 2-Dimensional Normal Distribution as below:

$$
aX+bY \sim \mathrm{N}(a\mu_1+b\mu_2,a^2\sigma_1^2+2ab\sigma_1\sigma_2\rho+b^2\sigma_2^2)
$$

, where $(X,Y) \sim \mathrm{N}(\mu_1,\mu_2;\sigma_1^2,\sigma_2^2;\rho)$.

#### $\chi^2$ Distribution

Assume $X_1, X_2, \cdots,X_n$ are independent and obeys standard normal distribution, define

$$
\chi^2=X_1^2+X_2^2+\cdots+X_n^2
$$

, then $\chi^2$ obeys $\chi^2$ distribution whose DOF is $n$, wrote as $\chi^2 \sim \chi^2(n)$. The expectation of $\chi^2(n)$ is 

$$
\mathrm{E}[\chi^2(n)]=n\mathrm{E}[\chi^2(1)]=nE(X^2)=n
$$

and the deviation of $\chi^2(n)$ is 

$$
\mathrm{D}[\chi^2(n)]=n\mathrm{D}[\chi^2(1)]=n[\mathrm{E}(X^4)-\mathrm{E}(X^2)]= \\ 
n[\frac1{\sqrt{2\pi}}\int_{-\infty}^{+\infty}x^4\mathrm{e}^{-\frac{x^2}2}\mathrm{d}x-\mathrm{E}(X)^2-\mathrm{D}(X)]=n[3-1]=2n
$$

. Assume $\chi^2 \sim \chi^2(n)$, for given $0<\alpha<1$, which satisfies the condition:

$$
\mathrm{P}\{\chi^2>\chi_\alpha^2(n)\}=\int_{\chi_\alpha^2(n)}^{+\infty}f(x)\mathrm{d}x=\alpha
$$ 

, then the $\chi_\alpha^2(n)$ is the quantile of $\alpha$ on $\chi^2(n)$ distribution. If $\chi_1^2 \sim \chi^2(n_1)$ and $\chi_2^2 \sim \chi^2(n_2)$, in addition that $\chi_1^2$ and $\chi_2^2$ are independent, then $\chi_1^2+\chi_2^2 \sim \chi^2(n_1+n_2)$.

#### $t$ Distribution

If random variable $X$ and $Y$ are independent of each other, assume $X \sim \mathrm{N}(0,1), Y \sim \chi^2(n)$, define random variable

$$
T=\frac{X}{\sqrt{Y/n}}
$$

, then $T$ obeys $t$ distribution with DOF $n$, denoted as $T \sim t(n)$. Because the possibility density function of $t$ distribution is even, when $n \to \infty$, $t(n)$ is similar to $N(0,1)$. Assume $T \sim t(n)$, for given $0<\alpha<1$, which satisfies the condition:

$$
\mathrm{P}\{T>t_\alpha(n)\}=\int_{t_\alpha(n)}^{+\infty}f(x)\mathrm{d}x=\alpha
$$ 

, then the $t_\alpha(n)$ is the quantile of $\alpha$ on $t(n)$ distribution. Obviously $t_\alpha(n)=-t_{1-\alpha(n)}$

#### $F$ Distribution

If random variable $X$ and $Y$ are independent of each other, assume $X \sim \chi^2(n_1), Y \sim \chi^2(n_2)$, define random variable

$$
F=\frac{X/n_1}{Y/n_2}
$$

, then $F$ obeys $F$ distribution with DOF $(n_1,n_2)$, denoted as $F \sim F(n_1,n_2)$, where $n_1, n_2$ are the first and second DOF. Assume $F \sim F(n_1,n_2)$, for given $0<\alpha<1$, which satisfies the condition:

$$
\mathrm{P}\{F>F_\alpha(n_1,n_2)\}=\int_{F_\alpha(n_1,n_2)}^{+\infty}f(x)\mathrm{d}x=\alpha
$$ 

, then the $F_\alpha(n_1,n_2)$ is the quantile of $\alpha$ on $F(n_1,n_2)$ distribution. Obviously $\frac1F \sim F_\alpha(n_2,n_1)$ and 

$$
F_{1-\alpha}(n_1,n_2)=\frac1{F_\alpha(n_2,n_1)}
$$

#### Sampling Distribution of Normal Variable

If $X \sim \mathrm{N}(\mu,\sigma^2)$, $X_1, X_2, \cdots, X_n$ are samples from $X$, the average of samples is $\bar X=\frac1n\sum_{i=1}^nX_i$, the variance of samples is $S^2=\frac1{n-1}\sum_{i=1}^n(X_i-\bar X)^2$, then we have the following conclusion:

$$
\bar X \sim \mathrm{N}(\mu, \frac{\sigma^2}n), U=\frac{\bar X-\mu}{\sigma/\sqrt{n}} \sim \mathrm{N}(0,1);
$$

$$
\chi^2=\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1);
$$

$$
T=\frac{\bar X-\mu}{S/\sqrt{n}} \sim t(n-1);
$$

$$
\chi^2=\frac1{\sigma^2}\sum_{i=1}^n(X_i-\mu)^2 \sim \chi^2(n)
$$

, moreover the $\bar X$ and $S^2$ are independent of each other.
