// 存储选中的文本
let selectedText = '';

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated');
    try {
        chrome.contextMenus.create({
            id: 'generateQuoteCard',
            title: '生成金句卡片',
            contexts: ['selection']
        });
        console.log('Context menu created');
    } catch (e) {
        console.error('Error creating context menu:', e);
    }
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('Context menu clicked:', info);
    if (info.menuItemId === 'generateQuoteCard') {
        try {
            selectedText = info.selectionText;
            console.log('Selected text from context menu:', selectedText);
            
            // 存储到 storage.local
            try {
                await chrome.storage.local.set({ selectedText });
                console.log('Text stored in storage.local');
            } catch (e) {
                console.error('Error storing text:', e);
            }

            // 打开弹窗
            await openPopup();
        } catch (e) {
            console.error('Error handling context menu click:', e);
        }
    }
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in background:', message);

    if (message.type === 'GET_SELECTED_TEXT') {
        // 同步返回内存中的文本
        console.log('Sending selected text:', selectedText);
        sendResponse({ text: selectedText });
        return false; // 同步响应
    }
    
    if (message.type === 'UPDATE_SELECTED_TEXT') {
        selectedText = message.text;
        chrome.storage.local.set({ selectedText: message.text })
            .then(() => {
                console.log('Updated selected text:', selectedText);
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error updating text:', error);
                sendResponse({ success: false, error });
            });
        return true; // 异步响应
    }

    if (message.type === 'OPEN_POPUP') {
        selectedText = message.text;
        chrome.storage.local.set({ selectedText: message.text })
            .then(() => {
                console.log('Opening popup with text:', selectedText);
                return openPopup();
            })
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error opening popup:', error);
                sendResponse({ success: false, error });
            });
        return true; // 异步响应
    }

    return false; // 默认同步响应
});

// 打开弹窗的函数
async function openPopup() {
    console.log('Opening popup window');
    try {
        const popup = await chrome.windows.create({
            url: 'popup.html',
            type: 'popup',
            width: 400,
            height: 600
        });
        console.log('Popup window created:', popup);
        return popup;
    } catch (e) {
        console.error('Error opening popup:', e);
        throw e;
    }
} 