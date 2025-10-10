明白 ✅ 你希望捕捉 **非法访问空指针（Segmentation Fault, SIGSEGV）** 的崩溃，并打印出堆栈信息，但不使用 `XSense_log_*` 这些自定义日志函数。

下面是一个 **纯标准C/C++ + glibc** 实现的版本（不依赖任何第三方库），能捕获常见崩溃信号并打印详细调用栈信息：

---

### ✅ 完整示例代码（纯净版）

```cpp
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <execinfo.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <thread>
#include <sstream>
#include <iostream>

void signal_handler(int sig) {
    void *array[20];
    size_t size;

    pid_t pid = getpid();
    pid_t tid = syscall(SYS_gettid);

    // 获取 C++ 层线程 ID
    std::ostringstream oss;
    oss << std::this_thread::get_id();
    std::string cpp_tid = oss.str();

    fprintf(stderr, "\n===== 崩溃捕获 =====\n");
    fprintf(stderr, "收到信号 %d (PID: %d, TID: %ld, C++ thread id: %s)\n", 
            sig, pid, (long)tid, cpp_tid.c_str());

    // 设置超时保护
    signal(SIGALRM, [](int){ 
        fprintf(stderr, "backtrace 处理超时，强制退出\n");
        _exit(1); 
    });
    alarm(5); // 5秒超时

    // 获取调用栈
    size = backtrace(array, 20);
    fprintf(stderr, "backtrace 完成，栈深度: %zu\n", size);

    // 解析符号
    char **symbols = backtrace_symbols(array, size);
    alarm(0); // 成功后取消alarm

    if (!symbols) {
        fprintf(stderr, "backtrace_symbols 失败\n");
        goto cleanup_and_exit;
    }

    fprintf(stderr, "调用栈信息如下：\n");
    for (size_t i = 0; i < size; i++) {
        fprintf(stderr, "  [%zu] %s\n", i, symbols[i]);
    }

    free(symbols);

cleanup_and_exit:
    fprintf(stderr, "\n程序将在 3 秒后退出...\n");
    fflush(stderr);
    sleep(3);
    _exit(1);
}

void register_signal_handler() {
    printf("注册信号处理函数...\n");

    signal(SIGSEGV, signal_handler); // 段错误（非法内存访问）
    signal(SIGABRT, signal_handler); // abort()
    signal(SIGFPE,  signal_handler); // 除0等浮点异常
    signal(SIGILL,  signal_handler); // 非法指令
    signal(SIGBUS,  signal_handler); // 总线错误（未对齐访问等）

    printf("信号处理函数注册完成\n");
}

int main() {
    register_signal_handler();

    printf("程序开始运行...\n");

    // 模拟空指针访问
    int *p = nullptr;
    printf("即将访问空指针...\n");
    *p = 42;  // 触发 SIGSEGV

    printf("这行不会被执行\n");
    return 0;
}
```

---

### 🧠 说明

* **捕捉的信号**

  | 信号        | 含义               |
  | --------- | ---------------- |
  | `SIGSEGV` | 段错误（空指针访问、越界访问等） |
  | `SIGABRT` | 调用 `abort()` 触发  |
  | `SIGFPE`  | 除以 0、无效浮点操作      |
  | `SIGILL`  | 非法指令（代码段损坏等）     |
  | `SIGBUS`  | 总线错误（未对齐访问或非法地址） |

* **调用栈**

  * `backtrace()` 获取函数调用地址；
  * `backtrace_symbols()` 转为可读字符串；
  * 编译时请带上调试符号：

    ```bash
    g++ main.cpp -g -rdynamic -pthread -o crash_demo
    ```

* **输出示例**

  ```
  ===== 崩溃捕获 =====
  收到信号 11 (PID: 32574, TID: 32574, C++ thread id: 0x7f1b9d8e4700)
  backtrace 完成，栈深度: 5
  调用栈信息如下：
    [0] ./crash_demo(+0x1234) [0x55f4b67a8234]
    [1] ./crash_demo(+0x110f) [0x55f4b67a810f]
    [2] /lib/x86_64-linux-gnu/libc.so.6(+0x3c050) [0x7f1b9f3a2050]
    [3] ./crash_demo(+0x10aa) [0x55f4b67a80aa]
  程序将在 3 秒后退出...
  ```

