// FILE: assets/js/wishlist.js

let wishlistProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  initWishlistPage();
});

async function initWishlistPage() {
  try {
    // Pastikan data produk sudah tersedia
    await loadProducts(); // dari app.js, mengisi global allProducts

    const wishlistIds = getWishlist(); // dari app.js
    if (!Array.isArray(wishlistIds) || !wishlistIds.length) {
      showEmptyWishlist();
      return;
    }

    wishlistProducts = wishlistIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);

    if (!wishlistProducts.length) {
      showEmptyWishlist();
      return;
    }

    renderWishlist();
  } catch (err) {
    console.error('Gagal memuat wishlist:', err);
    showEmptyWishlist();
  }
}

function showEmptyWishlist() {
  const wrapper = document.getElementById('wishlist-wrapper');
  const empty = document.getElementById('wishlist-empty');
  const countText = document.getElementById('wishlist-count-text');

  if (wrapper) wrapper.hidden = true;
  if (empty) empty.hidden = false;
  if (countText) countText.textContent = '0 produk di wishlist';
}

function renderWishlist() {
  const wrapper = document.getElementById('wishlist-wrapper');
  const empty = document.getElementById('wishlist-empty');
  const listEl = document.getElementById('wishlist-items');
  const countText = document.getElementById('wishlist-count-text');

  if (!wrapper || !empty || !listEl) return;

  if (!wishlistProducts.length) {
    showEmptyWishlist();
    updateWishlistCount(); // navbar
    return;
  }

  wrapper.hidden = false;
  empty.hidden = true;

  listEl.innerHTML = '';

  wishlistProducts.forEach(prod => {
    listEl.appendChild(createWishlistCard(prod));
  });

  if (countText) {
    countText.textContent = `${wishlistProducts.length} produk di wishlist`;
  }

  // update badge di navbar
  updateWishlistCount();
}

function createWishlistCard(prod) {
  const card = document.createElement('article');
  card.className = 'wishlist-card';

  const image = Array.isArray(prod.images) && prod.images[0]
    ? prod.images[0]
    : 'https://via.placeholder.com/140x180?text=Kitab';

  const title = prod.title?.id || prod.title || 'Tanpa Judul';
  const subjectText = prod.subject?.id
    ? prod.subject.id + (prod.subject.ar ? ` – ${prod.subject.ar}` : '')
    : '';
  const categoryLabel = mapWishlistCategoryLabel(prod.category);
  const price = prod.price || 0;

  card.innerHTML = `
    <div class="wishlist-card-inner">
      <div class="wishlist-media">
        <img src="${image}" alt="${title}">
      </div>
      <div class="wishlist-info">
        <div class="wishlist-title">
          <a href="product.html?id=${encodeURIComponent(prod.id)}">${title}</a>
        </div>
        <div class="wishlist-meta">
          ${subjectText ? `${subjectText} · ` : ''}${categoryLabel}
        </div>
        <div class="wishlist-price">${formatRupiah(price)}</div>
        ${prod.subject?.id ? `<span class="wishlist-chip">${prod.subject.id}</span>` : ''}
      </div>
    </div>
    <div class="wishlist-actions">
      <button
        type="button"
        class="btn btn-primary btn-move-to-cart"
        data-id="${prod.id}">
        Pindahkan ke Keranjang
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-remove-wishlist"
        data-id="${prod.id}">
        Hapus
      </button>
    </div>
  `;

  // Bind actions
  const moveBtn = card.querySelector('.btn-move-to-cart');
  const removeBtn = card.querySelector('.btn-remove-wishlist');

  if (moveBtn) {
    moveBtn.addEventListener('click', () => {
      handleMoveToCart(prod.id);
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      handleRemoveFromWishlist(prod.id);
    });
  }

  return card;
}

function mapWishlistCategoryLabel(categoryId) {
  switch (categoryId) {
    case 'kitab':
      return 'Kitab';
    case 'alat-tulis':
      return 'Alat Tulis';
    case 'aksesoris':
      return 'Aksesoris Kitab';
    case 'perlengkapan-ngaji':
      return 'Perlengkapan Ngaji';
    case 'layanan':
      return 'Layanan Tambahan';
    default:
      return categoryId || 'Lainnya';
  }
}

// =============================
// Actions
// =============================

function handleMoveToCart(productId) {
  const prod = allProducts.find(p => p.id === productId);
  if (!prod) return;

  addProductToCartBasic(prod, 1); // qty default 1
  handleRemoveFromWishlist(productId, false); // remove tanpa re-render dua kali
  renderWishlist();
}

function handleRemoveFromWishlist(productId, reRender = true) {
  // gunakan toggleWishlist atau manipulasi langsung
  toggleWishlist(productId); // dari app.js, akan menambah/hapus ID

  // sync array lokal dengan localStorage
  const ids = getWishlist();
  wishlistProducts = ids
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);

  if (reRender) {
    renderWishlist();
  }
}

// =============================
// Cart helper (basic add)
// =============================

function addProductToCartBasic(prod, qty = 1) {
  const cart = getCart(); // dari app.js
  const baseTitle = prod.title?.id || prod.title || 'Produk';
  const price = prod.price || 0;
  const image = Array.isArray(prod.images) && prod.images[0] ? prod.images[0] : '';

  // Item dianggap sama bila id & price sama (tanpa layanan tambahan)
  const existing = cart.find(
    item => item.id === prod.id && item.price === price && item.title === baseTitle
  );

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: prod.id,
      title: baseTitle,
      price: price,
      image: image,
      quantity: qty,
      selected: true
    });
  }

  saveCart(cart);
  updateCartCount();
}
