// 创建右键菜单项
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateQuoteCard",
    title: "生成金句卡片",
    contexts: ["selection"]
  });
});

// 存储选中的文本
let selectedText = '';

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateQuoteCard") {
    selectedText = info.selectionText;
    // 存储到 localStorage
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: text => {
        localStorage.setItem('selectedText', text);
      },
      args: [selectedText]
    });
    // 打开插件弹窗
    chrome.action.openPopup();
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SELECTED_TEXT') {
    selectedText = request.text;
    // 发送消息给所有打开的popup
    chrome.runtime.sendMessage({
      type: 'SELECTED_TEXT',
      text: selectedText
    });
  } else if (request.type === 'GET_SELECTED_TEXT') {
    sendResponse({ text: selectedText });
    return true; // 保持消息通道开启
  }
}); 