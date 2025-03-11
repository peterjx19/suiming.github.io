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
    const header = document.querySelector('.header');
    
    // 颜色控制
    function updateColor(color) {
        header.style.backgroundColor = color;
        downloadBtn.style.backgroundColor = color;
        document.querySelectorAll('[contenteditable="true"]:focus').forEach(el => {
            el.style.borderColor = color;
        });
        colorControl.value = color;
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
            link.download = '高新技术企业认定_' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
    
    // 初始化
    updateColor(colorControl.value);
    container.style.width = widthControl.value + 'px';
    container.style.height = heightControl.value + 'px';
});