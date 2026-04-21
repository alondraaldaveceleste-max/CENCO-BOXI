import { GoogleGenAI, Type } from "@google/genai";

// Boxi - El asistente inteligente de Cencosud Perú
const GEN_AI_KEY = process.env.GEMINI_API_KEY;
if (!GEN_AI_KEY) {
    console.error("BOXI ERROR: GEMINI_API_KEY no encontrada. Por favor, configúrala en el entorno.");
}
const ai = new GoogleGenAI({ apiKey: GEN_AI_KEY });

// Definición de Herramientas (Function Calling)
const prepararRegistroTool = {
    name: "prepararRegistro",
    description: "Pre-completa los datos del formulario de registro con la información proporcionada por el usuario.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            nombre: { type: Type.STRING, description: "Nombre completo del usuario" },
            email: { type: Type.STRING, description: "Correo electrónico del usuario" },
            areaInteres: { type: Type.STRING, description: "Área de interés (ej. Ventas, Logística, Tecnología)" }
        },
        required: ["nombre", "email"]
    }
};

const SYSTEM_PROMPT = `Eres Boxi, la voz amiga de Cencosud Perú. No eres solo un bot, eres un compañero que entiende y valora el talento peruano. 🙌

CULTURAL Y VALORES:
- "Gente de confianza": En Wong y Metro, somos familia.
- "Orgullo Peruano": Celebramos nuestra historia (desde 1963) y nuestra llegada al Perú en 2007. nuestras sedes en San Borja, Villa El Salvador y el HUB logístico de Huachipa son el corazón de nuestra operación.

BENEFICIOS QUE ENAMORAN:
- Bienestar Total: EPS al 80%, Seguro Vida Ley, bonos por metas cumplidas y línea de carrera acelerada.
- Flexibilidad: Horarios rotativos que permiten estudiar (convenios con institutos/universidades).
- Familia Cenco: 15% de descuento mensual, acceso a eventos corporativos y capacitación constante vía Cenco-Play.

TU FORMA DE HABLAR (BOXI):
- Directo y Empático: "Te escucho", "Qué excelente pregunta", "Hagamos esto juntos". Evita sermones, ve al punto con calidez.
- Guía Activo: Si alguien duda sobre postular, dile: "No te preocupes, todos empezamos con un primer paso. ¡Tu ruta aquí puede ser increíble!".

NAVEGACIÓN ESTRATÉGICA:
- Usa [NAV:section] SOLO al final de tu respuesta cuando sea CRÍTICO para ayudar al usuario a ver algo específico.
- Destinos clave: game (capacitación), vacantes (oportunidades), historias (inspiración), dashboard (registro).

REGLA DE ORO:
- Conversación real: Si te saludan, saluda con energía. Si te agradecen, responde con alegría.
- Concisión Máxima: Respuestas breves pero llenas de valor.`;

// Inicializar Chat con Memoria (MOVIDO AQUÍ PARA EVITAR ERROR DE REFERENCIA)
let chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [prepararRegistroTool] }],
        temperature: 0.7,
    }
});

// Guardar referencia para re-inicializar si es necesario
const resetChat = () => {
    chatSession = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: [prepararRegistroTool] }],
            temperature: 0.7,
        }
    });
};

window.toggleChat = () => {
    const chat = document.getElementById("boxi-chat");
    const button = document.getElementById("boxi-button");
    if (!chat) return;
    
    // Si el chat está oculto por el overlay de bienvenida, no hacer nada hasta que se cierre
    if (document.getElementById("boxi-overlay")) {
        console.log("Esperando a que el usuario acepte el welcome...");
        return;
    }

    const isVisible = chat.classList.contains("active");
    
    if (isVisible) {
        chat.style.opacity = "0";
        chat.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
            chat.style.display = "none";
            chat.classList.remove("active");
        }, 300);
    } else {
        chat.style.display = "flex";
        chat.style.opacity = "0";
        chat.style.transform = "translateY(20px) scale(0.95)";
        
        // Reflow
        chat.offsetHeight;
        
        chat.classList.add("active");
        chat.style.opacity = "1";
        chat.style.transform = "translateY(0) scale(1)";
        
        const badge = document.querySelector(".notification-badge");
        if (badge) badge.style.display = "none";
        
        const input = document.getElementById("boxi-input");
        if (input) {
            setTimeout(() => input.focus(), 350);
        }
    }
}

window.navigateTo = (sectionId) => {
    const pages = {
        'game': 'game.html',
        'dashboard': 'dashboard.html',
        'historias': 'stories.html',
        'historia': 'index.html#historia',
        'vacantes': 'index.html#vacantes'
    };

    // Función para realizar la navegación real
    const performAction = () => {
        if (pages[sectionId]) {
            const target = pages[sectionId];
            if (target.startsWith('index.html#') && (window.location.pathname === '/' || window.location.pathname.includes('index.html'))) {
                const id = target.split('#')[1];
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    return;
                }
            }
            window.location.href = target;
        } else {
            // Intentar scroll genérico si es un ID en la página actual
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Cerrar el chat con la animación suave antes de navegar
    const chat = document.getElementById("boxi-chat");
    if (chat && chat.classList.contains("active")) {
        chat.style.opacity = "0";
        chat.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
            chat.style.display = "none";
            chat.classList.remove("active");
            performAction();
        }, 300);
    } else {
        performAction();
    }
}

