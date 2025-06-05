# 多态

1. 多态生效的关键：通过 Animal* 或 Animal& 调用 virtual 函数
2. 虚析构函数：防止 delete base_ptr 时只调用了基类析构函数（内存泄漏）
3. override:（可选）加在派生类中，提高代码安全性（编译器检查重写是否正确）
4. 正确的析构顺序：先销毁派生类，再销毁基类。
5. 虚析构函数本质是是“动态绑定的析构函数”，C++ 中默认是 静态绑定（即编译时决定函数调用），加上 virtual 后，函数就变成了 动态绑定（运行时通过虚函数表 vtable 决定调用哪个函数）
6. 只要类有任何 virtual 函数，就要写 virtual ~Base()


✅ 用 shared_ptr：
多处共享对象，不清楚谁释放资源；

比如：观察者模式、图结构、插件管理器、缓存池。

✅ 用 unique_ptr：
容器独占管理，谁创建谁销毁；

比如：树结构、游戏引擎中实体组件、解析器对象等。


默认用 unique_ptr，除非你真的需要共享；

如果你用 shared_ptr，建议搭配 make_shared<T>() 来减少 heap 分配；

不要混用 shared_ptr<T> 和 unique_ptr<T> 同时指向同一对象（容易双重释放）；

使用 vector<unique_ptr<T>> 时注意：必须用 std::move 来 push。


正确实现多态数组的方式: 使用 std::vector<Animal*> 或 std::array<std::unique_ptr<Animal>>

```bash

std::vector<std::unique_ptr<Animal>> animals;
animals.push_back(std::make_unique<Dog>());
animals[0]->speak();  // 正确：调用 Dog::speak()
```

## override关键字
1. 在派生类中重写基类的虚函数时，建议写上override
override防止函数拼写错误(写成新函数)，避免签名不匹配
2. ~Derived() override，会验证基类析构函数是否为virtual
3. 如果基类析构函数是 virtual，会先调派生再调基类

## final关键字

1. 禁止继承一个类
class Animal final {
    // ...
};

2. 禁止派生类重写虚函数
class Animal {
public:
    virtual void speak() final;  // ❌ 不能被任何派生类 override
};
派生类:
class Dog : public Animal {
public:
    void speak() override;  // ❌ 编译错误：final 不能被 override
};
3. 同时用：override final
class Animal {
public:
    virtual void speak();
};

class Dog : public Animal {
public:
    void speak() override final;  // ✅ 重写了，但不允许再被 override
};

再定义新子类：
class Labrador : public Dog {
public:
    void speak() override;  // ❌ 编译错误：final 不能再 override
};


✅ 总结一张表
写法	说明
virtual void f();	基类虚函数
void f() override;	派生类重写基类函数，强烈推荐写
void f() final;	禁止被派生类再重写（仅用于虚函数）
void f() override final;	重写基类函数，并禁止子类继续重写
class A final {}	整个类不能被继承

✨ 实战建议
所有虚函数的重写，都加 override；

如果你明确不希望别人重写某个虚函数，加 final；

如果你设计的是库接口，final 是非常有用的封闭策略。


## 其他
virtual std::string Shout() = 0;  // 纯虚函数：必须由派生类实现
纯虚函数 表示一个”接口“函数，派生类必须实现这个函数，否则派生类也是抽象类
基类不能实例化

🧠 常见用途：
定义统一接口（多态）；

限制不能实例化基类；

强制子类必须实现行为；

virtual ~Animal() = default;      // 推荐加虚析构函数

= default 的意思：
告诉编译器生成一个默认的析构函数；可以写成 virtual ~Animal() {}，也可以写 = default 更简洁
要通过基类指针释放对象	✅ 必须虚析构


多态的原理是当方法被调用时，无论对象是否被转换为其父类，都只有位于对象继承链最末端的方法实现会被调用。也就是说，虚方法是按照其运行时类型而非编译时类型进行动态绑定调用的

虚函数的调用是通过运行时动态绑定的，即函数的调用行为取决于对象的运行时类型，而不是指针或引用的编译时类型。