---

### ✅ 建议编译选项

为了让堆栈符号更可读：

```bash
g++ -g -O0 -rdynamic main.cpp -o crash_demo
```

> `-rdynamic` 会让 `backtrace_symbols()` 输出函数名而非地址。
> `-O0` 禁用优化，避免栈被优化掉。

---

是否希望我再帮你加上「自动生成 core dump 文件」以便后续用 `gdb` 复盘？这能在生产环境里更完整地分析崩溃。



非常好 👍
那我们来在上面的基础上，**加上自动生成 core dump 文件的机制**，这样你可以在程序崩溃后用 `gdb` 还原当时的状态。

---

## ✅ 改进版：支持自动生成 core dump 的崩溃捕获

```cpp
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <execinfo.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/resource.h>
#include <thread>
#include <sstream>
#include <iostream>

// 设置 core dump 文件大小为无限制
void enable_core_dump() {
    struct rlimit core_limit;
    core_limit.rlim_cur = RLIM_INFINITY;
    core_limit.rlim_max = RLIM_INFINITY;
    if (setrlimit(RLIMIT_CORE, &core_limit) == 0) {
        printf("✅ 已启用 core dump 文件生成（无限制）\n");
    } else {
        perror("⚠️ 设置 core dump 失败");
    }

    // 显示当前 core_pattern（Linux）
    FILE *fp = fopen("/proc/sys/kernel/core_pattern", "r");
    if (fp) {
        char pattern[256];
        if (fgets(pattern, sizeof(pattern), fp))
            printf("当前 core 文件路径规则: %s\n", pattern);
        fclose(fp);
    }
}

void signal_handler(int sig) {
    void *array[20];
    size_t size;

    pid_t pid = getpid();
    pid_t tid = syscall(SYS_gettid);

    std::ostringstream oss;
    oss << std::this_thread::get_id();
    std::string cpp_tid = oss.str();

    fprintf(stderr, "\n===== 崩溃捕获 =====\n");
    fprintf(stderr, "收到信号 %d (PID: %d, TID: %ld, C++ thread id: %s)\n", 
            sig, pid, (long)tid, cpp_tid.c_str());

    signal(SIGALRM, [](int){ 
        fprintf(stderr, "backtrace 超时，强制退出\n");
        _exit(1); 
    });
    alarm(5);

    size = backtrace(array, 20);
    fprintf(stderr, "backtrace 完成，栈深度: %zu\n", size);

    char **symbols = backtrace_symbols(array, size);
    alarm(0);

    if (!symbols) {
        fprintf(stderr, "backtrace_symbols 失败\n");
        goto dump_and_exit;
    }

    fprintf(stderr, "调用栈信息如下：\n");
    for (size_t i = 0; i < size; i++) {
        fprintf(stderr, "  [%zu] %s\n", i, symbols[i]);
    }
    free(symbols);

dump_and_exit:
    fprintf(stderr, "\n即将触发 core dump 文件生成...\n");
    fflush(stderr);

    // 恢复默认信号处理器并重新触发信号，让系统生成 core 文件
    signal(sig, SIG_DFL);
    raise(sig);  // 再次发出相同信号，生成 core dump

    // 如果上面未生成 core dump，则强制退出
    _exit(1);
}

void register_signal_handler() {
    printf("注册信号处理函数...\n");

    signal(SIGSEGV, signal_handler);
    signal(SIGABRT, signal_handler);
    signal(SIGFPE,  signal_handler);
    signal(SIGILL,  signal_handler);
    signal(SIGBUS,  signal_handler);

    printf("信号处理函数注册完成\n");
}

int main() {
    enable_core_dump();       // 启用 core dump
    register_signal_handler();

    printf("程序开始运行...\n");

    // 模拟空指针访问
    int *p = nullptr;
    printf("即将访问空指针...\n");
    *p = 42;  // SIGSEGV

    printf("这行不会被执行\n");
    return 0;
}
```

---

## 🧠 工作原理

