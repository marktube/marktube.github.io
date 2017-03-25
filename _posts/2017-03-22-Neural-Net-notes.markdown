---
layout: post
title: "Neural Network Notes"
date: 2017-03-21 22:43
categories: MachineLearning
---

> Neural networks, a beautiful biologically-inspired programming paradigm which enables a computer to learn from observational data

#### Perceptron

#### SGD

#### Back Propagation

$$\delta^l_j=\frac{\partial C}{\partial a^l_j}\sigma^\prime(z^l_j)$$

$$\delta^l=((\omega^{l+1})^T\delta^{l+1})*\sigma^\prime(z^l)$$

$$\frac{\partial C}{\partial b^l_j}=\delta^l_j$$

$$\frac{\partial C}{\partial \omega^l_{jk}}=a^{l-1}_k\delta^l_j$$

#### Initialnization
Then we shall initialize those weights as Gaussian random variables with mean 0 and standard deviation $\frac1{\sqrt{n_{in}}}$

#### Cross-entropy Cost Function

$$C=\frac1n\sum_x[y\ln a+(1-y)\ln(1-a)]$$

where n is the total number of items of training data, the sum is over all training inputs , x, and y is the corresponding desired output.

#### Softmax

$$a^L_j=\frac{e^{z^L_j}}{\sum_ke^{z^L_k}}$$

#### Regularization

$$\frac{\lambda}{2n}\sum_ww^2$$

#### Dropout
Dropout is a radically different technique for regularization.

#### Hyperparameter
learining rate $\eta$
regularization parameter $\lambda$
mini-batch size

#### Activate Function
sigmoid
tanh
relu

#### Gradient Lost


#### CNN

#### RNN

#### LSTM

#### DBN
