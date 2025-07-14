// Configuration and constants
const CONFIG = {
    PROXY_URL: "https://corsproxy.io/?",
    BACKEND_URL: "https://novas-backend.onrender.com",
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    ERROR_TIMEOUT: 5000,
    CANVAS_GENERATION_DELAY: 300
};

// Project configurations with their respective topic IDs
const PROJECTS = {
    novas: { id: "NYT", name: "Novastro", color: "#8f4fff" },
    bitcoin: { id: "BTC", name: "Bitcoin", color: "#f7931a" },
    ethereum: { id: "ETH", name: "Ethereum", color: "#627eea" },
    solana: { id: "SOL", name: "Solana", color: "#9945ff" },
    base: { id: "BASE", name: "Base", color: "#0052ff" },
    polygon: { id: "MATIC", name: "Polygon", color: "#8247e5" },
    arbitrum: { id: "ARB", name: "Arbitrum", color: "#28a0f0" },
    optimism: { id: "OP", name: "Optimism", color: "#ff0420" },
    cardano: { id: "ADA", name: "Cardano", color: "#0033ad" },
    chainlink: { id: "LINK", name: "Chainlink", color: "#375bd2" }
};

// DOM elements cache
const DOM = {
    searchBtn: null,
    usernameInput: null,
    projectSelect: null,
    resultCard: null,
    generatedCard: null,
    loader: null,
    errorMessage: null,
    errorText: null,
    errorCloseBtn: null,
    visitorCount: null,
    elements: {} // Cache for dynamically accessed elements
};

// State management
const STATE = {
    currentProject: 'novas',
    currentUsername: '',
    userData: null,
    leaderboardData: null,
    isLoading: false
};


