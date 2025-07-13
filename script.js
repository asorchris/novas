const searchBtn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("usernameInput");
const resultCard = document.getElementById("resultCard");
const generatedCard = document.getElementById("generatedCard");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const errorCloseBtn = document.getElementById("errorCloseBtn");
const visitorCount = document.getElementById("visitorCount");

const proxy = "https://corsproxy.io/?"; // CORS bypass

// Visitor counter
function updateVisitorCount() {
    let count = parseInt(localStorage.getItem("visitorCount") || "0");
    count++;
    localStorage.setItem("visitorCount", count);
    visitorCount.textContent = count;
}

updateVisitorCount();

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = "flex";
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

// Hide error message
errorCloseBtn.addEventListener("click", () => {
    errorMessage.style.display = "none";
});

// Preload image to handle CORS issues
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
}

searchBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    if (!username) {
        showError("Please enter a username");
        return;
    }

    try {
        loader.style.display = "flex";
        // 1. Fetch Yaps Data
        let yapsData = null;
        const yapsRes = await fetch(
            `${proxy}https://api.kaito.ai/api/v1/yaps?username=${username}`
        );

        if (yapsRes.status === 204) {
            console.warn("User has no Yaps data (204 No Content).");
        } else if (!yapsRes.ok) {
            if (yapsRes.status === 404) {
                throw new Error("Username not found");
            }
            throw new Error(`User yaps fetch failed: ${yapsRes.status}`);
        } else {
            yapsData = await yapsRes.json();
            if (!yapsData || Object.keys(yapsData).length === 0) yapsData = null;
        }

        // 2. Update Display Info
        let avatarUrl = `${proxy}https://unavatar.io/twitter/${username}`;
        await preloadImage(avatarUrl).catch(() => {
            console.warn("Avatar image failed to load, using fallback");
            avatarUrl = "https://via.placeholder.com/80";
        });
        document.getElementById("displayName").textContent = username;
        document.getElementById("handle").textContent = `@${username}`;
        document.getElementById("userAvatar").src = avatarUrl;
        document.getElementById("generatedAvatar").src = avatarUrl;

        if (yapsData) {
            document.getElementById("totalYaps").textContent =
                yapsData.yaps_all.toFixed(2);
            document.getElementById("last24h").textContent =
                yapsData.yaps_l24h.toFixed(2);
            document.getElementById("last7d").textContent =
                yapsData.yaps_l7d.toFixed(2);
            document.getElementById("last30d").textContent =
                yapsData.yaps_l30d.toFixed(2);
        } else {
            document.getElementById("totalYaps").textContent = "-";
            document.getElementById("last24h").textContent = "-";
            document.getElementById("last7d").textContent = "-";
            document.getElementById("last30d").textContent = "-";
        }

        // 3. Leaderboard URLs
        const urls = {
            "7d": "https://hub.kaito.ai/api/v1/gateway/ai/kol/mindshare/top-leaderboard?duration=7d&topic_id=NYT&top_n=100&customized_community=customized&community_yaps=false",
            "30d": "https://hub.kaito.ai/api/v1/gateway/ai/kol/mindshare/top-leaderboard?duration=30d&topic_id=NYT&top_n=100&customized_community=customized&community_yaps=false",
            "3m": "https://hub.kaito.ai/api/v1/gateway/ai/kol/mindshare/top-leaderboard?duration=3m&topic_id=NYT&top_n=100&customized_community=customized&community_yaps=false",
        };

        const [leaderboard7d, leaderboard30d, leaderboard3m] = await Promise.all(
            Object.values(urls).map(async (url, i) => {
                const res = await fetch(proxy + url);
                if (!res.ok) {
                    throw new Error(
                        `Leaderboard fetch failed [${Object.keys(urls)[i]}]: ${res.status}`
                    );
                }
                return await res.json();
            })
        );

        // 4. Find ranks
        function findRank(list) {
            const user = list.find(
                (item) => item.username.toLowerCase() === username.toLowerCase()
            );
            return user ? list.indexOf(user) + 1 : "-";
        }

        const rank7d = findRank(leaderboard7d);
        const rank30d = findRank(leaderboard30d);
        const rank3m = findRank(leaderboard3m);

        document.getElementById("rank7d").textContent = rank7d;
        document.getElementById("rank30d").textContent = rank30d;
        document.getElementById("rank3m").textContent = rank3m;

        // 5. Update Generated Card
        document.getElementById("generatedDisplayName").textContent = username;
        document.getElementById("generatedHandle").textContent = `@${username}`;
        document.getElementById("generatedTotalYaps").textContent = yapsData ? yapsData.yaps_all.toFixed(2) : "-";
        document.getElementById("generatedLast24h").textContent = yapsData ? yapsData.yaps_l24h.toFixed(2) : "-";
        document.getElementById("generatedLast7d").textContent = yapsData ? yapsData.yaps_l7d.toFixed(2) : "-";
        document.getElementById("generatedLast30d").textContent = yapsData ? yapsData.yaps_l30d.toFixed(2) : "-";
        document.getElementById("generatedRank7d").textContent = rank7d;
        document.getElementById("generatedRank30d").textContent = rank30d;
        document.getElementById("generatedRank3m").textContent = rank3m;

        // Log for debugging
        console.log("Leaderboard ranks:", { rank7d, rank30d, rank3m });
        console.log("Generated leaderboard DOM:", document.querySelector("#generatedCard .leaderboard-section").innerHTML);
        console.log("Watermark DOM:", document.querySelector("#generatedCard .watermark").innerHTML);

        // 6. Show Result
        resultCard.style.display = "block";
        resultCard.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        console.error("Error details:", err);
        if (err.message.includes("Username not found")) {
            showError("Username not found. Please check and try again.");
        } else if (err.message.includes("Leaderboard fetch failed")) {
            showError("Failed to fetch leaderboard data. Please try again later.");
        } else {
            showError("Network error. Please check your connection and try again.");
        }
    } finally {
        loader.style.display = "none";
    }
});

