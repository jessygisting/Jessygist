console.log("JessyGist script.js is running!");
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

    document.querySelectorAll(".news-card").forEach(function (card) {
        const cardText = card.innerText.toLowerCase();

        card.style.display = cardText.includes(searchText)
            ? ""
            : "none";
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

        storyDetails.replaceChildren();

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = story.category || "News";
        storyDetails.appendChild(category);

        const title = document.createElement("h2");
        title.textContent = story.title || "Untitled story";
        storyDetails.appendChild(title);

        if (story.image) {
            const image = document.createElement("img");
            image.src = story.image;
            image.alt = story.title || "News";
            storyDetails.appendChild(image);
        }

        (story.paragraphs || []).forEach(function (paragraphText) {
            const paragraph = document.createElement("p");
            paragraph.textContent = paragraphText;
            storyDetails.appendChild(paragraph);
        });

        if (newsSection) newsSection.hidden = true;
        if (searchSection) searchSection.hidden = true;
        if (welcomeSection) welcomeSection.hidden = true;
        if (submitSection) submitSection.hidden = true;
        if (storyPage) storyPage.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});


// RETURN TO THE MAIN APP
if (backButton) {
    backButton.addEventListener("click", function () {
        if (storyPage) storyPage.hidden = true;
        if (newsSection) newsSection.hidden = false;
        if (searchSection) searchSection.hidden = false;
        if (welcomeSection) welcomeSection.hidden = false;
        if (submitSection) submitSection.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


// SHOW THE CURRENT YEAR
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// LOAD ARTICLES FROM FIREBASE
(async function loadFirebaseArticles() {
    try {
        const {
            initializeApp,
            getApps,
            getApp
        } = await import(
            "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js"
        );

        const {
            getFirestore,
            collection,
            getDocs
        } = await import(
            "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
        );

        const firebaseConfig = {
            apiKey: "AIzaSyA-AFHmu2oQVPW2fegLtMo8MCIQvSAD_Ow",
            authDomain: "jessygist-web.firebaseapp.com",
            projectId: "jessygist-web",
            storageBucket: "jessygist-web.firebasestorage.app",
            messagingSenderId: "525204408186",
            appId: "1:525204408186:web:1258ae725d2987346878c3",
            measurementId: "G-5MKSXMHBYL"
        };

        const app = getApps().length
            ? getApp()
            : initializeApp(firebaseConfig);

        const db = getFirestore(app);

        const snapshot = await getDocs(
            collection(db, "articles")
        );

        console.log(
            "JessyGist Firebase articles found:",
            snapshot.size
        );

        const newsGrid =
            document.querySelector(".news-grid") ||
            document.getElementById("newsGrid");

        if (!newsGrid) {
            throw new Error(
                "The news container was not found in index.html."
            );
        }

        snapshot.forEach(function (documentSnapshot) {
            const article = documentSnapshot.data();

            // Create the article card.
            const card = document.createElement("article");
            card.className = "news-card";

            if (article.imageUrl) {
                const image = document.createElement("img");
                image.src = article.imageUrl;
                image.alt = article.title || "News";
                image.loading = "lazy";
                card.appendChild(image);
            }

            const content = document.createElement("div");
            content.className = "news-content";

            const category = document.createElement("span");
            category.className = "category";
            category.textContent = article.category || "News";

            const title = document.createElement("h3");
            title.textContent = article.title || "Untitled story";

            const summary = document.createElement("p");
            summary.textContent = article.summary || "";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "read-more";
            button.textContent = "Read More";

            // Open a Firebase article.
            button.addEventListener("click", function () {
                if (!storyPage || !storyDetails) {
                    alert("The story reader could not be found.");
                    return;
                }

                storyDetails.replaceChildren();

                const storyCategory = document.createElement("span");
                storyCategory.className = "category";
                storyCategory.textContent = article.category || "News";
                storyDetails.appendChild(storyCategory);

                const storyTitle = document.createElement("h2");
                storyTitle.textContent = article.title || "Untitled story";
                storyDetails.appendChild(storyTitle);

                if (article.imageUrl) {
                    const storyImage = document.createElement("img");
                    storyImage.src = article.imageUrl;
                    storyImage.alt = article.title || "News";
                    storyDetails.appendChild(storyImage);
                }

                const paragraph = document.createElement("p");
                paragraph.textContent =
                    article.content || article.summary || "";
                storyDetails.appendChild(paragraph);

                if (newsSection) newsSection.hidden = true;
                if (searchSection) searchSection.hidden = true;
                if (welcomeSection) welcomeSection.hidden = true;
                if (submitSection) submitSection.hidden = true;

                storyPage.hidden = false;

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });

            content.appendChild(category);
            content.appendChild(title);
            content.appendChild(summary);
            content.appendChild(button);

            card.appendChild(content);
            newsGrid.appendChild(card);
        });

        console.log(
            "JessyGist loaded " + snapshot.size + " Firebase article(s)."
        );

    } catch (error) {
        console.error(
            "JessyGist Firebase article loading error:",
            error
        );

        alert(
            "JessyGist could not load articles.\n\n" +
            "Error: " + error.message
        );
    }
})();

});
