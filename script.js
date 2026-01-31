let currentMode = 'psi';

function showCalculator(mode) {
    currentMode = mode;
    document.body.className = 'mode-' + mode;
    const isPsi = (mode === 'psi');
    const isNatrium = (mode === 'natrium');
    const isKalium = (mode === 'kalium');
    document.getElementById('calc-psi-content').style.display = 'none';
    document.getElementById('calc-natrium-content').style.display = 'none';
    document.getElementById('calc-kalium-content').style.display = 'none';
    document.getElementById('psi-output-box').style.display = 'none';
    document.getElementById('natrium-output-box').style.display = 'none';
    document.getElementById('kalium-output-box').style.display = 'none';
    
    if(isPsi) {
        document.getElementById('calc-psi-content').style.display = 'block';
        document.getElementById('psi-output-box').style.display = 'block';
    } else if(isNatrium) {
        document.getElementById('calc-natrium-content').style.display = 'block';
        document.getElementById('natrium-output-box').style.display = 'block';
    } else if(isKalium) {
        document.getElementById('calc-kalium-content').style.display = 'block';
        document.getElementById('kalium-output-box').style.display = 'block';
    }
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', isNatrium);
    document.getElementById('btn-kalium').classList.toggle('active', isKalium);
}

// Data Binding
document.getElementById('nama').addEventListener('input', e => document.getElementById('displayNama').textContent = e.target.value || '-');
document.getElementById('noMR').addEventListener('input', e => document.getElementById('displayNoMR').textContent = e.target.value || '-');
document.getElementById('inputDPJP').addEventListener('input', e => document.getElementById('displayDPJP').textContent = e.target.value || '');
document.getElementById('tglAsesmen').addEventListener('change', e => document.getElementById('displayTglAsesmen').textContent = e.target.value || '-');
document.getElementById('tglLahir').addEventListener('change', updateStats);
document.getElementById('jk').addEventListener('change', updateStats);

['bb', 'naSerum', 'naTarget', 'naKecepatan', 'naInfus', 'kSerum', 'aksesVena'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => { calculateNatrium(); calculateKalium();});
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
    const kecMax = parseFloat(document.getElementById('naKecepatan').value);
    const jk = document.getElementById('jk').value;
    const tglAsesmenInput = document.getElementById('tglAsesmen').value;
    const age = parseInt(document.getElementById('displayUmur').textContent) || 30;

    const container = document.getElementById('natrium-tables-container');
    container.innerHTML = ""; 

    document.getElementById('displayNaAwal').textContent = isNaN(naSerum) ? "0" : naSerum;
    document.getElementById('displayNaTarget').textContent = isNaN(naTarget) ? "0" : naTarget;
    
    if(!bb || isNaN(naSerum) || isNaN(naTarget) || isNaN(kecMax) || !jk) return;

    const deltaTotal = naTarget - naSerum;
    document.getElementById('displayDeltaTotal').textContent = deltaTotal.toFixed(1);

    if (deltaTotal <= 0) {
        document.getElementById('displayDurasi').textContent = "0";
        return;
    }

    // TBW & Delta per Liter
    let factor = (age <= 18) ? 0.6 : (jk === 'L' ? (age > 65 ? 0.5 : 0.6) : (age > 65 ? 0.45 : 0.5));
    const tbw = bb * factor;
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1);

    let sisaDelta = deltaTotal;
    let hari = 1;
    const selectInfus = document.getElementById('naInfus');
    const cairan = selectInfus.options[selectInfus.selectedIndex].text.split(' (')[0];

    // Persiapan Tanggal
    let baseDate = tglAsesmenInput ? new Date(tglAsesmenInput) : new Date();

    while (sisaDelta > 0.01) {
        let deltaHariIni = Math.min(sisaDelta, kecMax);
        const vol = (deltaHariIni / deltaPerLiter) * 1000;
        const botol = Math.ceil(vol / 500);
        const speed = (vol / 24).toFixed(1);

        // Hitung Tanggal untuk Hari ini
        let currentDayDate = new Date(baseDate);
        currentDayDate.setDate(baseDate.getDate() + (hari - 1));
        
        // Format Tanggal (Contoh: 31 Jan 2026)
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const dateString = currentDayDate.toLocaleDateString('id-ID', options);

        const tableHtml = `
            <table class="scoring-table" style="margin-top: 15px;">
                <thead>
                    <tr>
                        <th style="background:${hari === 1 ? '#4CAF50' : '#2196F3'} !important;">
                            Rencana Hari ke-${hari} (${dateString})
                        </th>
                        <th>Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    ${hari === 1 ? `<tr><td>Total Body Water (TBW)</td><td>${tbw.toFixed(1)} L</td></tr>` : ''}
                    <tr><td>Target Δ Na+ Periode Ini</td><td>${deltaHariIni.toFixed(1)} mEq/L</td></tr>
                    <tr class="highlight-natrium"><td>Kebutuhan Botol (500 mL)</td><td>${botol} Botol ${cairan} 500 mL</td></tr>
                    <tr class="highlight-natrium"><td>Kecepatan Infus</td><td>${speed} mL/jam</td></tr>
                </tbody>
            </table>
        `;
        container.innerHTML += tableHtml;
        
        sisaDelta -= deltaHariIni;
        if(sisaDelta > 0.01) hari++;
        else break;
    }
    document.getElementById('displayDurasi').textContent = hari;
}

function calculateKalium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const kSerum = parseFloat(document.getElementById('kSerum').value);
    const akses = document.getElementById('aksesVena').value;
    const container = document.getElementById('kalium-instructions');

    if (!bb || isNaN(kSerum)) return;

    // Klasifikasi 
    let klasifikasi = "Normal";
    if (kSerum < 2.5) klasifikasi = "Berat";
    else if (kSerum < 3.0) klasifikasi = "Sedang";
    else if (kSerum < 3.5) klasifikasi = "Ringan";
    
    document.getElementById('displayKaliumSerum').textContent = kSerum;
    document.getElementById('displayKlasifikasiK').textContent = klasifikasi;

    // Rumus PPK MTMH 
    const kebutuhan = 0.3 * bb * (4 - kSerum);
    document.getElementById('displayKebutuhanK').textContent = kebutuhan.toFixed(1);

    // Instruksi berdasarkan PPK [cite: 96, 104]
    let instruksi = "";
    if (kSerum >= 3.0 && kSerum < 3.5) {
        instruksi = `<tr><td>Terapi Oral</td><td>KCl oral 20 mEq 3-4 kali sehari & edukasi diet kaya kalium.</td></tr>`;
    } else {
        const kecPerifer = "Maks 10-20 mEq dalam 500ml NaCl 0.9%";
        const kecSentral = "25 mEq dalam 100ml NaCl 0.9% (Kecepatan 5-20 mEq/jam)";
        instruksi = `
            <tr><td>Metode</td><td>Rapid Correction (Intravena)</td></tr>
            <tr><td>Dosis Total</td><td>${kebutuhan.toFixed(1)} mEq KCl dilarutkan dalam NaCl 0.9%</td></tr>
            <tr><td>Kecepatan Maks</td><td>${akses === 'perifer' ? kecPerifer : kecSentral}</td></tr>
            <tr><td>Monitoring</td><td>Observasi ekstravasasi setiap 30 menit & EKG kontinu jika >10 mEq/jam.</td></tr>
        `;
    }
    container.innerHTML = instruksi;
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
