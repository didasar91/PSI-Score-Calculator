// --- Navigasi Tab ---
function showCalculator(mode) {
    document.body.className = 'mode-' + mode;
    const isPsi = (mode === 'psi');
    
    document.getElementById('calc-psi-content').style.display = isPsi ? 'block' : 'none';
    document.getElementById('calc-natrium-content').style.display = isPsi ? 'none' : 'block';
    document.querySelector('.psi-only-result').style.display = isPsi ? 'block' : 'none';
    document.querySelector('.natrium-only-result').style.display = isPsi ? 'none' : 'block';
    
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', !isPsi);
}

// --- Sinkronisasi Data Pasien ---
document.getElementById('nama').addEventListener('input', e => document.getElementById('displayNama').textContent = e.target.value || '-');
document.getElementById('noMR').addEventListener('input', e => document.getElementById('displayNoMR').textContent = e.target.value || '-');
document.getElementById('inputDPJP').addEventListener('input', e => document.getElementById('displayDPJP').textContent = e.target.value || '');
document.getElementById('tglAsesmen').addEventListener('change', e => document.getElementById('displayTglAsesmen').textContent = e.target.value || '-');

// Update Umur & Statistik Dasar
document.getElementById('tglLahir').addEventListener('change', updateStats);
document.getElementById('jk').addEventListener('change', updateStats);
document.getElementById('bb').addEventListener('input', calculateNatrium);
document.getElementById('naSerum').addEventListener('input', calculateNatrium);
document.getElementById('naInfus').addEventListener('change', calculateNatrium);

function updateStats() {
    const tgl = document.getElementById('tglLahir').value;
    if(!tgl) return;

    const dob = new Date(tgl);
    const age = new Date().getFullYear() - dob.getFullYear();
    document.getElementById('displayTglLahir').textContent = tgl;
    document.getElementById('displayUmur').textContent = age + " Tahun";

    // Hitung Skor Usia PSI [cite: 29]
    const jk = document.getElementById('jk').value;
    let ageScore = 0;
    if(jk === 'P') {
        ageScore = Math.max(0, age - 10);
    } else {
        ageScore = age;
    }
    document.getElementById('scoreUsia').textContent = ageScore;

    calculatePSI();
    calculateNatrium();
}

// --- Logika Kalkulator PSI ---
document.querySelectorAll('.psi-check').forEach(box => {
    box.addEventListener('change', () => {
        const id = box.dataset.id;
        // Ambil elemen target score, contoh: 'scoreKeganasan'
        const scoreId = 'score' + id.charAt(0).toUpperCase() + id.slice(1);
        const targetEl = document.getElementById(scoreId);
        if(targetEl) targetEl.textContent = box.checked ? box.dataset.score : 0;
        calculatePSI();
    });
});

function calculatePSI() {
    let total = parseInt(document.getElementById('scoreUsia').textContent) || 0;
    document.querySelectorAll('.psi-check').forEach(c => {
        if(c.checked) total += parseInt(c.dataset.score);
    });

    document.getElementById('totalScore').textContent = total;

    // Klasifikasi Risiko 
    let kelas = "-", mort = "-", risiko = "-";
    if(total > 130) { kelas = "V"; mort = "29.2%"; risiko = "Berat"; }
    else if(total >= 91) { kelas = "IV"; mort = "8.2%"; risiko = "Sedang"; }
    else if(total >= 71) { kelas = "III"; mort = "2.8%"; risiko = "Rendah"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; risiko = "Rendah"; }
    else { kelas = "I"; mort = "0.1%"; risiko = "Rendah"; }

    document.getElementById('kelasRisiko').textContent = kelas;
    document.getElementById('mortalityRate').textContent = mort;
}

// --- Logika Kalkulator Natrium (Adrogué-Madias) ---
function calculateNatrium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const naSerum = parseFloat(document.getElementById('naSerum').value);
    const naInfus = parseFloat(document.getElementById('naInfus').value);
    const jk = document.getElementById('jk').value;
    const umur = parseInt(document.getElementById('displayUmur').textContent) || 30;

    // Validasi input
    if(!bb || !naSerum || !jk) {
        document.getElementById('displayDelta').textContent = "0";
        document.getElementById('txtDelta').textContent = "0";
        return;
    }

    // Tentukan Faktor TBW
    let faktor = (jk === 'L') ? 0.6 : 0.5;
    if(umur > 65) faktor -= 0.1; // Lansia faktor air tubuh berkurang

    const tbw = bb * faktor;
    // Rumus: (Na Infus - Na Serum) / (TBW + 1)
    const delta = (naInfus - naSerum) / (tbw + 1);

    // Update Tampilan
    document.getElementById('txtFaktor').textContent = faktor;
    document.getElementById('txtTBW').textContent = tbw.toFixed(1);
    document.getElementById('txtDelta').textContent = delta.toFixed(2);
    document.getElementById('displayTBW').textContent = tbw.toFixed(1);
    document.getElementById('displayDelta').textContent = delta.toFixed(2);
}
