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


变量起名

注释生成



rv1126:
```
npu:

watch -n 1 cat /sys/devices/platform/ffbc0000.npu/devfreq/ffbc0000.npu/cur_freq

watch -n 1 cat /sys/class/thermal/thermal_zone0/temp

echo userspace > /sys/class/devfreq/ffbc0000.npu/governor
echo 396000000 > /sys/class/devfreq/ffbc0000.npu/userspace/set_freq


cpu

cat /sys/devices/system/cpu/cpu*/cpufreq/cpuinfo_cur_freq

cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq  # 最小频率
cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq  # 最大频率

cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor


echo userspace | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor


cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies
echo 1000000 | sudo tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed

```