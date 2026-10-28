// FILE: assets/js/shop.js

let shopAllProducts = [];
let shopCategories = [];
let shopSubjects = [];

// Hanya tiga state: search, kategori, keilmuan
const shopFilterState = {
  search: '',
  category: 'all',
  subject: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initShopPage();
});

// =============================
// Inisialisasi Halaman Katalog
// =============================

async function initShopPage() {
  try {
    // Ambil data produk dari app.js (allProducts terisi)
    await loadProducts();

    // Ambil data kategori & keilmuan
    const catData = await loadCategoriesData();

    shopAllProducts = Array.isArray(allProducts) ? allProducts.slice() : [];
    shopCategories = catData.categories || [];
    shopSubjects = catData.subjects || [];

    setTotalProductsCount(shopAllProducts.length);
    initFilterOptions();
    applyFiltersFromURL();
    bindFilterEvents();
    applyFiltersAndRender();
  } catch (err) {
    console.error('Gagal menginisialisasi halaman shop:', err);
  }
}

// =============================
// Data Kategori
// =============================

async function loadCategoriesData() {
  const res = await fetch('data/categories.json');
  if (!res.ok) throw new Error('Gagal memuat categories.json');
  return res.json();
}

// =============================
// UI Helpers
// =============================

function setTotalProductsCount(total) {
  const el = document.getElementById('shop-total-products');
  if (el) el.textContent = total;
}

function setFilteredCount(total) {
  const el = document.getElementById('shop-filtered-count');
  if (el) el.textContent = total;
}

function initFilterOptions() {
  // Kategori
  const categorySelect = document.getElementById('filter-category');
  if (categorySelect && shopCategories.length) {
    shopCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

  // Subject / keilmuan
  const subjectSelect = document.getElementById('filter-subject');
  if (subjectSelect && shopSubjects.length) {
    shopSubjects.forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj.id;
      opt.textContent = subj.id + (subj.ar ? ` – ${subj.ar}` : '');
      subjectSelect.appendChild(opt);
    });
  }
}

// =============================
// Event Binding Filter
// =============================

function bindFilterEvents() {
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('filter-category');
  const subjectSelect = document.getElementById('filter-subject');
  const applyBtn = document.getElementById('filter-apply-btn');
  const resetBtn = document.getElementById('filter-reset-btn');
  const noResultsResetBtn = document.getElementById('no-results-reset-btn');

  // Untuk hide/show keilmuan (Kitab saja yang boleh)
  const subjectGroup =
    subjectSelect && subjectSelect.closest
      ? subjectSelect.closest('.filter-group')
      : null;

  function updateSubjectVisibility() {
    if (!subjectGroup) return;
    const cat = shopFilterState.category;
    // Jika kategori kosong / all / kitab → tampilkan keilmuan
    if (!cat || cat === 'all' || cat === 'kitab') {
      subjectGroup.style.display = '';
    } else {
      subjectGroup.style.display = 'none';
      shopFilterState.subject = 'all';
      if (subjectSelect) subjectSelect.value = 'all';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      shopFilterState.search = e.target.value.trim();
      applyFiltersAndRender();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', e => {
      shopFilterState.category = e.target.value;
      updateSubjectVisibility();
      applyFiltersAndRender();
    });
  }

  if (subjectSelect) {
    subjectSelect.addEventListener('change', e => {
      shopFilterState.subject = e.target.value;
      applyFiltersAndRender();
    });
  }

  if (applyBtn) {
    // Sekarang tombol "Terapkan Filter" hanya menjalankan filter yang sudah di state
    applyBtn.addEventListener('click', () => {
      applyFiltersAndRender();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetAllFilters();
    });
  }

  if (noResultsResetBtn) {
    noResultsResetBtn.addEventListener('click', () => {
      resetAllFilters();
    });
  }

  // Set nilai awal ke UI + atur visibilitas keilmuan
  syncFilterUIWithState();
  updateSubjectVisibility();
}

// =============================
// Reset & Sinkronisasi UI
// =============================

function resetAllFilters() {
  shopFilterState.search = '';
  shopFilterState.category = 'all';
  shopFilterState.subject = 'all';

  syncFilterUIWithState();
  applyFiltersAndRender();
}

function syncFilterUIWithState() {
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('filter-category');
  const subjectSelect = document.getElementById('filter-subject');

  if (searchInput) searchInput.value = shopFilterState.search || '';
  if (categorySelect) categorySelect.value = shopFilterState.category || 'all';
  if (subjectSelect) subjectSelect.value = shopFilterState.subject || 'all';

  renderActiveFiltersPills();
}

// Ambil filter dari URL (misal ?category=kitab&subject=fiqh&q=riyadus)
function applyFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');
  const subjectParam = params.get('subject');
  const searchParam = params.get('q');

  if (categoryParam) shopFilterState.category = categoryParam;
  if (subjectParam) shopFilterState.subject = subjectParam;
  if (searchParam) shopFilterState.search = searchParam;
}

