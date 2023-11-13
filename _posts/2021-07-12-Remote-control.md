---
layout: post-mathjax
title: "Setup Remote Control on Ubuntu20.04"
date: 2021-07-12 20:09
disqus: true
categories: Computer
---


> 远程工作必备神器

#### VNC

- Step 1 — Installing the Desktop Environment and VNC Server

  ```bash
  $ sudo apt update
  $ sudo apt install xfce4 xfce4-goodies
  $ sudo apt install tightvncserver
  $ vncserver
  $ vncpasswd
  ```

- Step 2 — Configuring the VNC Server

  ```bash
  $ vncserver -kill :1
  $ mv ~/.vnc/xstartup ~/.vnc/xstartup.bak
  $ nano ~/.vnc/xstartup
  #!/bin/bash
  xrdb $HOME/.Xresources
  startxfce4 &
  ```

- Step 3 — Connecting to the VNC Desktop Securely

  ```bash
  $ chmod +x ~/.vnc/xstartup
  $ vncserver :2 -depth 24 -geometry 1920x1080 -localhost
  $ ssh -L 59000:localhost:5901 -C -N -l your_username your_server_ip
  ```

  If you are using PuTTY to connect to your server, you can create an SSH tunnel by right-clicking on the top bar of the terminal window, and then clicking the **Change Settings…** option. Find the **Connection** branch in the tree menu on the left-hand side of the PuTTY Reconfiguration window. Expand the **SSH** branch and click on **Tunnels**. On the **Options controlling SSH port forwarding** screen, enter `59000` as the **Source Port** and `localhost:5902` as the **Destination**. Then click the **Add** button, and then the **Apply** button to implement the tunnel. Once the tunnel is running, use a VNC client to connect to `localhost:59000`. You’ll be prompted to authenticate using the password you set in Step 1.

  If you meet snow screen, modify the ~/.vnc/xstartup as below

  ```bash
  #!/bin/bash
  unset SESSION_MANAGER
  unset DBUS_SESSION_BUS_ADDRESS
  #xrdb $HOME/.Xresources
  startxfce4 &
  ```



#### XRDP

- Step 1: Install Xrdp on Ubuntu 20.04

  ```bash
  $ sudo apt install ubuntu-desktop
  $ sudo apt install xrdp
  $ sudo systemctl status xrdp
  ```

- Step 2: Configure Xrdp on Ubuntu 20.04

  set port in file: /etc/xrdp/xrdp.ini, default 3389. If meeting black ubuntu screen,

  ```bash
  $ sudo vim /etc/xrdp/startwm.sh
  ```

  add the following before test -x /etc/X11/Xsession && ....

  ```bash
  unset DBUS_SESSION_BUS_ADDRESS
  unset XDG_RUNTIME_DIR
  ```

  run command

  ```bash
  $ echo "gnome-session" > ~/.xsession
  $ sudo systemctl restart xrdp
  ```

- Step 3: Access Remote Ubuntu Desktop with RDP Client

  Using PuTTY like above to set 59000 as source port and localhost:3389 as the destination.


If your computer has ipv6 enabled, you can try it without DDNS.

#### Reference

[How to Install and Configure VNC on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-vnc-on-ubuntu-20-04)

[How to Install Xrdp on Ubuntu 20.04](https://www.tecmint.com/install-xrdp-on-ubuntu/#:~:text=Ubuntu%2015%20Comments%20Xrdp%20is%20an%20open-source%20equivalent,article.%20It%E2%80%99s%20completely%20free%20to%20download%20and%20use.)

[How to configure XRDP to start cinnamon as default desktop session](https://askubuntu.com/questions/135483/how-to-configure-xrdp-to-start-cinnamon-as-default-desktop-session)
