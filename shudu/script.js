// 数独生成器核心功能
class SudokuGenerator {
    constructor() {
        this.currentGrid = null;
        this.currentSolution = null;
        this.currentSize = 9;
        this.currentDifficulty = 'medium';
        this.solutionVisible = false;
        this.gameStartTime = null;
        this.timerInterval = null;
        this.currentFocusedCell = null;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }

    init() {
        this.loadSavedSize();
        this.bindEvents();
        this.generateNewPuzzle();
        this.loadHistory();
        this.updateDifficultyDisplay();
        
        // 检测设备类型
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
    }

    bindEvents() {
        // 宫格大小选择
        document.getElementById('gridSize').addEventListener('change', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.saveSizePreference();
            this.generateNewPuzzle();
        });

        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.updateDifficultyDisplay();
        });

        // 生成新题目
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateNewPuzzle();
        });

        // 显示/隐藏答案
        document.getElementById('toggleSolutionBtn').addEventListener('click', () => {
            this.toggleSolution();
        });

        // 清空历史记录
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // 成功弹窗事件
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeSuccessModal();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.closeSuccessModal();
            this.generateNewPuzzle();
        });

        // 移动端数字面板事件
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.number-panel') && !e.target.closest('.cell')) {
                this.hideNumberPanel();
            }
        });
    }

    // 保存宫格大小偏好
    saveSizePreference() {
        localStorage.setItem('sudoku_preferred_size', this.currentSize.toString());
    }

    // 加载保存的宫格大小
    loadSavedSize() {
        const savedSize = localStorage.getItem('sudoku_preferred_size');
        if (savedSize) {
            this.currentSize = parseInt(savedSize);
            document.getElementById('gridSize').value = this.currentSize;
        }
    }

    // 获取子宫格维度
    getSubgridDimensions(size) {
        const dimensions = {
            4: { rows: 2, cols: 2 },
            6: { rows: 2, cols: 3 },
            9: { rows: 3, cols: 3 }
        };
        return dimensions[size] || { rows: 3, cols: 3 };
    }

    // 生成空的数独网格
    createEmptyGrid(size) {
        return Array(size).fill().map(() => Array(size).fill(0));
    }

    // 检查数字是否可以放置在指定位置
    isValid(grid, row, col, num) {
        const size = grid.length;
        const subgrid = this.getSubgridDimensions(size);

        // 检查行
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num) return false;
        }

        // 检查列
        for (let x = 0; x < size; x++) {
            if (grid[x][col] === num) return false;
        }

        // 检查子宫格
        const startRow = row - row % subgrid.rows;
        const startCol = col - col % subgrid.cols;
        
        for (let i = 0; i < subgrid.rows; i++) {
            for (let j = 0; j < subgrid.cols; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    // 使用回溯算法填充完整的数独网格
    fillGrid(grid) {
        const size = grid.length;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    // 随机化数字顺序以增加变化
                    const numbers = Array.from({length: size}, (_, i) => i + 1);
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.fillGrid(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 数组随机排序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 根据难度移除数字创建题目
    createPuzzle(solution, difficulty) {
        const puzzle = solution.map(row => [...row]);
        const size = puzzle.length;
        const totalCells = size * size;
        
        // 根据难度确定要移除的数字数量
        const removalRates = {
            easy: 0.4,
            medium: 0.6,
            hard: 0.7
        };
        
        const cellsToRemove = Math.floor(totalCells * removalRates[difficulty]);
        const positions = [];
        
        // 创建所有位置的数组
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                positions.push([row, col]);
            }
        }
        
        // 随机选择要移除的位置
        this.shuffleArray(positions);
        
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            puzzle[row][col] = 0;
        }
        
        return puzzle;
    }

    // 生成新的数独题目
    generateNewPuzzle() {
        this.showLoading();
        
        // 使用setTimeout来避免阻塞UI
        setTimeout(() => {
            const size = this.currentSize;
            const solution = this.createEmptyGrid(size);
            
            // 填充完整解答
            this.fillGrid(solution);
            
            // 创建题目
            const puzzle = this.createPuzzle(solution, this.currentDifficulty);
            
            this.currentGrid = puzzle;
            this.currentSolution = solution;
            this.solutionVisible = false;
            
            this.renderGrid();
            this.hideSolution();
            this.startTimer();
            this.hideLoading();
            
            // 保存到历史记录
            this.saveToHistory(puzzle, solution);
        }, 100);
    }

    // 渲染数独网格
    renderGrid() {
        const gridContainer = document.getElementById('sudokuGrid');
        const size = this.currentSize;
        const subgrid = this.getSubgridDimensions(size);
        
        gridContainer.innerHTML = '';
        gridContainer.className = `sudoku-grid size-${size}`;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加子宫格边框
                if ((col + 1) % subgrid.cols === 0 && col < size - 1) {
                    cell.classList.add('border-right');
                }
                if ((row + 1) % subgrid.rows === 0 && row < size - 1) {
                    cell.classList.add('border-bottom');
                }
                
                const value = this.currentGrid[row][col];
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('given');
                } else {
                    // 创建可编辑单元格
                    this.createEditableCell(cell, row, col);
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }

    // 创建可编辑单元格
    createEditableCell(cell, row, col) {
        cell.tabIndex = 0; // 使单元格可聚焦
        
        // 点击事件
        cell.addEventListener('click', () => {
            this.focusCell(cell, row, col);
        });

        // 键盘事件
        cell.addEventListener('keydown', (e) => {
            this.handleKeyDown(e, cell, row, col);
        });

        // 触摸事件（移动端）
        if (this.isMobile) {
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.focusCell(cell, row, col);
                this.showNumberPanel(row, col);
            });
        }
    }

    // 处理单元格焦点
    focusCell(cell, row, col) {
        // 移除之前的焦点
        document.querySelectorAll('.cell.focused').forEach(c => {
            c.classList.remove('focused');
        });
        
        // 设置新焦点
        cell.classList.add('focused');
        cell.focus();
        this.currentFocusedCell = { cell, row, col };
    }

    // 处理键盘输入
    handleKeyDown(e, cell, row, col) {
        const key = e.key;
        
        // 阻止默认行为
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            const num = parseInt(key);
            if (num <= this.currentSize) {
                this.setCellValue(cell, row, col, num);
            }
        } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            e.preventDefault();
            this.setCellValue(cell, row, col, 0);
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || 
                   key === 'ArrowLeft' || key === 'ArrowRight') {
            e.preventDefault();
            this.navigateGrid(key, row, col);
        }
    }

    // 设置单元格值
    setCellValue(cell, row, col, value) {
        if (cell.classList.contains('given')) return;
        
        this.currentGrid[row][col] = value;
        cell.textContent = value || '';
        
        // 验证输入
        if (this.solutionVisible) {
            this.validateInput(cell, row, col, value);
        }
        
        // 检查是否完成
        this.checkCompletion();
    }

    // 验证输入
    validateInput(cell, row, col, value) {
        cell.classList.remove('error', 'correct');
        
        if (value === 0) return;
        
        if (value === this.currentSolution[row][col]) {
            cell.classList.add('correct');
        } else {
            cell.classList.add('error');
            this.shakeCell(cell);
        }
    }

    // 震动效果
    shakeCell(cell) {
        cell.classList.add('shake');
        setTimeout(() => {
            cell.classList.remove('shake');
        }, 500);
        
        // 触觉反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    // 网格导航
    navigateGrid(direction, currentRow, currentCol) {
        let newRow = currentRow;
        let newCol = currentCol;
        const size = this.currentSize;
        
        switch (direction) {
            case 'ArrowUp':
                newRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(size - 1, currentRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(size - 1, currentCol + 1);
                break;
        }
        
        const targetCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (targetCell) {
            this.focusCell(targetCell, newRow, newCol);
        }
    }

    // 显示移动端数字面板
    showNumberPanel(row, col) {
        if (!this.isMobile) return;
        
        const panel = document.getElementById('numberPanel');
        const buttonsContainer = panel.querySelector('.number-buttons');
        
        // 清空并重新生成数字按钮
        buttonsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.currentSize; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => {
                if (this.currentFocusedCell) {
                    this.setCellValue(
                        this.currentFocusedCell.cell,
                        this.currentFocusedCell.row,
                        this.currentFocusedCell.col,
                        i
                    );
                }
                this.hideNumberPanel();
            });
            buttonsContainer.appendChild(btn);
        }
        
        // 清除按钮事件
        panel.querySelector('.clear-btn').addEventListener('click', () => {
            if (this.currentFocusedCell) {
                this.setCellValue(
                    this.currentFocusedCell.cell,
                    this.currentFocusedCell.row,
                    this.currentFocusedCell.col,
                    0
                );
            }
            this.hideNumberPanel();
        });
        
        panel.classList.add('show');
    }

    // 隐藏移动端数字面板
    hideNumberPanel() {
        const panel = document.getElementById('numberPanel');
        panel.classList.remove('show');
    }

    // 检查游戏完成
    checkCompletion() {
        const size = this.currentSize;
        let filled = true;
        let correct = true;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.currentGrid[row][col] === 0) {
                    filled = false;
                    break;
                }
                if (this.currentGrid[row][col] !== this.currentSolution[row][col]) {
                    correct = false;
                }
            }
            if (!filled) break;
        }
        
        if (filled && correct) {
            this.onGameComplete();
        }
    }

    // 游戏完成处理
    onGameComplete() {
        this.stopTimer();
        this.showSuccessModal();
        this.createFireworks();
        
        // 播放音效（如果有）
        this.playSuccessSound();
    }

    // 显示成功弹窗
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        const timeSpent = this.getFormattedTime();
        
        document.getElementById('completionTime').textContent = timeSpent;
        document.getElementById('completionDifficulty').textContent = this.getDifficultyText();
        
        modal.classList.add('show');
    }

    // 关闭成功弹窗
    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('show');
    }

    // 创建烟花动画
    createFireworks() {
        const container = document.getElementById('fireworks');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = Math.random() * 100 + '%';
                firework.style.top = Math.random() * 100 + '%';
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                container.appendChild(firework);
                
                setTimeout(() => {
                    container.removeChild(firework);
                }, 1000);
            }, i * 100);
        }
    }

    // 播放成功音效
    playSuccessSound() {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // 显示/隐藏答案
    toggleSolution() {
        this.solutionVisible = !this.solutionVisible;
        
        if (this.solutionVisible) {
            this.showSolution();
            // 重新验证所有已输入的数字
            this.validateAllInputs();
        } else {
            this.hideSolution();
            // 移除所有验证状态
            this.clearValidationStates();
        }
    }

    // 显示答案
    showSolution() {
        const container = document.getElementById('solutionContainer');
        const solutionGrid = document.getElementById('solutionGrid');
        const size = this.currentSize;
        
        solutionGrid.innerHTML = '';
        solutionGrid.className = `sudoku-grid solution size-${size}`;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = this.currentSolution[row][col];
                solutionGrid.appendChild(cell);
            }
        }
        
        container.style.display = 'block';
        document.getElementById('toggleSolutionBtn').textContent = '隐藏答案';
    }

    // 隐藏答案
    hideSolution() {
        document.getElementById('solutionContainer').style.display = 'none';
        document.getElementById('toggleSolutionBtn').textContent = '显示答案';
    }

    // 验证所有输入
    validateAllInputs() {
        const cells = document.querySelectorAll('.cell:not(.given)');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.currentGrid[row][col];
            
            if (value !== 0) {
                this.validateInput(cell, row, col, value);
            }
        });
    }

    // 清除验证状态
    clearValidationStates() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('error', 'correct');
        });
    }

    // 计时器功能
    startTimer() {
        this.gameStartTime = Date.now();
        this.stopTimer(); // 停止之前的计时器
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (!this.gameStartTime) return;
        
        const elapsed = Date.now() - this.gameStartTime;
        const formattedTime = this.formatTime(elapsed);
        document.getElementById('timer').textContent = formattedTime;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getFormattedTime() {
        if (!this.gameStartTime) return '00:00';
        const elapsed = Date.now() - this.gameStartTime;
        return this.formatTime(elapsed);
    }

    // 更新难度显示
    updateDifficultyDisplay() {
        document.getElementById('currentDifficulty').textContent = this.getDifficultyText();
    }

    getDifficultyText() {
        const difficultyTexts = {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        };
        return difficultyTexts[this.currentDifficulty];
    }

    // 历史记录功能
    saveToHistory(puzzle, solution) {
        const historyKey = 'sudoku_history';
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        const record = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('zh-CN'),
            size: this.currentSize,
            difficulty: this.currentDifficulty,
            puzzle: puzzle,
            solution: solution
        };
        
        history.unshift(record);
        
        // 只保留最近10条记录
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem(historyKey, JSON.stringify(history));
        this.loadHistory();
    }

    loadHistory() {
        const historyKey = 'sudoku_history';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const container = document.getElementById('historyList');
        
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">暂无历史记录</p>';
            return;
        }
        
        history.forEach(record => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            item.innerHTML = `
                <div class="history-item-header">
                    <span class="history-item-title">${record.size}×${record.size} 数独</span>
                    <span class="history-item-time">${record.timestamp}</span>
                </div>
                <div class="history-item-info">
                    难度: ${this.getDifficultyTextFromValue(record.difficulty)}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.loadHistoryRecord(record);
            });
            
            container.appendChild(item);
        });
    }

    getDifficultyTextFromValue(difficulty) {
        const difficultyTexts = {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        };
        return difficultyTexts[difficulty] || '未知';
    }

    loadHistoryRecord(record) {
        this.currentSize = record.size;
        this.currentDifficulty = record.difficulty;
        this.currentGrid = record.puzzle.map(row => [...row]);
        this.currentSolution = record.solution.map(row => [...row]);
        this.solutionVisible = false;
        
        // 更新UI
        document.getElementById('gridSize').value = this.currentSize;
        document.getElementById('difficulty').value = this.currentDifficulty;
        this.updateDifficultyDisplay();
        
        this.renderGrid();
        this.hideSolution();
        this.startTimer();
    }

    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？')) {
            localStorage.removeItem('sudoku_history');
            this.loadHistory();
        }
    }

    // 显示加载状态
    showLoading() {
        document.getElementById('generateBtn').textContent = '生成中...';
        document.getElementById('generateBtn').disabled = true;
    }

    hideLoading() {
        document.getElementById('generateBtn').textContent = '生成新题目';
        document.getElementById('generateBtn').disabled = false;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGenerator();
});