// =============================
// Filtering Logic
// =============================

function applyFiltersAndRender() {
  if (!Array.isArray(shopAllProducts) || !shopAllProducts.length) {
    renderProducts([]);
    return;
  }

  const filtered = shopAllProducts.filter(prod => {
    // kategori
    if (shopFilterState.category && shopFilterState.category !== 'all') {
      if (prod.category !== shopFilterState.category) return false;
    }

    // keilmuan (hanya untuk kitab)
    if (
      shopFilterState.subject &&
      shopFilterState.subject !== 'all' &&
      prod.category === 'kitab'
    ) {
      const subjId =
        typeof prod.subject === 'string'
          ? prod.subject.toLowerCase()
          : (prod.subject?.id || '').toLowerCase();
      if (subjId !== shopFilterState.subject.toLowerCase()) return false;
    }

    // search
    if (shopFilterState.search) {
      const q = shopFilterState.search.toLowerCase();

      const titleId = (prod.title?.id || prod.title || '').toLowerCase();
      const titleAr = prod.title?.ar || '';
      const subjId = (prod.subject?.id || prod.subject || '').toLowerCase();
      const descId = (prod.description?.id || prod.description || '').toLowerCase();
      const authorId = (prod.author?.id || prod.author || '').toLowerCase();
      const tags = Array.isArray(prod.tags)
        ? prod.tags.join(' ').toLowerCase()
        : '';

      const match =
        titleId.includes(q) ||
        titleAr.includes(q) ||
        subjId.includes(q) ||
        descId.includes(q) ||
        authorId.includes(q) ||
        tags.includes(q);

      if (!match) return false;
    }

    return true;
  });

  renderProducts(filtered);
  setFilteredCount(filtered.length);
}

// =============================
// Rendering
// =============================

function renderProducts(list) {
  const grid = document.getElementById('shop-products');
  const emptyBlock = document.getElementById('shop-no-results');

  if (!grid) return;

  grid.innerHTML = '';

  if (!list.length) {
    if (emptyBlock) emptyBlock.hidden = false;
    setFilteredCount(0);
    return;
  }

  if (emptyBlock) emptyBlock.hidden = true;

  list.forEach(prod => {
    if (typeof window.createProductCard === 'function') {
      grid.appendChild(window.createProductCard(prod));
    } else {
      grid.appendChild(createFallbackCard(prod));
    }
  });
}

// Kartu fallback kalau createProductCard tidak ada
function createFallbackCard(prod) {
  const card = document.createElement('article');
  card.className = 'product-card hdr-hover';

  const title = (prod.title?.id || prod.title || 'Produk');
  const img =
    prod.images && prod.images.length
      ? prod.images[0]
      : 'assets/images/default-product.jpg';
  const priceText =
    typeof formatRupiah === 'function'
      ? formatRupiah(prod.price || 0)
      : 'Rp ' + (Number(prod.price) || 0).toLocaleString('id-ID');

  card.innerHTML = `
    <div class="product-media">
      <img src="${img}" alt="${title}">
    </div>
    <div class="product-body">
      <h3 class="product-title">${title}</h3>
      <div class="product-price-row">
        <span class="product-price">${priceText}</span>
      </div>
      <div class="product-card-actions">
        <a href="product.html?id=${encodeURIComponent(
          prod.id
        )}" class="btn btn-sm btn-secondary">Detail</a>
      </div>
    </div>
  `;

  return card;
}

// =============================
// Active Filter Pills
// =============================

function renderActiveFiltersPills() {
  const container = document.getElementById('active-filters');
  const listEl = document.getElementById('active-filters-list');
  if (!container || !listEl) return;

  listEl.innerHTML = '';

  const pills = [];

  if (shopFilterState.search) {
    pills.push({
      key: 'search',
      label: `Cari: "${shopFilterState.search}"`
    });
  }

  if (shopFilterState.category && shopFilterState.category !== 'all') {
    pills.push({
      key: 'category',
      label: `Kategori: ${shopFilterState.category}`
    });
  }

  if (shopFilterState.subject && shopFilterState.subject !== 'all') {
    pills.push({
      key: 'subject',
      label: `Keilmuan: ${shopFilterState.subject}`
    });
  }

  if (!pills.length) {
    container.hidden = true;
    return;
  }

  pills.forEach(pill => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-pill';
    btn.textContent = pill.label;
    btn.addEventListener('click', () => {
      clearFilterField(pill.key);
    });
    listEl.appendChild(btn);
  });

  container.hidden = false;
}

function clearFilterField(key) {
  switch (key) {
    case 'search':
      shopFilterState.search = '';
      break;
    case 'category':
      shopFilterState.category = 'all';
      break;
    case 'subject':
      shopFilterState.subject = 'all';
      break;
  }

  syncFilterUIWithState();
  applyFiltersAndRender();
}
