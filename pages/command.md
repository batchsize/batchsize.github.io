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


# conda 安装到非/root路径
# 创建目标目录并赋权
mkdir -p /opt/miniconda3
chown -R $(whoami):$(whoami) /opt/miniconda3

# 下载并安装 Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh
bash /tmp/miniconda.sh -b -p -u /opt/miniconda3
rm /tmp/miniconda.sh

验证安装
source /opt/miniconda3/bin/activate
conda --version

# 初始化 Conda（将启动代码添加到 ~/.bashrc）
/your/path/to/conda/bin/conda init bash  # 将 Conda 

# 登录时自动激活 base 环境
conda config --set auto_activate_base true 
#启动代码写入 ~/.bashrc
source ~/.bashrc # 重新加载 Shell 配置
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
ffmpeg -i input.jpg -pix_fmt nv12 -s 1280x720 output.yuv
ffplay -f rawvideo -pix_fmt nv12 -s 1280x720 output.yuv

ffmpeg -f rawvideo -pix_fmt nv12 -s 1280x720 -i output.yuv line_out.jpg

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


ffmpeg -ss 00:02:30 -i input.mp4 -c copy output.mp4

ffmpeg -ss 00:02:30 -i input.mp4 -t 10 -c copy output.mp4

ffmpeg -ss 00:02:30 -to 00:02:40 -i input.mp4 -c copy output.mp4

ffmpeg -ss 00:02:30 -i input.mp4 -t 10 -c:v libx264 -c:a aac output.mp4


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

