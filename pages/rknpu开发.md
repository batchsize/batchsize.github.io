```bash

更新rknn 驱动 
https://github.com/rockchip-linux/rknpu


完成后确定是否更新成功，确保 /usr/lib/npu/rknn/memory_profile这个文件有可执行权限
strings /usr/lib/librknn_runtime.so | grep version
chmod +x /usr/lib/npu/rknn/memory_profile



查看版本:
strings /usr/bin/rknn_server | grep build

strings /usr/lib/librknn_runtime.so | grep build

dmesg | grep -i galcore



抓取log 
export RKNN_LOG_LEVEL=5
export VIV_VX_DEBUG_LEVEL=5
restart_rknn.sh

```
