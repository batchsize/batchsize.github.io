## **1. Submodule**

Submodule是将一个 Git 仓库嵌套为另一个仓库的子模块。

### **添加 Submodule**

1. **初始化子模块**
   将子仓库添加为主仓库的子模块：

   ```bash
   git submodule add <submodule_repository_url> path/to/subdirectory
   ```
2. **初始化和更新子模块**
   当克隆主仓库时，初始化并拉取子模块内容：

   ```bash
   git submodule update --init --recursive
   ```

3. **拉取子模块的更新**
   ```bash
   git submodule update --remote
   ```

4. **提交子模块变更**
   子模块更新后，需要在主仓库中提交：

   ```bash
   git add path/to/subdirectory
   git commit -m "Update submodule"
   ```

---

### **检查 Submodule 的状态**

1. **查看当前子模块状态**

   ```bash
   git submodule status
   ```

2. **从子模块中进入独立仓库**
   子模块是一个独立的 Git 仓库，可以直接进入并操作：

   ```bash
   cd path/to/subdirectory
   git pull
   ```

---

## **2. Subtree**

Subtree 将子仓库直接嵌入到主仓库，使用时不需要额外初始化和管理，适合更简单的场景。

### **添加 Subtree**

1. **拉取子仓库**
   使用 `git subtree` 将子仓库拉入指定目录：

   ```bash
   git subtree add --prefix=path/to/subdirectory <submodule_repository_url> <branch>
   ```
   - `<branch>` 是子仓库的分支。

2. **更新子仓库**

   ```bash
   git subtree pull --prefix=path/to/subdirectory <submodule_repository_url> <branch>
   ```

3. **推送子仓库的更改**
   如果在子仓库目录中进行了修改，需要将变更推回远程：

   ```bash
   git subtree push --prefix=path/to/subdirectory <submodule_repository_url> <branch>
   ```

---

### **对比 Submodule 和 Subtree**

| 特性               | Submodule                                      | Subtree                                              |
|--------------------|-----------------------------------------------|-----------------------------------------------------|
| 易用性             | 需要额外初始化和管理，稍复杂                  | 无需额外初始化，简单直接                           |
| 子模块独立性       | 子模块是独立的 Git 仓库                        | 子仓库的内容直接嵌入主仓库                         |
| 适用场景           | 子模块需要经常独立开发                        | 子模块内容变化少，主要用作依赖或工具               |
| 学习成本           | 较高                                           | 较低                                                |

---

## **选择合适的方式**

1. 如果子模块需要独立开发，并且版本频繁更新，**推荐使用 Submodule**。
2. 如果子模块内容稳定，主要用作工具或依赖库，**推荐使用 Subtree**。
3. 如果需要临时拉取子仓库，可以使用 `git clone` 或 `git archive`。

---

## **3.git远程分支操作**
要查看 Git 中的远程分支，可以使用以下命令：

### **1. 查看所有远程分支**

```bash
git branch -r
```

该命令会列出所有的远程跟踪分支（remote tracking branches），格式为 `origin/branch_name`，其中 `origin` 是远程仓库的默认名称。

### **2. 查看所有本地和远程分支**

如果你想查看所有本地和远程分支，可以使用：

```bash
git branch -a
```

这将列出所有分支，其中本地分支前面没有前缀，远程分支会显示为 `remotes/origin/branch_name`。

### **3. 查看远程仓库的详细信息**

要查看远程仓库的详细信息，包括所有远程分支，可以使用：

```bash
git remote show origin
```

输出中会列出所有的远程分支，以及当前跟踪的分支等信息。

### **4. 查看特定远程分支的最新信息**

如果想查看某个远程分支的详细信息，可以使用：

```bash
git fetch origin
git log origin/branch_name
```

`git fetch` 会更新远程引用，然后可以通过 `git log` 查看该远程分支的提交历史。

---

### **注意事项**

- 远程分支是你本地仓库中的远程跟踪分支，这些分支通常会在执行 `git fetch` 或 `git pull` 时更新。
- 远程分支前缀 `origin/` 表示远程仓库的分支。例如，`origin/main` 是远程仓库 `origin` 上的 `main` 分支。



### **5.将所有远程分支拉取到本地**

#### **1. 拉取所有远程分支的引用**

首先，通过 `git fetch` 命令从远程仓库获取所有分支的引用。此命令不会自动切换到这些分支，而是将远程分支的更新保存在本地的远程跟踪分支中。

```bash
git fetch --all
```

#### **2. 拉取所有远程分支并在本地创建跟踪分支**

如果你希望将所有远程分支都检出并在本地创建对应的跟踪分支，可以使用以下命令：

```bash
for branch in $(git branch -r | grep -v '\->'); do git checkout --track $branch; done
```

这个命令做了以下几件事：
- `git branch -r` 列出所有远程分支。
- 使用 `grep -v '\->'` 过滤掉符号链接（如 `HEAD ->`）。
- 使用 `git checkout --track` 命令为每个远程分支创建本地跟踪分支。


---

#### **3. 注意事项**
- 使用 `git fetch` 会拉取所有远程分支的最新信息，但不会自动切换到这些分支。
- 使用 `git checkout --track` 创建本地分支并跟踪远程分支。

## **超大仓库分段克隆**
```bash
git clone --depth=1 <repo-url>  # 仅克隆最新的 commit
```
如果需要完整历史，后续可以逐步拉取：

```bash
git fetch --unshallow
```

### 忽略文件权限变更
```bash
git config core.fileMode false
git config --global core.fileMode false # 全局
```

### git pull 连接失败问题
```bash
1. ssh 22端口被屏蔽，尝试使用443
# 编辑 ~/.ssh/config，添加以下内容
Host github.com
    Hostname ssh.github.com
    Port 443
    User git


2.测试连接
ssh -T git@github.com

3. 验证ssh key
ssh -vT git@github.com  # -v 显示详细日志

4. 使用临时https + 个人访问令牌（PAT）
git remote set-url origin https://github.com/username/repo.git
git pull  # 输入用户名和PAT（替代密码）

生成 PAT：GitHub → Settings → Developer settings → Personal Access Tokens。

```