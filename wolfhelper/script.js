document.addEventListener('DOMContentLoaded', function() {
    const startGameBtn = document.getElementById('startGame');
    const resetGameBtn = document.getElementById('resetGame');
    const numPlayersInput = document.getElementById('numPlayers');
    const playerSection = document.getElementById('playerSection');
    const playerList = document.getElementById('playerList');
    const roleSelectTemplate = document.getElementById('roleSelectTemplate');

    // 定义角色数组
    const roles = [
        { value: '狼人', class: 'role-wolf' },
        { value: '预言家', class: 'role-good' },
        { value: '女巫', class: 'role-good' },
        { value: '守卫', class: 'role-good' },
        { value: '猎人', class: 'role-good' },
        { value: '好人/村民', class: 'role-villager' }
    ];

    // 定义行为标签数组
    const behaviorTags = [
        { value: '嫌疑狼人', style: 'tag-wolf' },
        { value: '划水', style: 'tag-slacker' },
        { value: '上警', style: 'tag-police' },
        { value: '金水', style: 'tag-good' },
        { value: '引战', style: 'tag-trouble' },
        { value: '跟风', style: 'tag-trouble' },
        { value: '啰嗦', style: 'tag-trouble' },
    ];

    // 添加重置按钮事件监听
    resetGameBtn.addEventListener('click', function() {
        if (confirm('确定要重置游戏吗？所有记录将被清除。')) {
            // 清除本地存储
            localStorage.removeItem('wolfKillerState');
            // 重置输入框
            numPlayersInput.value = '';
            // 隐藏玩家区域
            playerSection.style.display = 'none';
            // 清空玩家列表
            playerList.innerHTML = '';
        }
    });

    // 检查是否有保存的游戏状态
    const savedState = localStorage.getItem('wolfKillerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        numPlayersInput.value = state.numPlayers;
        initializeGame(state.numPlayers, state.players);
        playerSection.style.display = 'block'; // 确保玩家区域显示
    }

    startGameBtn.addEventListener('click', function() {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers >= 3) {
            initializeGame(numPlayers);
        } else {
            alert('请输入至少3名玩家');
        }
    });

    function saveGameState() {
        const players = [];
        document.querySelectorAll('.player-item').forEach((item, index) => {
            const statusTag = item.querySelector('.status-tag');
            const roleButton = item.querySelector('.role-button');
            const tags = Array.from(item.querySelectorAll('.player-tag')).map(tag => tag.getAttribute('data-tag'));
            
            players.push({
                number: index + 1,
                isAlive: statusTag.classList.contains('status-alive'),
                role: roleButton.textContent === '选择角色' ? '' : roleButton.textContent,
                roleClass: Array.from(roleButton.classList).find(cls => cls.startsWith('role-') && cls !== 'role-button') || '',
                tags: tags
            });
        });

        const gameState = {
            numPlayers: parseInt(numPlayersInput.value),
            players: players
        };

        localStorage.setItem('wolfKillerState', JSON.stringify(gameState));
    }

    function getTagStyle(tag) {
        const tagConfig = behaviorTags.find(t => t.value === tag);
        return tagConfig ? tagConfig.style : '';
    }

    function createTagElement(tagText) {
        const tagSpan = document.createElement('span');
        tagSpan.className = `player-tag ${getTagStyle(tagText)}`;
        tagSpan.setAttribute('data-tag', tagText);
        tagSpan.innerHTML = `
            ${tagText}
            <span class="tag-remove">×</span>
        `;
        
        tagSpan.querySelector('.tag-remove').addEventListener('click', function(e) {
            e.stopPropagation();
            tagSpan.remove();
            saveGameState();
        });
        
        return tagSpan;
    }

    function initializeGame(numPlayers, savedPlayers = null) {
        // 清空玩家列表
        playerList.innerHTML = '';
        // 显示玩家区域
        playerSection.style.display = 'block';
        
        // 创建玩家列表
        for (let i = 1; i <= numPlayers; i++) {
            const playerItem = document.createElement('li');
            playerItem.className = 'player-item';
            
            // 添加存活状态标签
            const statusTag = document.createElement('span');
            statusTag.className = 'status-tag status-alive';
            statusTag.textContent = '存活';

            // 恢复存活状态
            if (savedPlayers && savedPlayers[i-1]) {
                if (!savedPlayers[i-1].isAlive) {
                    statusTag.classList.remove('status-alive');
                    statusTag.classList.add('status-dead');
                    statusTag.textContent = '死亡';
                }
            }

            statusTag.addEventListener('click', function() {
                if (this.classList.contains('status-alive')) {
                    this.classList.remove('status-alive');
                    this.classList.add('status-dead');
                    this.textContent = '死亡';
                } else {
                    this.classList.remove('status-dead');
                    this.classList.add('status-alive');
                    this.textContent = '存活';
                }
                saveGameState();
            });
            playerItem.appendChild(statusTag);

            // 添加玩家编号
            const playerNumber = document.createElement('span');
            playerNumber.className = 'player-number';
            playerNumber.textContent = `玩家 ${i}`;
            playerItem.appendChild(playerNumber);

            // 添加角色选择按钮
            const roleButton = document.createElement('button');
            roleButton.className = 'role-button';
            roleButton.textContent = '选择角色';
            playerItem.appendChild(roleButton);

            // 添加角色选择弹出框
            const rolePopup = document.createElement('div');
            rolePopup.className = 'role-popup';
            rolePopup.style.display = 'none';

            const roleOptions = document.createElement('div');
            roleOptions.className = 'role-options';
            
            // 使用角色数组创建按钮
            roles.forEach(role => {
                const button = document.createElement('button');
                button.setAttribute('data-role', role.value);
                button.textContent = role.value;
                roleOptions.appendChild(button);

                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    roleButton.textContent = this.textContent;
                    roleButton.className = 'role-button ' + role.class;
                    rolePopup.style.display = 'none';
                    saveGameState();
                });
            });

            // 添加重置按钮
            const resetButton = document.createElement('button');
            resetButton.className = 'role-reset';
            resetButton.setAttribute('data-role', '');
            resetButton.textContent = '重置 ⟲';
            resetButton.addEventListener('click', function(e) {
                e.stopPropagation();
                roleButton.textContent = '选择角色';
                roleButton.className = 'role-button';
                rolePopup.style.display = 'none';
                saveGameState();
            });
            roleOptions.appendChild(resetButton);

            rolePopup.appendChild(roleOptions);
            playerItem.appendChild(rolePopup);

            // 角色按钮点击事件
            roleButton.addEventListener('click', function(e) {
                e.stopPropagation();
                rolePopup.style.display = rolePopup.style.display === 'none' ? 'block' : 'none';
            });

            // 恢复保存的角色
            if (savedPlayers && savedPlayers[i-1] && savedPlayers[i-1].role) {
                const savedRole = savedPlayers[i-1].role;
                roleButton.textContent = savedRole;
                
                const roleConfig = roles.find(r => r.value === savedRole);
                if (roleConfig) {
                    roleButton.classList.add(roleConfig.class);
                }
            }

            // 添加标签容器
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'player-tags';
            
            // 恢复保存的标签
            if (savedPlayers && savedPlayers[i-1] && savedPlayers[i-1].tags) {
                savedPlayers[i-1].tags.forEach(tag => {
                    tagsContainer.appendChild(createTagElement(tag));
                });
            }
            playerItem.appendChild(tagsContainer);

            // 添加标签选择器
            const tagSelect = document.getElementById('tagSelectTemplate').cloneNode(true);
            tagSelect.style.display = 'inline-block';
            tagSelect.id = `tag-select-${i}`;
            
            const tagDropdown = tagSelect.querySelector('.tag-dropdown');
            
            // 动态添加行为选项
            behaviorTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.value;
                option.textContent = tag.value;
                tagDropdown.appendChild(option);
            });

            tagDropdown.addEventListener('change', function(e) {
                const selectedTag = e.target.value;
                if (selectedTag) {
                    // 检查标签是否已存在
                    const existingTags = tagsContainer.querySelectorAll('.player-tag');
                    let tagExists = false;
                    existingTags.forEach(tag => {
                        if (tag.getAttribute('data-tag') === selectedTag) {
                            tagExists = true;
                        }
                    });
                    
                    if (!tagExists) {
                        tagsContainer.appendChild(createTagElement(selectedTag));
                        saveGameState();
                    }
                    
                    // ���置选择
                    e.target.value = '';
                }
            });

            playerItem.appendChild(tagSelect);
            playerList.appendChild(playerItem);
        }

        // 点击其他地方关闭所有弹出框
        document.addEventListener('click', function() {
            document.querySelectorAll('.role-popup').forEach(popup => {
                popup.style.display = 'none';
            });
        });
    }

    // 添加玩家状态管理功能
    playerList.addEventListener('click', function(e) {
        const playerItem = e.target.closest('.player-item');
        if (!playerItem) return;

        if (e.target.matches('.player-item')) {
            // 点击玩家项本身时的处理（如果需要）
        }
    });

    // 添加字体大小控制
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    const container = document.querySelector('.container');

    // 恢复保存的字体大小设置
    const savedFontSize = localStorage.getItem('preferredFontSize') || 'medium';
    container.className = `container font-${savedFontSize}`;
    document.querySelector(`.font-size-btn[data-size="${savedFontSize}"]`).classList.add('active');

    fontSizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            
            // 更新按钮状态
            fontSizeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新容器类名
            container.className = `container font-${size}`;
            
            // 保存设置
            localStorage.setItem('preferredFontSize', size);
        });
    });
});