// FILE: assets/js/app.js
// Core util + global config untuk ReeezdBaraqah

// =============================
// CONFIG & GLOBAL STATE
// =============================
const APP_CONFIG = {
  whatsappNumber: '6282264925085', // ganti dengan nomor toko
  productsUrl: 'data/products.json',
  categoriesUrl: 'data/categories.json'
};

const STORAGE_KEYS = {
  cart: 'rb_cart',
  wishlist: 'rb_wishlist',
  customer: 'rb_customer'
};

// cache produk global
let allProducts = [];
let productsPromise = null;

// =============================
// BOOTSTRAP
// =============================
document.addEventListener('DOMContentLoaded', () => {
  initCurrentYear();
  initNavbarToggle();
  initNavbarScroll();
  initScrollReveal();

  // Load products PERTAMA KALI saat halaman dibuka
  loadProducts().then(() => {
    console.log('✅ Produk berhasil dimuat:', allProducts.length, 'item');
  }).catch(err => {
    console.error('❌ Gagal memuat produk:', err);
  });
  
  // sync badge nav dari localStorage
  updateCartCount();
  updateWishlistCount();
});

// =============================
// PRODUK (JSON) – helper
// =============================
async function loadProducts(force = false) {
  if (!force && allProducts.length) {
    return allProducts;
  }
  if (!force && productsPromise) {
    return productsPromise;
  }
  
  productsPromise = fetch(APP_CONFIG.productsUrl)
    .then(res => {
      if (!res.ok) throw new Error('Gagal memuat data produk.');
      return res.json();
    })
    .then(data => {
      allProducts = Array.isArray(data) ? data : [];
      return allProducts;
    })
    .catch(err => {
      console.error(err);
      allProducts = [];
      return allProducts;
    });
  
  return productsPromise;
}

// =============================
// GET PRODUCT BY ID (SYNC)
// =============================
function getProductById(id) {
  if (!Array.isArray(allProducts) || !allProducts.length) {
    console.warn('getProductById dipanggil sebelum loadProducts – hasil bisa kosong.');
  }
  return allProducts.find(p => p.id === id) || null;
}

window.getProductById = getProductById;

// =============================
// CART (KERANJANG)
// =============================
function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Gagal membaca cart dari localStorage:', err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart || []));
  } catch (err) {
    console.error('Gagal menyimpan cart ke localStorage:', err);
  }
}

function updateCartCount() {
  const cart = getCart();
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  
  let totalQty = 0;
  cart.forEach(item => {
    totalQty += Number(item.quantity) || 0;
  });
  countEl.textContent = totalQty;
}

function addToCart(productId, qty = 1) {
  const prod = getProductById(productId);
  if (!prod) {
    console.warn('Produk tidak ditemukan:', productId);
    return;
  }
  
  const cart = getCart();
  const baseTitle = prod.title?.id || prod.title || 'Produk';
  const price = prod.price || 0;
  const image = Array.isArray(prod.images) && prod.images[0] ? prod.images[0] : '';
  
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
  
  // Notifikasi sederhana
  alert(`✅ "${baseTitle}" ditambahkan ke keranjang (${qty} eksemplar)`);
}

window.addToCart = addToCart;

// =============================
// WISHLIST
// =============================
function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.wishlist);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Gagal membaca wishlist dari localStorage:', err);
    return [];
  }
}

function saveWishlist(ids) {
  try {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(ids || []));
  } catch (err) {
    console.error('Gagal menyimpan wishlist ke localStorage:', err);
  }
}

function addToWishlist(productId) {
  if (!productId) return;
  
  const list = getWishlist();
  if (list.includes(productId)) {
    alert('⚠️ Produk sudah ada di wishlist');
    return;
  }
  
  list.push(productId);
  saveWishlist(list);
  updateWishlistCount();
  
  const prod = getProductById(productId);
  const title = prod?.title?.id || prod?.title || 'Produk';
  alert(`💚 "${title}" ditambahkan ke wishlist`);
}

window.addToWishlist = addToWishlist;

function toggleWishlist(productId) {
  if (!productId) return;
  const list = getWishlist();
  const index = list.indexOf(productId);
  
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(productId);
  }
  
  saveWishlist(list);
  updateWishlistCount();
}

function updateWishlistCount() {
  const list = getWishlist();
  const countEl = document.getElementById('wishlist-count');
  if (!countEl) return;
  countEl.textContent = list.length;
}

function isInWishlist(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

// =============================
// CUSTOMER PROFILE
// =============================
function getCustomer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customer);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca customer dari localStorage:', err);
    return null;
  }
}

function saveCustomer(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(profile));
  } catch (err) {
    console.error('Gagal menyimpan customer ke localStorage:', err);
  }
}

function clearCustomer() {
  try {
    localStorage.removeItem(STORAGE_KEYS.customer);
  } catch (err) {
    console.error('Gagal menghapus customer dari localStorage:', err);
  }
}

window.getCustomer = getCustomer;
window.saveCustomer = saveCustomer;
window.clearCustomer = clearCustomer;

// =============================
// FORMAT & UTILS
// =============================
function formatRupiah(value) {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    const parts = n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Rp ' + parts;
  }
}

