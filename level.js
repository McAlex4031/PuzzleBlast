// Configuration des niveaux
const LEVELS = [
    {
        id: 1,
        name: "Niveau 1 - Débutant",
        moves: 25,
        objective: "Scorer 5000 points",
        targetScore: 5000,
        obstacles: [],
        boardLayout: null // grille aléatoire
    },
    {
        id: 2,
        name: "Niveau 2 - Intermédiaire",
        moves: 20,
        objective: "Scorer 8000 points",
        targetScore: 8000,
        obstacles: [
            { row: 3, col: 3, type: 'brick' },
            { row: 3, col: 6, type: 'brick' },
            { row: 6, col: 3, type: 'shield' },
            { row: 6, col: 6, type: 'shield' }
        ],
        boardLayout: null
    },
    {
        id: 3,
        name: "Niveau 3 - Expert",
        moves: 15,
        objective: "Scorer 12000 points",
        targetScore: 12000,
        obstacles: [
            { row: 2, col: 2, type: 'brick' },
            { row: 2, col: 7, type: 'brick' },
            { row: 4, col: 4, type: 'stone' },
            { row: 4, col: 5, type: 'stone' },
            { row: 5, col: 4, type: 'stone' },
            { row: 5, col: 5, type: 'stone' },
            { row: 7, col: 2, type: 'wood' },
            { row: 7, col: 7, type: 'wood' }
        ],
        boardLayout: null
    }
];

// Éléments disponibles
const TILES = ['🍇', '🍒', '🍋', '🍏'];

// Types de boosters
const BOOSTERS = {
    ROCKET: 'rocket',      // 🚀
    BOMB: 'bomb',          // 💣
    LIGHTNING: 'lightning' // ⚡
};

// Types d'obstacles
const OBSTACLES = {
    BRICK: 'brick',      // 🧱 - 2 impacts
    SHIELD: 'shield',    // 🛡 - 1 impact
    WOOD: 'wood',        // 🪵 - association
    STONE: 'stone',      // 🪨 - 2 impacts/associations
    STAR: 'star'         // ⭐ - 1 impact, transforme 3x3 en zone jaune
};

// Configuration des boosters achetables
const SHOP_ITEMS = {
    hammer: {
        icon: '🔨',
        name: 'Casse-Case',
        price: 500,
        maxStock: 3,
        type: 'hammer'
    },
    swap: {
        icon: '🧤',
        name: 'Swap Libre',
        price: 500,
        maxStock: 3,
        type: 'swap'
    },
    explosion: {
        icon: '🧨',
        name: 'Explosion 3x3',
        price: 500,
        maxStock: 3,
        type: 'explosion'
    }
};

// Points par action
const POINTS = {
    match3: 100,
    match4: 300,
    match5: 500,
    rocket: 200,
    bomb: 300,
    lightning: 400,
    combo: (multiplier) => multiplier * 50
};

// Configuration du gameplay
const GAME_CONFIG = {
    GRID_SIZE: 10,
    TILE_SIZE: 50,
    FALL_SPEED: 0.15,
    SWAP_DURATION: 200,
    MATCH_CHECK_DELAY: 150,
    ANIMATION_DURATION: 300,
    COINS_PER_LEVEL: 50
};
