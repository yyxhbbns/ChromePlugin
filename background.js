/*
 * @name 微信图片素材库清理插件
 * @description 一键清空微信公众平台素材库中的图片
 * @version 1.0
 * @author YH
 * @date 2025-01-10
 */
// 监听插件安装完成事件
chrome.runtime.onInstalled.addListener(function () {
    console.log('微信图片素材库清空插件已安装');
    chrome.storage.local.set({
        'lastClearTime': 0
    }, function () {
        console.log('默认配置已设置');
    });
});

// 监听浏览器启动事件
chrome.runtime.onStartup.addListener(function () {
    console.log('浏览器启动，微信图片素材库清空插件处于后台运行状态');
});