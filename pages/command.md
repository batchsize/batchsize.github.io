# 常用命令

### cmake

```bash
# cmake添加预处理器定义(宏定义)、指定编译链
cmake -DCMAKE_CXX_FLAGS="-DMY_DEFINE -DANOTHER_DEFINE"  -DCMAKE_TOOLCHAIN_FILE=../platforms/x86_64.cmake ..
```

### conda
```bash
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


### C++
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
```


### ffmpeg
```bash
ffplay -video_size 1280x720 -pixel_format nv12 -f rawvideo frame_nv12.yuv
ffmpeg -i ../02.mp4 -frames:v 1 -vf scale=1280:720 -pix_fmt nv12 frame_nv12.yuv
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
```