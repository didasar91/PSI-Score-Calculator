let currentMode = 'psi';

function showCalculator(mode) {
    currentMode = mode;
    document.body.className = 'mode-' + mode;
    const isPsi = (mode === 'psi');
    document.getElementById('calc-psi-content').style.display = isPsi ? 'block' : 'none';
    document.getElementById('calc-natrium-content').style.display = !isPsi ? 'block' : 'none';
    document.getElementById('psi-output-box').style.display = isPsi ? 'block' : 'none';
    document.getElementById('natrium-output-box').style.display = !isPsi ? 'block' : 'none';
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', !isPsi);
}

// Data Binding
document.getElementById('nama').addEventListener('input', e => document.getElementById('displayNama').textContent = e.target.value || '-');
document.getElementById('noMR').addEventListener('input', e => document.getElementById('displayNoMR').textContent = e.target.value || '-');
document.getElementById('inputDPJP').addEventListener('input', e => document.getElementById('displayDPJP').textContent = e.target.value || '');
document.getElementById('tglAsesmen').addEventListener('change', e => document.getElementById('displayTglAsesmen').textContent = e.target.value || '-');
document.getElementById('tglLahir').addEventListener('change', updateStats);
document.getElementById('jk').addEventListener('change', updateStats);

['bb', 'naSerum', 'naTarget', 'naInfus'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateNatrium);
});

function updateStats() {
    const tgl = document.getElementById('tglLahir').value;
    if(!tgl) return;
    const dob = new Date(tgl);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    
    document.getElementById('displayTglLahir').textContent = tgl;
    document.getElementById('displayUmur').textContent = age + " Tahun";
    const jk = document.getElementById('jk').value;
    
    // Perbaikan Skor Usia PSI
    const scoreUsia = (jk === 'P') ? Math.max(0, age - 10) : age;
    document.getElementById('scoreUsia').textContent = scoreUsia;
    
    calculatePSI();
    calculateNatrium();
}

document.querySelectorAll('.psi-check').forEach(box => {
    box.addEventListener('change', () => {
        const id = box.dataset.id;
        const scoreId = 'score' + id.charAt(0).toUpperCase() + id.slice(1);
        const el = document.getElementById(scoreId);
        if(el) el.textContent = box.checked ? box.dataset.score : 0;
        calculatePSI();
    });
});

function calculatePSI() {
    let total = parseInt(document.getElementById('scoreUsia').textContent) || 0;
    document.querySelectorAll('.psi-check').forEach(c => { 
        if(c.checked) total += parseInt(c.dataset.score); 
    });
    document.getElementById('totalScore').textContent = total;
    
    let kelas = "I", mort = "0.1%";
    if(total > 130) { kelas = "V"; mort = "29.2%"; }
    else if(total >= 91) { kelas = "IV"; mort = "8.2%"; }
    else if(total >= 71) { kelas = "III"; mort = "2.8%"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; }
    document.getElementById('kelasRisiko').textContent = kelas;
    document.getElementById('mortalityRate').textContent = mort;
}

function calculateNatrium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const naSerum = parseFloat(document.getElementById('naSerum').value);
    const naTarget = parseFloat(document.getElementById('naTarget').value);
    const naInfus = parseFloat(document.getElementById('naInfus').value);
    const jk = document.getElementById('jk').value;
    const age = parseInt(document.getElementById('displayUmur').textContent) || 30;

    if(!bb || isNaN(naSerum) || isNaN(naTarget) || !jk) return;

    const deltaTotal = naTarget - naSerum;
    document.getElementById('displayDeltaTotal').textContent = deltaTotal.toFixed(1);

    // Penyesuaian TBW
    let factor = (age <= 18) ? 0.6 : (jk === 'L' ? (age > 65 ? 0.5 : 0.6) : (age > 65 ? 0.45 : 0.5));
    const tbw = bb * factor;
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1);

    // Reset Tampilan Tabel
    document.getElementById('table-hari-2').style.display = 'none';
    document.getElementById('table-hari-3').style.display = 'none';
    document.getElementById('table-hari-4').style.display = 'none';
    
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0;

    // Logika Pembagian Bertahap (Maks 10 mEq/L per hari)
    if (deltaTotal > 30) {
        t1 = 10; t2 = 10; t3 = 10; t4 = deltaTotal - 30;
        document.getElementById('table-hari-2').style.display = 'table';
        document.getElementById('table-hari-3').style.display = 'table';
        document.getElementById('table-hari-4').style.display = 'table';
    } else if (deltaTotal > 20) {
        t1 = 10; t2 = 10; t3 = deltaTotal - 20;
        document.getElementById('table-hari-2').style.display = 'table';
        document.getElementById('table-hari-3').style.display = 'table';
    } else if (deltaTotal > 10) {
        t1 = 10; t2 = deltaTotal - 10;
        document.getElementById('table-hari-2').style.display = 'table';
    } else {
        t1 = deltaTotal;
    }

    const hitung = (target) => {
        const vol = (target / deltaPerLiter) * 1000;
        return {
            botol: Math.ceil(vol / 500),
            speed: (vol / 24).toFixed(1)
        };
    };

    const selectInfus = document.getElementById('naInfus');
    const cairan = selectInfus.options[selectInfus.selectedIndex].text.split(' (')[0];

    // Isi Data Hari 1
    const res1 = hitung(t1);
    document.getElementById('txtTBW').textContent = tbw.toFixed(1) + " L";
    document.getElementById('txtTargetHarian').textContent = t1.toFixed(1) + " mEq/L";
    document.getElementById('txtBotolDisplay').textContent = res1.botol + " Botol " + cairan + " 500 mL";
    document.getElementById('txtKecepatan').textContent = res1.speed + " mL/jam";

    // Isi Data Hari 2, 3, & 4 jika ada
    if (t2 > 0) {
        const res2 = hitung(t2);
        document.getElementById('txtTargetHarian2').textContent = t2.toFixed(1) + " mEq/L";
        document.getElementById('txtBotolDisplay2').textContent = res2.botol + " Botol " + cairan + " 500 mL";
        document.getElementById('txtKecepatan2').textContent = res2.speed + " mL/jam";
    }
    if (t3 > 0) {
        const res3 = hitung(t3);
        document.getElementById('txtTargetHarian3').textContent = t3.toFixed(1) + " mEq/L";
        document.getElementById('txtBotolDisplay3').textContent = res3.botol + " Botol " + cairan + " 500 mL";
        document.getElementById('txtKecepatan3').textContent = res3.speed + " mL/jam";
    }
    if (t4 > 0) {
        const res4 = hitung(t4);
        document.getElementById('txtTargetHarian4').textContent = t4.toFixed(1) + " mEq/L";
        document.getElementById('txtBotolDisplay4').textContent = res4.botol + " Botol " + cairan + " 500 mL";
        document.getElementById('txtKecepatan4').textContent = res4.speed + " mL/jam";
    }
}

function printAndDownload() {
    const nama = document.getElementById('nama').value;
    const noMR = document.getElementById('noMR').value;
    const dpjp = document.getElementById('inputDPJP').value;
    if (!nama || noMR.length !== 10 || !dpjp) {
        alert("Lengkapi Nama, No. MR (10 digit), dan Nama DPJP.");
        return;
    }
    document.title = nama + " - " + currentMode.toUpperCase();
    window.print();
}
