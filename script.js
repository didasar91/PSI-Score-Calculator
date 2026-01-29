// Calculate age from date of birth
document.getElementById('tanggalLahir').addEventListener('change', function() {
    const dob = new Date(this.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    document.getElementById('umur').value = age;
    calculateTotal();
});

// Calculate age score based on gender
function calculateAgeScore() {
    const age = parseInt(document.getElementById('umur').value) || 0;
    const gender = document.getElementById('jenisKelamin').value;
    
    let ageScore = 0;
    if (gender === 'L') {
        ageScore = age;
    } else if (gender === 'P') {
        ageScore = age - 10;
    }
    
    document.getElementById('scoreUsia').textContent = ageScore;
    return ageScore;
}

// Gender change listener
document.getElementById('jenisKelamin').addEventListener('change', calculateTotal);

// Handle checkbox changes
document.querySelectorAll('.score-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const score = this.checked ? parseInt(this.dataset.score) : 0;
        const field = this.dataset.field;
        const scoreElement = document.getElementById('score' + field.charAt(0).toUpperCase() + field.slice(1));
        scoreElement.textContent = score;
        calculateTotal();
    });
});

// Calculate total score and risk classification
function calculateTotal() {
    let total = calculateAgeScore();
    
    document.querySelectorAll('.score-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            total += parseInt(checkbox.dataset.score);
        }
    });
    
    document.getElementById('totalScore').textContent = total;
    
    // Determine risk classification based on PSI score
    let risiko, kelasRisiko, mortalityRate;
    
    if (total <= 70) {
        risiko = 'Rendah';
        kelasRisiko = 'II';
        mortalityRate = '0.6%';
    } else if (total >= 71 && total <= 90) {
        risiko = 'Rendah';
        kelasRisiko = 'III';
        mortalityRate = '2.8%';
    } else if (total >= 91 && total <= 130) {
        risiko = 'Sedang';
        kelasRisiko = 'IV';
        mortalityRate = '8.2%';
    } else if (total > 130) {
        risiko = 'Berat';
        kelasRisiko = 'V';
        mortalityRate = '29.2%';
    }
    
    document.getElementById('risiko').textContent = risiko;
    document.getElementById('kelasRisiko').textContent = kelasRisiko;
    document.getElementById('mortalityRate').textContent = mortalityRate;
}

// Update DPJP display
document.getElementById('namaDPJP').addEventListener('input', function() {
    document.getElementById('dpjpDisplay').textContent = this.value;
});

// Reset form
function resetForm() {
    if (confirm('Apakah Anda yakin ingin mereset semua data?')) {
        document.querySelectorAll('input[type="text"], input[type="date"], input[type="number"]').forEach(input => {
            input.value = '';
        });
        document.getElementById('jenisKelamin').value = '';
        document.querySelectorAll('.score-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('span[id^="score"]').forEach(span => {
            span.textContent = '0';
        });
        document.getElementById('totalScore').textContent = '0';
        document.getElementById('risiko').textContent = '-';
        document.getElementById('kelasRisiko').textContent = '-';
        document.getElementById('mortalityRate').textContent = '-';
        document.getElementById('dpjpDisplay').textContent = '';
    }
}

// Initialize
calculateTotal();