虚函数表（vtable）原理（简单了解）：
每个类有一个虚函数表；

每个对象有一个指向该表的隐藏指针（vptr）；

调用虚函数时会通过 vptr 查表调用正确版本；

所以只要对象是 Cat，即使用 Animal* 来访问，它的 vptr 仍指向 Cat 的 vtable


## 对象切片
为什么会有对象切片？
C++ 对象布局：

派生类对象是基类对象的“扩展”，包含了基类成员 + 派生类新增成员；

把派生类对象赋值给基类对象时，只复制基类部分，派生类新增部分不拷贝；

这是“值拷贝”，发生在对象（非指针/引用）之间赋值时。

如何避免对象切片？
用指针或引用操作多态，比如：

Animal* animal = new Cat();
animal->speak();  // 多态调用，正确输出 Meow
或用智能指针：

std::shared_ptr<Animal> animal = std::make_shared<Cat>();
animal->speak();
不要用基类对象存放派生类对象（例如避免 std::vector<Animal>）

你可能的误区
操作	结果	是否切片？
Animal a = cat;	只保留 Animal 部分	是，发生切片
Animal& a = cat;	引用绑定，没有切片	否
Animal* a = &cat;	指针绑定，没有切片	否
std::vector<Animal> v; v.push_back(cat);	向量存对象，发生切片	是
std::vector<Animal*> v; v.push_back(&cat);	存指针，无切片	否

总结
对象切片是？	派生类对象赋值给基类对象时派生类特有部分被丢弃的现象
造成原因？	基类对象仅保存基类成员，派生类成员被丢弃
如何避免？	使用基类指针或引用操作多态，不要用基类对象存派生类对象



子类拥有所有父类非private的属性和方法


# 同时编译两个so避免错误:
1. 如果依赖.cpp 文件中定义了非 static 的函数或变量（全局函数、全局变量等），则会在多个 so 中重复出现同名符号，这可能在运行时链接时引起：
    符号重定义（一般编译器已避免）
    运行时符号解析异常（尤其是在 dlopen 两个 so 时）

a. 若只是工具类函数或封装，改为 static 或放在 .h 里作为 inline 定义
b. 如果确实要共享实现，可以提取成独立静态库 common.a，让两个 so 链接它，避免重复定义

2. 两个 so 使用相同的全局资源或单例
可能会重复初始化，或行为不一致

解决:
a. 在主程序main初始化，在so不做初始化
b. 如果必须初始化，确保只初始化一次（用 static flag 或者工厂模式）


dlopen("demo1_sdk.so") 和 dlopen("demo2_sdk.so") 方式加载，有潜在风险：
a.如果两个 so 导出符号冲突，加载顺序可能影响结果
b. 建议使用 -fvisibility=hidden 编译 so，并使用 __attribute__((visibility("default"))) 显式导出接口符号
set(CMAKE_CXX_VISIBILITY_PRESET hidden)
set(CMAKE_VISIBILITY_INLINES_HIDDEN 1)


两个不同名、内部依赖C++实现代码一样的so，每个so独立编译，编译器会分别为其生成所有符号表
一个可执行程序中同时链接了这两个 so，并且它们内部实现的 C++ 类、函数、符号名称是完全一样的：
a. 静态变量/单例重复定义：会造成行为错乱。
b. 符号冲突（One Definition Rule 被破坏）：动态链接器可能会解析为第一个加载的库的符号，导致两个库的行为不独立。

```bash
// common.cpp
std::string global_config = "xxx";  // 两个 so 都有这个符号

// 编译到 demo1_sdk.so 和 demo2_sdk.so 中


main -> 链接 demo1_sdk 和 demo2_sdk
→ global_config 实际只保留了一个，行为不再独立

```


