// API Configuration
export const API_CONFIG = {
    BASE_URLS: {
        YAPS: "https://api.kaito.ai/api/v1/yaps",
        LEADERBOARD: "https://hub.kaito.ai/api/v1/gateway/ai/kol/mindshare/top-leaderboard",
        AVATAR: "https://unavatar.io/twitter",
        COUNTER: "https://novas-backend.onrender.com/counter"
    },
    PROXY: "https://corsproxy.io/?",
    RETRY_CONFIG: {
        attempts: 3,
        delay: 1000,
        backoff: 2
    }
};

// Extended project configurations with more metadata
export const PROJECT_CONFIG = {
    novas: {
        id: "NYT",
        name: "Novastro",
        displayName: "Novastro",
        color: "#8f4fff",
        website: "https://novastro.xyz",
        twitter: "@novastro_xyz",
        description: "AI-powered crypto insights platform"
    },
    bitcoin: {
        id: "BTC",
        name: "Bitcoin",
        displayName: "Bitcoin",
        color: "#f7931a",
        website: "https://bitcoin.org",
        twitter: "@bitcoin",
        description: "The first and largest cryptocurrency"
    },
    ethereum: {
        id: "ETH",
        name: "Ethereum",
        displayName: "Ethereum",
        color: "#627eea",
        website: "https://ethereum.org",
        twitter: "@ethereum",
        description: "Decentralized platform for smart contracts"
    },
    solana: {
        id: "SOL",
        name: "Solana",
        displayName: "Solana",
        color: "#9945ff",
        website: "https://solana.com",
        twitter: "@solana",
        description: "High-performance blockchain for crypto apps"
    },
    base: {
        id: "BASE",
        name: "Base",
        displayName: "Base",
        color: "#0052ff",
        website: "https://base.org",
        twitter: "@base",
        description: "Coinbase's Layer 2 solution"
    },
    polygon: {
        id: "MATIC",
        name: "Polygon",
        displayName: "Polygon",
        color: "#8247e5",
        website: "https://polygon.technology",
        twitter: "@0xPolygon",
        description: "Ethereum scaling and infrastructure"
    },
    arbitrum: {
        id: "ARB",
        name: "Arbitrum",
        displayName: "Arbitrum",
        color: "#28a0f0",
        website: "https://arbitrum.io",
        twitter: "@arbitrum",
        description: "Optimistic rollup for Ethereum"
    },
    optimism: {
        id: "OP",
        name: "Optimism",
        displayName: "Optimism",
        color: "#ff0420",
        website: "https://optimism.io",
        twitter: "@optimismFND",
        description: "Optimistic Ethereum scaling solution"
    },
    cardano: {
        id: "ADA",
        name: "Cardano",
        displayName: "Cardano",
        color: "#0033ad",
        website: "https://cardano.org",
        twitter: "@cardano",
        description: "Sustainable blockchain platform"
    },
    chainlink: {
        id: "LINK",
        name: "Chainlink",
        displayName: "Chainlink",
        color: "#375bd2",
        website: "https://chain.link",
        twitter: "@chainlink",
        description: "Decentralized oracle network"
    },
    avalanche: {
        id: "AVAX",
        name: "Avalanche",
        displayName: "Avalanche",
        color: "#e84142",
        website: "https://avax.network",
        twitter: "@avalancheavax",
        description: "Platform for decentralized applications"
    },
    polkadot: {
        id: "DOT",
        name: "Polkadot",
        displayName: "Polkadot",
        color: "#e6007a",
        website: "https://polkadot.network",
        twitter: "@polkadot",
        description: "Multi-chain blockchain platform"
    },
    cosmos: {
        id: "ATOM",
        name: "Cosmos",
        displayName: "Cosmos",
        color: "#2e3148",
        website: "https://cosmos.network",
        twitter: "@cosmos",
        description: "Internet of blockchains"
    },
    near: {
        id: "NEAR",
        name: "NEAR",
        displayName: "NEAR Protocol",
        color: "#00c08b",
        website: "https://near.org",
        twitter: "@nearprotocol",
        description: "User-friendly blockchain platform"
    },
    algorand: {
        id: "ALGO",
        name: "Algorand",
        displayName: "Algorand",
        color: "#000000",
        website: "https://algorand.com",
        twitter: "@algorand",
        description: "Pure proof-of-stake blockchain"
    }
};

// Rate limiting configuration
export const RATE_LIMIT = {
    requests: 100,
    window: 60000, // 1 minute
    storage: 'localStorage'
};

// Error messages
export const ERROR_MESSAGES = {
    USERNAME_NOT_FOUND: "Username not found. Please check and try again.",
    LEADERBOARD_ERROR: "Failed to fetch leaderboard data. Please try again later.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    RATE_LIMIT_ERROR: "Too many requests. Please wait a moment and try again.",
    CARD_GENERATION_ERROR: "Failed to generate card. Please try again."
};

// Analytics configuration (placeholder for future analytics integration)
export const ANALYTICS_CONFIG = {
    enabled: false,
    trackingId: null,
    events: {
        SEARCH: 'search',
        SHARE: 'share',
        GENERATE_CARD: 'generate_card',
        PROJECT_CHANGE: 'project_change'
    }
};

// Feature flags
export const FEATURES = {
    MULTIPLE_PROJECTS: true,
    VISITOR_COUNTER: true,
    SHARE_FUNCTIONALITY: true,
    CARD_GENERATION: true,
    DEBOUNCED_SEARCH: true,
    THEME_SWITCHING: true,
    ANALYTICS: false
};