// 按顺序保存
ls ./videos/*.mp4 | sort -n -t/ -k3 | awk '{print "./" $0}' > video_list.txt
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

有多个adb设备，设置别名
alias adbb='adb -s 0000000000000000'

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

# 查看onnx版本
pip show onnx

# 手动修改whl
pip install wheel
python -m wheel unpack your_package.whl
cat your_package/METADATA
# 打包whl
python -m wheel pack your_package


# 安装依赖清单文件
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
```


zip -r -y out.zip out/


find imgsavet -name "*.npy" | sort -t '/' -k2 -n | tee input.txt

cmake -DCMAKE_TOOLCHAIN_FILE=../toolchains/arm-linux-gnueabihf.toolchain.cmake -DCMAKE_BUILD_TYPE=Release ..


```bash
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
set(CMAKE_BUILD_TYPE Release)



set(CMAKE_SKIP_RPATH TRUE)
install(TARGETS test_sdk
        LIBRARY DESTINATION ${CMAKE_SOURCE_DIR}/release/test_sdk)

install(FILES 
    include/header1.h
    include/subdir/header2.h
    DESTINATION release/scene_sense_sdk/include
)


install(DIRECTORY ${CMAKE_SOURCE_DIR}/include/
    DESTINATION release/scene_sense_sdk/include
    FILES_MATCHING 
    PATTERN "*.h"
    PATTERN "unwanted_dir" EXCLUDE  # 排除特定目录
    PATTERN "experimental/*" EXCLUDE  # 排除实验性头文件
)

set(PUBLIC_HEADERS
    include/core/api.h
    include/utils/helper.h
)

install(FILES ${PUBLIC_HEADERS}
    DESTINATION release/scene_sense_sdk/include
)

install(FILES ${CMAKE_SOURCE_DIR}/tests/main.cpp
    DESTINATION ${CMAKE_SOURCE_DIR}/release/
    RENAME demo.cpp
)
```


```
switch 语句的表达式必须是整数类型（包括字符型和枚举类型）或能够隐式转换为整数的类型例, 如 int, short, char 或 enum

```

tail -f

```



```
ssh: connect to host github.com port 22: Connection timed out

解决方案：使用 SSH 的 备用端口 443
nano ~/.ssh/config
添加:
Host github.com
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile ~/.ssh/id_rsa
IdentityFile 改成你的私钥路径（一般就是 ~/.ssh/id_rsa）

测试连接:
ssh -T git@github.com

```


```
tail -f

## 匹配 任意一个 关键字  `egrep "a|b" 或 grep -E "a|b"`
tail -f /var/log/syslog | egrep "error|fail"

tail -f server.log | grep -E "timeout|disconnect"

## 同时匹配两个关键字	`grep "a" |	grep "b"`

tail -f your.log | grep "error" | grep "disk" （两个关键词都必须满足）

## grep 基础上排除某个关键字
tail -f your.log | grep -v "heartbeat"

先排除包含 "debug" 的行；
再在剩下的结果中排除包含 "heartbeat" 的行
两个 grep -v 是逐步过滤的，逻辑是 “不包含 debug 且不包含 heartbeat”
tail -f your.log | grep -v "debug" | grep -v "heartbeat" (排除多个关键字)


## 排除多个
这是一个正则表达式形式，"debug|heartbeat" 表示匹配任何一个包含 debug 或 heartbeat 的行，然后用 -v 排除。

也等价于：“不包含 debug 或 heartbeat 的任意一项”
tail -f your.log | grep -Ev "debug|heartbeat" （一次性排除多个）

## 组合
tail -f your.log | grep -E "error|warn" | grep -v "debug"

## 包含空格或特殊字符

grep -E "connection timeout|server disconnect|login failed"


## 匹配三个关键字
tail -f server.log | grep -E "timeout|disconnect|failed"

tail -f server.log | grep -Ev "timeout|disconnect|failed"


## 避免误匹配
grep -Evw "debug|heartbeat"


-E：Extended regular expressions
扩展正则表达式语法（ERE），允许使用 |（或）、+、?、() 等更丰富的正则语法，而不必转义
-v：Invert match
```



```
检测内存泄漏  valgrind 

valgrind --tool=memcheck --leak-check=full ./your_program

valgrind --leak-check=full --show-leak-kinds=all ./your_program

valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./your_program

✅ --leak-check=full

检查所有内存泄漏，包括微小泄漏

显示泄漏的大小、位置（backtrace）

✅ --show-leak-kinds=all

显示所有类型的泄漏，包括：

definitely lost: 100% 泄漏，找不到指针

indirectly lost: 被泄漏对象间接引用的内存

possibly lost: 有可能泄漏，无法确定是否还可达

still reachable: 程序结束仍可访问，但未释放（不一定是 bug）

👉 用这个可以识别哪些泄漏是 真正的问题。

✅ --track-origins=yes

启用来源追踪：当有未初始化内存读写、野指针使用时，会显示它在哪里分配的

非常有用来找：

use of uninitialized value

invalid read/write

错误 malloc/free 使用等

⚠️ 缺点：会显著变慢，比不开启时慢 2-5 倍。


| 场景             | 推荐命令                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| 只是看看有没有泄漏      | `valgrind --leak-check=full ./your_program`                                           |
| 想知道详细泄漏类型      | `valgrind --leak-check=full --show-leak-kinds=all ./your_program`                     |
| 出现非法访问/莫名其妙的崩溃 | `valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./your_program` |


使用 --trace-children=yes 和日志文件
valgrind --tool=memcheck --leak-check=full --trace-children=yes --log-file=valgrind.log ./your_program
--trace-children=yes：跟踪子进程。
--log-file：把结果写到文件，避免终端输出被淹没。


```


火焰图
初始化




```
快速安装opencv


1. 直接安装预编译的 OpenCV（无需编译，最快！）
pip install --prefer-binary opencv-python-headless -i https://mirrors.aliyun.com/pypi/simple

2. 使用 apt 安装（Ubuntu/Debian 系统最快）
sudo apt update
sudo apt install python3-opencv  # 系统自带的 OpenCV（可能版本较旧）

3. 使用 Conda 安装（适合 Anaconda 环境）
conda install -c conda-forge opencv  # 自动解决依赖，速度较快
```



```
Segmentation fault (core dumped)
1. int 函数忘写返回值
2. 程序试图访问未分配或受保护的内存区域
```



```
# cp 命令

# 保留软链接
cp -P source_file_or_dir destination/ (或 --preserve=links)

# -a 或 --archive（相当于 -dR --preserve=all，保留软链接、权限、时间戳等所有属性）
cp -a source_file_or_dir destination/

# -d 选项（等同于 --no-dereference --preserve=links，确保软链接不会被解引用（dereference），而是直接拷贝链接本身）
cp -d source_file_or_dir destination/

# 注意
如果目标位置已经存在同名文件，cp 会覆盖它（除非使用 -i 交互模式）。
如果软链接指向的路径在目标位置不存在，拷贝后的软链接可能会失效（变成“悬空链接”）。
如果希望递归拷贝整个目录并保留软链接，可以使用 -r 或 -R 结合 -P 或 -a：

cp -aR source_dir/ destination/
```


```

netstat -ano | findstr ":23"
```


#include <thread>

void my_function() {
    // 获取当前线程ID
    std::thread::id thread_id = std::this_thread::get_id();
    std::cout << "Current thread ID: " << thread_id << std::endl;
}


# win 使用vscode 远程可视ubuntu服务器

```
vscode  配置文件:
ForwardX11 yes
ForwardX11Trusted yes

export DISPLAY=172.21.105.158:0
export DISPLAY=localhost:10

windows 下载VcXsrv

Disable access control勾选，其它按默认即可
```


```
1. 表达"做什么",不是"怎么做"
❌ CameraCoverCNN
❌ OcclusionAlgorithm
✅ CameraOcclusionDetector
2. 用名词或名词短语
❌ DetectCameraOcclusion
✅ CameraOcclusionDetector
3. SDK 场景下，避免过于具体的实现细节
你是 SDK，不是 Demo：
❌ CameraLensBlockJudgeV2
✅ CameraObstructionAnalyzer

✅ 方案 2：Sdk + Manager / Service

平台:
CameraOcclusionSdkManager
CameraOcclusionSdkService
内部：
CameraOcclusionDetector
CameraOcclusionAnalyzer

camera-occlusion-sdk
 ├── CameraOcclusionSdk
 ├── CameraOcclusionDetector
 ├── CameraOcclusionConfig
 ├── CameraOcclusionResult
 ├── CameraOcclusionException
```