console.log("JessyGist upgraded script.js is running!");

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");
    const storyPage = document.getElementById("storyPage");
    const storyDetails = document.getElementById("storyDetails");
    const backButton = document.getElementById("backButton");

    const newsSection = document.getElementById("news");
    const searchSection = document.querySelector(".search-section");
    const welcomeSection = document.querySelector(".welcome");
    const submitSection = document.getElementById("submit");

let currentArticle = null;
let currentArticleId = null;
let currentShareUrl = window.location.href;
let firestoreDb = null;
let replyingTo = null;

const firebaseArticles = new Map();

    // SHOW MAIN PAGE
    function showMainPage() {
        if (storyPage) storyPage.hidden = true;
        if (newsSection) newsSection.hidden = false;
        if (searchSection) searchSection.hidden = false;
        if (welcomeSection) welcomeSection.hidden = false;
        if (submitSection) submitSection.hidden = false;
    }

    // SHOW STORY PAGE
    function showStoryPage() {
        if (newsSection) newsSection.hidden = true;
        if (searchSection) searchSection.hidden = true;
        if (welcomeSection) welcomeSection.hidden = true;
        if (submitSection) submitSection.hidden = true;
        if (storyPage) storyPage.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // CREATE SOCIAL MEDIA SHARING BUTTONS
    function createShareButtons(title, summary, shareUrl) {

        const shareSection = document.createElement("div");
        shareSection.className = "social-share";

        const heading = document.createElement("h3");
        heading.textContent = "Share This Article";
        shareSection.appendChild(heading);

        const buttons = [
            {
                name: "WhatsApp",
                url: "https://wa.me/?text=" +
                    encodeURIComponent(title + "\n\n" + shareUrl)
            },
            {
                name: "Facebook",
                url: "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(shareUrl)
            },
            {
                name: "X",
                url: "https://twitter.com/intent/tweet?text=" +
                    encodeURIComponent(title) +
                    "&url=" + encodeURIComponent(shareUrl)
            },
            {
                name: "Telegram",
                url: "https://t.me/share/url?url=" +
                    encodeURIComponent(shareUrl) +
                    "&text=" + encodeURIComponent(title)
            }
        ];

        buttons.forEach(function (item) {

            const link = document.createElement("a");

            link.textContent = item.name;
            link.href = item.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "share-button";

            shareSection.appendChild(link);

        });

        // NATIVE PHONE SHARING
        const nativeButton = document.createElement("button");

        nativeButton.type = "button";
        nativeButton.textContent = "Share";
        nativeButton.className = "share-button";

        nativeButton.addEventListener("click", async function () {

            if (navigator.share) {

                try {
                    await navigator.share({
                        title: title,
                        text: summary,
                        url: shareUrl
                    });

                } catch (error) {
                    if (error.name !== "AbortError") {
                        console.error("Sharing error:", error);
                    }
                }

            } else {

                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert("Article link copied. You can now share it.");

                } catch (error) {
                    alert("Please copy this article link from your browser.");
                }

            }

        });

        shareSection.appendChild(nativeButton);

        // COPY ARTICLE LINK
        const copyButton = document.createElement("button");

        copyButton.type = "button";
        copyButton.textContent = "Copy Article Link";
        copyButton.className = "share-button";

        copyButton.addEventListener("click", async function () {

            try {

                await navigator.clipboard.writeText(shareUrl);

                copyButton.textContent = "Copied!";

                setTimeout(function () {
                    copyButton.textContent = "Copy Article Link";
                }, 2000);

            } catch (error) {

                alert("Unable to copy automatically. Please copy the link from your browser.");

            }

        });

        shareSection.appendChild(copyButton);

        return shareSection;
    }

    // OPEN AND DISPLAY AN ARTICLE
    function openArticle(article, articleId, storyKey) {

        if (!storyDetails || !storyPage) {
            alert("Story reader could not be found.");
            return;
        }

        currentArticle = article;

        const titleText = article.title || "Untitled story";

        let shareUrl = new URL(window.location.href);

        if (articleId) {
            shareUrl.searchParams.set("article", articleId);
            shareUrl.searchParams.delete("story");
        } else if (storyKey) {
            shareUrl.searchParams.set("story", storyKey);
            shareUrl.searchParams.delete("article");
        }

        currentShareUrl = shareUrl.href;

        storyDetails.replaceChildren();

        // CATEGORY
        const category = document.createElement("span");
        category.className = "category";
        category.textContent = article.category || "News";

        storyDetails.appendChild(category);

        // TITLE
        const title = document.createElement("h2");
        title.textContent = titleText;

        storyDetails.appendChild(title);

        // IMAGE
        if (article.imageUrl || article.image) {

            const image = document.createElement("img");

            image.src = article.imageUrl || article.image;
            image.alt = titleText;
            image.loading = "lazy";

            storyDetails.appendChild(image);
        }

        // ARTICLE CONTENT
        if (article.paragraphs) {

            article.paragraphs.forEach(function (text) {

                const paragraph = document.createElement("p");
                paragraph.textContent = text;

                storyDetails.appendChild(paragraph);

            });

        } else {

            const content = document.createElement("div");
            content.className = "article-content";

            content.style.whiteSpace = "pre-wrap";

            content.textContent =
                article.content || article.summary || "";

            storyDetails.appendChild(content);
        }

        // SOCIAL SHARING
        const sharing = createShareButtons(
            titleText,
            article.summary || "",
            currentShareUrl
        );

        storyDetails.appendChild(sharing);

        showStoryPage();
    }

    // SAMPLE STORIES
    const stories = {

        entertainment: {
            category: "Entertainment",
            title: "Entertainment News and Celebrity Gist",
            image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",

            paragraphs: [
                "Welcome to the JessyGist entertainment section, your destination for celebrity gist, movies, music, and popular culture.",

                "Entertainment brings people together through film, television, music, and the achievements of creative talents. JessyGist aims to share interesting updates and stories that readers can enjoy.",

                "Check back for new entertainment reports, interviews, and trending stories."
            ]
        },

        sports: {
            category: "Sports",
            title: "Sports Updates and Trending Stories",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",

            paragraphs: [
                "Welcome to the JessyGist sports section, where sports fans can follow exciting competitions, teams, and sporting personalities.",

                "Sports bring people together through teamwork, determination, and competition.",

                "Visit JessyGist for sports reports, interviews, and updates."
            ]
        },

        trending: {
            category: "Trending News",
            title: "Trending Stories Making Headlines",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",

            paragraphs: [
                "Welcome to JessyGist, where readers can explore news topics and stories attracting public attention.",

                "Trending topics may include current affairs, technology, lifestyle, entertainment, and community developments.",

                "Our goal is to present useful, clear, and responsible information."
            ]
        }

    };

    // OPEN STATIC STORIES
    document.querySelectorAll(".read-more").forEach(function (button) {

        button.addEventListener("click", function () {

            const storyKey = button.dataset.story;
            const story = stories[storyKey];

            if (!story) return;

            openArticle(story, null, storyKey);

            const url = new URL(window.location.href);
            url.searchParams.set("story", storyKey);

            history.pushState({}, "", url);

        });

    });

    // BACK BUTTON
    if (backButton) {

        backButton.addEventListener("click", function () {

            history.pushState({}, "", window.location.pathname);

            currentArticle = null;

            showMainPage();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    // HANDLE BROWSER BACK AND FORWARD
    window.addEventListener("popstate", function () {

        const params = new URLSearchParams(window.location.search);

        const articleId = params.get("article");
        const storyKey = params.get("story");

        if (articleId && firebaseArticles.has(articleId)) {

            openArticle(
                firebaseArticles.get(articleId),
                articleId
            );

        } else if (storyKey && stories[storyKey]) {

            openArticle(stories[storyKey], null, storyKey);

        } else {

            showMainPage();

        }

    });

    // SEARCH
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

    // CURRENT YEAR
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // LOAD FIREBASE ARTICLES
    async function loadFirebaseArticles() {

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
    getDocs,
    query,
    where,
    addDoc,
    serverTimestamp
} = await import(
    "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
);

            const firebaseConfig = {
                apiKey: "AIzaSyA-AFHmu2oQVP2WfegLtMo8MCIQvSAD_Ow",
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

            firestoreDb = getFirestore(app);
const db = firestoreDb;

            const articlesQuery = query(
                collection(db, "articles"),
                where("status", "==", "published")
            );

            const snapshot = await getDocs(articlesQuery);

            console.log(
                "JessyGist Firebase articles found:",
                snapshot.size
            );

            const newsGrid =
                document.querySelector(".news-grid") ||
                document.getElementById("newsGrid");

            if (!newsGrid) {
                throw new Error("News container not found.");
            }

            snapshot.forEach(function (documentSnapshot) {

                const articleId = documentSnapshot.id;
                const article = documentSnapshot.data();

                firebaseArticles.set(articleId, article);

                const card = document.createElement("article");
                card.className = "news-card";

                // ARTICLE IMAGE
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

                button.addEventListener("click", function () {

                    openArticle(article, articleId);

                    const url = new URL(window.location.href);

                    url.searchParams.set("article", articleId);

                    history.pushState({}, "", url);

                });

                content.appendChild(category);
                content.appendChild(title);
                content.appendChild(summary);
                content.appendChild(button);

                card.appendChild(content);

                newsGrid.appendChild(card);

            });

            console.log(
                "JessyGist successfully loaded " +
                snapshot.size +
                " published article(s)."
            );

            // OPEN SHARED ARTICLE WHEN VISITOR ARRIVES
            const params = new URLSearchParams(window.location.search);

            const sharedArticleId = params.get("article");

            if (sharedArticleId) {

                const sharedArticle = firebaseArticles.get(sharedArticleId);

                if (sharedArticle) {

                    openArticle(sharedArticle, sharedArticleId);

                } else {

                    console.warn("Shared article was not found.");

                }

            } else {

                const sharedStory = params.get("story");

                if (sharedStory && stories[sharedStory]) {

                    openArticle(stories[sharedStory], null, sharedStory);

                }

            }

        } catch (error) {

            console.error(
                "JessyGist Firebase loading error:",
                error
            );

        }

    }

    loadFirebaseArticles();

});