// Share button logic
document.getElementById("shareBtn").addEventListener("click", () => {
    const username = document.getElementById("displayName").textContent;
    const totalYaps = document.getElementById("totalYaps").textContent;
    const rank7d = document.getElementById("rank7d").textContent;
    const rank30d = document.getElementById("rank30d").textContent;
    const rank3m = document.getElementById("rank3m").textContent;

    const text = `I Just checked my Yaps and position on @Novastro_xyz with this website by @xtopher0x and I have ${totalYaps} total Yaps. \n\nHere are my ranks: \n\n#${rank7d} in the last 7 days\n#${rank30d} in the last 30 days\n #${rank3m} in the last 3 months\n\nTry it at https://novastroyaps.vercel.app`;

    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
    )}`;
    window.open(tweet, "_blank");
});

// Generate card logic
document.getElementById("generateBtn").addEventListener("click", async () => {
    const card = document.getElementById("generatedCard");
    const avatar = document.getElementById("generatedAvatar");
    const leaderboardSection = document.querySelector("#generatedCard .leaderboard-section");

    try {
        loader.style.display = "flex";
        // Preload avatar image
        await preloadImage(avatar.src).catch(() => {
            console.warn("Avatar image failed to load, using fallback");
            avatar.src = "https://via.placeholder.com/80";
        });

        // Ensure card is renderable
        card.style.visibility = "visible";
        card.style.position = "absolute";
        card.style.left = "-9999px";

        // Force DOM reflow
        card.offsetHeight;
        leaderboardSection.offsetHeight;

        // Wait to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 300));

        await html2canvas(card, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#0f0f13"
        }).then((canvas) => {
            const link = document.createElement("a");
            link.download = "novastro-yaps-card.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    } catch (err) {
        console.error("Error generating card:", err);
        showError("Failed to generate card. Please try again.");
    } finally {
        loader.style.display = "none";
        card.style.visibility = "hidden";
    }
});