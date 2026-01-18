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
document.querySelectorAll(".overall-review").forEach(section => {
    const key = section.dataset.key;
    const content = section.querySelector(".overall-content");
    const btn = section.querySelector(".save-review");

    const saved = localStorage.getItem(key);
    if (saved) content.innerHTML = saved;

    btn.onclick = () => {
        localStorage.setItem(key, content.innerHTML);
        btn.textContent = "✅ Đã lưu";
        setTimeout(() => btn.textContent = "💾 Lưu đánh giá", 1500);
    };
});

// ===== CAROUSEL – 3 CARD CỐ ĐỊNH =====
document.querySelectorAll(".carousel-wrapper").forEach(wrapper => {
    const container = wrapper.querySelector(".card-container");
    const prevBtn = wrapper.querySelector(".prev");
    const nextBtn = wrapper.querySelector(".next");
    const cards = container.children;

    const visible = 3;
    const total = cards.length;
    let index = 0;

    if (total > visible) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
    }

    function update() {
        const cardWidth = cards[0].offsetWidth + 20;
        container.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    prevBtn.onclick = () => {
        index = Math.max(index - visible, 0);
        update();
    };

    nextBtn.onclick = () => {
        index = Math.min(index + visible, total - visible);
        update();
    };
});
