// FILE: assets/js/cart-page.js
// Halaman keranjang + checkout via WhatsApp

let cartItemsState = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('🛒 Inisialisasi halaman cart...');
  initCartPage();
});

function initCartPage() {
  // Load cart dari localStorage
  cartItemsState = getCartLocal();
  console.log('📦 Item di cart:', cartItemsState.length);
  
  normalizeCartState();
  renderCart();
  bindCartButtons();
  updateCartCustomerInfo();
}

// Pastikan setiap item punya properti yang kita butuhkan
function normalizeCartState() {
  cartItemsState.forEach(item => {
    if (typeof item.selected === 'undefined') {
      item.selected = true;
    }
    if (typeof item.quantity === 'undefined' || item.quantity <= 0) {
      item.quantity = 1;
    }
  });
  saveCartLocal(cartItemsState);
}

// =============================
// RENDER KERANJANG
// =============================
function renderCart() {
  const listEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  
  if (!listEl) {
    console.error('❌ Element #cart-items tidak ditemukan di HTML');
    return;
  }
  
  listEl.innerHTML = '';
  
  // ✅ PAKSA DISPLAY BLOCK
  listEl.style.display = 'flex';
  listEl.style.flexDirection = 'column';
  listEl.style.gap = '0.75rem';
  
  if (!cartItemsState.length) {
    console.log('⚠️ Keranjang kosong');
    if (emptyEl) emptyEl.hidden = false;
    if (listEl) listEl.style.display = 'none';
    updateCartSummary();
    return;
  }
  
  if (emptyEl) emptyEl.hidden = true;
  
  console.log('✅ Rendering', cartItemsState.length, 'item di cart');
  
  cartItemsState.forEach((item, index) => {
    const row = createCartRow(item, index);
    // ✅ PAKSA ROW VISIBLE
    row.style.display = 'grid';
    row.style.marginBottom = '0.75rem';
    listEl.appendChild(row);
  });
  
  updateCartSummary();
}

function createCartRow(item, index) {
  const row = document.createElement('div');
  row.className = 'cart-row';
  row.dataset.index = index;

  const title = item.title || 'Produk';
  const price = Number(item.price) || 0;
  const qty = Number(item.quantity) || 1;
  const subtotal = price * qty;
  const img = item.image || 'https://via.placeholder.com/80x100?text=Produk';
  const checked = item.selected ? 'checked' : '';

  row.innerHTML = `
    <div class="cart-col-product">
      <label class="cart-select-label">
        <input type="checkbox" class="cart-item-checkbox" ${checked} data-index="${index}">
      </label>
      <div class="cart-product-media">
        <img src="${img}" alt="${title}" onerror="this.src='https://via.placeholder.com/80x100?text=No+Image'">
      </div>
      <div class="cart-product-info">
        <h4 class="cart-product-title">${title}</h4>
      </div>
    </div>
    
    <div class="cart-col-price">
      <span>${formatRupiah(price)}</span>
    </div>
    
    <div class="cart-col-qty">
      <input type="number" class="cart-qty-input" value="${qty}" min="1" max="99" data-index="${index}">
    </div>
    
    <div class="cart-col-subtotal">
      <span>${formatRupiah(subtotal)}</span>
    </div>
    
    <div class="cart-col-remove">
      <button type="button" class="cart-remove-btn" data-index="${index}" title="Hapus">✕</button>
    </div>
  `;

  return row;
}

// =============================
// UPDATE SUMMARY
// =============================
function updateCartSummary() {
  const countEl = document.getElementById('cart-summary-count');
  const totalEl = document.getElementById('cart-summary-total');
  
  let totalItems = 0;
  let totalPrice = 0;

  cartItemsState.forEach(item => {
    if (item.selected) {
      totalItems += Number(item.quantity) || 0;
      totalPrice += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }
  });

  if (countEl) {
    countEl.textContent = totalItems > 0 ? `${totalItems} item` : 'Belum ada item yang dipilih';
  }
  
  if (totalEl) {
    totalEl.textContent = formatRupiah(totalPrice);
  }

  // Update badge di navbar (gunakan fungsi global kalau ada)
  if (typeof window.updateCartCount === 'function') {
    window.updateCartCount();
  }
}

// =============================
// UPDATE CUSTOMER INFO
// =============================
function updateCartCustomerInfo() {
  const infoEl = document.getElementById('cart-customer-info');
  if (!infoEl) return;

  const customer = getCustomerLocal();
  
  if (!customer || !customer.name) {
    infoEl.innerHTML = `
      <span style="color: #6b7280;">Belum ada profil tersimpan.</span><br>
      <a href="login.html?redirect=cart.html" style="color: #0f766e; text-decoration: underline;">Klik di sini untuk mengisi profil</a>
    `;
    return;
  }

  let html = `<strong>Nama:</strong> ${customer.name}<br>`;
  html += `<strong>WhatsApp:</strong> ${customer.whatsapp || '-'}<br>`;
  if (customer.short_address) {
    html += `<strong>Alamat:</strong> ${customer.short_address}`;
  }
  
  infoEl.innerHTML = html;
}

