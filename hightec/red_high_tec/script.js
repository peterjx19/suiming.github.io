document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('resizable-container');
    const widthControl = document.getElementById('width-control');
    const heightControl = document.getElementById('height-control');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const colorControl = document.getElementById('color-control');
    const colorPresets = document.getElementById('color-presets');
    const templateSelector = document.getElementById('template-selector');
    
    // 设置初始颜色
    document.documentElement.style.setProperty('--main-color', '#e60000');
    
    // 定义模板数据
    const templates = [
        {
            id: 'template-1',
            name: '标准模板',
            styleClass: 'template-style-1',
            thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100"><rect x="0" y="0" width="80" height="20" fill="%23e60000"/><rect x="0" y="20" width="80" height="80" fill="white" stroke="%23e60000" stroke-width="2"/><text x="40" y="60" font-family="Arial" font-size="10" text-anchor="middle" fill="%23e60000">标准模板</text></svg>'
        },
        {
            id: 'template-2',
            name: '渐变模板',
            styleClass: 'template-style-2',
            thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23e60000;stop-opacity:1" /><stop offset="100%" style="stop-color:%23990000;stop-opacity:1" /></linearGradient></defs><rect x="0" y="0" width="80" height="20" fill="url(%23grad1)"/><rect x="0" y="20" width="80" height="80" fill="white" stroke="%23e60000" stroke-width="2"/><text x="40" y="60" font-family="Arial" font-size="10" text-anchor="middle" fill="%23e60000">渐变模板</text></svg>'
        },
        {
            id: 'template-3',
            name: '简约模板',
            styleClass: 'template-style-3',
            thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100"><rect x="0" y="0" width="80" height="20" fill="white" stroke="%23e60000" stroke-width="2"/><rect x="0" y="20" width="80" height="80" fill="%23f8f8f8"/><text x="40" y="60" font-family="Arial" font-size="10" text-anchor="middle" fill="%23e60000">简约模板</text></svg>'
        }
    ];
    
    // 创建模板选择器
    function createTemplateSelector() {
        templates.forEach((template, index) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.setAttribute('data-template-id', template.id);
            templateItem.innerHTML = `
                <img src="${template.thumbnail}" alt="${template.name}">
                <div class="template-name">${template.name}</div>
            `;
            
            // 设置第一个模板为默认选中
            if (index === 0) {
                templateItem.classList.add('active');
                container.className = `container ${template.styleClass}`;
            }
            
            templateItem.addEventListener('click', function() {
                // 移除所有模板的active类
                document.querySelectorAll('.template-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // 添加active类到当前选中的模板
                this.classList.add('active');
                
                // 应用模板样式
                const templateId = this.getAttribute('data-template-id');
                const selectedTemplate = templates.find(t => t.id === templateId);
                
                // 移除所有模板样式类
                templates.forEach(t => {
                    container.classList.remove(t.styleClass);
                });
                
                // 添加选中的模板样式类
                container.className = `container ${selectedTemplate.styleClass}`;
                container.id = 'resizable-container'; // 保持ID不变
            });
            
            templateSelector.appendChild(templateItem);
        });
    }
    
    // 调用创建模板选择器函数
    createTemplateSelector();
    
    // 宽度调整
    widthControl.addEventListener('input', function() {
        const newWidth = this.value + 'px';
        container.style.width = newWidth;
        widthValue.textContent = newWidth;
    });
    
    // 高度调整
    heightControl.addEventListener('input', function() {
        const newHeight = this.value + 'px';
        container.style.height = newHeight;
        heightValue.textContent = newHeight;
    });
    
    // 颜色调整
    colorControl.addEventListener('input', function() {
        const newColor = this.value;
        document.documentElement.style.setProperty('--main-color', newColor);
    });
    
    // 颜色预设
    if (colorPresets) {
        const presetButtons = colorPresets.querySelectorAll('.color-preset');
        presetButtons.forEach(button => {
            button.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                document.documentElement.style.setProperty('--main-color', color);
                colorControl.value = color;
            });
        });
    }
    
    // 初始化显示值
    widthValue.textContent = widthControl.value + 'px';
    heightValue.textContent = heightControl.value + 'px';
    
    // 使所有文本可编辑
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
        element.addEventListener('focus', function() {
            // 选中所有文本，方便用户直接替换
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this);
            selection.removeAllRanges();
            selection.addRange(range);
        });
    });
    
    // 添加下载图片功能
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // 使用html2canvas库将容器转换为图片
            html2canvas(container, {
                scale: 2, // 提高图片质量
                backgroundColor: null,
                logging: false,
                useCORS: true
            }).then(canvas => {
                // 创建下载链接
                const link = document.createElement('a');
                link.download = '高新技术企业申报.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }
});