// Utility functions
class Utils {
    static async fetchWithRetry(url, options = {}, retries = CONFIG.RETRY_ATTEMPTS, delay = CONFIG.RETRY_DELAY) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                if (i === retries - 1) throw error;
                console.warn(`Retry ${i + 1}/${retries} for ${url}:`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
            }
        }
    }

    static async preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    static formatNumber(num) {
        if (num === null || num === undefined || num === '-') return '-';
        if (typeof num === 'number') {
            return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
        return num.toString();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static sanitizeUsername(username) {
        return username.trim().replace(/^@/, '').toLowerCase();
    }

    static getElement(id) {
        if (!DOM.elements[id]) {
            DOM.elements[id] = document.getElementById(id);
        }
        return DOM.elements[id];
    }
}

// API service
class APIService {
    static async fetchUserYaps(username) {
        const url = `${CONFIG.PROXY_URL}https://api.kaito.ai/api/v1/yaps?username=${username}`;
        
        try {
            const response = await Utils.fetchWithRetry(url);
            
            if (response.status === 204) {
                console.warn("User has no Yaps data (204 No Content)");
                return null;
            }
            
            const data = await response.json();
            return data && Object.keys(data).length > 0 ? data : null;
        } catch (error) {
            if (error.message.includes('404')) {
                throw new Error('Username not found');
            }
            throw new Error(`Failed to fetch user data: ${error.message}`);
        }
    }

    static async fetchLeaderboardData(project, durations = ['7d', '30d', '3m']) {
        const topicId = PROJECTS[project]?.id || PROJECTS.novas.id;
        const baseUrl = "https://hub.kaito.ai/api/v1/gateway/ai/kol/mindshare/top-leaderboard";
        
        const urls = durations.map(duration => 
            `${baseUrl}?duration=${duration}&topic_id=${topicId}&top_n=100&customized_community=customized&community_yaps=false`
        );

        try {
            const responses = await Promise.all(
                urls.map(url => Utils.fetchWithRetry(CONFIG.PROXY_URL + url))
            );
            
            const data = await Promise.all(responses.map(res => res.json()));
            
            return durations.reduce((acc, duration, index) => {
                acc[duration] = data[index];
                return acc;
            }, {});
        } catch (error) {
            throw new Error(`Failed to fetch leaderboard data: ${error.message}`);
        }
    }
    static async updateVisitorCount() {
        try {
            // Increment counter
            await Utils.fetchWithRetry(`${CONFIG.BACKEND_URL}/counter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incrementBy: 1 })
            });

            // Fetch current count
            const response = await Utils.fetchWithRetry(`${CONFIG.BACKEND_URL}/counter`);
            const data = await response.json();
            
            return data.value || 0;
        } catch (error) {
            console.error("Visitor counter error:", error);
            return 0;
        }
    }

    static async getUserAvatar(username) {
        const avatarUrl = `${CONFIG.PROXY_URL}https://unavatar.io/twitter/${username}`;
        
        try {
            await Utils.preloadImage(avatarUrl);
            return avatarUrl;
        } catch (error) {
            console.warn("Avatar loading failed, using fallback:", error.message);
            return "https://via.placeholder.com/80x80/8f4fff/ffffff?text=" + username.charAt(0).toUpperCase();
        }
    }
}

// UI Controller
class UIController {
    static showError(message) {
        DOM.errorText.textContent = message;
        DOM.errorMessage.classList.remove('hidden');
        DOM.errorMessage.classList.add('animate-fade-in');
        
        setTimeout(() => {
            DOM.errorMessage.classList.add('hidden');
            DOM.errorMessage.classList.remove('animate-fade-in');
        }, CONFIG.ERROR_TIMEOUT);
    }

    static hideError() {
        DOM.errorMessage.classList.add('hidden');
        DOM.errorMessage.classList.remove('animate-fade-in');
    }

    static showLoader() {
        DOM.loader.classList.remove('hidden');
        DOM.loader.classList.add('flex');
        STATE.isLoading = true;
    }

    static hideLoader() {
        DOM.loader.classList.add('hidden');
        DOM.loader.classList.remove('flex');
        STATE.isLoading = false;
    }

    static updateUserInfo(username, avatarUrl) {
        const displayName = username.charAt(0).toUpperCase() + username.slice(1);
        const handle = `@${username}`;
        
        // Update main result card
        Utils.getElement('displayName').textContent = displayName;
        Utils.getElement('handle').textContent = handle;
        Utils.getElement('userAvatar').src = avatarUrl;
        
        // Update generated card
        Utils.getElement('generatedDisplayName').textContent = displayName;
        Utils.getElement('generatedHandle').textContent = handle;
        Utils.getElement('generatedAvatar').src = avatarUrl;
    }

    static updateYapsData(yapsData) {
        const elements = ['totalYaps', 'last24h', 'last7d', 'last30d'];
        const generatedElements = ['generatedTotalYaps', 'generatedLast24h', 'generatedLast7d', 'generatedLast30d'];
        
        elements.forEach((elementId, index) => {
            const value = yapsData ? Utils.formatNumber(yapsData[`yaps_${elementId.replace('totalYaps', 'all').replace(/last(\d+)([hd])/, 'l$1$2')}`]) : '-';
            Utils.getElement(elementId).textContent = value;
            Utils.getElement(generatedElements[index]).textContent = value;
        });
    }

    static updateLeaderboardData(leaderboardData, username) {
        const findUserRank = (data) => {
            if (!data || !Array.isArray(data)) return '-';
            const userIndex = data.findIndex(item => 
                item.username.toLowerCase() === username.toLowerCase()
            );
            return userIndex !== -1 ? userIndex + 1 : '-';
        };

        const ranks = {
            '7d': findUserRank(leaderboardData['7d']),
            '30d': findUserRank(leaderboardData['30d']),
            '3m': findUserRank(leaderboardData['3m'])
        };

        // Update main result card
        Utils.getElement('rank7d').textContent = ranks['7d'];
        Utils.getElement('rank30d').textContent = ranks['30d'];
        Utils.getElement('rank3m').textContent = ranks['3m'];
        
        // Update generated card
        Utils.getElement('generatedRank7d').textContent = ranks['7d'];
        Utils.getElement('generatedRank30d').textContent = ranks['30d'];
        Utils.getElement('generatedRank3m').textContent = ranks['3m'];
    }

    static showResultCard() {
        DOM.resultCard.classList.remove('hidden');
        DOM.resultCard.classList.add('animate-fade-in');
        DOM.resultCard.scrollIntoView({ behavior: 'smooth' });
    }

    static updateVisitorCount(count) {
        DOM.visitorCount.textContent = count.toLocaleString();
    }

    static updateProjectTheme(project) {
        const projectConfig = PROJECTS[project];
        if (!projectConfig) return;

        // Update CSS custom properties for theme
        document.documentElement.style.setProperty('--primary', projectConfig.color);
        
        // Update title to reflect current project
        document.title = `${projectConfig.name} Yaps`;
        document.querySelector('h1').textContent = `${projectConfig.name} Yaps`;
    }
}

// Share functionality
class ShareController {
    static generateShareText(userData) {
        const { username, yapsData, leaderboardData } = userData;
        const projectName = PROJECTS[STATE.currentProject].name;
        
        const totalYaps = yapsData ? Utils.formatNumber(yapsData.yaps_all) : '-';
        const rank7d = Utils.getElement('rank7d').textContent;
        const rank30d = Utils.getElement('rank30d').textContent;
        const rank3m = Utils.getElement('rank3m').textContent;

        return `I just checked my Yaps and position on @${projectName.toLowerCase()}_xyz with this website by @xtopher0x and I have ${totalYaps} total Yaps.

Here are my ranks:

#${rank7d} in the last 7 days
#${rank30d} in the last 30 days
#${rank3m} in the last 3 months

Try it at https://novastroyaps.vercel.app`;
    }

    static shareToTwitter(text) {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(tweetUrl, '_blank');
    }
}

// Card generation
class CardGenerator {
    static async generateCard() {
        const card = DOM.generatedCard;
        const avatar = Utils.getElement('generatedAvatar');
        
        try {
            UIController.showLoader();
            
            // Preload avatar image
            await Utils.preloadImage(avatar.src).catch(() => {
                console.warn("Avatar preload failed, using fallback");
                avatar.src = "https://via.placeholder.com/80x80/8f4fff/ffffff?text=?";
            });

            // Prepare card for screenshot
            card.style.visibility = 'visible';
            card.style.position = 'absolute';
            card.style.left = '-9999px';
            
            // Force reflow
            card.offsetHeight;
            
            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, CONFIG.CANVAS_GENERATION_DELAY));

            // Generate canvas
            const canvas = await html2canvas(card, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#0f0f13",
                logging: false,
                allowTaint: true
            });

            // Download image
            const link = document.createElement('a');
            link.download = `${STATE.currentProject}-yaps-card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error("Card generation error:", error);
            UIController.showError("Failed to generate card. Please try again.");
        } finally {
            UIController.hideLoader();
            card.style.visibility = 'hidden';
        }
    }
}

// Main application controller
class AppController {
    static async init() {
        // Cache DOM elements
        DOM.searchBtn = document.getElementById('searchBtn');
        DOM.usernameInput = document.getElementById('usernameInput');
        DOM.projectSelect = document.getElementById('projectSelect');
        DOM.resultCard = document.getElementById('resultCard');
        DOM.generatedCard = document.getElementById('generatedCard');
        DOM.loader = document.getElementById('loader');
        DOM.errorMessage = document.getElementById('errorMessage');
        DOM.errorText = document.getElementById('errorText');
        DOM.errorCloseBtn = document.getElementById('errorCloseBtn');
        DOM.visitorCount = document.getElementById('visitorCount');

        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize visitor counter
        this.initVisitorCounter();
        
        // Set initial project theme
        UIController.updateProjectTheme(STATE.currentProject);
    }

    static setupEventListeners() {
        // Search functionality
        DOM.searchBtn.addEventListener('click', () => this.handleSearch());
        DOM.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Project selection
        DOM.projectSelect.addEventListener('change', (e) => {
            STATE.currentProject = e.target.value;
            UIController.updateProjectTheme(STATE.currentProject);
        });

        // Error handling
        DOM.errorCloseBtn.addEventListener('click', UIController.hideError);

        // Share functionality
        document.getElementById('shareBtn').addEventListener('click', () => {
            const shareText = ShareController.generateShareText({
                username: STATE.currentUsername,
                yapsData: STATE.userData,
                leaderboardData: STATE.leaderboardData
            });
            ShareController.shareToTwitter(shareText);
        });

        // Card generation
        document.getElementById('generateBtn').addEventListener('click', () => {
            CardGenerator.generateCard();
        });

        // Debounced search on input
        DOM.usernameInput.addEventListener('input', 
            Utils.debounce(() => {
                if (DOM.usernameInput.value.trim().length > 2) {
                    this.handleSearch();
                }
            }, 1000)
        );
    }

    static async initVisitorCounter() {
        try {
            UIController.updateVisitorCount(0);
            const count = await APIService.updateVisitorCount();
            UIController.updateVisitorCount(count);
        } catch (error) {
            console.error("Failed to initialize visitor counter:", error);
        }
    }

    static async handleSearch() {
        const username = Utils.sanitizeUsername(DOM.usernameInput.value);
        
        if (!username) {
            UIController.showError("Please enter a username");
            return;
        }

        if (STATE.isLoading) return;

        try {
            UIController.showLoader();
            UIController.hideError();
            
            STATE.currentUsername = username;

            // Fetch user data and leaderboard data in parallel
            const [yapsData, leaderboardData, avatarUrl] = await Promise.all([
                APIService.fetchUserYaps(username),
                APIService.fetchLeaderboardData(STATE.currentProject),
                APIService.getUserAvatar(username)
            ]);

            // Store data in state
            STATE.userData = yapsData;
            STATE.leaderboardData = leaderboardData;

            // Update UI
            UIController.updateUserInfo(username, avatarUrl);
            UIController.updateYapsData(yapsData);
            UIController.updateLeaderboardData(leaderboardData, username);
            UIController.showResultCard();

        } catch (error) {
            console.error("Search error:", error);
            
            if (error.message.includes('Username not found')) {
                UIController.showError("Username not found. Please check and try again.");
            } else if (error.message.includes('leaderboard')) {
                UIController.showError("Failed to fetch leaderboard data. Please try again later.");
            } else {
                UIController.showError("Network error. Please check your connection and try again.");
            }
        } finally {
            UIController.hideLoader();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});

// Add CSS animations via JavaScript (since we removed the CSS file)
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);