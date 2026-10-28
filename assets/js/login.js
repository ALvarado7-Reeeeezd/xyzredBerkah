// FILE: assets/js/login.js
// Login / profil customer simple berbasis localStorage

document.addEventListener('DOMContentLoaded', () => {
  initCustomerLoginPage();
});

function initCustomerLoginPage() {
  const form = document.getElementById('login-form');
  const nameInput = document.getElementById('customer-name');
  const waInput = document.getElementById('customer-wa');
  const addrInput = document.getElementById('customer-short-address');
  const clearBtn = document.getElementById('login-clear-btn');
  const statusText = document.getElementById('login-status-text');

  if (!form || !nameInput || !waInput) return;

  // Prefill jika sudah ada profile
  const currentProfile = getCustomer();
  if (currentProfile) {
    nameInput.value = currentProfile.name || '';
    waInput.value = currentProfile.whatsapp || '';
    if (addrInput) addrInput.value = currentProfile.short_address || '';

    if (statusText) {
      statusText.textContent = 'Profil customer sudah tersimpan di perangkat ini. Anda dapat mengubahnya di bawah.';
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const whatsapp = waInput.value.trim();
    const shortAddress = addrInput ? addrInput.value.trim() : '';

    if (!name || !whatsapp) {
      alert('Nama lengkap dan nomor WhatsApp wajib diisi.');
      return;
    }

    // validasi WA sederhana: hanya angka, panjang minimal
    const waDigits = whatsapp.replace(/\D+/g, '');
    if (waDigits.length < 8) {
      alert('Nomor WhatsApp tampaknya belum benar. Mohon periksa kembali.');
      return;
    }

    const profile = {
      name,
      whatsapp: waDigits,
      short_address: shortAddress
    };

    saveCustomer(profile);

    if (statusText) {
      statusText.textContent = 'Profil tersimpan. Anda dapat langsung menggunakan untuk checkout.';
    }

    alert('Profil customer berhasil disimpan.');

    // redirect jika ada ?redirect=...
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.location.href = redirect;
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!getCustomer()) {
        alert('Belum ada profil yang tersimpan di perangkat ini.');
        return;
      }

      const yakin = confirm('Yakin ingin menghapus profil dari perangkat ini?');
      if (!yakin) return;

      clearCustomer();
      nameInput.value = '';
      waInput.value = '';
      if (addrInput) addrInput.value = '';
      if (statusText) {
        statusText.textContent = 'Profil customer telah dihapus. Isi kembali untuk menyimpan data baru.';
      }

      alert('Profil customer berhasil dihapus dari perangkat ini.');
    });
  }
}
