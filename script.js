let transaksi = JSON.parse(localStorage.getItem('transaksi')) || [];

function tambahTransaksi() {
  const tanggal = document.getElementById('tanggal').value;
  const jenis = document.getElementById('jenis').value;
  const kategori = document.getElementById('kategori').value || '-';
  const nominal = parseInt(document.getElementById('nominal').value);
  const persentase = parseFloat(document.getElementById('persentase').value);

  if (!tanggal || !nominal) { alert('Isi semua data transaksi!'); return; }

  transaksi.push({ tanggal, jenis, kategori, nominal });
  localStorage.setItem('transaksi', JSON.stringify(transaksi));
  updateTampilan();

  document.getElementById('tanggal').value = '';
  document.getElementById('kategori').value = '';
  document.getElementById('nominal').value = '';
}

function updateTampilan() {
  const riwayatTabel = document.getElementById('riwayat');
  const rekapTabel = document.getElementById('rekapMingguan');
  const alertBox = document.getElementById('alert-box');
  riwayatTabel.innerHTML = '';
  rekapTabel.innerHTML = '';
  alertBox.innerHTML = '';

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  const persentase = parseFloat(document.getElementById('persentase').value) / 100;

  const filterBulan = document.getElementById('filterBulan').value;

  transaksi.forEach(t => {
    // Filter bulan
    if (filterBulan && !t.tanggal.startsWith(filterBulan)) return;

    if (t.jenis === 'pemasukan') totalPemasukan += t.nominal;
    else totalPengeluaran += t.nominal;

    riwayatTabel.innerHTML += `<tr>
      <td>${t.tanggal}</td>
      <td>${t.jenis}</td>
      <td>${t.kategori}</td>
      <td>Rp ${t.nominal}</td>
    </tr>`;
  });

  const saldo = totalPemasukan - totalPengeluaran;
  const tabungan = saldo * persentase;

  document.getElementById('totalPemasukan').innerText = totalPemasukan;
  document.getElementById('totalPengeluaran').innerText = totalPengeluaran;
  document.getElementById('saldo').innerText = saldo;
  document.getElementById('modal').innerText = tabungan;

  if (totalPengeluaran > totalPemasukan * 0.8) {
    alertBox.innerHTML = '<div class="alert">Peringatan: Pengeluaran sudah >80% dari pemasukan!</div>';
  }

  updateRekapMingguan(filterBulan);
  updateGrafik(filterBulan);
}

function updateRekapMingguan(filterBulan) {
  const rekap = {};
  transaksi.forEach(t => {
    if (filterBulan && !t.tanggal.startsWith(filterBulan)) return;
    const date = new Date(t.tanggal);
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day + 1);
    const weekKey = startOfWeek.toISOString().split('T')[0];

    if (!rekap[weekKey]) rekap[weekKey] = { pemasukan: 0, pengeluaran: 0 };

    if (t.jenis === 'pemasukan') rekap[weekKey].pemasukan += t.nominal;
    else rekap[weekKey].pengeluaran += t.nominal;
  });

  const rekapTabel = document.getElementById('rekapMingguan');
  const persentase = parseFloat(document.getElementById('persentase').value) / 100;

  for (let key in rekap) {
    const saldo = rekap[key].pemasukan - rekap[key].pengeluaran;
    const tabungan = saldo * persentase;
    rekapTabel.innerHTML += `<tr>
      <td>${key}</td>
      <td>Rp ${rekap[key].pemasukan}</td>
      <td>Rp ${rekap[key].pengeluaran}</td>
      <td>Rp ${saldo}</td>
      <td>Rp ${tabungan}</td>
    </tr>`;
  }
}

function updateGrafik(filterBulan) {
  const rekap = {};
  transaksi.forEach(t => {
    if (filterBulan && !t.tanggal.startsWith(filterBulan)) return;
    const date = new Date(t.tanggal);
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day + 1);
    const weekKey = startOfWeek.toISOString().split('T')[0];

    if (!rekap[weekKey]) rekap[weekKey] = { pemasukan: 0, pengeluaran: 0 };
    if (t.jenis === 'pemasukan') rekap[weekKey].pemasukan += t.nominal;
    else rekap[weekKey].pengeluaran += t.nominal;
  });

  const labels = Object.keys(rekap);
  const dataPemasukan = labels.map(l => rekap[l].pemasukan);
  const dataPengeluaran = labels.map(l => rekap[l].pengeluaran);

  const ctx = document.getElementById('grafikMingguan').getContext('2d');
  if (window.grafik) window.grafik.destroy();
  window.grafik = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Pemasukan', data: dataPemasukan, backgroundColor: '#4CAF50' },
        { label: 'Pengeluaran', data: dataPengeluaran, backgroundColor: '#f44336' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } }
    }
  });
}

updateTampilan();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker Registered'));
}