// =============================
// EVENT HANDLERS
// =============================
function bindCartButtons() {
  const listEl = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const updateBtn = document.getElementById('cart-update-btn');

  if (listEl) {
    // Checkbox select item
    listEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('cart-item-checkbox')) {
        const index = Number(e.target.dataset.index);
        if (cartItemsState[index]) {
          cartItemsState[index].selected = e.target.checked;
          saveCartLocal(cartItemsState);
          updateCartSummary();
        }
      }
    });

    // Input quantity manual
    listEl.addEventListener('input', (e) => {
      if (e.target.classList.contains('cart-qty-input')) {
        const index = Number(e.target.dataset.index);
        let newQty = Number(e.target.value) || 1;
        if (newQty < 1) newQty = 1;
        if (newQty > 99) newQty = 99;
        
        if (cartItemsState[index]) {
          cartItemsState[index].quantity = newQty;
          saveCartLocal(cartItemsState);
          renderCart();
        }
      }
    });

    // Tombol + dan -
    listEl.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      
      // Tombol minus
      if (e.target.classList.contains('cart-qty-minus')) {
        if (cartItemsState[index]) {
          let newQty = cartItemsState[index].quantity - 1;
          if (newQty < 1) newQty = 1;
          cartItemsState[index].quantity = newQty;
          saveCartLocal(cartItemsState);
          renderCart();
        }
      }
      
      // Tombol plus
      if (e.target.classList.contains('cart-qty-plus')) {
        if (cartItemsState[index]) {
          let newQty = cartItemsState[index].quantity + 1;
          if (newQty > 99) newQty = 99;
          cartItemsState[index].quantity = newQty;
          saveCartLocal(cartItemsState);
          renderCart();
        }
      }
      
      // Tombol hapus
      if (e.target.classList.contains('cart-remove-btn')) {
        const item = cartItemsState[index];
        if (confirm(`Hapus "${item.title}" dari keranjang?`)) {
          cartItemsState.splice(index, 1);
          saveCartLocal(cartItemsState);
          renderCart();
        }
      }
    });
  }

  // Tombol update keranjang
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      renderCart();
      alert('✅ Keranjang berhasil diperbarui');
    });
  }

  // Tombol checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
}

// =============================
// CHECKOUT VIA WHATSAPP
// =============================
function handleCheckout() {
  const selectedItems = cartItemsState.filter(item => item.selected);

  if (!selectedItems.length) {
    alert('⚠️ Pilih minimal 1 produk untuk checkout');
    return;
  }

  // Ambil profil customer
  const customer = getCustomerLocal();
  
  // Buat pesan WhatsApp
  let message = '*PESANAN BARU - ReeezdBaraqah*\n';
  message += '━━━━━━━━━━━━━━━━━━━━\n\n';
  
  // Info customer (jika ada)
  if (customer && customer.name) {
    message += '*Data Pemesan:*\n';
    message += `Nama: ${customer.name}\n`;
    message += `WhatsApp: ${customer.whatsapp || '-'}\n`;
    if (customer.short_address) {
      message += `Alamat: ${customer.short_address}\n`;
    }
    message += '\n';
  }
  
  message += '*Daftar Produk:*\n';

  let totalPrice = 0;
  selectedItems.forEach((item, i) => {
    const subtotal = item.price * item.quantity;
    totalPrice += subtotal;
    message += `${i + 1}. ${item.title}\n`;
    message += `   Qty: ${item.quantity} × ${formatRupiah(item.price)}\n`;
    message += `   Subtotal: ${formatRupiah(subtotal)}\n\n`;
  });

  message += '━━━━━━━━━━━━━━━━━━━━\n';
  message += `*Total: ${formatRupiah(totalPrice)}*\n\n`;
  message += '_Mohon konfirmasi ketersediaan stok dan ongkos kirim. Terima kasih!_';

  // Encode untuk URL
  const encodedMessage = encodeURIComponent(message);
  const waNumber = '6282264925085'; // GANTI dengan nomor WA toko Anda
  const waURL = `https://wa.me/${waNumber}?text=${encodedMessage}`;

  // Buka WhatsApp
  window.open(waURL, '_blank');
  
  console.log('📱 Membuka WhatsApp checkout...');
}

// =============================
// HELPER FUNCTIONS - FIXED (TANPA RECURSION)
// =============================
function formatRupiah(value) {
  const num = Number(value) || 0;
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    return 'Rp ' + num.toLocaleString('id-ID');
  }
}

// ✅ LANGSUNG AKSES localStorage - TIDAK ADA RECURSIVE CALL
function getCartLocal() {
  try {
    const raw = localStorage.getItem('rb_cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading cart:', err);
    return [];
  }
}

function saveCartLocal(cart) {
  try {
    localStorage.setItem('rb_cart', JSON.stringify(cart || []));
  } catch (err) {
    console.error('Error saving cart:', err);
  }
}

function getCustomerLocal() {
  try {
    const raw = localStorage.getItem('rb_customer');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading customer:', err);
    return null;
  }
}