// 存储选中的文本
let lastSelectedText = '';

// 监听鼠标抬起事件，检查是否有文字被选中
window.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    lastSelectedText = selectedText;
    
    // 创建插件图标
    const icon = document.createElement('div');
    icon.style.position = 'absolute';
    icon.style.background = 'url(icons/icon16.svg) no-repeat center';
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.cursor = 'pointer';
    icon.style.zIndex = '1000';

    // 获取选中文字的范围
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 设置图标位置
    icon.style.top = `${rect.top + window.scrollY - 20}px`;
    icon.style.left = `${rect.left + window.scrollX}px`;

    // 点击图标时发送选中的文本到popup
    icon.addEventListener('click', () => {
      // 存储选中的文本到 localStorage
      localStorage.setItem('selectedText', selectedText);
      
      // 发送消息到 background script
      chrome.runtime.sendMessage({
        type: 'SELECTED_TEXT',
        text: selectedText
      });
    });

    // 将图标添加到页面
    document.body.appendChild(icon);

    // 移除之前的图标
    setTimeout(() => {
      document.body.removeChild(icon);
    }, 3000);
  }
});

// 响应来自popup的请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SELECTED_TEXT') {
    // 首先尝试从 localStorage 获取
    const savedText = localStorage.getItem('selectedText');
    if (savedText) {
      sendResponse({ text: savedText });
    } else {
      sendResponse({ text: lastSelectedText });
    }
    return true; // 保持消息通道开启
  }
}); 