1. **`enable_core_dump()`**

   * 使用 `setrlimit(RLIMIT_CORE, RLIM_INFINITY)` 允许系统生成 core 文件；
   * 打印当前 core 文件路径规则；
   * 默认 Linux 会把 core 文件放到：

     ```
     ./core
     ```

     或根据 `/proc/sys/kernel/core_pattern` 的配置，比如：

     ```
     core
     core.%p
     /var/lib/systemd/coredump/core.%e.%p
     ```

2. **`signal_handler()`**

   * 捕捉崩溃信号；
   * 打印调用栈；
   * 恢复默认处理器 (`signal(sig, SIG_DFL)`)；
   * 重新触发信号 (`raise(sig)`) → 系统生成 core 文件；
   * 如果依然没生成，调用 `_exit(1)` 强制退出。

---

## ⚙️ 编译与运行

```bash
g++ -g -O0 -rdynamic main.cpp -o crash_demo
ulimit -c unlimited     # 必须启用 core dump
./crash_demo
```

运行后你会看到：

```
✅ 已启用 core dump 文件生成（无限制）
注册信号处理函数...
信号处理函数注册完成
程序开始运行...
即将访问空指针...

===== 崩溃捕获 =====
收到信号 11 (PID: 13245, TID: 13245, C++ thread id: 0x7fca3c5dc740)
backtrace 完成，栈深度: 5
调用栈信息如下：
  [0] ./crash_demo(_Z14signal_handleri+0x73) [0x55f54c6a1a73]
  ...
即将触发 core dump 文件生成...
已放弃 (core dumped)
```

---

## 🧩 使用 GDB 分析 core 文件

1. 查看 core 文件名：

   ```bash
   ls core*
   ```

2. 用 GDB 打开：

   ```bash
   gdb ./crash_demo core
   ```

3. 在 GDB 中查看崩溃现场：

   ```gdb
   (gdb) bt
   ```

4. 如果想查看崩溃位置代码：

   ```gdb
   (gdb) frame 0
   (gdb) list
   ```

---

是否希望我帮你改成 **自动在程序启动时检测并打印 core 文件生成路径（包含 `%p`、`%e`、`%t` 展开解释）**？
这样在多线程服务中更方便调试。


非常好 ✅
那我们来升级成一个「专业版」崩溃捕获器：
👉 **支持自动生成 core dump 文件**
👉 **自动检测 `/proc/sys/kernel/core_pattern` 并解析实际生成路径规则（含变量展开说明）**
👉 **打印出开发者友好的提示，方便在生产环境中定位 core 文件**

---

## ✅ 完整专业版：带 core dump 路径解析

