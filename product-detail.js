

document.addEventListener("DOMContentLoaded", () => {

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("Chưa đăng nhập");
        window.location.href = "index.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("Thiếu ProductId");
        return;
    }

    const connStr = localStorage.getItem("connectionString");
    if (!connStr) {
        alert("Mất Connection-String");
        window.location.href = "index.html";
        return;
    }

    fetch(`${API_BASE}/products/${productId}`, {
        headers: {
            "Connection-String": connStr
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("Không load được chi tiết");
            return res.json();
        })
        .then(renderDetail)
        .catch(err => {
            console.error(err);
            alert("Lỗi load chi tiết");
        });
});


/* ===== RENDER ===== */
function renderDetail(p) {
    document.getElementById("productName").innerText = p.productName;
    document.getElementById("price").innerText =
        Number(p.price).toLocaleString() + " đ";
    document.getElementById("category").innerText = p.categoryName ?? "";
    document.getElementById("stock").innerText = "Tồn kho: " + p.stock;

    const baseUrl = API_BASE.replace("/api", "");

    // ===== MAIN IMAGE =====
    const mainImage = document.getElementById("mainImage");
    if (p.images && p.images.length > 0) {
        mainImage.src = `${baseUrl}${p.images[0]}`;
    } else {
        mainImage.src = "images/no-image.png";
    }

    // ===== THUMBNAILS =====
    const thumbList = document.getElementById("thumbnailList");
    thumbList.innerHTML = "";

    if (!p.images) return;

    p.images.forEach(img => {
        const thumb = document.createElement("img");
        thumb.src = `${baseUrl}${img}`;
        thumb.onclick = () => {
            mainImage.src = thumb.src;
        };
        thumbList.appendChild(thumb);
    });
}
