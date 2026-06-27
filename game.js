// ===== CLASSE PRINCIPALE DU JEU =====
class PuzzleBlastGame {
    constructor() {
        this.currentLevel = 1;
        this.coins = 0;
        this.grid = [];
        this.selectedTile = null;
        this.isAnimating = false;
        this.movesLeft = 0;
        this.score = 0;
        this.boosterStock = {
            hammer: 3,
            swap: 3,
            explosion: 3
        };
        this.moveHistory = [];
        this.comboMultiplier = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGameState();
        this.showMenu();
    }

    // ===== GESTION DES ÉVÉNEMENTS =====
    setupEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => this.startLevel());
        document.getElementById('shopButton').addEventListener('click', () => this.toggleShop(true));
        document.getElementById('closeShop').addEventListener('click', () => this.toggleShop(false));
        document.getElementById('homeButton').addEventListener('click', () => this.returnToMenu());
        document.getElementById('undoButton').addEventListener('click', () => this.undoLastMove());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('retryButton').addEventListener('click', () => this.startLevel());

        // Shop items
        document.querySelectorAll('.shop-item').forEach((item, index) => {
            item.addEventListener('click', () => this.buyBooster(Object.keys(SHOP_ITEMS)[index]));
        });
    }

    // ===== SAUVEGARDE ET CHARGEMENT =====
    loadGameState() {
        const saved = localStorage.getItem('puzzleBlastSave');
        if (saved) {
            const state = JSON.parse(saved);
            this.currentLevel = state.currentLevel || 1;
            this.coins = state.coins || 0;
            this.boosterStock = state.boosterStock || { hammer: 3, swap: 3, explosion: 3 };
        }
    }

    saveGameState() {
        const state = {
            currentLevel: this.currentLevel,
            coins: this.coins,
            boosterStock: this.boosterStock
        };
        localStorage.setItem('puzzleBlastSave', JSON.stringify(state));
    }

    // ===== ÉCRANS =====
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }

    showMenu() {
        this.showScreen('mainMenu');
        this.updateMenuDisplay();
    }

    updateMenuDisplay() {
        document.getElementById('menuCoins').textContent = this.coins;
        document.getElementById('playButtonText').textContent = `Jouer Niveau ${this.currentLevel}`;
    }

    toggleShop(show) {
        const panel = document.getElementById('shopPanel');
        if (show) {
            panel.classList.add('active');
            this.updateShopDisplay();
        } else {
            panel.classList.remove('active');
        }
    }

    updateShopDisplay() {
        document.getElementById('hammerStock').textContent = this.boosterStock.hammer;
        document.getElementById('swapStock').textContent = this.boosterStock.swap;
        document.getElementById('bombStock').textContent = this.boosterStock.explosion;
    }

    // ===== DÉMARRAGE DU NIVEAU =====
    startLevel() {
        this.toggleShop(false);
        const level = LEVELS[this.currentLevel - 1];
        if (!level) {
            alert('Tous les niveaux complétés !');
            return;
        }

        this.movesLeft = level.moves;
        this.score = 0;
        this.comboMultiplier = 0;
        this.moveHistory = [];
        this.selectedTile = null;
        this.isAnimating = false;

        // Initialiser la grille
        this.initializeGrid();
        
        // Appliquer les obstacles
        if (level.obstacles && level.obstacles.length > 0) {
            level.obstacles.forEach(obs => {
                this.grid[obs.row][obs.col] = {
                    type: 'obstacle',
                    obstacleType: obs.type,
                    health: this.getObstacleHealth(obs.type)
                };
            });
        }

        this.showScreen('gameScreen');
        this.updateGameDisplay();
        this.renderGrid();
    }

    getObstacleHealth(type) {
        const health = {
            brick: 2,
            shield: 1,
            wood: 1,
            stone: 2,
            star: 1
        };
        return health[type] || 1;
    }

    // ===== INITIALISATION DE LA GRILLE =====
    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
                const tile = this.createRandomTile();
                this.grid[row][col] = tile;
            }
        }

        // Éliminer les matches existants
        let hasMatches = true;
        while (hasMatches) {
            this.clearMatches();
            hasMatches = this.findMatches().length > 0;
        }
    }

    createRandomTile() {
        return {
            type: 'tile',
            value: TILES[Math.floor(Math.random() * TILES.length)],
            booster: null,
            falling: false
        };
    }

    // ===== RENDU DE LA GRILLE =====
    renderGrid() {
        const gridElement = document.getElementById('gameGrid');
        gridElement.innerHTML = '';

        for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
                const tile = this.grid[row][col];
                const tileElement = this.createTileElement(row, col, tile);
                gridElement.appendChild(tileElement);
            }
        }
    }

    createTileElement(row, col, tile) {
        const element = document.createElement('button');
        element.className = 'tile';
        element.dataset.row = row;
        element.dataset.col = col;

        if (tile.type === 'tile') {
            element.textContent = tile.value;
            if (tile.booster) {
                element.classList.add('has-booster');
                element.dataset.booster = tile.booster;
            }
            element.addEventListener('click', () => this.selectTile(row, col));
        } else if (tile.type === 'obstacle') {
            element.textContent = this.getObstacleEmoji(tile.obstacleType);
            element.classList.add('obstacle', `obstacle-${tile.obstacleType}`);
            element.dataset.health = tile.health;
        }

        if (this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col) {
            element.classList.add('selected');
        }

        return element;
    }

    getObstacleEmoji(type) {
        const emojis = {
            brick: '🧱',
            shield: '🛡',
            wood: '🪵',
            stone: '🪨',
            star: '⭐'
        };
        return emojis[type] || '?';
    }

    // ===== SÉLECTION ET SWAP DE TUILES =====
    selectTile(row, col) {
        if (this.isAnimating || this.movesLeft <= 0) return;

        const tile = this.grid[row][col];
        if (tile.type !== 'tile') return;

        if (!this.selectedTile) {
            this.selectedTile = { row, col };
            this.renderGrid();
            return;
        }

        const isAdjacent = this.isAdjacentTile(
            this.selectedTile.row, this.selectedTile.col,
            row, col
        );

        if (isAdjacent) {
            this.isAnimating = true;
            this.swapTiles(this.selectedTile.row, this.selectedTile.col, row, col);
        } else {
            this.selectedTile = { row, col };
            this.renderGrid();
        }
    }

    isAdjacentTile(row1, col1, row2, col2) {
        const distance = Math.abs(row1 - row2) + Math.abs(col1 - col2);
        return distance === 1;
    }

    swapTiles(row1, col1, row2, col2) {
        // Sauvegarder l'état pour undo
        this.moveHistory.push(JSON.parse(JSON.stringify(this.grid)));

        // Échanger les tuiles
        [this.grid[row1][col1], this.grid[row2][col2]] = 
        [this.grid[row2][col2], this.grid[row1][col1]];

        this.selectedTile = null;
        this.movesLeft--;
        this.comboMultiplier = 0;

        this.updateGameDisplay();

        setTimeout(() => {
            const matches = this.findMatches();
            if (matches.length > 0) {
                this.processMatches(matches);
            } else {
                // Swap inverse si pas de match
                [this.grid[row1][col1], this.grid[row2][col2]] = 
                [this.grid[row2][col2], this.grid[row1][col1]];
                this.renderGrid();
                this.isAnimating = false;
                this.playSound('error');
            }
        }, GAME_CONFIG.SWAP_DURATION);
    }

    // ===== DÉTECTION DES MATCHES =====
    findMatches() {
        const matches = [];
        const matched = new Set();

        // Vérifier les lignes
        for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE - 2; col++) {
                const tiles = [
                    this.grid[row][col],
                    this.grid[row][col + 1],
                    this.grid[row][col + 2]
                ];

                if (this.isTilesMatch(tiles)) {
                    matches.push({
                        positions: [
                            { row, col },
                            { row, col: col + 1 },
                            { row, col: col + 2 }
                        ],
                        type: 'horizontal',
                        length: this.getMatchLength(row, col, 'horizontal')
                    });
                }
            }
        }

        // Vérifier les colonnes
        for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
            for (let row = 0; row < GAME_CONFIG.GRID_SIZE - 2; row++) {
                const tiles = [
                    this.grid[row][col],
                    this.grid[row + 1][col],
                    this.grid[row + 2][col]
                ];

                if (this.isTilesMatch(tiles)) {
                    matches.push({
                        positions: [
                            { row, col },
                            { row: row + 1, col },
                            { row: row + 2, col }
                        ],
                        type: 'vertical',
                        length: this.getMatchLength(row, col, 'vertical')
                    });
                }
            }
        }

        return this.removeDuplicateMatches(matches);
    }

    isTilesMatch(tiles) {
        if (tiles.some(t => t.type !== 'tile')) return false;
        return tiles.every(t => t.value === tiles[0].value);
    }

    getMatchLength(row, col, direction) {
        let length = 1;
        const tile = this.grid[row][col];

        if (direction === 'horizontal') {
            while (col + length < GAME_CONFIG.GRID_SIZE && 
                   this.grid[row][col + length].type === 'tile' &&
                   this.grid[row][col + length].value === tile.value) {
                length++;
            }
        } else {
            while (row + length < GAME_CONFIG.GRID_SIZE &&