```cpp
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <execinfo.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/resource.h>
#include <thread>
#include <sstream>
#include <iostream>
#include <fstream>
#include <regex>
#include <map>

// 打印 core_pattern 的解释说明
void explain_core_pattern(const std::string& pattern) {
    printf("🧩 core_pattern 原始规则: %s\n", pattern.c_str());
    printf("📘 可能的占位符说明:\n");
    printf("   %%p : 进程 ID\n");
    printf("   %%u : 用户 ID\n");
    printf("   %%g : 用户组 ID\n");
    printf("   %%s : 导致崩溃的信号编号\n");
    printf("   %%t : 崩溃时间 (Unix 时间戳)\n");
    printf("   %%e : 可执行文件名\n");
    printf("   %%E : 可执行文件路径（包含 /）\n");
    printf("   %%h : 主机名\n");
    printf("   %%P : 父进程 ID\n");
    printf("   %%c : core 限制次数（系统特性）\n");
    printf("\n");

    if (!pattern.empty() && pattern[0] == '|') {
        printf("⚠️ 注意：当前 core_pattern 以 '|' 开头，表示系统会把 core 文件发送给外部程序处理，\n");
        printf("   如 systemd-coredump，而不是直接在当前目录生成 core 文件。\n");
        printf("   建议运行：journalctl -k | grep core 或 查看 /var/lib/systemd/coredump/\n");
    } else {
        printf("💡 core 文件通常会生成在以下位置：\n");
        printf("   %s\n", pattern.c_str());
        printf("   实际路径中变量会在崩溃时展开。\n");
    }
    printf("------------------------------------------------------------\n\n");
}

// 启用 core dump 文件
void enable_core_dump() {
    struct rlimit core_limit;
    core_limit.rlim_cur = RLIM_INFINITY;
    core_limit.rlim_max = RLIM_INFINITY;
    if (setrlimit(RLIMIT_CORE, &core_limit) == 0) {
        printf("✅ 已启用 core dump 文件生成（无限制）\n");
    } else {
        perror("⚠️ 设置 core dump 失败");
    }

    // 读取 core_pattern
    std::ifstream fin("/proc/sys/kernel/core_pattern");
    if (fin) {
        std::string pattern;
        std::getline(fin, pattern);
        fin.close();
        explain_core_pattern(pattern);
    } else {
        printf("⚠️ 无法读取 /proc/sys/kernel/core_pattern\n");
    }
}

void signal_handler(int sig) {
    void *array[20];
    size_t size;

    pid_t pid = getpid();
    pid_t tid = syscall(SYS_gettid);

    std::ostringstream oss;
    oss << std::this_thread::get_id();
    std::string cpp_tid = oss.str();

    fprintf(stderr, "\n===== 崩溃捕获 =====\n");
    fprintf(stderr, "收到信号 %d (PID: %d, TID: %ld, C++ thread id: %s)\n", 
            sig, pid, (long)tid, cpp_tid.c_str());

    signal(SIGALRM, [](int){ 
        fprintf(stderr, "backtrace 超时，强制退出\n");
        _exit(1); 
    });
    alarm(5);

    size = backtrace(array, 20);
    fprintf(stderr, "backtrace 完成，栈深度: %zu\n", size);

    char **symbols = backtrace_symbols(array, size);
    alarm(0);

    if (!symbols) {
        fprintf(stderr, "backtrace_symbols 失败\n");
        goto dump_and_exit;
    }

    fprintf(stderr, "调用栈信息如下：\n");
    for (size_t i = 0; i < size; i++) {
        fprintf(stderr, "  [%zu] %s\n", i, symbols[i]);
    }
    free(symbols);

dump_and_exit:
    fprintf(stderr, "\n即将触发 core dump 文件生成...\n");
    fflush(stderr);

    // 恢复默认处理器并触发信号，生成 core 文件
    signal(sig, SIG_DFL);
    raise(sig);

    _exit(1);
}

void register_signal_handler() {
    printf("注册信号处理函数...\n");

    signal(SIGSEGV, signal_handler);
    signal(SIGABRT, signal_handler);
    signal(SIGFPE,  signal_handler);
    signal(SIGILL,  signal_handler);
    signal(SIGBUS,  signal_handler);

    printf("信号处理函数注册完成\n");
}

int main() {
    enable_core_dump();       // 启用 core dump
    register_signal_handler();

    printf("程序开始运行...\n");

    // 模拟空指针访问
    int *p = nullptr;
    printf("即将访问空指针...\n");
    *p = 42;  // SIGSEGV

    printf("这行不会被执行\n");
    return 0;
}
```

---

## 🧠 功能详解

### 🧩 1. 自动启用 core dump

* 调用 `setrlimit(RLIMIT_CORE, RLIM_INFINITY)`，解除系统限制。
* 如果不执行这个步骤，`core` 文件可能不会生成（默认 `ulimit -c 0`）。

### 🧩 2. 自动读取 `/proc/sys/kernel/core_pattern`

例如：

```bash
$ cat /proc/sys/kernel/core_pattern
core.%e.%p.%t
```

程序会打印：

```
🧩 core_pattern 原始规则: core.%e.%p.%t
📘 可能的占位符说明:
   %p : 进程 ID
   %t : 时间戳
   %e : 可执行文件名
💡 core 文件通常会生成在以下位置：
   core.%e.%p.%t
```

---

### 🧩 3. 特殊情况说明

* 若输出为：

  ```
  |/usr/lib/systemd/systemd-coredump %P %u %g %s %t %c %h %e
  ```

  说明系统启用了 **systemd-coredump**，core 文件不会直接生成在当前目录，而是被收集到：

  ```
  /var/lib/systemd/coredump/
  ```

  查看命令：

  ```bash
  coredumpctl list
  coredumpctl info <PID>
  ```

