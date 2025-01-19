/*
 * @name 微信图片素材库清理插件
 * @description 一键清空微信公众平台素材库中的图片
 * @version 1.0
 * @author YH
 * @date 2025-01-10
 */
document.addEventListener('DOMContentLoaded', function () {
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.querySelector('.status');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // 添加涟漪效果
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    // 更新状态显示
    function updateStatus(message, type = '') {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
    }

    // 设置按钮状态
    function setButtonState(isLoading) {
        clearBtn.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
        clearBtn.style.opacity = isLoading ? '0.7' : '1';
    }

    clearBtn.addEventListener('click', function (e) {
        createRipple(e);
        updateStatus('正在清理中...', 'loading');
        setButtonState(true);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    return new Promise((resolve, reject) => {
                        // 模拟点击全选
                        const selectAllCheckbox = document.querySelector('.weui-desktop-form__checkbox');
                        if (selectAllCheckbox) {
                            selectAllCheckbox.click();
                        }
                        // 延迟点击删除按钮
                        setTimeout(() => {
                            const deleteBtn = document.querySelector('.weui-desktop-popover__wrp .weui-desktop-icon-btn.weui-desktop-icon__response-mouse');
                            if (deleteBtn) {
                                console.log('点击删除按钮');
                                deleteBtn.click();
                                // 等待确认删除框弹出
                                setTimeout(() => {
                                    const confirmDelteWrpArray = document.getElementsByClassName('weui-desktop-btn_wrp');
                                    if (confirmDelteWrpArray.length > 1) {
                                        const targetDiv = confirmDelteWrpArray[3];
                                        const confirmDeleteBtn = targetDiv.querySelector('button.weui-desktop-btn.weui-desktop-btn_primary');
                                        if (confirmDeleteBtn) {
                                            console.log('找到确认删除按钮');
                                            if (!confirmDeleteBtn.disabled) {
                                                confirmDeleteBtn.click();
                                                resolve('开始删除操作');
                                            } else {
                                                const buttonObserver = new MutationObserver((mutations) => {
                                                    if (!confirmDeleteBtn.disabled) {
                                                        confirmDeleteBtn.click();
                                                        buttonObserver.disconnect();
                                                        resolve('开始删除操作');
                                                    }
                                                });
                                                buttonObserver.observe(confirmDeleteBtn, { attributes: true });
                                            }

                                            // 监听删除成功消息
                                            const observer = new MutationObserver(() => {
                                                const deleteSuccessMessage = document.querySelector('.weui-desktop-toast__content');
                                                if (deleteSuccessMessage && deleteSuccessMessage.textContent.includes('删除成功')) {
                                                    observer.disconnect();
                                                    resolve('删除成功');
                                                }
                                            });
                                            observer.observe(document.body, { childList: true, subtree: true });
                                        } else {
                                            reject('未找到确认删除按钮');
                                        }
                                    } else {
                                        reject('未找到确认删除按钮容器');
                                    }
                                }, 1500);
                            } else {
                                reject('未找到删除按钮');
                            }
                        }, 1500);
                    });
                }
            }).then(results => {
                if (results && results[0].result === '删除成功') {
                    updateStatus('清理完成！', 'success');
                } else {
                    updateStatus('操作已执行', 'success');
                }
                setButtonState(false);
            }).catch(error => {
                updateStatus('操作失败：' + error, 'error');
                setButtonState(false);
            });
        });
    });
});