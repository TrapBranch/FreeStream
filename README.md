# 🎬 随看 FreeStream

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TrapBranch/FreeStream)

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.10-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

一个现代化的在线影视播放平台，基于 Next.js 15 构建，提供流畅的观影体验。

## ✨ 功能特性

### 🎯 核心功能
- **📺 视频播放** - 支持 HLS 流媒体播放，自适应码率
- **🔍 智能搜索** - 实时搜索影片，支持搜索历史记录
- **📱 分类浏览** - 电影、电视剧、综艺、动漫、纪录片等分类
- **🎞️ 剧集管理** - 完整的剧集列表和播放进度管理
- **⏭️ 自动播放** - 剧集自动连播功能

### 🎨 用户体验
- **🌓 主题切换** - 深色/浅色主题，支持系统偏好设置
- **📱 移动优先** - 完全响应式设计，移动端体验优化
- **🚀 快速加载** - 无限滚动加载，图片懒加载优化
- **💫 流畅动画** - 精心设计的过渡动画和交互效果
- **🎯 直观导航** - 清晰的导航结构和面包屑导航

### 🛠️ 技术亮点
- **⚡ 服务端渲染** - Next.js 15 SSR 支持，SEO 友好
- **🎨 现代 UI** - Tailwind CSS + Radix UI 组件库
- **📊 状态管理** - React Hook 状态管理
- **🔄 数据缓存** - 智能缓存策略，提升加载速度
- **🎥 媒体播放** - HLS.js 专业视频播放器

## 🛠️ 技术栈

### 前端框架
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript

### 样式和 UI
- **Tailwind CSS 4** - 实用工具优先的 CSS 框架
- **Radix UI** - 无障碍访问的 UI 组件
- **Lucide React** - 美观的图标库
- **next-themes** - 主题切换解决方案

### 媒体播放
- **HLS.js** - HTTP 实时流播放器
- **Embla Carousel** - 轮播图组件

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 处理工具
- **pnpm** - 高性能包管理器

## 📸 产品截图

<div align="center">

<table>
  <tr>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/1.png" alt="Screenshot 1" /></td>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/2.png" alt="Screenshot 2" /></td>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/6.png" alt="Screenshot 6" /></td>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/7.png" alt="Screenshot 7" /></td>
  </tr>
  <tr>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/3.png" alt="Screenshot 3" /></td>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/4.png" alt="Screenshot 4" /></td>
    <td width="25%"><img src="https://github.com/TrapBranch/FreeStream/raw/main/github-assets/5.png" alt="Screenshot 5" /></td>
   <td width="25%"></td>
  </tr>
</table>

</div>


## 🚀 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- pnpm 8.0 或更高版本

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/TrapBranch/FreeStream.git
cd FreeStream

# 安装依赖
pnpm install
```

### 环境配置
复制环境变量示例文件并配置：
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件：
```env
# API 配置
API_BASE=https://jszyapi.com/api.php/provide/vod/
NEXT_PUBLIC_API_BASE=https://jszyapi.com/api.php/provide/vod/
```

**环境变量说明：**
- `API_BASE`: 后端API接口地址，运行在端口3000
- `NEXT_PUBLIC_API_BASE`: 前端API接口地址，浏览器端使用

### 启动开发服务器
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 📦 部署指南

### 🐳 Docker 部署（推荐）

项目已配置完整的 Docker 支持，可以一键部署到任何支持 Docker 的环境。

#### 使用 Docker Compose（最简单）
```bash
# 克隆项目
git clone https://github.com/TrapBranch/FreeStream.git
cd FreeStream

# 一键启动
docker compose up -d
```

#### 手动 Docker 部署
```bash
# 构建镜像
docker build -t freestream .

# 运行容器
docker run -d \
  --name freestream \
  -p 3000:3000 \
  -e API_BASE=https://jszyapi.com/api.php/provide/vod/ \
  -e NEXT_PUBLIC_API_BASE=https://jszyapi.com/api.php/provide/vod/ \
  freestream
```

#### Docker 环境变量配置
在 `docker-compose.yml` 中修改环境变量：
```yaml
environment:
  - NODE_ENV=production
  - API_BASE=https://jszyapi.com/api.php/provide/vod/
  - NEXT_PUBLIC_API_BASE=https://jszyapi.com/api.php/provide/vod/
```

### ☁️ Vercel 部署
1. 点击上方的 "Deploy with Vercel" 按钮
2. 连接你的 GitHub 仓库
3. 配置环境变量（如需要）
4. 点击部署

### 手动部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 其他平台部署
项目支持部署到任何支持 Node.js 的平台：
- **Netlify** - 配置构建命令 `pnpm build`
- **Railway** - 自动检测 Next.js 项目
- **VPS/云服务器** - 使用 Docker 或 PM2 部署

## 📁 项目结构

```
FreeStream/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API 路由
│   ├── category/          # 分类页面
│   ├── play/              # 播放页面
│   ├── search/            # 搜索页面
│   └── video/             # 视频详情页面
├── components/            # React 组件
│   ├── ui/                # 基础 UI 组件
│   ├── play/              # 播放器相关组件
│   └── ...                # 其他业务组件
├── hooks/                 # 自定义 Hook
├── lib/                   # 工具函数和 API
├── github-assets/         # GitHub 展示资源
│   ├── README.md          # 截图说明文件
│   └── screenshot-*.png   # 产品截图
├── public/                # 静态资源文件
├── Dockerfile             # Docker 构建文件
├── docker-compose.yml     # Docker Compose 配置
├── .dockerignore          # Docker 忽略文件
├── env.example            # 环境变量示例
├── LICENSE                # MIT 开源许可证
└── ...                    # 其他配置文件
```

## 🐳 Docker 技术说明

### 容器化特性
- **多阶段构建** - 优化镜像大小，分离构建和运行环境
- **Alpine Linux** - 使用轻量级基础镜像，减少安全漏洞
- **非 root 用户** - 提升容器安全性
- **Standalone 输出** - Next.js 独立部署模式，无需 Node.js 运行时

### 生产环境优化
- **自动重启** - 容器异常退出时自动重启
- **端口映射** - 默认映射到主机 3000 端口
- **环境变量** - 支持灵活的配置管理
- **日志管理** - 可选的日志卷挂载

### 常用 Docker 命令
```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build

# 查看运行状态
docker compose ps

# 查看日志
docker compose logs freestream

# 查看实时日志
docker compose logs -f freestream

# 多副本部署
docker compose up -d --scale freestream=3

# 使用不同端口
docker run -d -p 8080:3000 --name freestream-8080 freestream

# 进入容器调试
docker exec -it freestream sh

# 清理所有容器和镜像
docker compose down --rmi all --volumes
```

## 🎨 主题定制

项目支持深度定制主题，编辑 `app/globals.css` 文件中的 CSS 变量：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... 更多变量 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 暗色主题变量 */
}
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 组件注释使用英文，用户界面使用中文
- 提交信息使用约定式提交格式

## 📝 待办事项

- [ ] 用户系统和收藏功能
- [ ] 观看历史记录
- [ ] 视频下载功能

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 出色的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 高质量的 UI 组件
- [HLS.js](https://github.com/video-dev/hls.js/) - 专业的视频播放器
- [Lucide](https://lucide.dev/) - 美观的图标库

## 📧 联系方式

如果你有任何问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/TrapBranch/FreeStream/issues)
- 发起 [Discussion](https://github.com/TrapBranch/FreeStream/discussions)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！ # FreeStream
