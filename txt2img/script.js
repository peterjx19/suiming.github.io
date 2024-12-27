// 在文件开头添加切换编辑器的函数
function switchEditor(type) {
    // 隐藏所有编辑器
    document.querySelectorAll('.editor-container').forEach(editor => {
        editor.classList.remove('active');
    });
    
    // 显示选中的编辑器
    document.getElementById(`${type}-editor`).classList.add('active');
    
    // 如果切换到Mermaid编辑器，自动渲染默认内容
    if (type === 'mermaid') {
        renderMermaid();
    }
}

// 初始化Mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose'
});

// 标签切换功能
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // 更新标签状态
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 更新内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
    });
});

function renderSVG() {
    const svgCode = document.getElementById('svgInput').value;
    const preview = document.getElementById('preview');
    preview.innerHTML = svgCode;
}

function getSVGTitle() {
    const svg = document.querySelector('#preview svg');
    if (!svg) return '';
    
    // 尝试获取SVG中的text元素
    const textElement = svg.querySelector('text');
    if (textElement) {
        return textElement.textContent.trim();
    }
    
    // 如果没有text元素，返回空字符串
    return '';
}

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day}.${hour}.${minute}`;
}

function downloadPNG() {
    const svg = document.querySelector('#preview svg');
    if (!svg) {
        alert('请先渲染SVG！');
        return;
    }

    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取SVG尺寸
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 生成文件名
        const dateTime = getFormattedDateTime();
        const title = getSVGTitle();
        const fileName = `${dateTime}${title ? ' - ' + title : ''}.png`;
        
        // 转换为PNG并下载
        const pngData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = pngData;
        downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// Mermaid相关函数
async function renderMermaid() {
    const mermaidCode = document.getElementById('mermaidInput').value;
    const preview = document.getElementById('mermaid-preview');
    
    try {
        // 清空预览区域
        preview.innerHTML = '';
        
        // 创建新的预览容器
        const previewContainer = document.createElement('div');
        previewContainer.className = 'mermaid';
        previewContainer.textContent = mermaidCode;
        
        preview.appendChild(previewContainer);
        
        // 重新渲染
        await mermaid.run();
    } catch (error) {
        preview.innerHTML = `<div class="error">渲染错误: ${error.message}</div>`;
    }
}

async function downloadMermaidPNG() {
    const preview = document.getElementById('mermaid-preview');
    const svg = preview.querySelector('svg');
    
    if (!svg) {
        alert('请先渲染图表！');
        return;
    }

    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取SVG数据
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 生成文件名
        const dateTime = getFormattedDateTime();
        const fileName = `${dateTime} - mermaid.png`;
        
        // 转换为PNG并下载
        const pngData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = pngData;
        downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// 页面加载完成后渲染默认的Mermaid图表
document.addEventListener('DOMContentLoaded', () => {
    renderMermaid();
}); 