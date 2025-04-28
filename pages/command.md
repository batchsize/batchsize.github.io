# 常用命令

### cmake

```bash
# cmake添加预处理器定义(宏定义)、指定编译链
cmake -DCMAKE_CXX_FLAGS="-DMY_DEFINE -DANOTHER_DEFINE"  -DCMAKE_TOOLCHAIN_FILE=../platforms/x86_64.cmake ..
cmake -DCMAKE_INSTALL_PREFIX=/usr/local/myproject ..
```

### conda
```bash
curl -O https://repo.anaconda.com/archive/Anaconda3-2024.10-1-Linux-x86_64.sh

wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh

chmod +x Miniconda3-latest-Linux-x86_64.sh
./Miniconda3-latest-Linux-x86_64.sh

conda create --name convert_model python=3.12
conda env list
conda activate convert_model
# 退出环境
conda deactivate
# 删除
conda env remove --name convert_model
# 使用yml文件创建
conda env create -f convert_model.yml

```


### docker
```bash
# docker 导出image
docker save -o ubuntu_20.04.tar ubuntu:20.04
docker load -i ubuntu_20.04.tar
```


### 调试
```bash
strings /lib/libc.so.6  | grep GLIBC_
nm -D libtest_sdk.so | grep _ZN12test6Module7IsInputEv
nm -D lib/libtest_sdk.so | grep IsInput

ldd --version
# ldd (Ubuntu GLIBC 2.31-0ubuntu9.16) 2.3

strings /usr/lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
getconf GNU_LIBC_VERSION
# 或
strings /usr/lib/x86_64-linux-gnu/libc.so.6 | grep GLIBC

free -m

# 查看端口是否占用
netstat -ano | findstr :8080

# 打印thread id
#include <thread>
std::thread::id thread_id = std::this_thread::get_id();
```


### ffmpeg
```bash
ffmpeg -i input.jpg -pix_fmt nv12 output.nv12
ffplay -f rawvideo -pix_fmt nv12 -video_size 640x480 output.nv12

ffplay -video_size 1280x720 -pixel_format nv12 -f rawvideo frame_nv12.yuv
ffmpeg -i ../02.mp4 -frames:v 1 -vf scale=1280:720 -pix_fmt nv12 frame_nv12.yuv

# 图片转mp4
ffmpeg -loop 1 -i test.jpg -c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4

# h264 转mp4
ffmpeg -i input.h264 -c:v copy output.mp4

ffmpeg -i input.mp4  # 查看帧率等信息

# mp4转图片，从1开始
ffmpeg -i input.mp4 -start_number 1 data/%d.jpg


# 批量转mp4
#!/bin/bash

# 遍历当前目录下所有 .h264 文件
for file in *.h264; do
    # 提取文件名（不带扩展名）
    filename="${file%.*}"
    
    # 使用 ffmpeg 转换（H.264 直接封装为 MP4）
    ffmpeg -i "$file" -c:v copy -f mp4 "${filename}.mp4" -y
    
    echo "已转换: $file → ${filename}.mp4"
done
```

### gdb
```bash

```


### 其他
```bash
# 查看端口是否占用
netstat -ano | findstr :8080  


file libx264.so.164 
# libx264.so.164: ELF 32-bit LSB shared object, ARM, EABI5 version 1 (SYSV), dynamically linked, with debug_info, not stripped

# 将图片名保存到txt中
find ./yolo_data/quant_data/quant_image_v0.12/images/train/ -name "*.jpg" > dataset.txt
ls ./yolo_data/quant_data/quant_image_v0.12/images/train/*.jpg > dataset.txt
```


### adb
```bash
# 安装adb
apt install android-tools-adb android-tools-fastboot

adb devices
adb shell
adb push/pull

# 1. 停止 ADB 服务
sudo adb kill-server
# 2. 重新启动 ADB 服务
sudo adb start-server

```


### win md5
```bash
certutil -hashfile <文件路径> MD5
```

