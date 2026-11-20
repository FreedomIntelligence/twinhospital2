# TwinHospital2 · 让医院在数字世界中运行

TwinHospital2 项目主页：一个连接医院空间、真实 HIS 业务、岗位 AI Agent 与可信证据的数字医院研究原型。

Project website for TwinHospital2, a digital-hospital research prototype connecting hospital space, a real HIS, role-based AI agents and verifiable evidence.

- 在线访问 / Live site: https://freedomintelligence.github.io/twinhospital2/
- 第一版 / First version: https://freedomintelligence.github.io/TwinHospital/

## 结构 / Structure

| 路径 | 内容 |
| --- | --- |
| `index.html` | 页面（中文原文；英文由 `js/i18n.js` 在运行时切换） |
| `styles.css` | 版式与动效（全部动效在系统「减少动态效果」设置下关闭） |
| `js/twin.js` | 首屏实时数字孪生（等距画布，合成数据示意） |
| `js/app.js` | 院区平面图、门诊路径、录像播放、岗位架构图与实验图表 |
| `js/i18n.js` | 中英双语词典与切换 |
| `assets/` | 图片、录像（院区巡览、院内完整回放、Agent 浏览器实录）与轨迹数据 |

纯静态站点，无需构建。本地预览：

```sh
python -m http.server 8000
# 打开 http://localhost:8000/
```
