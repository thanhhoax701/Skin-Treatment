import { db, ref, onValue, set, get } from "./firebase.js";

/* =====================================================
   NOTIFICATION
===================================================== */
function showNotification(message) {
    alert(message);
}

/* =====================================================
   ACCORDION (FIX - DIRECT CLICK)
===================================================== */
function initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    console.log("🔍 Accordion headers found:", headers.length);

    headers.forEach((header, idx) => {
        console.log(`Header ${idx}:`, header.textContent);
        header.addEventListener("click", (e) => {
            console.log("✅ ACCORDION CLICKED:", header.textContent);
            e.stopPropagation();
            e.preventDefault();

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
        });
    });
}

// Initialize accordion when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordion);
} else {
    initAccordion();
}
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
    <h3 id="edit-modal-title">✏️ Chỉnh sửa card</h3>

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

/* =====================================================
   HISTORY MODAL
===================================================== */
const historyModal = document.createElement("div");
historyModal.className = "edit-modal";
historyModal.innerHTML = `
<div class="edit-box">
    <h3>📋 Lịch sử chỉnh sửa</h3>
    <div id="history-content" style="max-height:300px;overflow-y:auto;border:1px solid #ddd;padding:10px;border-radius:6px;">
        <p style="color:#999;">Không có lịch sử</p>
    </div>
    <div style="margin-top:10px;display:flex;gap:8px;">
        <button id="close-history" style="flex:1;padding:6px 12px;background:#4CAF50;color:#fff;border:none;border-radius:6px;cursor:pointer;">Đóng</button>
        <button id="delete-history" style="flex:1;padding:6px 12px;background:#f44336;color:#fff;border:none;border-radius:6px;cursor:pointer;">🗑️ Xóa lịch sử</button>
    </div>
</div>
`;
document.body.appendChild(historyModal);

let currentHistoryTarget = null;

document.getElementById("close-history").onclick = () => {
    historyModal.classList.remove("active");
    currentHistoryTarget = null;
};

