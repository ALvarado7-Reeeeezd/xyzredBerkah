// assets/js/product.js
// Detail Produk – ReeezdBaraqah

// ============================================
// Helper kecil khusus halaman produk
// ============================================

// Ambil param ?id=...
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Ambil teks dari string atau object {id, ar, en}
function getLocalizedText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.id || val.en || val.ar || '';
}

// Format rupiah – pakai yang global kalau ada
function formatPrice(val) {
  if (typeof window.formatRupiah === 'function') {
    return window.formatRupiah(val);
  }
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(val);
  }
  const num = Number(val) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Load semua produk dari JSON (standalone, tidak tergantung file lain)
async function fetchAllProducts() {
  const res = await fetch('data/products.json', { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error('Gagal mengambil data produk');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ============================================
// Render gallery gambar (maks 8 thumbnail)
// ============================================
function renderGallery(prod) {
  const mainImageEl = document.getElementById('product-main-image');
  const thumbnailsContainer = document.getElementById('product-thumbnails');

  if (!mainImageEl || !thumbnailsContainer) return;

  // Ambil list gambar dari produk
  let images = [];
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    images = prod.images.filter(Boolean);
  }

  // Fallback jika tidak ada gambar di JSON
  if (images.length === 0) {
    images = ['assets/images/default-product.jpg'];
  }

  // Wajib minimal 2, maksimal 8 (kalau cuma 1 digandakan saja)
  if (images.length === 1) {
    images = [images[0], images[0]];
  }
  if (images.length > 8) {
    images = images.slice(0, 8);
  }

  // Set gambar utama
  mainImageEl.src = images[0];
  mainImageEl.alt = getLocalizedText(prod.title) || 'Produk';

  // Bersihkan thumbnail
  thumbnailsContainer.innerHTML = '';

  images.forEach((src, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className =
      'product-thumb' + (index === 0 ? ' product-thumb--active' : '');
    thumb.innerHTML = `
      <img src="${src}" alt="Thumbnail ${index + 1}" loading="lazy">
    `;

    thumb.addEventListener('click', () => {
      // ganti gambar utama
      mainImageEl.src = src;
      mainImageEl.alt = getLocalizedText(prod.title) || 'Produk';

      // update state aktif
      const allThumbs = thumbnailsContainer.querySelectorAll(
        '.product-thumb'
      );
      allThumbs.forEach((t) =>
        t.classList.remove('product-thumb--active')
      );
      thumb.classList.add('product-thumb--active');
    });

    thumbnailsContainer.appendChild(thumb);
  });
}

// ============================================
// Render detail informasi produk
// ============================================
function renderProductDetail(prod) {
  const titleEl = document.getElementById('product-title');
  const titleArEl = document.getElementById('product-title-ar');
  const categoryChip = document.getElementById('product-category-chip');
  const subjectChip = document.getElementById('product-subject-chip');

  const authorEl = document.getElementById('product-author');
  const publisherEl = document.getElementById('product-publisher');
  const coverTypeEl = document.getElementById('product-cover-type');

  const priceEl = document.getElementById('product-price');
  const stockStatusEl = document.getElementById('product-stock-status');
  const stockTextEl = document.getElementById('product-stock-text');

  const descriptionEl = document.getElementById('product-description');
  const servicesContainer = document.getElementById('product-services');
  const tagsContainer = document.getElementById('product-tags');

  // Judul
  const titleId = prod.title?.id || getLocalizedText(prod.title) || 'Tanpa Judul';
  const titleAr = prod.title?.ar || '';

  if (titleEl) titleEl.textContent = titleId;
  if (titleArEl) titleArEl.textContent = titleAr;

  // Kategori
  const category = prod.category || 'lainnya';
  let categoryLabel = 'Lainnya';
  switch (category) {
    case 'kitab':
      categoryLabel = 'Kitab';
      break;
    case 'pena':
      categoryLabel = 'Pena & Penanda';
      break;
    case 'aksesoris':
      categoryLabel = 'Aksesoris Kitab';
      break;
    case 'perlengkapan':
      categoryLabel = 'Perlengkapan Ngaji';
      break;
  }
  if (categoryChip) {
    categoryChip.textContent = categoryLabel;
  }

  // Keilmuan (khusus kitab)
  let subjectText = '';
  if (prod.subject) {
    if (typeof prod.subject === 'string') {
      subjectText = prod.subject;
    } else {
      // contoh: { id: "fiqh", ar: "الفقه", label: "Fiqh – الفقه" }
      subjectText =
        prod.subject.label ||
        prod.subject.id ||
        prod.subject.ar ||
        '';
    }
  }
  if (subjectChip) {
    if (category === 'kitab' && subjectText) {
      subjectChip.textContent = subjectText;
      subjectChip.classList.remove('hidden');
    } else {
      subjectChip.textContent = '';
      subjectChip.classList.add('hidden');
    }
  }

  // Penulis
  let authorText = '';
  if (prod.author) {
    if (typeof prod.author === 'string') {
      authorText = prod.author;
    } else {
      authorText =
        prod.author.id || prod.author.en || prod.author.ar || '';
    }
  }
  if (authorEl) authorEl.textContent = authorText || '-';

  // Penerbit
  let publisherText = '';
  if (prod.publisher) {
    if (typeof prod.publisher === 'string') {
      publisherText = prod.publisher;
    } else {
      publisherText =
        prod.publisher.id ||
        prod.publisher.en ||
        prod.publisher.ar ||
        '';
    }
  }
  if (publisherEl) publisherEl.textContent = publisherText || '-';

  // Jenis cover
  if (coverTypeEl) {
    let coverLabel = '-';
    if (prod.cover_type === 'hardcover') coverLabel = 'Hardcover';
    else if (prod.cover_type === 'softcover') coverLabel = 'Softcover';
    coverTypeEl.textContent = coverLabel;
  }

  // Harga
  if (priceEl) {
    priceEl.textContent = formatPrice(prod.price || 0);
  }

  // Stok & status
  let stockStatusText = '';
  let stockNoteText = '';
  let stockClass = '';

  const stock = typeof prod.stock === 'number' ? prod.stock : null;

  if (prod.is_preorder) {
    stockStatusText = 'Pre-order';
    stockNoteText = 'Produk dapat dipesan, waktu kirim mengikuti konfirmasi admin.';
    stockClass = 'stock-label stock-label--preorder';
  } else if (stock === 0) {
    stockStatusText = 'Stok Habis';
    stockNoteText =
      'Saat ini stok kosong. Silakan hubungi admin untuk info ketersediaan berikutnya.';
    stockClass = 'stock-label stock-label--out';
  } else if (stock !== null && stock <= 5) {
    stockStatusText = 'Stok Terbatas';
    stockNoteText = `Tersisa sekitar ${stock} eksemplar.`;
    stockClass = 'stock-label stock-label--low';
  } else if (stock !== null) {
    stockStatusText = 'Tersedia';
    stockNoteText = `Stok sekitar ${stock} eksemplar.`;
    stockClass = 'stock-label stock-label--ok';
  } else {
    stockStatusText = 'Tersedia';
    stockNoteText =
      'Stok tersedia, jumlah pasti akan dikonfirmasi admin saat pemesanan.';
    stockClass = 'stock-label stock-label--ok';
  }

  if (stockStatusEl) {
    stockStatusEl.textContent = stockStatusText;
    stockStatusEl.className = stockClass;
  }
  if (stockTextEl) {
    stockTextEl.textContent = stockNoteText;
  }

  // Deskripsi
  if (descriptionEl) {
    const descText = getLocalizedText(prod.description);
    descriptionEl.textContent = descText || '-';
  }

  // Layanan tambahan (services)
  if (servicesContainer) {
    servicesContainer.innerHTML = '';

    if (prod.services && typeof prod.services === 'object') {
      const entries = Object.entries(prod.services);
      if (entries.length) {
        const list = document.createElement('ul');
        list.className = 'service-list';

        entries.forEach(([key, value]) => {
          if (!value) return;

          let label = '';
          if (key === 'cover_clear') label = 'Tambahan sampul bening';
          else if (key === 'full_cover_package')
            label = 'Paket full cover (sampul + penguatan)';
          else label = key;

          const li = document.createElement('li');
          li.className = 'service-item';
          li.innerHTML = `
            <span class="service-name">${label}</span>
            <span class="service-price">${formatPrice(value)}</span>
          `;
          list.appendChild(li);
        });

        servicesContainer.appendChild(list);
      } else {
        servicesContainer.textContent = 'Tidak ada layanan tambahan khusus.';
      }
    } else {
      servicesContainer.textContent = 'Tidak ada layanan tambahan khusus.';
    }
  }

  // Tag / keyword
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    if (Array.isArray(prod.tags) && prod.tags.length) {
      prod.tags.forEach((tag) => {
        if (!tag) return;
        const span = document.createElement('span');
        span.className = 'tag-chip';
        span.textContent = tag;
        tagsContainer.appendChild(span);
      });
    }
  }
}

// ============================================
// Produk terkait
// ============================================
function renderRelatedProducts(currentProd, allProducts) {
  const container = document.getElementById('related-products');
  if (!container) return;

  container.innerHTML = '';

  const related = allProducts
    .filter((p) => p.id !== currentProd.id)
    .filter((p) => {
      // Prioritas: kategori & keilmuan sama
      if (p.category !== currentProd.category) return false;
      if (
        currentProd.category === 'kitab' &&
        currentProd.subject &&
        p.subject
      ) {
        const curKey =
          typeof currentProd.subject === 'string'
            ? currentProd.subject
            : currentProd.subject.id;
        const otherKey =
          typeof p.subject === 'string' ? p.subject : p.subject.id;

        if (curKey && otherKey && curKey !== otherKey) return false;
      }
      return true;
    })
    .slice(0, 4); // maksimal 4 produk terkait

  if (!related.length) {
    container.innerHTML =
      '<p class="related-empty">Belum ada produk terkait yang dapat ditampilkan.</p>';
    return;
  }

  related.forEach((p) => {
    if (typeof window.createProductCard === 'function') {
      const card = window.createProductCard(p);
      container.appendChild(card);
    }
  });
}

// ============================================
// Event tombol cart & wishlist
// ============================================
function initProductActions(prod) {
  const qtyInput = document.getElementById('product-qty');
  const btnAddCart = document.getElementById('btn-add-to-cart');
  const btnAddWishlist = document.getElementById('btn-add-to-wishlist');

  const getQty = () => {
    const val = Number(qtyInput?.value || 1);
    return !val || val < 1 ? 1 : Math.floor(val);
  };

  if (btnAddCart) {
    btnAddCart.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = getQty();

      if (typeof window.addToCart === 'function') {
        window.addToCart(prod.id, qty);
      } else if (typeof window.addToCartByObject === 'function') {
        window.addToCartByObject(prod, qty);
      } else {
        console.warn('addToCart() belum tersedia di global');
      }
    });
  }

  if (btnAddWishlist) {
    btnAddWishlist.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.addToWishlist === 'function') {
        window.addToWishlist(prod.id);
      } else {
        console.warn('addToWishlist() belum tersedia di global');
      }
    });
  }
}

