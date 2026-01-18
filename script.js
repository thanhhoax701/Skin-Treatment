// ===== ACCORDION =====
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

// ===== IMAGE MODAL =====
const modal = document.createElement("div");
modal.className = "image-modal";
modal.innerHTML = `
    <span class="close-btn">✕</span>
    <img>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");
const closeBtn = modal.querySelector(".close-btn");

document.querySelectorAll(".card-image img").forEach(img => {
    img.addEventListener("click", () => {
        modalImg.src = img.src;
        modal.classList.add("active");
    });
});

closeBtn.onclick = (e) => {
    e.stopPropagation();
    modal.classList.remove("active");
};

modal.onclick = () => {
    modal.classList.remove("active");
};

// ===== SAVE OVERALL REVIEW =====
// document.querySelectorAll(".overall-review").forEach(section => {
//     const key = section.dataset.key;
//     const content = section.querySelector(".overall-content");
//     const btn = section.querySelector(".save-review");

//     const saved = localStorage.getItem(key);
//     if (saved) content.innerHTML = saved;

//     btn.onclick = () => {
//         localStorage.setItem(key, content.innerHTML);
//         btn.textContent = "✅ Đã lưu";
//         setTimeout(() => btn.textContent = "💾 Lưu đánh giá", 1500);
//     };
// });

import { db, ref, set, onValue } from "./firebase.js";

// map key html -> firebase
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

    const dbRef = ref(db, `reviews/${firebaseKey}`);

    // 🔴 REALTIME LISTEN
    onValue(dbRef, snapshot => {
        const data = snapshot.val();
        if (data && data.content) {
            contentDiv.innerHTML = data.content;
        }
    });

    // 💾 SAVE
    saveBtn.addEventListener("click", () => {
        set(dbRef, {
            content: contentDiv.innerHTML,
            updatedAt: Date.now()
        });
        saveBtn.textContent = "✅ Đã lưu";
        setTimeout(() => {
            saveBtn.textContent = "💾 Lưu đánh giá";
        }, 1500);
    });
});


// ===== CAROUSEL – TỰ ĐỘNG 3 CARD DESKTOP / 2 CARD MOBILE =====
document.querySelectorAll(".carousel-wrapper").forEach(wrapper => {
    const container = wrapper.querySelector(".card-container");
    const prevBtn = wrapper.querySelector(".prev");
    const nextBtn = wrapper.querySelector(".next");
    const cards = container.children;

    let index = 0;

    function getVisible() {
        return window.innerWidth <= 768 ? 2 : 3;
    }

    function updateButtons(visible) {
        if (cards.length > visible) {
            prevBtn.style.display = "block";
            nextBtn.style.display = "block";
        } else {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        }
    }

    function update() {
        const visible = getVisible();
        const cardWidth = cards[0].offsetWidth + 20;
        container.style.transform = `translateX(-${index * cardWidth}px)`;
        updateButtons(visible);
    }

    prevBtn.onclick = () => {
        const visible = getVisible();
        index = Math.max(index - visible, 0);
        update();
    };

    nextBtn.onclick = () => {
        const visible = getVisible();
        index = Math.min(index + visible, cards.length - visible);
        update();
    };

    // resize màn hình (xoay ngang / dọc)
    window.addEventListener("resize", () => {
        index = 0;
        update();
    });

    update();
});