document.getElementById("delete-history").onclick = () => {
    if (!currentHistoryTarget) return;

    const { type, side, id } = currentHistoryTarget;

    // Check if history is empty
    const historyContent = document.getElementById("history-content").innerText;
    if (historyContent.includes("Không có lịch sử")) {
        alert("⚠️ Lịch sử trống, không có gì để xóa!");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa lịch sử chỉnh sửa?")) return;

    if (type === "card") {
        // Chỉ xóa editHistory, giữ lại dữ liệu card
        const ref_ = ref(db, `cards/${side}/${id}/editHistory`);
        set(ref_, null).then(() => {
            // Reload history content để show "Không có lịch sử"
            const cardRef = ref(db, `cards/${side}/${id}`);
            onValue(cardRef, snap => {
                const card = snap.val();
                const historyContent = document.getElementById("history-content");

                if (card?.editHistory && card.editHistory.length > 0) {
                    historyContent.innerHTML = card.editHistory.map((entry, idx) => {
                        const timeStr = new Date(entry.timestamp).toLocaleString("vi-VN");
                        return `
                            <div style="padding:10px;border-bottom:1px solid #eee;margin-bottom:10px;">
                                <strong>Lần ${idx + 1}:</strong> ${timeStr}<br>
                                <small><strong>Ngày:</strong> ${entry.dateTime}</small>
                            </div>
                        `;
                    }).join("");
                } else {
                    historyContent.innerHTML = "<p style='color:#999;'>Không có lịch sử</p>";
                }
            }, { once: true });

            showNotification("✅ Đã xóa lịch sử!");
        });
    } else if (type === "review") {
        // Chỉ xóa editHistory của review, giữ lại content và title
        const ref_ = ref(db, `reviews/${side}/editHistory`);
        set(ref_, null).then(() => {
            // Reload history content để show "Không có lịch sử"
            const reviewRef = ref(db, `reviews/${side}`);
            onValue(reviewRef, snap => {
                const review = snap.val();
                const historyContent = document.getElementById("history-content");

                if (review?.editHistory && review.editHistory.length > 0) {
                    historyContent.innerHTML = review.editHistory.map((entry, idx) => {
                        const timeStr = new Date(entry.timestamp).toLocaleString("vi-VN");
                        return `
                            <div style="padding:10px;border-bottom:1px solid #eee;margin-bottom:10px;">
                                <strong>Lần ${idx + 1}:</strong> ${timeStr}<br>
                                <small><strong>Ngày:</strong> ${entry.updatedAt ? new Date(entry.updatedAt).toLocaleString("vi-VN") : "N/A"}</small>
                            </div>
                        `;
                    }).join("");
                } else {
                    historyContent.innerHTML = "<p style='color:#999;'>Không có lịch sử</p>";
                }
            }, { once: true });

            showNotification("✅ Đã xóa lịch sử!");
        });
    }
};

document.getElementById("save-edit").onclick = async () => {
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

    // Tạo history entry
    const newHistoryEntry = {
        timestamp: Date.now(),
        dateTime: dateTimeValue,
        statusHtml: statusValue,
        imageUrl: finalImageUrl
    };

    try {
        // Lấy card cũ để merge history
        const cardRef = ref(db, `cards/${side}/${id}`);

        // Dùng get() thay vì onValue để lấy data một lần
        const snapshot = await get(cardRef);
        const oldCard = snapshot.val();
        const oldHistory = (oldCard?.editHistory || []);
        const newHistory = [...oldHistory, newHistoryEntry];

        await set(cardRef, {
            imageUrl: finalImageUrl,
            dateTime: dateTimeValue,
            statusHtml: statusValue,
            dateKey: dateKeyValue,
            editHistory: newHistory,
            createdAt: oldCard?.createdAt || Date.now()
        });

        imageDataUrl = null;
        editModal.classList.remove("active");
        showNotification("✅ Đã lưu card!");
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Lỗi khi lưu dữ liệu!");
    }
};

/* =====================================================
   OVERALL REVIEW
===================================================== */
document.querySelectorAll(".overall-review").forEach(section => {
    const side = section.dataset.key;
    const title = section.querySelector("h3");
    const content = section.querySelector(".overall-content");
    const btn = section.querySelector(".save-review");

    const reviewRef = ref(db, `reviews/${side}`);

    onValue(reviewRef, snap => {
        const data = snap.val();
        if (data?.title) {
            title.textContent = data.title;
        }
        if (data?.content) {
            content.innerHTML = data.content;
        }
    });

    btn.onclick = async () => {
        try {
            const reviewRef = ref(db, `reviews/${side}`);

            // ✅ LẤY DATA 1 LẦN – KHÔNG TẠO LISTENER
            const snap = await get(reviewRef);
            const oldReview = snap.val();
            const oldHistory = (oldReview?.editHistory || []);

            const newHistoryEntry = {
                timestamp: Date.now(),
                content: content.innerHTML,
                title: title.textContent
            };

            const newHistory = [...oldHistory, newHistoryEntry];

            await set(reviewRef, {
                title: title.textContent,
                content: content.innerHTML,
                editHistory: newHistory,
                updatedAt: Date.now()
            });

            showNotification("✅ Đã lưu đánh giá!");
        } catch (err) {
            console.error("Lỗi khi lưu đánh giá:", err);
            alert("❌ Lỗi khi lưu đánh giá");
        }
    };


    // View history button for review
    const historyBtn = section.querySelector(".view-review-history");
    historyBtn.onclick = () => {
        currentHistoryTarget = { type: "review", side };

        onValue(reviewRef, snap => {
            const review = snap.val();
            const historyContent = document.getElementById("history-content");

            if (review?.editHistory && review.editHistory.length > 0) {
                historyContent.innerHTML = review.editHistory.map((entry, idx) => {
                    const timeStr = new Date(entry.timestamp).toLocaleString("vi-VN");
                    return `
                        <div style="padding:10px;border-bottom:1px solid #eee;margin-bottom:10px;">
                            <strong>Lần ${idx + 1}:</strong> ${timeStr}<br>
                            <small><strong>Tiêu đề:</strong> ${entry.title}</small>
                        </div>
                    `;
                }).join("");
            } else {
                historyContent.innerHTML = "<p style='color:#999;'>Không có lịch sử</p>";
            }

            historyModal.classList.add("active");
        }, { once: true });
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

        <div class="card-actions" style="display:flex;gap:8px;">
            <button class="edit-card-btn" style="flex:1;">✏️ Chỉnh sửa</button>
            <button class="view-history-btn" style="flex:1;background:#2196F3;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;">📋 Lịch sử</button>
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

    // View history button
    const historyBtn = e.target.closest(".view-history-btn");
    if (historyBtn) {
        const wrap = historyBtn.closest(".card-wrapper");
        const side = wrap.dataset.side;
        const id = wrap.dataset.id;

        currentHistoryTarget = { type: "card", side, id };

        const cardRef = ref(db, `cards/${side}/${id}`);
        onValue(cardRef, snap => {
            const card = snap.val();
            const historyContent = document.getElementById("history-content");

            if (card?.editHistory && card.editHistory.length > 0) {
                historyContent.innerHTML = card.editHistory.map((entry, idx) => {
                    const timeStr = new Date(entry.timestamp).toLocaleString("vi-VN");
                    return `
                        <div style="padding:10px;border-bottom:1px solid #eee;margin-bottom:10px;">
                            <strong>Lần ${idx + 1}:</strong> ${timeStr}<br>
                            <small><strong>Ngày:</strong> ${entry.dateTime}</small>
                        </div>
                    `;
                }).join("");
            } else {
                historyContent.innerHTML = "<p style='color:#999;'>Không có lịch sử</p>";
            }

            historyModal.classList.add("active");
        }, { once: true });
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

    // Cập nhật tiêu đề modal với ngày
    document.getElementById("edit-modal-title").textContent = `✏️ Chỉnh sửa card ${dateText}`;

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
