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

// ===== IMAGE MODAL WITH X BUTTON =====
const modal = document.createElement("div");
modal.className = "image-modal";
modal.innerHTML = `
    <span class="close-btn">✕</span>
    <img>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");
const closeBtn = modal.querySelector(".close-btn");

// click ảnh -> mở modal
document.querySelectorAll(".card-image img").forEach(img => {
    img.addEventListener("click", () => {
        modalImg.src = img.src;
        modal.classList.add("active");
    });
});

// click X -> đóng
closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    modal.classList.remove("active");
});

// click nền tối -> đóng
modal.addEventListener("click", () => {
    modal.classList.remove("active");
});

// ===== SAVE OVERALL REVIEW =====
document.querySelectorAll(".overall-review").forEach(section => {
    const key = section.dataset.key;
    const content = section.querySelector(".overall-content");
    const btn = section.querySelector(".save-review");

    const saved = localStorage.getItem(key);
    if (saved) content.innerHTML = saved;

    btn.addEventListener("click", () => {
        localStorage.setItem(key, content.innerHTML);
        btn.textContent = "✅ Đã lưu";
        setTimeout(() => btn.textContent = "💾 Lưu đánh giá", 1500);
    });
});
