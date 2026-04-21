/* ============================================================
   TRIVIA DATA (Preguntas del Juego)
   ============================================================ */
const gameQuestions = [
    { 
        "question": "¿Cuál es el lema icónico de Supermercados Wong en Perú?", 
        "options": ["Precios bajos siempre", "Donde comprar es un placer", "Calidad para todos", "Metro te da más"], 
        "answer": 1 
    },
    { 
        "question": "¿Qué marca de Cencosud Perú se enfoca en 'Precios más bajos, siempre'?", 
        "options": ["Wong", "Metro", "Easy", "Cenco Malls"], 
        "answer": 1 
    },
    { 
        "question": "¿Qué programa de capacitación con juegos usa Cencosud para sus colaboradores?", 
        "options": ["Cenco-Learn", "Cenco-Play", "Super-Cap", "Training Day"], 
        "answer": 1 
    },
    { 
        "question": "¿Cuál de estas marcas pertenece a la división de Centros Comerciales de Cencosud?", 
        "options": ["Cenco Malls", "MegaPlaza", "Real Plaza", "Mall Aventura"], 
        "answer": 0 
    },
    { 
        "question": "¿En qué año se fundó el primer supermercado Wong en el distrito de Miraflores?", 
        "options": ["1983", "1975", "1990", "2005"], 
        "answer": 0 
    },
    { 
        "question": "¿Cuál es el propósito principal de los Puntos Cenco?", 
        "options": ["Solo decoración", "Pagar estacionamiento", "Canjear por productos y beneficios reales", "Validar asistencia"], 
        "answer": 2 
    },
    { 
        "question": "¿Qué marca de Cencosud llegó a Perú para revolucionar el mejoramiento del hogar?", 
        "options": ["Easy", "Sodimac", "Promart", "Maestro"], 
        "answer": 0 
    }
];

let currentQ = 0;
let gameScore = 0;
let streak = 0;

/* ============================================================
   LÓGICA DEL JUEGO
   ============================================================ */

window.startGame = () => {
    document.getElementById('game-start').classList.add('d-none');
    document.getElementById('game-quiz').classList.remove('d-none');
    currentQ = 0;
    gameScore = 0;
    streak = 0;
    showQuestion();
};

function showQuestion() {
    const q = gameQuestions[currentQ];
    document.getElementById('q-counter').innerText = `Pregunta ${currentQ + 1}/${gameQuestions.length}`;
    document.getElementById('q-score').innerText = `${gameScore} pts`;
    document.getElementById('q-text').innerText = q.question;
    
    const container = document.getElementById('q-options');
    container.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(idx, btn);
        container.appendChild(btn);
    });
}

function checkAnswer(idx, btn) {
    const q = gameQuestions[currentQ];
    const btns = document.querySelectorAll('.btn-option');
    
    // Deshabilitar botones
    btns.forEach(b => b.disabled = true);
    
    if (idx === q.answer) {
        btn.classList.add('correct');
        streak++;
        const points = 1000 + (streak * 200); // Bonus por racha
        gameScore += points;
        
        // Efecto pequeño de confetti al acertar
        confetti({
            particleCount: 20,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#0074FF', '#002882', '#61d3b0']
        });
    } else {
        btn.classList.add('wrong');
        streak = 0;
        btns[q.answer].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQ++;
        if (currentQ < gameQuestions.length) {
            showQuestion();
        } else {
            finishGame();
        }
    }, 1000);
}

function updateLeaderboard(newScore) {
    let scores = JSON.parse(localStorage.getItem('cenco_leaderboard') || '[]');
    const date = new Date().toLocaleDateString();
    scores.push({ score: newScore, date });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5); // Guardar top 5
    localStorage.setItem('cenco_leaderboard', JSON.stringify(scores));
    
    const list = document.getElementById('leaderboard-list');
    if (list) {
        list.innerHTML = scores.map((s, i) => `
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <span><span class="fw-bold text-primary">#${i+1}</span> - ${s.date}</span>
                <span class="fw-bold text-navy">${s.score} pts</span>
            </div>
        `).join('');
    }

    const best = scores[0].score;
    document.getElementById('best-score-msg').innerHTML = `
        <span class="badge bg-primary rounded-pill px-3 py-2 mb-2">Tu Mejor Récord: ${best} pts</span><br>
        Puntos obtenidos en esta ronda.
    `;
}

function finishGame() {
    document.getElementById('game-quiz').classList.add('d-none');
    document.getElementById('game-results').classList.remove('d-none');
    document.getElementById('res-score').innerText = gameScore;

    updateLeaderboard(gameScore);

    // Efecto Master/Legendario
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

    function fire(particleRatio, opts) {
        confetti({
            ...opts,
            particleCount: Math.floor(200 * particleRatio),
            scalar
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    
    const redeemMsg = document.getElementById('redeem-msg');
    if (redeemMsg) {
        const isMaster = gameScore >= 5000;
        redeemMsg.innerHTML = `
            <div class="p-4 rounded-5 shadow-lg border-0 text-white animate-fade-in" 
                 style="background: linear-gradient(45deg, ${isMaster ? '#FFD700, #FFA500' : '#0074FF, #002882'});">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="bg-white p-3 rounded-circle text-navy">
                        <i class="bi ${isMaster ? 'bi-gem' : 'bi-plus-circle-fill'} fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-black mb-0">${isMaster ? '¡NIVEL LEYENDA!' : '¡MUY BIEN!'}</h4>
                        <p class="small mb-0 opacity-75">Has sumado ${gameScore} Cenco-Puntos</p>
                    </div>
                </div>
                <button onclick="redeemAnimation(this)" class="btn btn-light w-100 rounded-pill py-3 fw-black text-uppercase tracking-wider transform-hover">
                    RECLAMAR PUNTOS AHORA <i class="bi bi-gift-fill ms-1"></i>
                </button>
            </div>
        `;
        redeemMsg.classList.remove('d-none');
    }
    
    localStorage.setItem('cenco_score', gameScore);
}

window.redeemAnimation = (btn) => {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>PROCESANDO CANJE...`;
    
    // Sonido visual
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => {
        btn.classList.replace('btn-light', 'btn-success');
        btn.innerHTML = `<i class="bi bi-check-lg me-2"></i>¡PUNTOS CANJEADOS CON ÉXITO!`;
        const alert = document.createElement('div');
        alert.className = 'alert alert-info mt-3 rounded-4 border-0 animate-fade-in';
        alert.innerText = "¡Listo! Tus puntos aparecerán en tu Dashboard al iniciar sesión.";
        btn.parentNode.appendChild(alert);
    }, 2000);
};