---

### 🧩 4. 编译建议

```bash
g++ -g -O0 -rdynamic -pthread crash_with_core.cpp -o crash_with_core
ulimit -c unlimited
```

---

### 🧩 5. 用 GDB 分析 core 文件

```bash
gdb ./crash_with_core core
(gdb) bt
(gdb) frame 0
(gdb) list
```

---

是否希望我帮你加上一个“**崩溃自动命名 core 文件（带时间戳和程序名）**”的机制？
👉 比如生成文件名：

```
core_crash_demo_20251010_192015.pid13245
```





非常好 ✅
我们来做**最终专业版的崩溃捕获系统**，功能如下👇

---

## 🧰 功能概述

* ✅ 捕捉 SIGSEGV、SIGABRT、SIGBUS、SIGILL、SIGFPE 等崩溃信号
* ✅ 自动打印调用栈（含函数名）
* ✅ 自动启用 core dump
* ✅ 自动检测并解释 `/proc/sys/kernel/core_pattern`
* ✅ **自动在程序运行目录生成自定义命名的 core 文件**（如 `core_crash_demo_20251010_192015.pid1234`）
* ✅ 可在任何 Linux 环境独立使用

---

## 🚀 完整代码（可直接运行）

```cpp
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <execinfo.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/resource.h>
#include <thread>
#include <sstream>
#include <iostream>
#include <fstream>
#include <ctime>
#include <cstring>
#include <string>

// 🔧 生成时间戳字符串
std::string get_timestamp() {
    char buf[32];
    time_t now = time(nullptr);
    struct tm t;
    localtime_r(&now, &t);
    snprintf(buf, sizeof(buf), "%04d%02d%02d_%02d%02d%02d",
             t.tm_year + 1900, t.tm_mon + 1, t.tm_mday,
             t.tm_hour, t.tm_min, t.tm_sec);
    return buf;
}

// 🔧 启用 core dump（无限制）
void enable_core_dump() {
    struct rlimit core_limit;
    core_limit.rlim_cur = RLIM_INFINITY;
    core_limit.rlim_max = RLIM_INFINITY;
    if (setrlimit(RLIMIT_CORE, &core_limit) == 0) {
        printf("✅ 已启用 core dump 文件生成（无限制）\n");
    } else {
        perror("⚠️ 设置 core dump 失败");
    }

    std::ifstream fin("/proc/sys/kernel/core_pattern");
    if (fin) {
        std::string pattern;
        std::getline(fin, pattern);
        fin.close();
        printf("🧩 当前 core_pattern: %s\n", pattern.c_str());

        if (!pattern.empty() && pattern[0] == '|') {
            printf("⚠️ 系统正在使用管道方式处理 core 文件 (systemd-coredump)\n");
            printf("   你可以通过以下命令查看 core dump:\n");
            printf("   👉 coredumpctl list\n");
            printf("   👉 coredumpctl info <PID>\n");
        } else {
            printf("💡 core 文件通常会生成在当前目录或指定路径\n");
        }
        printf("------------------------------------------------------------\n");
    }
}

// 🔧 生成自定义 core 文件名（例如 core_crash_demo_20251010_192015.pid1234）
std::string get_custom_core_filename(const char* prog_name) {
    std::string base = prog_name;
    size_t slash = base.find_last_of('/');
    if (slash != std::string::npos)
        base = base.substr(slash + 1);

    pid_t pid = getpid();
    std::ostringstream oss;
    oss << "core_" << base << "_" << get_timestamp() << ".pid" << pid;
    return oss.str();
}

void signal_handler(int sig) {
    void* array[20];
    size_t size = backtrace(array, 20);
    pid_t pid = getpid();
    pid_t tid = syscall(SYS_gettid);

    std::ostringstream oss;
    oss << std::this_thread::get_id();
    std::string cpp_tid = oss.str();

    fprintf(stderr, "\n================ 崩溃捕获 ================\n");
    fprintf(stderr, "收到信号 %d (PID: %d, TID: %ld, C++ Thread ID: %s)\n",
            sig, pid, (long)tid, cpp_tid.c_str());

    char** symbols = backtrace_symbols(array, size);
    if (symbols) {
        fprintf(stderr, "调用栈 (%zu 层):\n", size);
        for (size_t i = 0; i < size; i++)
            fprintf(stderr, "  [%zu] %s\n", i, symbols[i]);
        free(symbols);
    } else {
        fprintf(stderr, "无法获取调用栈符号\n");
    }

    fflush(stderr);

    // 获取程序名
    char exe_path[256];
    ssize_t len = readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
    exe_path[len > 0 ? len : 0] = '\0';

    // 生成自定义 core 文件名
    std::string core_name = get_custom_core_filename(exe_path);

    fprintf(stderr, "\n💥 将在当前目录生成 core 文件: %s\n", core_name.c_str());
    fflush(stderr);

    // 修改 core_pattern 为当前目录下的自定义文件名
    FILE* fp = fopen("/proc/sys/kernel/core_pattern", "w");
    if (fp) {
        fprintf(fp, "%s\n", core_name.c_str());
        fclose(fp);
        fprintf(stderr, "已临时修改 core_pattern 为: %s\n", core_name.c_str());
    } else {
        fprintf(stderr, "⚠️ 无法修改 /proc/sys/kernel/core_pattern（可能需要 root 权限）\n");
    }

    // 重新触发信号生成 core 文件
    signal(sig, SIG_DFL);
    raise(sig);

    _exit(1);
}

// 注册信号处理函数
void register_signal_handler() {
    printf("注册信号处理函数...\n");

    signal(SIGSEGV, signal_handler);
    signal(SIGABRT, signal_handler);
    signal(SIGFPE,  signal_handler);
    signal(SIGILL,  signal_handler);
    signal(SIGBUS,  signal_handler);

    printf("信号处理函数注册完成\n");
}

// 主函数测试
int main(int argc, char** argv) {
    enable_core_dump();
    register_signal_handler();

    printf("程序启动成功，PID=%d\n", getpid());
    printf("模拟空指针访问以触发崩溃...\n");

    int* p = nullptr;
    *p = 42;  // 模拟 SIGSEGV

    return 0;
}
```