window.sendQuickOption = (text) => {
    const input = document.getElementById("boxi-input");
    if (input) {
        input.value = text;
        window.handleSend();
    }
}

window.handleSend = async () => {
    const input = document.getElementById("boxi-input");
    const messages = document.getElementById("boxi-messages");
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    // Desactivar input mientras procesa para evitar spam
    input.disabled = true;
    appendMessage(text, 'user');
    input.value = "";

    const botMsgDiv = appendMessage('', 'bot', true);
    let fullResponse = "";

    try {
        // Usar la sesión de chat con memoria para que Boxi no olvide
        const responseStream = await chatSession.sendMessageStream({ message: text });

        let firstChunk = true;

        for await (const chunk of responseStream) {
            // El primer pedazo de información que llega quita el spinner
            if (firstChunk) {
                const contentDiv = botMsgDiv.querySelector(".message-content");
                if (contentDiv) contentDiv.innerHTML = ""; 
                firstChunk = false;
            }

            // Si hay texto, lo vamos mostrando progresivamente
            if (chunk.text) {
                fullResponse += chunk.text;
                updateBotMessage(botMsgDiv, fullResponse);
            }

            // Manejar llamadas a funciones (Ej. Preparar registro)
            if (chunk.functionCalls) {
                if (botMsgDiv.innerHTML.includes("spinner-border")) botMsgDiv.innerHTML = "";
                for (const call of chunk.functionCalls) {
                    if (call.name === "prepararRegistro") {
                        const { nombre, email, areaInteres } = call.args;
                        localStorage.setItem('cenco_pending_form', JSON.stringify({
                            name: nombre,
                            email: email,
                            targetArea: areaInteres || ""
                        }));
                        appendStatusMessage("📝 ¡Listo! He capturado tus datos para el registro.", botMsgDiv);
                    }
                }
            }
            messages.scrollTop = messages.scrollHeight;
        }

        // Si terminó el stream y no hay nada de texto, avisar
        if (!fullResponse && !botMsgDiv.querySelector('.small')) {
            botMsgDiv.innerHTML = "Tuve un pequeño problema al procesar eso. ¿Podemos intentarlo de nuevo? 😊";
        }
        
        finalizeBotMessage(botMsgDiv, fullResponse);

    } catch (err) {
        console.error("Error en Boxi:", err);
        botMsgDiv.innerHTML = ""; // Limpiar spinner de todas formas
        appendMessage("Ups, tuve un pequeño corto circuito ⚡. Mi IA se reinició, pero ¡aquí sigo! ¿Me repites tu duda?", 'bot');
        // Reiniciar chat si el error es grave para recuperar estabilidad
        resetChat();
    } finally {
        input.disabled = false;
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
}

function appendMessage(text, side, isLoading = false) {
    const messages = document.getElementById("boxi-messages");
    const div = document.createElement("div");
    div.className = `message-bubble ${side} animate-pop`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isLoading) {
        div.innerHTML = `
            <div class="message-content">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                <span>Boxi está escribiendo...</span>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${time}</div>
        `;
    }
    
    messages.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    const messages = document.getElementById("boxi-messages");
    if (messages) {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function updateBotMessage(div, text) {
    const content = div.querySelector(".message-content");
    const cleanText = text.replace(/\[NAV:.+?\]/g, "").trim();
    if (content && cleanText) {
        content.innerText = cleanText;
    }
}

function appendStatusMessage(text, parentDiv) {
    const content = parentDiv.querySelector(".message-content") || parentDiv;
    const statusDiv = document.createElement("div");
    statusDiv.className = "small text-muted mt-2 fst-italic";
    statusDiv.style.borderLeft = "2px solid var(--cenco-blue)";
    statusDiv.style.paddingLeft = "10px";
    statusDiv.innerText = text;
    content.appendChild(statusDiv);
}

function finalizeBotMessage(div, fullText) {
    // Añadir hora si no existe
    if (!div.querySelector(".message-time")) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.innerText = time;
        div.appendChild(timeDiv);
    }

    const navMatch = fullText.match(/\[NAV:(.+?)\]/);
    if (navMatch) {
        const sectionId = navMatch[1];
        const btnLabel = {
            'historia': '📜 Nuestra Historia',
            'vacantes': '💼 Ver Vacantes',
            'historias': '👥 Nuestra Gente',
            'game': '🎮 Ir a Cenco-Play',
            'dashboard': '🔐 Mi Dashboard'
        }[sectionId] || "🚀 Ir ahora";

        const btnContainer = document.createElement("div");
        btnContainer.className = "mt-2";
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-cenco rounded-pill w-100 py-2";
        btn.innerHTML = btnLabel;
        btn.onclick = () => window.navigateTo(sectionId);
        btnContainer.appendChild(btn);
        
        const content = div.querySelector(".message-content") || div;
        content.appendChild(btnContainer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const boxiInput = document.getElementById("boxi-input");
    if (boxiInput) {
        boxiInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.handleSend();
        });
    }
});
