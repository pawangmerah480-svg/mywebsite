document.addEventListener('DOMContentLoaded', () => {
    const stored = JSON.parse(localStorage.getItem('nyxff_admin_accounts')) || accounts;
    const tbody = document.getElementById('adminAccountList');
    function render() {
        tbody.innerHTML = stored.map(a => `<tr><td>${a.kode}</td><td>${a.rank}</td><td>Rp${a.harga.toLocaleString()}</td><td>${a.status}</td><td><button onclick="editAccount('${a.id}')">Edit</button> <button onclick="deleteAccount('${a.id}')">Hapus</button></td></tr>`).join('');
        document.getElementById('totalAkun').textContent = stored.length;
        document.getElementById('totalTerjual').textContent = stored.filter(a => a.status === 'sold').length;
        document.getElementById('totalPendapatan').textContent = 'Rp' + stored.reduce((sum, a) => sum + (a.status === 'sold' ? a.harga : 0), 0).toLocaleString();
    }
    window.editAccount = (id) => {
        const acc = stored.find(a => a.id === id);
        if (acc) {
            document.getElementById('adminKode').value = acc.kode;
            document.getElementById('adminRank').value = acc.rank;
            document.getElementById('adminHarga').value = acc.harga;
            document.getElementById('adminStatus').value = acc.status;
        }
    };
    window.deleteAccount = (id) => {
        const updated = stored.filter(a => a.id !== id);
        localStorage.setItem('nyxff_admin_accounts', JSON.stringify(updated));
        location.reload();
    };
    document.getElementById('adminAccountForm').addEventListener('submit', e => {
        e.preventDefault();
        const newAcc = {
            id: 'ff' + Date.now(),
            kode: document.getElementById('adminKode').value,
            rank: document.getElementById('adminRank').value,
            harga: parseInt(document.getElementById('adminHarga').value),
            status: document.getElementById('adminStatus').value,
        };
        stored.push(newAcc);
        localStorage.setItem('nyxff_admin_accounts', JSON.stringify(stored));
        render();
        e.target.reset();
    });
    render();
});