function formatCurrency(value) {
  const num = Number(value) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

window.formatRupiah = formatRupiah;
window.formatCurrency = formatCurrency;

function getLocalizedText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.id || value.en || value.ar || '';
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function initCurrentYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// =============================
// NAVBAR FUNCTIONALITY
// =============================
function initNavbarToggle() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('show');
    });
  }
}

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// =============================
// SCROLL REVEAL ANIMATION
// =============================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal');
  if (!reveals.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1
  });
  
  reveals.forEach(el => observer.observe(el));
}

// ============================================
// KARTU PRODUK UMUM (dipakai Home, Shop, Related)
// ============================================
function createProductCard(prod) {
  if (!prod || typeof prod !== 'object') {
    console.warn('createProductCard: produk tidak valid', prod);
    const fallback = document.createElement('article');
    fallback.className = 'product-card';
    fallback.innerHTML = '<p>Produk tidak valid</p>';
    return fallback;
  }

  // --- Ambil data dasar ---
  const id = prod.id || '';
  const titleId = prod.title?.id || getLocalizedText(prod.title) || 'Tanpa Judul';
  const titleAr = prod.title?.ar || '';
  
  let author = '';
  if (prod.author) {
    author = typeof prod.author === 'string' ? prod.author : 
             (prod.author.id || prod.author.en || prod.author.ar || '');
  }
  
  let publisher = '';
  if (prod.publisher) {
    publisher = typeof prod.publisher === 'string' ? prod.publisher : 
                (prod.publisher.id || prod.publisher.en || prod.publisher.ar || '');
  }
  
  const category = prod.category || 'lainnya';
  
  // Subject/Keilmuan
  let subjectLabel = '';
  if (prod.subject) {
    if (typeof prod.subject === 'string') {
      subjectLabel = prod.subject;
    } else {
      const subId = prod.subject.id || '';
      const subAr = prod.subject.ar || '';
      subjectLabel = subId + (subAr ? ` – ${subAr}` : '');
    }
  }
  
  const price = typeof prod.price === 'number' ? prod.price : 0;
  const priceText = formatRupiah(price);
  const stock = typeof prod.stock === 'number' ? prod.stock : null;
  
  // Deskripsi singkat
  let shortDesc = '';
  if (prod.description) {
    shortDesc = typeof prod.description === 'string' ? prod.description :
                (prod.description.id || prod.description.en || prod.description.ar || '');
  }
  if (shortDesc.length > 110) {
    shortDesc = shortDesc.slice(0, 110).trim() + '…';
  }
  
  // Gambar - gunakan placeholder jika tidak ada
  const img = (Array.isArray(prod.images) && prod.images.length && prod.images[0]) || 
              'https://via.placeholder.com/280x360/0f766e/ffffff?text=Kitab';
  
  // --- Badge kategori ---
  let categoryLabel = '';
  switch (category) {
    case 'kitab': categoryLabel = 'Kitab'; break;
    case 'alat-tulis': categoryLabel = 'Alat Tulis'; break;
    case 'aksesoris': categoryLabel = 'Aksesoris'; break;
    case 'perlengkapan-ngaji': categoryLabel = 'Perlengkapan Ngaji'; break;
    default: categoryLabel = 'Lainnya';
  }
  
  // --- Status stok ---
  let stockLabel = '';
  let stockClass = 'stock-label stock-available';
  
  if (prod.is_preorder) {
    stockLabel = 'Pre-Order';
    stockClass = 'stock-label stock-preorder';
  } else if (stock === 0) {
    stockLabel = 'Stok Habis';
    stockClass = 'stock-label stock-out';
  } else if (stock !== null && stock <= 5) {
    stockLabel = `Stok Terbatas (${stock})`;
    stockClass = 'stock-label stock-low';
  } else if (stock !== null) {
    stockLabel = `Stok ${stock}`;
    stockClass = 'stock-label stock-available';
  } else {
    stockLabel = 'Tersedia';
    stockClass = 'stock-label stock-available';
  }
  
  // --- Susun HTML kartu produk ---
  const card = document.createElement('article');
  card.className = 'product-card hdr-hover';
  
  card.innerHTML = `
    <div class="product-card-image">
      <img src="${img}" alt="${titleId}" loading="lazy" onerror="this.src='https://via.placeholder.com/280x360/0f766e/ffffff?text=Kitab'">
      <div class="product-card-badges">
        <span class="badge badge-category">${categoryLabel}</span>
        ${category === 'kitab' && subjectLabel ? `<span class="badge badge-subject">${subjectLabel}</span>` : ''}
      </div>
    </div>
    
    <div class="product-card-body">
      ${titleAr ? `<p class="product-title-ar">${titleAr}</p>` : ''}
      <h3 class="product-title">${titleId}</h3>
      
      <div class="product-meta">
        ${author ? `<p class="product-author">Penulis: ${author}</p>` : ''}
        ${publisher && publisher !== '-' ? `<p class="product-publisher">Penerbit: ${publisher}</p>` : ''}
      </div>
      
      ${shortDesc ? `<p class="product-desc">${shortDesc}</p>` : ''}
      
      <div class="product-card-footer">
        <div class="product-price-stock">
          <p class="product-price">${priceText}</p>
          <span class="${stockClass}">${stockLabel}</span>
        </div>
        
        <div class="product-actions">
          <a href="product.html?id=${id}" class="btn btn-primary btn-sm">Detail</a>
          <button type="button" class="btn btn-icon btn-wishlist" onclick="addToWishlist('${id}')" title="Tambah ke Wishlist">
            <span>🤍</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

// Expose ke global
window.createProductCard = createProductCard;
window.loadProducts = loadProducts;