```bash
动态加载（dlopen）
如果你用 dlopen("demo1_sdk.so", RTLD_LAZY) 和 dlopen("demo2_sdk.so", RTLD_LAZY) 分别加载这两个库：

默认情况下是 共享符号表（RTLD_GLOBAL），第二个加载的库中重复定义的符号会被忽略！

所以两个库虽然加载了，但实际上第二个库可能部分函数并不是用的自己的实现，而是用了第一个库里的。

✅ 正确做法：保证符号隔离
✅ 方法 1：用 -fvisibility=hidden，只导出 C 接口符号
修改 CMake：
set(CMAKE_CXX_VISIBILITY_PRESET hidden)
set(CMAKE_VISIBILITY_INLINES_HIDDEN 1)

在头文件里只导出 C 接口：
extern "C" __attribute__((visibility("default")))
int sdk_init();

这样，两个 so 的 C++ 实现即便一样，只要不导出，动态加载就不会冲突。

✅ 方法 2：把公共代码编译成一个独立静态库 .a
将公共 C++ 实现（如 common.cpp, config.cpp 等）抽出编译成 lib_common.a，然后让两个 .so 链接这个静态库。

这样每个 .so 中都有自己的符号副本，不再依赖外部全局符号解析。

✅ 每个 so 拷贝一份，共享源代码但运行时不共享符号。

✅ 方法 3：动态加载时使用 RTLD_LOCAL

void* handle = dlopen("demo1_sdk.so", RTLD_LAZY | RTLD_LOCAL);
这样该 so 的内部符号不会污染全局符号表，可避免符号冲突。但这不能解决静态变量共享的问题。

```


```bash

// common.h
使用工厂模式：
通过接口和工厂函数创建对象实例
确保每个 SO 有自己的对象实例

class Processor {
public:
    virtual void process() = 0;
    virtual ~Processor() {}
};

// libA.cpp
class LibAProcessor : public Processor {
public:
    void process() override {
        // 实现特定于libA的处理逻辑
    }
};

// libB.cpp
class LibBProcessor : public Processor {
public:
    void process() override {
        // 实现特定于libB的处理逻辑
    }
};
```




---

## ✅ 1. **C++ 编译生成 `.so`，生成符号表是指什么？**

C++ 编译为 `.so`（共享库，Shared Object）文件的过程中，编译器会生成**符号表**，记录所有在程序中**定义或引用的变量、函数名、类、虚函数等的名字和位置信息**。

### 📌 符号表包含：

* 函数符号：例如 `void my_function()` → 符号名：`_Z11my_functionv`（C++ 有名**mangling**）
* 全局变量符号
* 类的虚表地址（如果用到虚函数）

### 🔧 作用：

* 在链接阶段帮助**解析调用关系**（比如 `main()` 里调用了 `my_function()`，编译器就靠符号表连接上）
* 动态链接库 `.so` 加载时，系统的动态链接器（如 `ld-linux.so`）通过符号表找到目标函数地址

### 👀 查看符号：

```bash
nm -C libmylib.so   # 显示符号并解码（demangle）C++ 名字
```

---

## ✅ 2. **C++ 的 so 调用机制是什么？**

### 🔁 动态链接：

当你写一个程序 `main.cpp` 并使用一个 `.so` 文件（比如 `libmylib.so`），你不需要把 `.so` 的源代码编译进来，只要在链接阶段链接 `.so` 里提供的函数。

### 编译链接过程：

```bash
g++ main.cpp -L. -lmylib -o main
```

运行时：

```bash
LD_LIBRARY_PATH=. ./main
```

### 🔍 调用流程：

1. **程序运行时**，Linux 动态链接器会根据符号表在 `.so` 中查找所需函数。
2. **装载到内存**后，使用函数的地址执行，就像调用本地函数一样。

---

## ✅ 3. **so 文件和可执行程序的区别是什么？**

| 项目         | `.so` 动态库           | 可执行程序（`.out`、`.exe`） |
| ---------- | ------------------- | -------------------- |
| 是否可以运行     | ❌ 不可以单独运行           | ✅ 可以运行               |
| 作用         | 提供共享的函数和对象接口        | 提供主入口函数（`main()`）    |
| 是否需要链接器解释  | ✅ 需要运行时链接器（`ld.so`） | ✅ 也需要                |
| 是否含 `main` | ❌ 没有主函数             | ✅ 有主函数               |
| 多个程序是否可共用  | ✅ 可共用（如 `libc.so`）  | ❌ 不可共用               |
| 编译时用途      | 被链接到主程序             | 最终生成的执行体             |

