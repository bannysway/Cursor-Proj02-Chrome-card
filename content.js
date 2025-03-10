// 存储选中的文本
let lastSelectedText = '';

// 检查扩展是否可用
function isExtensionAvailable() {
    try {
        return chrome.runtime && chrome.runtime.id;
    } catch (e) {
        console.log('Extension not available:', e);
        return false;
    }
}

// 安全地发送消息
async function sendMessageSafely(message) {
    console.log('Attempting to send message:', message);
    
    if (!isExtensionAvailable()) {
        console.log('Extension not available, cannot send message');
        return;
    }
    
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(message, response => {
                if (chrome.runtime.lastError) {
                    console.log('Error sending message:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Message sent successfully, response:', response);
                    resolve(response);
                }
            });
        } catch (e) {
            console.log('Error in sendMessageSafely:', e);
            reject(e);
        }
    });
}

// 监听文本选择事件
document.addEventListener('mouseup', async (event) => {
    try {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText) {
            console.log('Text selected:', selectedText);
            lastSelectedText = selectedText;
            
            // 存储到内存和 storage
            try {
                await sendMessageSafely({
                    type: 'UPDATE_SELECTED_TEXT',
                    text: selectedText
                });
                console.log('Text saved and broadcast');
            } catch (e) {
                console.log('Error saving text:', e);
            }

            // 创建并显示图标
            showSelectionIcon(selectedText, event);
        }
    } catch (e) {
        console.error('Error in mouseup event:', e);
    }
});

// 显示选择图标
function showSelectionIcon(selectedText, event) {
    console.log('Showing selection icon');
    try {
        // 移除可能存在的旧图标
        const oldIcon = document.querySelector('.quote-card-icon');
        if (oldIcon) {
            oldIcon.remove();
        }

        // 创建新图标
        const icon = document.createElement('div');
        icon.className = 'quote-card-icon';
        icon.style.position = 'fixed';
        icon.style.background = '#007AFF';
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '2147483647';
        icon.style.borderRadius = '50%';
        icon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        
        // 添加图标内容
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8h10M8 3v10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

        // 设置图标位置
        const iconSize = 24;
        const spacing = 10;
        icon.style.top = `${event.pageY - iconSize - spacing}px`;
        icon.style.left = `${event.pageX}px`;

        // 点击图标事件
        icon.addEventListener('click', async () => {
            console.log('Icon clicked');
            try {
                const response = await sendMessageSafely({
                    type: 'OPEN_POPUP',
                    text: selectedText
                });
                
                console.log('Received response after icon click:', response);
            } catch (e) {
                console.error('Error handling icon click:', e);
            }
        });

        // 添加图标到页面
        document.body.appendChild(icon);
        console.log('Icon added to page');

        // 3秒后移除图标
        setTimeout(() => {
            if (icon && icon.parentNode) {
                icon.remove();
                console.log('Icon removed');
            }
        }, 3000);

    } catch (e) {
        console.error('Error showing selection icon:', e);
    }
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in content script:', request);
    try {
        if (request.type === 'GET_SELECTED_TEXT') {
            // 同步返回最后选择的文本
            console.log('Sending response with text:', lastSelectedText);
            sendResponse({ text: lastSelectedText });
            return false; // 同步响应
        }
    } catch (e) {
        console.error('Error handling message in content script:', e);
        sendResponse({ error: e.message });
    }
    return false; // 默认同步响应
}); 