import { db, ref, onValue, set } from "./firebase.js";

/* =====================================================
   ACCORDION
===================================================== */
document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
        const item = header.parentElement;
        const content = item.querySelector(".accordion-content");

        if (item.classList.contains("active")) {
            content.style.height = "0px";
            item.classList.remove("active");
        } else {
            document.querySelectorAll(".accordion-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".accordion-content").style.height = "0px";
            });
            item.classList.add("active");
            content.style.height = content.scrollHeight + "px";
        }
    });
});

/* =====================================================
   IMAGE MODAL (FULLSCREEN)
===================================================== */
const modal = document.createElement("div");
modal.className = "image-modal";
modal.innerHTML = `
    <span class="close-btn">✕</span>
    <img>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");
const closeBtn = modal.querySelector(".close-btn");

closeBtn.onclick = e => {
    e.stopPropagation();
    modal.classList.remove("active");
};

modal.onclick = () => modal.classList.remove("active");

function bindImageModal(scope = document) {
    scope.querySelectorAll(".card-image img").forEach(img => {
        img.onclick = () => {
            modalImg.src = img.src;
            modal.classList.add("active");
        };
    });
}

/* =====================================================
   OVERALL REVIEW – FIREBASE REALTIME
===================================================== */
const REVIEW_MAP = {
    "overall-left": "left",
    "overall-right": "right",
    "overall-front": "front"
};

document.querySelectorAll(".overall-review").forEach(section => {
    const localKey = section.dataset.key;
    const firebaseKey = REVIEW_MAP[localKey];
    const contentDiv = section.querySelector(".overall-content");
    const saveBtn = section.querySelector(".save-review");

    const reviewRef = ref(db, `reviews/${firebaseKey}`);

    // realtime load
    onValue(reviewRef, snap => {
        const data = snap.val();
        if (data?.content) {
            contentDiv.innerHTML = data.content;
        }
    });

    // save
    saveBtn.onclick = () => {
        set(reviewRef, {
            content: contentDiv.innerHTML,
            updatedAt: Date.now()
        });
        saveBtn.textContent = "✅ Đã lưu";
        setTimeout(() => saveBtn.textContent = "💾 Lưu đánh giá", 1500);
    };
});

/* =====================================================
   RENDER CARD
===================================================== */
function renderCard(card) {
    if (!card) return "";

    return `
    <div class="card">
        <div class="card-image">
            <img src="${card.imageUrl || ""}" alt="">
        </div>
        <div class="card-info">
            <span class="date">${card.dateTime || ""}</span>
            <div class="tooltip">
                ${card.statusHtml || ""}
            </div>
        </div>
    </div>`;
}

/* =====================================================
   LOAD CARD FROM FIREBASE (REALTIME)
===================================================== */
document.querySelectorAll(".card-container").forEach(container => {
    const side = container.dataset.side;
    if (!side) return;

    const cardsRef = ref(db, `cards/${side}`);

    onValue(cardsRef, snap => {
        const data = snap.val();
        container.innerHTML = "";

        if (!data) {
            console.log("❌ Không có card:", side);
            return;
        }

        const cards = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
        }));

        cards
            .sort((a, b) => a.createdAt - b.createdAt)
            .forEach(card => {
                container.insertAdjacentHTML("beforeend", renderCard(card));
            });

        bindImageModal(container);
        initCarousel(container.closest(".carousel-wrapper"));
    });
});

/* =====================================================
   CAROUSEL (3 CARD DESKTOP / 2 CARD MOBILE – FIXED SIZE)
===================================================== */
function initCarousel(wrapper) {
    if (!wrapper) return;

    const container = wrapper.querySelector(".card-container");
    const prevBtn = wrapper.querySelector(".prev");
    const nextBtn = wrapper.querySelector(".next");
    const cards = container.children;

    let index = 0;

    function visible() {
        return window.innerWidth <= 768 ? 2 : 3;
    }

    function update() {
        const v = visible();

        if (cards.length > v) {
            prevBtn.style.display = "block";
            nextBtn.style.display = "block";
        } else {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        }

        const cardWidth = cards[0]?.offsetWidth + 20 || 0;
        container.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    prevBtn.onclick = () => {
        index = Math.max(index - visible(), 0);
        update();
    };

    nextBtn.onclick = () => {
        index = Math.min(index + visible(), cards.length - visible());
        update();
    };

    window.addEventListener("resize", () => {
        index = 0;
        update();
    });

    update();
}
