# 金句卡片生成器

## 项目目标
金句卡片生成器是一款基于Chrome浏览器的插件，旨在帮助用户从网页中选取文字并生成精美的金句卡片。用户可以选择不同的主题风格和样式，并将卡片导出为多种图片格式。

## 基础架构
- 使用Manifest V3规范开发Chrome扩展。
- 使用Service Workers处理后台逻辑。
- 使用Content Scripts在网页上实现文字选择功能。

## 核心功能
1. **网页文字选择功能**
   - 实现网页文字选中后的右键菜单功能。
   - 实现网页文字选中后在文字上方出现插件icon，点击即可唤起插件菜单。

2. **卡片模板系统**
   - 提供3种不同的主题风格（简约、复古、现代）。

3. **卡片样式定制**
   - 背景设置：3种纯色，3种渐变色，配色淡雅。
   - 字体设置：6种不同的字体选择，字体颜色根据背景自动调整。
   - 布局设置：支持文字对齐方式选择，保留文字换行，内容区域自适应。

4. **导出功能**
   - 支持多种图片格式（PNG/JPG/WEBP）。
   - 可选择导出图片质量。

## 开发建议
- 在代码中添加详细的中文注释。
- 实现响应式设计，确保在不同分辨率下的良好体验。
- 实现适当的错误处理和日志记录。

## 进一步优化建议
- 考虑使用Chrome扩展的高级特性，如Side Panel、Offscreen Documents等。
- 优化扩展性能，包括启动时间和内存使用。
- 确保扩展符合Chrome Web Store的发布要求。 