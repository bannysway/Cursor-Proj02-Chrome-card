// 存储选中的文本
let selectedText = '';

// 初始化时从 background.js 获取选中的文本
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 从 background.js 获取文本
        const response = await chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' });
        console.log('Received text from background:', response);
        if (response && response.text) {
            selectedText = response.text;
            updatePreview();
        }
    } catch (e) {
        console.error('Error getting text:', e);
    }

    // 监听来自 background 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Received message in popup:', message);
        if (message.type === 'updateSelectedText') {
            selectedText = message.text;
            updatePreview();
        }
    });

    // 背景选择
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除其他选项的 active 类
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // 添加当前选项的 active 类
            this.classList.add('active');
            // 更新预览
            updatePreview();
        });
    });

    // 模板选择
    const templateButtons = document.querySelectorAll('.template-button');
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            templateButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updatePreview();
        });
    });

    // 对齐方式选择
    const alignButtons = document.querySelectorAll('.align-button');
    alignButtons.forEach(button => {
        button.addEventListener('click', function() {
            alignButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updatePreview();
        });
    });

    // 字体选择
    document.getElementById('font-select').addEventListener('change', updatePreview);

    // 保存按钮点击事件
    document.getElementById('save-button').addEventListener('click', exportImage);
});

// 更新预览
function updatePreview() {
    const preview = document.getElementById('card-preview');
    const previewContainer = document.querySelector('.preview-container');
    
    if (!selectedText) {
        preview.textContent = '请先选择文字';
        return;
    }

    // 获取当前选中的背景
    const activeBackground = document.querySelector('.color-option.active');
    if (activeBackground) {
        // 获取背景样式
        const computedStyle = window.getComputedStyle(activeBackground);
        previewContainer.style.background = computedStyle.background;
    }

    // 获取当前选中的模板
    const activeTemplate = document.querySelector('.template-button.active');
    if (activeTemplate) {
        // 根据模板设置样式
        switch(activeTemplate.textContent) {
            case '简约':
                preview.style.fontSize = '16px';
                preview.style.letterSpacing = 'normal';
                break;
            case '复古':
                preview.style.fontSize = '18px';
                preview.style.letterSpacing = '2px';
                break;
            case '现代':
                preview.style.fontSize = '20px';
                preview.style.letterSpacing = '1px';
                break;
        }
    }

    // 获取当前选中的字体
    const fontSelect = document.getElementById('font-select');
    const selectedFont = fontSelect.value;
    preview.style.fontFamily = getFontFamily(selectedFont);

    // 获取当前选中的对齐方式
    const activeAlign = document.querySelector('.align-button.active');
    if (activeAlign) {
        preview.style.textAlign = getAlignValue(activeAlign.textContent);
    }

    // 设置文本内容
    preview.textContent = selectedText;
}

// 获取字体族
function getFontFamily(fontValue) {
    const fontMap = {
        'default': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'songti': '"SimSun", "宋体", serif',
        'heiti': '"SimHei", "黑体", sans-serif',
        'kaiti': '"KaiTi", "楷体", serif'
    };
    return fontMap[fontValue] || fontMap['default'];
}

// 获取对齐值
function getAlignValue(alignText) {
    const alignMap = {
        '左对齐': 'left',
        '居中': 'center',
        '右对齐': 'right'
    };
    return alignMap[alignText] || 'center';
}

// 生成并导出图片
async function exportImage() {
    const preview = document.getElementById('card-preview');
    const previewContainer = document.querySelector('.preview-container');
    const exportSelect = document.getElementById('export-select');

    try {
        // 创建 canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置 canvas 尺寸
        canvas.width = 800;
        canvas.height = 400;

        // 绘制背景
        const background = window.getComputedStyle(previewContainer).background;
        if (background.includes('gradient')) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            // 提取渐变色
            const colors = background.match(/rgb\([^)]+\)/g) || background.match(/#[0-9A-Fa-f]{6}/g);
            if (colors) {
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                ctx.fillStyle = gradient;
            }
        } else {
            ctx.fillStyle = background;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制文本
        ctx.font = window.getComputedStyle(preview).font;
        ctx.fillStyle = '#333333';
        ctx.textAlign = preview.style.textAlign || 'center';

        // 文本换行处理
        const maxWidth = canvas.width - 100;
        const words = selectedText.split('');
        let line = '';
        const lines = [];
        const lineHeight = parseInt(window.getComputedStyle(preview).fontSize) * 1.5;

        for (let word of words) {
            const testLine = line + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // 绘制文本
        const startY = (canvas.height - (lines.length * lineHeight)) / 2;
        lines.forEach((line, index) => {
            const x = ctx.textAlign === 'left' ? 50 : 
                     ctx.textAlign === 'right' ? canvas.width - 50 : 
                     canvas.width / 2;
            ctx.fillText(line, x, startY + (index * lineHeight));
        });

        // 导出图片
        const format = exportSelect.value.toLowerCase();
        const link = document.createElement('a');
        link.download = `quote-card.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();

    } catch (error) {
        console.error('导出图片时出错:', error);
        alert('导出图片时出错，请重试');
    }
} 