// ===== ACCORDION MƯỢT =====
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

// ===== MODAL FULLSCREEN IMAGE =====
const modal = document.createElement("div");
modal.className = "image-modal";
modal.innerHTML = `<img>`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");

// click ảnh -> mở full
document.querySelectorAll(".card-image img").forEach(img => {
    img.addEventListener("click", () => {
        modalImg.src = img.src;
        modal.classList.add("active");
    });
});

// click nền hoặc nút X -> đóng
modal.addEventListener("click", () => {
    modal.classList.remove("active");
    modalImg.src = "";
});
