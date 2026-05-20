// js/admin.js
// Admin panel logic untuk admin.html (digunakan terpisah)
document.addEventListener('DOMContentLoaded', () => {
    const accountList = document.getElementById('adminAccountList');
    if (!accountList) return;
    function renderAdminAccounts() {
        const stored = JSON.parse(localStorage.getItem('nyxff_admin_accounts')) || accounts;
        accountList.innerHTML = stored.map(acc => `
            <tr>
                <td>${acc.kode}</td><td>${acc.rank}</td><td>Rp${acc.harga}</td><td>${acc.status}</td>
                <td><button onclick="editAccount('${acc.id}')">Edit</button> <button onclick="deleteAccount('${acc.id}')">Hapus</button></td>
            </tr>
        `).join('');
    }
    window.editAccount = (id) => alert('Fitur edit dalam pengembangan.');
    window.deleteAccount = (id) => {
        let stored = JSON.parse(localStorage.getItem('nyxff_admin_accounts')) || accounts;
        stored = stored.filter(a => a.id !== id);
        localStorage.setItem('nyxff_admin_accounts', JSON.stringify(stored));
        renderAdminAccounts();
    };
    renderAdminAccounts();
});