### nfs 挂载
```bash
# 本机安装nfs服务器
sudo apt update
sudo apt install nfs-kernel-server
# 编辑 /etc/exports，添加
/home/user/shared *(rw,sync,no_subtree_check)

# *：允许所有 IP 访问。可以替换为特定 IP 或网段（如 192.168.1.0/24）。
# rw：允许读写。
# sync：同步写入。
# no_subtree_check：禁用子树检查，提高性能

# 重启nfs服务
sudo systemctl restart nfs-kernel-server

# 验证导出
sudo exportfs -v

# 远程机器挂载
sudo apt update
sudo apt install nfs-common
sudo mkdir -p /mnt/remote_shared
sudo mount 192.168.1.100:/home/user/shared /mnt/remote_shared
#验证挂载 
df -h
```

# tmux
```bash
apt install tmux

tmux -V
# 启动一个新的 tmux 会话：
tmux new -s mysession
# 在 tmux 会话中运行程序：
./your_program arg1 arg2 arg3
# 按 Ctrl+B，然后按 D 分离会话（程序会在后台继续运行）。

# 重新连接到会话：
tmux attach -t mysession

tmux ls # 列出所有会话

exit # 退出会话

# 删除会话 
tmux kill-session -t session2

# 快捷键
快捷键	功能
Ctrl+B + D	分离当前会话
Ctrl+B + C	创建一个新窗口
Ctrl+B + N	切换到下一个窗口
Ctrl+B + P	切换到上一个窗口
Ctrl+B + W	列出所有窗口
Ctrl+B + %	垂直分割窗口
Ctrl+B + "	水平分割窗口
Ctrl+B + 方向键	在分割的窗口之间切换
Ctrl+B + [	进入复制模式（按 q 退出）
Ctrl+B + ]	粘贴复制的内容
Ctrl+B + &	关闭当前窗口

```


``` bash

chmod -R 777 /path/to/folder
```

``` bash
# 文件查找
sudo find / -name "librga.so" 2>/dev/null

```

```bash
# ssh 免密登录
ssh-keygen # 生成公钥
ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.x.x

# windows
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub | ssh user@123.45.67.89 "cat >> ~/.ssh/authorized_keys"
```


```bash

import numpy as np

# 加载 .npy 文件
data = np.load('your_file.npy')

# 查看数组维度
print("Shape:", data.shape)

# 查看数组占用的内存大小（字节）
print("Size in memory (bytes):", data.nbytes)

# 转换为人类可读格式（如 MB）
print("Size in MB:", data.nbytes / (1024 * 1024))
```


### 替换特殊字符

```bash
# 安装 rename 工具（如果未安装）
sudo apt install rename

# 进入目标目录
cd /path/to/your/images/

# 替换所有 & 为 _ （示例）
rename 's/&/_/g' *

# 替换所有空格为 _ 
rename 's/ /_/g' *

# 替换所有特殊字符（包括 &, -, 空格等）
rename 's/[^a-zA-Z0-9._-]/_/g' *



# 进入目标目录
cd /path/to/your/images/

# 替换所有 & 为 _
find . -name "*&*" -exec bash -c 'mv "$0" "${0//&/_}"' {} \;

# 替换所有空格为 _
find . -name "* *" -exec bash -c 'mv "$0" "${0// /_}"' {} \;

说明：
find . -name "*&*"：查找所有包含 & 的文件。

"${0//&/_}"：把 $0（文件名）中的 & 替换成 _。

```


### python

```bash
pip cache dir
pip cache purge
pip install onnx -i https://pypi.tuna.tsinghua.edu.cn/simple


# 手动修改whl
pip install wheel
python -m wheel unpack your_package.whl
cat your_package/METADATA
# 打包whl
python -m wheel pack your_package
```


zip -r -y out.zip out/


find imgsavet -name "*.npy" | sort -t '/' -k2 -n | tee input.txt

cmake -DCMAKE_TOOLCHAIN_FILE=../toolchains/arm-linux-gnueabihf.toolchain.cmake -DCMAKE_BUILD_TYPE=Release ..
