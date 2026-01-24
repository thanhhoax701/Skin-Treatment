import { db, ref, onValue, set } from "./firebase.js";

/* =====================================================
   NOTIFICATION
===================================================== */
function showNotification(message) {
    alert(message);
}

/* =====================================================
   ACCORDION (FIX ASYNC HEIGHT)
===================================================== */
document.querySelectorAll(".accordion-header").forEach(header => {
    header.onclick = () => {
        const item = header.parentElement;
        const content = item.querySelector(".accordion-content");

        document.querySelectorAll(".accordion-item").forEach(i => {
            if (i !== item) {
                i.classList.remove("active");
                i.querySelector(".accordion-content").style.height = "0px";
            }
        });

        if (item.classList.contains("active")) {
            item.classList.remove("active");
            content.style.height = "0px";
        } else {
            item.classList.add("active");
            content.style.height = content.scrollHeight + "px";
        }
    };
});

/* =====================================================
   IMAGE MODAL (ZOOM)
===================================================== */
const imageModal = document.createElement("div");
imageModal.className = "image-modal";
imageModal.innerHTML = `
<span class="close-btn">✕</span>
<img>
`;
document.body.appendChild(imageModal);

imageModal.querySelector(".close-btn").onclick = () => {
    imageModal.classList.remove("active");
};

imageModal.onclick = e => {
    if (e.target === imageModal) {
        imageModal.classList.remove("active");
    }
};

/* =====================================================
   EDIT MODAL
===================================================== */
const editModal = document.createElement("div");
editModal.className = "edit-modal";
editModal.innerHTML = `
<div class="edit-box">
    <h3>✏️ Chỉnh sửa card</h3>

    <label>Thời gian</label>
    <input type="text" id="edit-date">

    <label>Chọn ảnh</label>
    <input type="file" id="edit-image-file" accept="image/*">
    <div id="image-preview"></div>

    <label>Tình trạng</label>
    <textarea id="edit-status"></textarea>

    <div style="margin-top:10px;display:flex;justify-content:space-between;gap:6px">
        <button id="save-edit" style="flex:1;padding:6px;font-size:13px">💾 Lưu</button>
        <button id="cancel-edit" style="flex:1;padding:6px;font-size:13px">❌ Hủy</button>
    </div>
</div>
`;
document.body.appendChild(editModal);

// Handle file input change
let imageDataUrl = null;
document.getElementById("edit-image-file").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        imageDataUrl = event.target.result;
        const preview = document.getElementById("image-preview");
        preview.innerHTML = `<img src="${imageDataUrl}" style="max-width:100%;border-radius:6px;">`;
    };
    reader.readAsDataURL(file);
};

let currentEdit = null;

document.getElementById("cancel-edit").onclick = () => {
    editModal.classList.remove("active");
};

document.getElementById("save-edit").onclick = () => {
    if (!currentEdit) return;

    const { side, id } = currentEdit;
    const dateTimeValue = document.getElementById("edit-date").value.trim();
    const statusValue = document.getElementById("edit-status").value.trim();

    if (!dateTimeValue || !statusValue) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Nếu chọn file mới thì dùng imageDataUrl, nếu không thì dùng ảnh cũ
    const finalImageUrl = imageDataUrl || currentEdit.imageUrl;

    // Lấy dateKey từ input dateTime (phần trước " - ")
    const dateKeyValue = dateTimeValue.split(" - ")[0].trim();

    set(ref(db, `cards/${side}/${id}`), {
        imageUrl: finalImageUrl,
        dateTime: dateTimeValue,
        statusHtml: statusValue,
        dateKey: dateKeyValue,
        createdAt: Date.now()
    });

    imageDataUrl = null;
    editModal.classList.remove("active");
    showNotification("✅ Đã lưu card!");
};

/* =====================================================
   OVERALL REVIEW
===================================================== */
document.querySelectorAll(".overall-review").forEach(section => {
    const side = section.dataset.key;
    const content = section.querySelector(".overall-content");
    const btn = section.querySelector(".save-review");

    const reviewRef = ref(db, `reviews/${side}`);

    onValue(reviewRef, snap => {
        if (snap.val()?.content) {
            content.innerHTML = snap.val().content;
        }
    });

    btn.onclick = () => {
        set(reviewRef, {
            content: content.innerHTML,
            updatedAt: Date.now()
        });
        showNotification("✅ Đã lưu đánh giá!");
    };
});