---

## 🔍 运行效果示例

```bash
$ g++ -g -O0 -rdynamic -pthread crash_core_named.cpp -o crash_demo
$ sudo ulimit -c unlimited
$ ./crash_demo
```

输出：

```
✅ 已启用 core dump 文件生成（无限制）
🧩 当前 core_pattern: core
注册信号处理函数...
信号处理函数注册完成
程序启动成功，PID=21745
模拟空指针访问以触发崩溃...

================ 崩溃捕获 ================
收到信号 11 (PID: 21745, TID: 21745, C++ Thread ID: 0x7f9c923fa740)
调用栈 (5 层):
  [0] ./crash_demo(_Z14signal_handleri+0x73) [...]
  ...
💥 将在当前目录生成 core 文件: core_crash_demo_20251010_192015.pid21745
```

生成文件：

```
core_crash_demo_20251010_192015.pid21745
```

---

## 🧠 用 GDB 分析

```bash
gdb ./crash_demo core_crash_demo_20251010_192015.pid21745
(gdb) bt
```

---

## ⚙️ 说明与注意事项

1. **root 权限**

   * 程序尝试写入 `/proc/sys/kernel/core_pattern`，需要 root 权限。
   * 如果无权限，系统仍会使用默认 core_pattern（但仍会生成 core）。

2. **非 root 环境方案**

   * 若不想修改系统配置，可直接保留默认 core 文件名；
   * core 文件名无法完全自定义，但 stack trace 仍会打印。

3. **systemd-coredump 系统**

   * 如果 `/proc/sys/kernel/core_pattern` 以 `|` 开头，系统会把 core 文件交给 `systemd-coredump`；
   * 使用命令：

     ```bash
     coredumpctl list
     coredumpctl info <PID>
     ```

---

是否希望我帮你改成：

* ✅ **自动检测是否有 root 权限**
* ✅ **若无权限则不尝试修改 core_pattern，只打印提示**
  （这在生产环境中更安全）
