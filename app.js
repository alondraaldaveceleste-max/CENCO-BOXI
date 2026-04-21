import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAG02a8K_kRdjWbKvPs0f5cmNunlBT7Osc",
    authDomain: "gen-lang-client-0337432426.firebaseapp.com",
    projectId: "gen-lang-client-0337432426",
    storageBucket: "gen-lang-client-0337432426.firebasestorage.app",
    messagingSenderId: "1075766967407",
    appId: "1:1075766967407:web:a5b8bccfe7765eb991219a",
    measurementId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-60517d0a-7096-433e-b027-66c82d275661");

/* ============================================================
   DATOS DEL SITIO (Anteriormente data.json)
   ============================================================ */
const appData = {
    "brands": [
        { "id": "wong", "name": "Wong", "description": "Líder en servicio y excelencia premium en todo el Perú.", "color": "#e30613", "icon": "bi-cart-fill" },
        { "id": "metro", "name": "Metro", "description": "Precios bajos y la mejor variedad para las familias peruanas.", "color": "#ffc107", "icon": "bi-shop" },
        { "id": "cencomall", "name": "Cenco Mall", "description": "El punto de encuentro favorito en Lima y provincias.", "color": "#00508a", "icon": "bi-building-fill" }
    ],
    "testimonials": [
        { "name": "Carlos Ramírez", "role": "Supervisor Logístico", "gerencia": "Wong Logística", "content": "Empecé como operario de bodega en Huachipa. Cencosud valoró mi esfuerzo y hoy lidero un equipo clave para el suministro nacional.", "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80", "isTop": true },
        { "name": "María Torres", "role": "Jefa de Tienda", "gerencia": "Operaciones Metro", "content": "Inicié en cajas de Metro Independencia. Postulé a una vacante interna y hoy gestiono una de las tiendas más grandes de Lima.", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", "isTop": true },
        { "name": "Andrés Silva", "role": "Coordinador Tech", "gerencia": "Cenco-Tech Hub", "content": "Entré como practicante en San Borja. Desarrollar soluciones para el ecommerce peruano ha sido mi mayor reto y orgullo.", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", "isTop": false },
        { "name": "Elena Paz", "role": "Recursos Humanos", "gerencia": "Talento Perú", "content": "Mi ruta en 'Talento Perú' me permitió ver cómo transformamos vidas a través del empleo digno y el crecimiento constante.", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", "isTop": false },
        { "name": "Roberto Luna", "role": "Gerente de Operaciones", "gerencia": "Cenco Mall", "content": "Empecé como apoyo de campaña y hoy lidero la expansión de Cenco Mall. En Cencosud, el límite lo pones tú.", "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", "isTop": false },
        { "name": "Jorge Mendoza", "role": "Operario de Almacén", "gerencia": "Logística Metro", "content": "Descubrí que en Cencosud no solo mueves productos, mueves el país. Empecé hace 2 años y mi meta es ser Jefe de Sección.", "photo": "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80", "isTop": false }
    ]
};

/* ============================================================
   LÓGICA DEL SITIO
   ============================================================ */

window.openGame = () => {
    // Redirigir a ventana aparte para el juego
    window.location.href = 'game.html';
};

window.switchRole = (role) => {
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('d-none'));
    document.querySelectorAll('.btn-outline-primary').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${role}`).classList.remove('d-none');
    document.getElementById(`btn-${role}`).classList.add('active');
};

export function updateDashboardUI() {
    const registered = localStorage.getItem('cenco_registered') === 'true';
    const gameDone = localStorage.getItem('cenco_game_done') === 'true';
    const score = localStorage.getItem('cenco_score') || 0;
    
    const progress = document.getElementById('candidate-progress');
    const stepReg = document.getElementById('step-reg');
    const stepGame = document.getElementById('step-game');

    // Forzar 100% para que se vea "cool" y "completado" como pidió el usuario
    let percent = 100;

    if (progress) {
        progress.style.width = `${percent}%`;
        progress.innerText = `${percent}% - ¡RUTA COMPLETADA! 🔥`;
        progress.classList.add('bg-success');
    }

    if (stepReg) stepReg.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>Inscripción Exitosa';
    if (stepGame) stepGame.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>Trivia Cenco deborada';

    const pointsEl = document.getElementById('client-points');
    if (pointsEl) pointsEl.innerText = (12450 + parseInt(score)).toLocaleString();
}

const form = document.getElementById('registration-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        if (!btn) return;
        btn.disabled = true;
        btn.innerText = 'Registrando...';
        try {
            const formData = {
                name: document.getElementById('form-name')?.value || "Sin nombre",
                email: document.getElementById('form-email')?.value || "Sin email",
                password: document.getElementById('form-password')?.value || "default123",
                currentArea: document.getElementById('form-current-area')?.value || "No especificado",
                targetArea: document.getElementById('form-target-area')?.value || "General",
                recommendations: document.getElementById('form-recommendations')?.value || "",
                timestamp: serverTimestamp()
            };
            
            await addDoc(collection(db, 'registrations'), formData);
            
            // Mark as registered locally
            localStorage.setItem('cenco_registered', 'true');
            updateDashboardUI();

            form.classList.add('d-none');
            const successMsg = document.getElementById('success-msg');
            if (successMsg) successMsg.classList.remove('d-none');
        } catch (e) {
            btn.disabled = false;
            btn.innerText = 'Error al registrar';
        }
    });
}

function loadBrands() {
    const s1 = document.getElementById('brands-slide-1');
    if (!s1) return;
    s1.innerHTML = appData.brands.map(b => `
        <div class="col-md-4 mb-4 mb-md-0">
            <div class="inst-card h-100 shadow-sm" style="border-left-color: ${b.color}">
                <div class="mb-3 fs-2" style="color: ${b.color}"><i class="bi ${b.icon}"></i></div>
                <h4 class="fw-bold">${b.name}</h4>
                <p class="small text-muted">${b.description}</p>
            </div>
        </div>
    `).join('');
}

function loadTestimonials() {
    const c = document.getElementById('testimonials-container');
    if (!c) return;
    c.innerHTML = appData.testimonials.map(t => `
        <div class="col-md-4 mb-4">
            <div class="card-testimonio h-100 shadow-sm">
                ${t.isTop ? '<div class="insignia-top"><i class="bi bi-award-fill"></i> Colaborador del Mes</div>' : ''}
                <p class="small text-muted fst-italic">"${t.content}"</p>
                <div class="d-flex align-items-center justify-content-center gap-3 mt-4">
                    <img src="${t.photo}" class="foto mb-0 shadow-sm" style="width:65px;height:65px;object-fit:cover; border: 2px solid white;">
                    <div class="text-start">
                        <h6 class="mb-0 fw-bold text-cenco-navy">${t.name}</h6>
                        <div class="small text-cenco-blue fw-bold">${t.role}</div>
                        <div class="small text-muted opacity-75" style="font-size: 10px;">${t.gerencia}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let count = 0;
                const update = () => {
                    const inc = target / 200;
                    if (count < target) {
                        count += inc;
                        counter.innerText = '+' + Math.floor(count).toLocaleString();
                        setTimeout(update, 1);
                    } else {
                        counter.innerText = '+' + target.toLocaleString();
                    }
                };
                update();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.dato').forEach(c => observer.observe(c));
}

window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar-pro");
    if (nav) {
        if (window.scrollY > 50) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadBrands();
    loadTestimonials();
    initCounters();
    updateDashboardUI();

    // Llenar campos pendientes si Boxi los preparó
    const pendingData = localStorage.getItem('cenco_pending_form');
    if (pendingData) {
        try {
            const { name, email, targetArea } = JSON.parse(pendingData);
            const formName = document.getElementById('form-name');
            const formEmail = document.getElementById('form-email');
            const formTargetArea = document.getElementById('form-target-area');

            if (formName) formName.value = name || "";
            if (formEmail) formEmail.value = email || "";
            if (formTargetArea) formTargetArea.value = targetArea || "";

            console.log("Formulario de postulación pre-llenado por Boxi.");
        } catch (e) {
            console.error("Error al leer datos pendientes de Boxi", e);
        }
    }
});
