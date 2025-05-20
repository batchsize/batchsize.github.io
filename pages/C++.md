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
override防止函数拼写错误，避免签名不匹配
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
