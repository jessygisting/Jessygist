console.log("JessyGist upgraded script.js is running!");

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. WEBSITE ELEMENTS
    // =====================================

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

    let firebaseFunctions = null;

    const firebaseArticles = new Map();

    // =====================================
    // 2. SHOW MAIN PAGE
    // =====================================

    function showMainPage() {

        if (storyPage) storyPage.hidden = true;
        if (newsSection) newsSection.hidden = false;
        if (searchSection) searchSection.hidden = false;
        if (welcomeSection) welcomeSection.hidden = false;
        if (submitSection) submitSection.hidden = false;

    }

    // =====================================
    // 3. SHOW STORY PAGE
    // =====================================

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

    // =====================================
    // 4. SOCIAL MEDIA SHARING
    // =====================================

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

                    alert("Article link copied.");

                } catch (error) {

                    alert("Please copy the article link from your browser.");

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

                alert("Unable to copy the link automatically.");

            }

        });

        shareSection.appendChild(copyButton);

        return shareSection;

    }

    // =====================================
    // 5. CREATE COMMENT SECTION
    // =====================================

    function createCommentsSection(articleId) {

        const section = document.createElement("section");

        section.className = "comments-section";

        const heading = document.createElement("h3");

        heading.textContent = "Comments";

        const count = document.createElement("span");

        count.id = "commentCount";
        count.textContent = "0";

        heading.appendChild(document.createTextNode(" ("));
        heading.appendChild(count);
        heading.appendChild(document.createTextNode(")"));

        section.appendChild(heading);

        // COMMENT LIST

        const commentsList = document.createElement("div");

        commentsList.id = "commentsList";
        commentsList.textContent = "Loading comments...";

        section.appendChild(commentsList);

        // REPLY MESSAGE

        const replyMessage = document.createElement("p");

        replyMessage.id = "commentMessage";
        replyMessage.textContent = "";

        section.appendChild(replyMessage);

        // COMMENT FORM

        const form = document.createElement("form");

        form.id = "commentForm";

        // NAME INPUT

        const nameLabel = document.createElement("label");

        nameLabel.textContent = "Your Name";

        const nameInput = document.createElement("input");

        nameInput.type = "text";
        nameInput.id = "commentName";
        nameInput.maxLength = 100;
        nameInput.required = true;
        nameInput.placeholder = "Enter your name";

        nameLabel.appendChild(nameInput);

        form.appendChild(nameLabel);

        // COMMENT TEXTAREA

        const textLabel = document.createElement("label");

        textLabel.textContent = "Your Comment";

        const textInput = document.createElement("textarea");

        textInput.id = "commentText";
        textInput.maxLength = 1000;
        textInput.required = true;
        textInput.placeholder = "Write your comment here...";

        textLabel.appendChild(textInput);

        form.appendChild(textLabel);

        // SUBMIT BUTTON

        const submitButton = document.createElement("button");

        submitButton.type = "submit";
        submitButton.textContent = "Submit Comment";

        form.appendChild(submitButton);

        section.appendChild(form);

        // MODERATION NOTICE

        const notice = document.createElement("p");

        notice.textContent =
            "Comments are reviewed before they appear publicly.";

        section.appendChild(notice);

        // CANCEL REPLY

        const cancelReply = document.createElement("button");

        cancelReply.type = "button";
        cancelReply.textContent = "Cancel Reply";
        cancelReply.hidden = true;

        cancelReply.addEventListener("click", function () {

            replyingTo = null;

            replyMessage.textContent = "";

            cancelReply.hidden = true;

        });

        section.insertBefore(cancelReply, form);

        // SUBMIT COMMENT

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            await submitComment(
                articleId,
                nameInput.value,
                textInput.value,
                submitButton
            );

            if (!replyingTo) {
                textInput.value = "";
            }

        });

        return section;

    }

    // =====================================
    // 6. LOAD FIREBASE COMMENTS
    // =====================================

    async function loadComments(articleId) {

        const commentsList = document.getElementById("commentsList");

        const commentCount = document.getElementById("commentCount");

        if (!commentsList || !commentCount || !articleId) return;

        if (!firestoreDb || !firebaseFunctions) {

            commentsList.textContent = "Comments are temporarily unavailable.";

            return;

        }

        const {
            collection,
            getDocs,
            query,
            where
        } = firebaseFunctions;

        commentsList.replaceChildren();

        commentsList.textContent = "Loading comments...";

        try {

            const commentsRef = collection(
                firestoreDb,
                "articles",
                articleId,
                "comments"
            );

            const commentsQuery = query(
                commentsRef,
                where("status", "==", "approved")
            );

            const snapshot = await getDocs(commentsQuery);

            const comments = snapshot.docs.map(function (doc) {

                return {
                    id: doc.id,
                    ...doc.data()
                };

            });

            comments.sort(function (a, b) {

                return (a.createdAt?.toMillis?.() || 0) -
                    (b.createdAt?.toMillis?.() || 0);

            });

            commentCount.textContent = comments.length;

            commentsList.replaceChildren();

            if (comments.length === 0) {

                commentsList.textContent =
                    "No comments yet. Be the first!";

                return;

            }

            // DISPLAY MAIN COMMENTS

            const roots = comments.filter(function (comment) {

                return !comment.parentId;

            });

            roots.forEach(function (comment) {

                const item = document.createElement("div");

                item.className = "comment-item";

                const name = document.createElement("strong");

                name.textContent = comment.name || "Anonymous";

                const message = document.createElement("p");

                message.textContent = comment.text || "";

                item.append(name, message);

                // REPLY BUTTON

                const replyButton = document.createElement("button");

                replyButton.type = "button";
                replyButton.textContent = "Reply";

                replyButton.addEventListener("click", function () {

                    replyingTo = comment.id;

                    const replyMessage =
                        document.getElementById("commentMessage");

                    const cancelReply =
                        document.querySelector(
                            ".comments-section button[type='button']"
                        );

                    if (replyMessage) {

                        replyMessage.textContent =
                            "Replying to " +
                            (comment.name || "Anonymous");

                    }

                    if (cancelReply) {

                        cancelReply.hidden = false;

                    }

                    document.getElementById("commentText")?.focus();

                });

                item.appendChild(replyButton);

                // DISPLAY REPLIES

                const replies = comments.filter(function (reply) {

                    return reply.parentId === comment.id;

                });

                replies.forEach(function (reply) {

                    const replyItem = document.createElement("div");

                    replyItem.className = "comment-reply";

                    const replyName = document.createElement("strong");

                    replyName.textContent =
                        reply.name || "Anonymous";

                    const replyText = document.createElement("p");

                    replyText.textContent = reply.text || "";

                    replyItem.append(replyName, replyText);

                    item.appendChild(replyItem);

                });

                commentsList.appendChild(item);

            });

        } catch (error) {

            console.error("Comment loading error:", error);

            commentsList.textContent =
                "Unable to load comments. Please try again later.";

        }

    }

    // =====================================
    // 7. SUBMIT FIREBASE COMMENTS
    // =====================================

    async function submitComment(
        articleId,
        name,
        message,
        submitButton
    ) {

        if (!firestoreDb || !firebaseFunctions) {

            alert("Firebase is not ready. Please try again.");

            return;

        }

        name = name.trim();
        message = message.trim();

        if (!name || !message) {

            alert("Please enter your name and comment.");

            return;

        }

        if (name.length > 100 || message.length > 1000) {

            alert("Your comment is too long.");

            return;

        }

        const {
            collection,
            addDoc,
            serverTimestamp
        } = firebaseFunctions;

        submitButton.disabled = true;

        submitButton.textContent = "Submitting...";

        try {

            await addDoc(

                collection(
                    firestoreDb,
                    "articles",
                    articleId,
                    "comments"
                ),

                {
                    name: name,
                    text: message,
                    parentId: replyingTo || null,
                    status: "pending",
                    createdAt: serverTimestamp()
                }

            );

            alert(
                "Thank you! Your comment has been submitted for approval."
            );

            replyingTo = null;

            const replyMessage =
                document.getElementById("commentMessage");

            if (replyMessage) {

                replyMessage.textContent = "";

            }

            const cancelReply =
                document.querySelector(
                    ".comments-section button[type='button']"
                );

            if (cancelReply) {

                cancelReply.hidden = true;

            }

            await loadComments(articleId);

        } catch (error) {

            console.error("Comment submission error:", error);

            alert(
                "Unable to submit your comment. Please try again."
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent = "Submit Comment";

        }

    }

    // =====================================
    // 8. OPEN AND DISPLAY ARTICLE
    // =====================================

    function openArticle(article, articleId, storyKey) {

        if (!storyDetails || !storyPage) {

            alert("Story reader could not be found.");

            return;

        }

        currentArticle = article;

        currentArticleId = articleId || null;

        replyingTo = null;

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

        // COMMENTS

        if (articleId) {

            const commentsSection =
                createCommentsSection(articleId);

            storyDetails.appendChild(commentsSection);

            loadComments(articleId);

        }

        showStoryPage();

    }

    // =====================================
    // 9. SAMPLE STORIES
    // =====================================

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

    // =====================================
    // 10. OPEN STATIC STORIES
    // =====================================

    document.querySelectorAll(".read-more").forEach(function (button) {

        button.addEventListener("click", function () {

            const storyKey = button.dataset.story;

            const story = stories[storyKey];

            if (!story) return;

            openArticle(story, null, storyKey);

            const url = new URL(window.location.href);

            url.searchParams.set("story", storyKey);

            url.searchParams.delete("article");

            history.pushState({}, "", url);

        });

    });

    // =====================================
    // 11. BACK BUTTON
    // =====================================

    if (backButton) {

        backButton.addEventListener("click", function () {

            history.pushState(
                {},
                "",
                window.location.pathname + window.location.hash
            );

            currentArticle = null;

            currentArticleId = null;

            replyingTo = null;

            showMainPage();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    // =====================================
    // 12. BROWSER BACK AND FORWARD
    // =====================================

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

            currentArticle = null;

            currentArticleId = null;

            showMainPage();

        }

    });

    // =====================================
    // 13. SEARCH
    // =====================================

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchText =
                searchInput.value.toLowerCase().trim();

            document.querySelectorAll(".news-card").forEach(
                function (card) {

                    const cardText =
                        card.innerText.toLowerCase();

                    card.style.display =
                        cardText.includes(searchText) ? "" : "none";

                }
            );

        });

    }

    // =====================================
    // 14. CURRENT YEAR
    // =====================================

    const yearElement = document.getElementById("year");

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }

    // =====================================
    // 15. LOAD FIREBASE ARTICLES
    // =====================================

    async function loadFirebaseArticles() {

        try {

            const {

                initializeApp,
                getApps,
                getApp

            } = await import(

                "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js"

            );

            const firestore = await import(

                "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"

            );

            const {

                getFirestore,
                collection,
                getDocs,
                query,
                where,
                addDoc,
                serverTimestamp

            } = firestore;

            firebaseFunctions = {

                collection,
                getDocs,
                query,
                where,
                addDoc,
                serverTimestamp

            };

            // FIREBASE CONFIGURATION

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

            // GET PUBLISHED ARTICLES

            const articlesQuery = query(

                collection(firestoreDb, "articles"),

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

            // DISPLAY ARTICLES

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

                // CATEGORY

                const category = document.createElement("span");

                category.className = "category";

                category.textContent =
                    article.category || "News";

                // TITLE

                const title = document.createElement("h3");

                title.textContent =
                    article.title || "Untitled story";

                // SUMMARY

                const summary = document.createElement("p");

                summary.textContent =
                    article.summary || "";

                // READ MORE BUTTON

                const button = document.createElement("button");

                button.type = "button";

                button.className = "read-more";

                button.textContent = "Read More";

                button.addEventListener("click", function () {

                    openArticle(article, articleId);

                    const url = new URL(window.location.href);

                    url.searchParams.set("article", articleId);

                    url.searchParams.delete("story");

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

            // OPEN SHARED ARTICLE

            const params = new URLSearchParams(window.location.search);

            const sharedArticleId = params.get("article");

            if (sharedArticleId) {

                const sharedArticle =
                    firebaseArticles.get(sharedArticleId);

                if (sharedArticle) {

                    openArticle(
                        sharedArticle,
                        sharedArticleId
                    );

                } else {

                    console.warn(
                        "Shared article was not found."
                    );

                }

            } else {

                const sharedStory = params.get("story");

                if (sharedStory && stories[sharedStory]) {

                    openArticle(
                        stories[sharedStory],
                        null,
                        sharedStory
                    );

                }

            }

        } catch (error) {

            console.error(
                "JessyGist Firebase loading error:",
                error
            );

        }

    }

    // =====================================
    // 16. START FIREBASE
    // =====================================

    loadFirebaseArticles();

});