---

## 💡 举个例子：

假设你写了一个库函数：

```cpp
// mylib.cpp
void say_hello() {
    std::cout << "Hello from lib!" << std::endl;
}
```

编译为 `.so`：

```bash
g++ -fPIC -shared -o libmylib.so mylib.cpp
```

然后你在主程序中调用：

```cpp
// main.cpp
void say_hello();
int main() {
    say_hello();
    return 0;
}
```

链接：

```bash
g++ main.cpp -L. -lmylib -o main
```

执行：

```bash
LD_LIBRARY_PATH=. ./main
```

---

## 🧠 总结一句话：

> `.so` 是一种**共享的函数库**，符号表是连接和调用它的“导航图”，调用机制依赖于动态链接器，`.so` 是模块，可执行程序是最终产品。

如果你想手动用 `dlopen/dlsym` 调用 `.so` 里的函数，也可以提供例子，告诉我需要吗？




C++ 程序的执行流程包括 **从编写源代码到程序运行**的全过程，大致可以分为以下 **五个阶段**：

---

### 🧩 1. **预处理（Preprocessing）**

由 \*\*预处理器（cpp）\*\*完成，对源代码中的以 `#` 开头的命令进行处理。

🔧 主要工作：

* 展开 `#include` 的头文件
* 替换 `#define` 宏
* 处理 `#ifdef/#ifndef/#endif` 条件编译

📌 示例：

```cpp
#include <iostream>
#define PI 3.14
```

➡ 被替换为：

```cpp
// <iostream> 的实际内容
double pi = 3.14;
```

---

### 🔧 2. **编译（Compiling）**

由 **编译器（如 g++）** 将预处理后的 `.cpp` 文件编译成汇编代码（`.s` 文件）。

📌 关键步骤：

* 语法/语义分析
* 生成中间代码
* 优化代码
* 输出汇编代码

例如：

```cpp
int add(int a, int b) {
    return a + b;
}
```

➡ 编译成类似的汇编代码。

---

### 🏗️ 3. **汇编（Assembling）**

由 **汇编器（如 `as`）** 将 `.s` 汇编代码转为 `.o`（目标文件，machine code）格式。

* 汇编语言 ➜ 机器码（二进制）
* 每个 `.cpp` 文件会生成一个对应的 `.o` 文件

---

### 🔗 4. **链接（Linking）**

由 **链接器（ld）** 负责，把多个 `.o` 文件和依赖的库（如 `libstdc++.so`）合并成一个可执行文件（`a.out` 或 `my_program`）。

📌 工作内容：

* 合并符号表（变量和函数地址）
* 解决函数调用地址（如 `main`、`std::cout`）
* 报错“未定义引用”通常就是这个阶段的错误

---

### ▶️ 5. **执行（Execution）**

* 操作系统加载可执行文件到内存
* 调用程序的入口点（通常是 `main()` 函数）
* 程序开始运行

🔄 运行过程中可能涉及：

* 动态链接（`.so` 动态库）
* 内存管理（堆/栈）
* I/O 访问
* 多线程、网络等

---

### 📊 整体流程图：

```text
源码(.cpp/.h)
   ↓ [预处理器: cpp]
预处理代码
   ↓ [编译器: g++ -S]
汇编代码(.s)
   ↓ [汇编器: as]
目标文件(.o)
   ↓ [链接器: ld]
可执行文件(.out)
   ↓ [操作系统加载]
运行（从 main() 开始）
```

---

### ✅ 命令示例（g++）

```bash
g++ -c main.cpp -o main.o         # 编译为 .o
g++ main.o -o main_exe            # 链接成可执行文件
./main_exe                        # 运行
```

---

如需了解 **动态链接库 (`.so`) 的参与流程**，我可以继续讲解 `dlopen()` 或 `LD_LIBRARY_PATH` 等机制。需要吗？