// ============================================
// INIT
// ============================================
async function initProductPage() {
  const notFoundSection = document.getElementById('product-not-found');
  const detailSection = document.getElementById('product-detail-section');
  
  const showNotFound = () => {
    if (detailSection) detailSection.classList.add('hidden');
    if (notFoundSection) notFoundSection.classList.remove('hidden');
  };

  try {
    const id = getProductIdFromUrl();
    if (!id) {
      console.warn('ID produk tidak ditemukan di URL');
      showNotFound();
      return;
    }

    // PENTING: Load products DULU sebelum cari by ID
    const allProducts = await fetchAllProducts();
    
    if (!allProducts || !allProducts.length) {
      console.error('Data produk kosong atau gagal dimuat');
      showNotFound();
      return;
    }

    const product = allProducts.find((p) => p.id === id);
    
    if (!product) {
      console.warn('Produk tidak ditemukan di products.json:', id);
      showNotFound();
      return;
    }

    // Tampilkan detail
    if (detailSection) detailSection.classList.remove('hidden');
    if (notFoundSection) notFoundSection.classList.add('hidden');
    
    renderGallery(product);
    renderProductDetail(product);
    renderRelatedProducts(product, allProducts);
    initProductActions(product);
    
  } catch (err) {
    console.error('Gagal memuat halaman produk:', err);
    showNotFound();
  }
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
});

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
});