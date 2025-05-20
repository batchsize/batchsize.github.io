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