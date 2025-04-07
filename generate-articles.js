const fs = require('fs');
const path = require('path');

// 读取pages目录中的所有.md文件
const pagesDir = path.join(__dirname, 'pages');
const files = fs.readdirSync(pagesDir).filter(file => file.endsWith('.md'));

// 将文章按类别分组
const articles = {
    'Development': [],
    'Programming': []
};

// 处理每个文件
files.forEach(file => {
    // 从文件名生成标题（去掉.md后缀）
    const title = file.replace('.md', '');
    
    // 根据文件内容或命名规则决定分类
    // 这里使用一个简单的规则：包含特定关键词的文件归类到Programming，其他归类到Development
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    const category = content.toLowerCase().includes('code') || 
                    content.toLowerCase().includes('programming') || 
                    file.toLowerCase().includes('log') ? 'Programming' : 'Development';
    
    // 添加文章信息
    articles[category].push({
        title: title,
        file: `pages/${file}`
    });
});

// 将结果写入articles.json
fs.writeFileSync(
    path.join(__dirname, 'articles.json'),
    JSON.stringify(articles, null, 4),
    'utf8'
);

console.log('articles.json has been generated successfully!');