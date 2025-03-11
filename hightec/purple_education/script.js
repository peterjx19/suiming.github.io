document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const container = document.getElementById('resizable-container');
    const colorControl = document.getElementById('color-control');
    const colorPresets = document.getElementById('color-presets');
    const widthControl = document.getElementById('width-control');
    const heightControl = document.getElementById('height-control');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const downloadBtn = document.getElementById('download-btn');
    const titleRights = document.querySelectorAll('.title-right');
    
    // 颜色控制
    function updateColor(color) {
        container.style.background = `linear-gradient(135deg, ${color} 0%, ${lightenColor(color, 30)} 100%)`;
        downloadBtn.style.backgroundColor = color;
        
        // 更新标题右侧文字背景色
        titleRights.forEach(el => {
            el.style.color = color;
        });
        
        // 更新下载按钮悬停颜色
        const style = document.createElement('style');
        style.innerHTML = `.download-button:hover { background-color: ${lightenColor(color, 20)}; }`;
        document.head.appendChild(style);
        
        colorControl.value = color;
    }
    
    // 调整颜色亮度的辅助函数
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = (num >> 16);
        const g = ((num >> 8) & 0x00FF);
        const b = (num & 0x0000FF);
        
        const newR = Math.min(255, r + percent);
        const newG = Math.min(255, g + percent);
        const newB = Math.min(255, b + percent);
        
        return '#' + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
    }
    
    colorControl.addEventListener('input', function() {
        updateColor(this.value);
    });
    
    colorPresets.addEventListener('click', function(e) {
        if (e.target.classList.contains('color-preset')) {
            const color = e.target.getAttribute('data-color');
            updateColor(color);
        }
    });
    
    // 尺寸控制
    widthControl.addEventListener('input', function() {
        const width = this.value + 'px';
        container.style.width = width;
        widthValue.textContent = width;
    });
    
    heightControl.addEventListener('input', function() {
        const height = this.value + 'px';
        container.style.height = height;
        heightValue.textContent = height;
    });
    
    // 下载图片
    downloadBtn.addEventListener('click', function() {
        // 临时移除resize属性以便截图
        const originalResize = container.style.resize;
        container.style.resize = 'none';
        
        html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: null
        }).then(canvas => {
            // 恢复resize属性
            container.style.resize = originalResize;
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = '致知教育专营_' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
    
    // 初始化
    updateColor(colorControl.value);
    container.style.width = widthControl.value + 'px';
    container.style.height = heightControl.value + 'px';
});