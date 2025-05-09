
# build.sh

```bash
mkdir build_arm && cd build_arm

# 设置工具链路径
export TOOLCHAIN_PATH=/home/work/tools/toolchains/gcc-arm-8.3-2019.03-x86_64-arm-linux-gnueabihf
export CC=${TOOLCHAIN_PATH}/bin/arm-linux-gnueabihf-gcc
export CXX=${TOOLCHAIN_PATH}/bin/arm-linux-gnueabihf-g++

# 使用 CMake 配置
cmake .. \
  -DCMAKE_SYSTEM_NAME=Linux \
  -DCMAKE_SYSTEM_PROCESSOR=arm \
  -DCMAKE_C_COMPILER=${CC} \
  -DCMAKE_CXX_COMPILER=${CXX} \
  -DCMAKE_INSTALL_PREFIX=./install \
  -DBUILD_SHARED_LIBS=ON \      # 编译动态库（默认）
  -DWITH_GFLAGS=OFF \           # 如果不需 gflags 支持
  -DWITH_UNWIND=OFF             # 禁用 libunwind（避免依赖问题）


make -j$(nproc)       # 多线程编译
make install 
```