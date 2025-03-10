import { themes, backgrounds, fonts, exportFormats } from './styles.js';

// 获取选中的文本
let selectedText = '';

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取所有UI元素
    const themeSelect = document.getElementById('theme');
    const backgroundSelect = document.getElementById('background');
    const fontSelect = document.getElementById('font');
    const textAlignSelect = document.getElementById('textAlign');
    const exportFormatSelect = document.getElementById('exportFormat');
    const qualitySelect = document.getElementById('quality');
    const previewButton = document.getElementById('preview');
    const exportButton = document.getElementById('export');
    const cardPreview = document.getElementById('card-preview');

    // 更新预览
    function updatePreview() {
        console.log('Updating preview with text:', selectedText); // 调试日志

        if (!selectedText) {
            cardPreview.textContent = '请先选择文字';
            return;
        }

        const theme = themes[themeSelect.value];
        const background = backgrounds[backgroundSelect.value];
        const font = fonts[fontSelect.value];
        const textAlign = textAlignSelect.value;

        cardPreview.style.fontFamily = font;
        cardPreview.style.backgroundColor = background;
        cardPreview.style.color = theme.textColor;
        cardPreview.style.padding = theme.padding;
        cardPreview.style.borderRadius = theme.borderRadius;
        cardPreview.style.textAlign = textAlign;
        cardPreview.textContent = selectedText;
    }

    // 生成卡片图片
    async function generateCardImage() {
        console.log('Generating image with text:', selectedText); // 调试日志

        const theme = themes[themeSelect.value];
        const background = backgrounds[backgroundSelect.value];
        const font = fonts[fontSelect.value];
        const textAlign = textAlignSelect.value;

        // 创建canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸
        canvas.width = 800;
        canvas.height = 400;

        // 绘制背景
        if (background.startsWith('linear-gradient')) {
            // 处理渐变色背景
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            const colors = background.match(/#[0-9a-fA-F]{6}/g);
            if (colors) {
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = background;
            }
        } else {
            ctx.fillStyle = background;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 设置文本样式
        ctx.font = `32px ${font}`;
        ctx.fillStyle = theme.textColor;
        ctx.textAlign = textAlign;

        // 文本换行处理
        const maxWidth = canvas.width - 100;
        const lines = [];
        let currentLine = '';
        
        // 按字符分割文本
        for (let char of selectedText) {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        // 绘制文本
        const lineHeight = 40;
        const startY = (canvas.height - (lines.length * lineHeight)) / 2;
        
        lines.forEach((line, index) => {
            const x = textAlign === 'left' ? 50 : textAlign === 'right' ? canvas.width - 50 : canvas.width / 2;
            ctx.fillText(line, x, startY + (index * lineHeight));
        });

        return canvas;
    }

    // 导出图片
    async function exportImage() {
        try {
            const canvas = await generateCardImage();
            const format = exportFormatSelect.value;
            const quality = parseFloat(qualitySelect.value);
            const mimeType = exportFormats[format];

            // 转换为图片数据
            const imageData = canvas.toDataURL(mimeType, quality);

            // 创建下载链接
            const link = document.createElement('a');
            link.download = `quote-card.${format}`;
            link.href = imageData;
            link.click();
        } catch (error) {
            console.error('导出图片时出错:', error);
            alert('导出图片时出错，请重试');
        }
    }

    // 事件监听
    themeSelect.addEventListener('change', updatePreview);
    backgroundSelect.addEventListener('change', updatePreview);
    fontSelect.addEventListener('change', updatePreview);
    textAlignSelect.addEventListener('change', updatePreview);
    previewButton.addEventListener('click', updatePreview);
    exportButton.addEventListener('click', exportImage);

    // 初始化时获取选中的文本
    function initializeSelectedText() {
        // 首先尝试从 localStorage 获取
        const savedText = localStorage.getItem('selectedText');
        if (savedText) {
            selectedText = savedText;
            updatePreview();
            return;
        }

        // 如果 localStorage 中没有，则从 background script 获取
        chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, response => {
            if (response && response.text) {
                selectedText = response.text;
                updatePreview();
            }
        });
    }

    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'SELECTED_TEXT') {
            selectedText = request.text;
            localStorage.setItem('selectedText', selectedText);
            updatePreview();
        }
    });

    // 初始化
    initializeSelectedText();
}); 