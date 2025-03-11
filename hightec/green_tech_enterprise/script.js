document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const container = document.getElementById('resizable-container');
    const leftSection = document.querySelector('.left-section');
    const subTitle = document.querySelector('.sub-title');
    const colorControl = document.getElementById('color-control');
    const colorPresets = document.getElementById('color-presets');
    const widthControl = document.getElementById('width-control');
    const heightControl = document.getElementById('height-control');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const downloadBtn = document.getElementById('download-btn');
    
    // 颜色控制
    function updateColor(color) {
        leftSection.style.backgroundColor = color;
        subTitle.style.color = color;
        downloadBtn.style.backgroundColor = color;
        
        // 更新下载按钮悬停颜色
        const style = document.createElement('style');
        style.innerHTML = `.download-button:hover { background-color: ${darkenColor(color, 20)}; }`;
        document.head.appendChild(style);
        
        colorControl.value = color;
    }
    
    // 调整颜色亮度的辅助函数
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = (num >> 16);
        const g = ((num >> 8) & 0x00FF);
        const b = (num & 0x0000FF);
        
        const newR = Math.max(0, r - percent);
        const newG = Math.max(0, g - percent);
        const newB = Math.max(0, b - percent);
        
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
            link.download = '高新技术企业_' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
    
    // 初始化
    updateColor(colorControl.value);
    container.style.width = widthControl.value + 'px';
    container.style.height = heightControl.value + 'px';
});