/* =====================================================
   RENDER CARD (CARD + ACTION RIÊNG)
===================================================== */
function renderCard(card, id, side) {
    return `
    <div class="card-wrapper" data-id="${id}" data-side="${side}">
        <div class="card">
            <div class="card-image">
                <img src="${card.imageUrl}">
            </div>
            <div class="card-info">
                <span class="date">${card.dateTime || ""}</span>
                <div class="tooltip">${card.statusHtml || ""}</div>
            </div>
        </div>

        <div class="card-actions">
            <button class="edit-card-btn">✏️ Chỉnh sửa</button>
        </div>
    </div>`;
}

/* =====================================================
   LOAD CARD FROM FIREBASE (REALTIME + FIX HEIGHT)
===================================================== */
document.querySelectorAll(".card-container").forEach(container => {
    const side = container.dataset.side;
    const cardsRef = ref(db, `cards/${side}`);

    onValue(cardsRef, snap => {
        container.innerHTML = "";

        const data = snap.val();
        if (!data) return;

        Object.entries(data)
            .sort((a, b) => a[1].createdAt - b[1].createdAt)
            .forEach(([id, card]) => {
                container.insertAdjacentHTML(
                    "beforeend",
                    renderCard(card, id, side)
                );
            });

        initCarousel(container.closest(".carousel-wrapper"));

        /* 🔥 FIX MẤT CARD DO ACCORDION HEIGHT */
        const accordion = container.closest(".accordion-item");
        if (accordion.classList.contains("active")) {
            const content = accordion.querySelector(".accordion-content");
            content.style.height = content.scrollHeight + "px";
        }
    });
});

/* =====================================================
   CLICK IMAGE (ZOOM)
===================================================== */
document.addEventListener("click", e => {
    const img = e.target.closest(".card-image img");
    if (img) {
        imageModal.querySelector("img").src = img.src;
        imageModal.classList.add("active");
        return;
    }
});

/* =====================================================
   CLICK EDIT (TÁCH BIỆT – KHÔNG BỊ CHẶN)
===================================================== */
document.addEventListener("click", e => {
    const btn = e.target.closest(".edit-card-btn");
    if (!btn) return;

    const wrap = btn.closest(".card-wrapper");
    const dateText = wrap.querySelector(".date").innerText;

    currentEdit = {
        id: wrap.dataset.id,
        side: wrap.dataset.side,
        imageUrl: wrap.querySelector("img").src,
        dateTime: dateText,
        dateKey: dateText.split(" - ")[0].trim()
    };

    document.getElementById("edit-date").value = dateText;

    // Reset file input
    document.getElementById("edit-image-file").value = "";
    document.getElementById("image-preview").innerHTML = `<img src="${currentEdit.imageUrl}" style="max-width:100%;border-radius:6px;">`;
    imageDataUrl = null;

    document.getElementById("edit-status").value =
        wrap.querySelector(".tooltip").innerHTML;

    editModal.classList.add("active");
});

/* =====================================================
   CAROUSEL (ỔN ĐỊNH)
===================================================== */
function initCarousel(wrapper) {
    if (!wrapper) return;

    const container = wrapper.querySelector(".card-container");
    const prev = wrapper.querySelector(".prev");
    const next = wrapper.querySelector(".next");

    let index = 0;

    const visible = () => window.innerWidth <= 768 ? 2 : 3;

    function update() {
        const v = visible();
        const total = container.children.length;

        prev.style.display = next.style.display =
            total > v ? "block" : "none";

        const cardWidth =
            container.children[0]?.offsetWidth + 20 || 0;

        container.style.transform =
            `translateX(-${index * cardWidth}px)`;
    }

    prev.onclick = () => {
        index = Math.max(0, index - visible());
        update();
    };

    next.onclick = () => {
        index = Math.min(
            container.children.length - visible(),
            index + visible()
        );
        update();
    };

    window.addEventListener("resize", () => {
        index = 0;
        update();
    });

    update();
}
