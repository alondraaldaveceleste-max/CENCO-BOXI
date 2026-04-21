import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAG02a8K_kRdjWbKvPs0f5cmNunlBT7Osc",
  authDomain: "gen-lang-client-0337432426.firebaseapp.com",
  projectId: "gen-lang-client-0337432426",
  storageBucket: "gen-lang-client-0337432426.firebasestorage.app",
  messagingSenderId: "1075766967407",
  appId: "1:1075766967407:web:a5b8bccfe7765eb991219a",
  measurementId: ""
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "ai-studio-60517d0a-7096-433e-b027-66c82d275661");
const googleProvider = new GoogleAuthProvider();

// --- ELEMENTOS DEL DOM ---
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMsg = document.getElementById('error-msg');
const logoutBtn = document.getElementById('logout-btn');

// Campos adicionales registro
const registerFields = document.getElementById('register-fields');
const roleSelection = document.getElementById('role-selection');

// --- VARIABLES DE ESTADO ---
let isRegister = false;
let userRole = 'candidato';

// --- FUNCIONES ---

// Alternar entre Login y Registro
window.toggleAuthMode = () => {
    isRegister = !isRegister;
    authTitle.innerText = isRegister ? 'Crea tu Cuenta' : 'Acceso Seguro';
    authSubmitBtn.innerText = isRegister ? 'Empezar Mi Ruta' : 'Entrar';
    toggleAuthBtn.innerText = isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí';
    registerFields.style.display = isRegister ? 'block' : 'none';
    
    // MOSTRAR selector de roles en registro para que sea fácil elegir
    const roleSelector = document.getElementById('role-selection');
    if (roleSelector) {
        roleSelector.style.display = isRegister ? 'flex' : 'none';
    }

    // Poner el foco en el nombre para ir rápido
    if (isRegister) {
        setTimeout(() => document.getElementById('name')?.focus(), 100);
    }
};

// Cambiar Rol
window.setRole = (role) => {
    userRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-light', 'text-muted');
    });
    document.getElementById(`role-${role}`).classList.remove('bg-light', 'text-muted');
    document.getElementById(`role-${role}`).classList.add('bg-primary', 'text-white');
};

// Manejar Login/Registro
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nameInput = document.getElementById('name');
    const name = nameInput ? nameInput.value : 'Usuario Cencosud';

    // Feedback visual inmediato
    authSubmitBtn.disabled = true;
    authSubmitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...`;

    try {
        if (isRegister) {
            // REGISTRO REAL
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                userId: userCredential.user.uid,
                email,
                name,
                role: userRole,
                status: 'approved',
                createdAt: new Date().toISOString()
            });
        } else {
            // LOGIN REAL
            await signInWithEmailAndPassword(auth, email, password);
        }
        
        // El onAuthStateChanged se encargará de mostrar el dashboard
        localStorage.removeItem('cenco_pending_form');
    } catch (err) {
        console.error("Auth Error:", err.message);
        errorMsg.innerText = `Error: ${err.message}`;
        errorMsg.style.display = 'block';
        authSubmitBtn.disabled = false;
        authSubmitBtn.innerText = isRegister ? 'Empezar Mi Ruta' : 'Entrar';
    }
});

// Login con Google
googleLoginBtn.addEventListener('click', async () => {
    // Feedback visual
    const originalContent = googleLoginBtn.innerHTML;
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Conectando...`;
    errorMsg.style.display = 'none';

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                userId: user.uid,
                email: user.email,
                name: user.displayName || 'Nuevo Usuario',
                role: 'cliente',
                status: 'approved',
                createdAt: new Date().toISOString()
            });
        }
        // El onAuthStateChanged se encargará de la redirección
    } catch (err) {
        console.error("Google Login Error:", err);
        errorMsg.innerText = `Error Google: ${err.message}`;
        errorMsg.style.display = 'block';
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = originalContent;
    }
});

// Cerrar Sesión
logoutBtn.addEventListener('click', () => signOut(auth));

// Escuchar cambios de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        loadDashboard(user.uid);
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';

        // Llenar campos pendientes si Boxi los preparó
        const pendingData = localStorage.getItem('cenco_pending_form');
        if (pendingData) {
            try {
                const { name, email } = JSON.parse(pendingData);
                // Si hay datos, vamos a registro directamente
                if (!isRegister) window.toggleAuthMode();
                
                const nameField = document.getElementById('name');
                const emailField = document.getElementById('email');

                if (nameField) nameField.value = name || "";
                if (emailField) emailField.value = email || "";
                
                console.log("Datos de Boxi cargados en Dashboard.");
                // Limpiamos opcionalmente o dejamos para que el usuario confirme
                // localStorage.removeItem('cenco_pending_form'); 
            } catch (e) {
                console.error("Error al cargar datos de Boxi", e);
            }
        }
    }
});

// Cargar datos del Dashboard
function loadDashboard(uid) {
    onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            renderDashboard(data);
        }
    });
}

function renderDashboard(profile) {
    const content = document.getElementById('dashboard-content');
    const roleTag = document.getElementById('user-role-tag');
    
    roleTag.innerText = profile.role === 'candidato' ? 'Candidato' : 'Cliente';
    
    if (profile.role === 'candidato') {
        content.innerHTML = `
            <div class="bg-white rounded-5 shadow-lg p-5 border-start border-primary border-5 w-100">
                <div class="d-flex align-items-center gap-3 mb-4 text-navy">
                    <i class="bi bi-clipboard-check fs-2"></i>
                    <h2 class="fw-bold mb-0">Mi Postulación</h2>
                </div>
                <div class="mb-4">
                    <p class="fw-bold mb-2">Estado de mi Ruta:</p>
                    <div class="progress rounded-pill" style="height: 30px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 100%">Ruta Completada (100%)</div>
                    </div>
                </div>
                <ul class="list-unstyled space-y-3">
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Perfil validado exitosamente</li>
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Participación en Cenco-Play</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Entrevista técnica aprobada</li>
                </ul>
            </div>
        `;
    } else {
        const points = profile.points || localStorage.getItem('cenco_score') || '12,450';
        content.innerHTML = `
            <div class="row g-4 w-100">
                <div class="col-md-6">
                    <div class="bg-white rounded-5 shadow-lg p-5 border-start border-warning border-5 h-100">
                        <h4 class="fw-bold text-navy mb-4"><i class="bi bi-star-fill text-warning me-2"></i>Cenco-Puntos</h4>
                        <span class="display-3 fw-black text-navy d-block mb-3">${points}</span>
                        <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold">CANJEAR AHORA</button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="bg-white rounded-5 shadow-lg p-5 border-start border-success border-5 h-100">
                        <h4 class="fw-bold text-navy mb-4"><i class="bi bi-gift-fill text-success me-2"></i>Beneficios</h4>
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="bg-light p-3 rounded-4"><i class="bi bi-percent fs-3 text-primary"></i></div>
                            <div><h6 class="fw-bold mb-0">15% Descuento</h6><p class="small text-muted mb-0">En todas las tiendas</p></div>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-light p-3 rounded-4"><i class="bi bi-truck fs-3 text-primary"></i></div>
                            <div><h6 class="fw-bold mb-0">Envío Gratis</h6><p class="small text-muted mb-0">Cenco Mall Online</p></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
