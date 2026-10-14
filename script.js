document.addEventListener("DOMContentLoaded", function () {
const searchInput = document.getElementById("searchInput");
const newsCards = document.querySelectorAll(".news-card");
const storyPage = document.getElementById("storyPage");
const storyDetails = document.getElementById("storyDetails");
const backButton = document.getElementById("backButton");
const newsSection = document.getElementById("news");
const searchSection = document.querySelector(".search-section");
const welcomeSection = document.querySelector(".welcome");
const submitSection = document.getElementById("submit");

const stories = {
    entertainment: {
        category: "Entertainment",
        title: "Entertainment News and Celebrity Gist",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
        paragraphs: [
            "Welcome to the JessyGist entertainment section, your destination for celebrity gist, movies, music, and popular culture.",
            "Entertainment brings people together through film, television, music, and the achievements of creative talents. JessyGist aims to share interesting updates and stories that readers can enjoy.",
            "Check back for new entertainment reports, interviews, and trending stories. News will be updated as verified information becomes available."
        ]
    },

    sports: {
        category: "Sports",
        title: "Sports Updates and Trending Stories",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
        paragraphs: [
            "Welcome to the JessyGist sports section, where sports fans can follow exciting competitions, teams, and sporting personalities.",
            "Sports bring people together through teamwork, determination, and competition. Fans enjoy following match results, player performances, and important developments across different sports.",
            "Visit JessyGist for sports reports, interviews, and updates. Match results and other time-sensitive details should be checked against reliable sources before publication."
        ]
    },

    trending: {
        category: "Trending News",
        title: "Trending Stories Making Headlines",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
        paragraphs: [
            "Welcome to JessyGist, where readers can explore news topics and stories attracting public attention.",
            "Trending topics may include current affairs, technology, lifestyle, entertainment, and community developments. Understanding the facts behind a headline helps readers make informed decisions.",
            "Our goal is to present useful, clear, and responsible information. Specific news reports should be checked against credible sources and updated as new facts emerge."
        ]
    }
};

// SEARCH STORIES
if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();

        newsCards.forEach(function (card) {
            const cardText = card.innerText.toLowerCase();
            card.style.display = cardText.includes(searchText) ? "" : "none";
        });
    });
}

// OPEN A STORY
document.querySelectorAll(".read-more").forEach(function (button) {
    button.addEventListener("click", function () {
        const storyKey = button.dataset.story;
        const story = stories[storyKey];

        if (!story) {
            alert("Sorry, this story is not available yet.");
            return;
        }

        storyDetails.innerHTML = `
            <span class="category">${story.category}</span>
            <h2>${story.title}</h2>
            <img src="${story.image}" alt="${story.category}">
            ${story.paragraphs.map(function (paragraph) {
                return `<p>${paragraph}</p>`;
            }).join("")}
        `;

        newsSection.hidden = true;
        searchSection.hidden = true;
        welcomeSection.hidden = true;
        submitSection.hidden = true;
        storyPage.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

// RETURN TO THE MAIN APP
if (backButton) {
    backButton.addEventListener("click", function () {
        storyPage.hidden = true;
        newsSection.hidden = false;
        searchSection.hidden = false;
        welcomeSection.hidden = false;
        submitSection.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// SHOW THE CURRENT YEAR
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

});
// LOAD ARTICLES FROM articles.json
fetch("articles.json")
.then(function (response) {
if (!response.ok) {
throw new Error("Could not load articles.");
}
return response.json();
})
.then(function (articles) {
console.log("JessyGist articles loaded:", articles);
})
.catch(function (error) {
console.error("Article loading error:", error);
});
