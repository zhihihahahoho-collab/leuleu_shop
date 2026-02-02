// ===== CONNECTION STRING CACHE =====
let cachedConnectionString = null;

function getConnectionString() {
    if (cachedConnectionString) return cachedConnectionString;

    const cs = localStorage.getItem("connectionString");
    if (!cs || cs.trim() === "") return null;

    cachedConnectionString = cs;
    return cs;
}

function requireLogin() {
    const cs = getConnectionString();
    if (!cs) {
        alert("Chưa đăng nhập hoặc mất phiên đăng nhập!");
        window.location.href = "index.html";
        return false;
    }
    return true;
}


// ===== LOAD ALL PRODUCTS =====
function loadAllProducts() {
    if (!requireLogin()) return;

    fetch(`${API_BASE}/products`, {
        headers: {
            "Connection-String": getConnectionString(),
            // THÊM DÒNG NÀY ĐỂ SỬA LỖI NGROK
            "ngrok-skip-browser-warning": "true" 
        }
    })
    .then(res => {
        // Nếu res trả về HTML thay vì JSON, dòng này sẽ giúp debug dễ hơn
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            throw new Error("Server trả về HTML thay vì JSON (Lỗi Ngrok)");
        }
        if (!res.ok) throw new Error("Không load được sản phẩm");
        return res.json();
    })
    .then(renderProducts)
    .catch(err => alert(err.message));
}


// ===== LOAD / SEARCH PRODUCTS =====
function loadProducts() {
    if (!requireLogin()) return;

    const keyword  = document.getElementById("searchInput")?.value.trim();
    const minPrice = document.getElementById("minPrice")?.value;
    const maxPrice = document.getElementById("maxPrice")?.value;
    const sort     = document.getElementById("sortSelect")?.value;

    const params = new URLSearchParams();
    if (keyword)  params.append("keyword", keyword);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (sort)     params.append("sort", sort);

    fetch(`${API_BASE}/products/search?${params}`, {
        headers: {
            "Connection-String": getConnectionString(),
            // THÊM DÒNG NÀY ĐỂ SỬA LỖI NGROK
            "ngrok-skip-browser-warning": "true" 
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không load được sản phẩm");
        return res.json();
    })
    .then(renderProducts)
    .catch(err => alert(err.message));
}


// ===== RENDER PRODUCTS =====
function renderProducts(data) {
    const list = document.getElementById("productList");
    list.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        list.innerHTML = `<p style="color:#9ca3af">Không có sản phẩm phù hợp</p>`;
        return;
    }

    const baseUrl = API_BASE.replace("/api", "");

    data.forEach(p => {
        const imageUrl = p.imageUrl
            ? `${baseUrl}${p.imageUrl}`
            : "images/no-image.png";

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <a href="product-detail.html?id=${p.productId}" class="product-link">
                <img src="${imageUrl}" alt="${p.productName}">
                <h3>${p.productName}</h3>
                <p class="price">${Number(p.price).toLocaleString()} đ</p>
                <p class="category">${p.categoryName ?? ""}</p>
            </a>
        `;
        list.appendChild(card);
    });
}


// ===== DATABASE SPACE (FOOTER) =====
function loadDbSpace() {
    if (!requireLogin()) return;

    fetch(`${API_BASE}/admin/database-space`, {
        headers: {
            "Connection-String": getConnectionString(),
            // THÊM DÒNG NÀY ĐỂ SỬA LỖI NGROK
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không lấy được dung lượng DB");
        return res.json();
    })
    .then(data => {
        document.getElementById("dbSpace").innerHTML =
            `<p>${data.database_name} – ${data.database_size}</p>`;
    })
    .catch(err => console.error(err.message));
}


// ===== LOAD LẦN ĐẦU =====
loadAllProducts();