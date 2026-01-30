let currentMode = 'psi';

function showCalculator(mode) {
    currentMode = mode;
    document.body.className = 'mode-' + mode;
    const isPsi = (mode === 'psi');
    
    // Toggle Konten Utama
    document.getElementById('calc-psi-content').style.display = isPsi ? 'block' : 'none';
    document.getElementById('calc-natrium-content').style.display = !isPsi ? 'block' : 'none';
    
    // Toggle Output Box Kanan Atas
    document.getElementById('psi-output-box').style.display = isPsi ? 'block' : 'none';
    document.getElementById('natrium-output-box').style.display = !isPsi ? 'block' : 'none';
    
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', !isPsi);
}

// Data Binding & Umur
document.getElementById('tglLahir').addEventListener('change', updateStats);
document.getElementById('jk').addEventListener('change', updateStats);

function updateStats() {
    const tgl = document.getElementById('tglLahir').value;
    if(!tgl) return;
    const dob = new Date(tgl);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    
    document.getElementById('displayUmur').textContent = age + " Tahun";
    const jk = document.getElementById('jk').value;
    
    // Skor PSI Usia (Berdasarkan PDF Rekomendasi)
    document.getElementById('scoreUsia').textContent = (jk === 'P') ? Math.max(0, age - 10) : age; [cite: 29]
    
    calculatePSI();
    calculateNatrium();
}

function calculateNatrium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const naSerum = parseFloat(document.getElementById('naSerum').value);
    const naInfus = parseFloat(document.getElementById('naInfus').value);
    const target = parseFloat(document.getElementById('targetNa').value) || 8;
    const jk = document.getElementById('jk').value;
    const age = parseInt(document.getElementById('displayUmur').textContent) || 30;

    if(!bb || !naSerum || !jk) return;

    // LOGIKA TBW (Termasuk Penyesuaian Anak & Lansia)
    let factor = 0.6; // Default Anak-anak & Pria Dewasa
    if (age > 18) {
        if (jk === 'P') {
            factor = (age > 65) ? 0.45 : 0.5;
        } else {
            factor = (age > 65) ? 0.5 : 0.6;
        }
    }
    
    const tbw = bb * factor; [cite: 81]
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1); [cite: 81]
    const totalVolumeMl = (target / deltaPerLiter) * 1000;
    const botolCount = Math.ceil(totalVolumeMl / 500); 

    const selectInfus = document.getElementById('naInfus');
    const namaCairan = selectInfus.options[selectInfus.selectedIndex].text.split(' (')[0];

    document.getElementById('txtTBW').textContent = tbw.toFixed(1) + " L";
    document.getElementById('txtDelta').textContent = deltaPerLiter.toFixed(2) + " mEq/L";
    document.getElementById('txtBotolDisplay').textContent = botolCount + " Botol " + namaCairan + " 500 mL";
    
    document.getElementById('displayDelta').textContent = deltaPerLiter.toFixed(2);
    document.getElementById('displayBotol').textContent = botolCount;
}
// ... (calculatePSI & Listener lainnya tetap sama)
