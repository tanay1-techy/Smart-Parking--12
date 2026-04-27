// AI Chatbot UI & Logic (Phase 1)

const elements = {
    fab: document.getElementById('ai-fab'),
    chatWindow: document.getElementById('ai-chat-window'),
    closeBtn: document.getElementById('ai-close-btn'),
    messagesContainer: document.getElementById('ai-chat-messages'),
    chatForm: document.getElementById('ai-chat-form'),
    chatInput: document.getElementById('ai-chat-input'),
    typingIndicator: document.getElementById('ai-typing-indicator'),
    quickReplies: document.querySelectorAll('.ai-quick-reply')
};

let isOpen = false;
let chatState = 0; // 0: Asking vehicle type, 1: Asking zone, 2: Asking duration, 3: Recommendation
let userPreferences = {
    vehicleType: '',
    zone: '',
    duration: ''
};

let currentLang = 'en';
const i18n = {
    en: {
        zoneQ: "Got it, you're driving a <strong>{type}</strong> vehicle. Which zone do you prefer?",
        durQ: "Great. How long do you plan to park?",
        found: "I found a perfect spot for you: <strong>Slot {slot}</strong>.",
        rate: "Rate:",
        est: "Est. Total:",
        hold: "Hold Spot (10 mins)",
        fallback: "I've already secured your spot! If you need more help, just ask.",
        held: "✅ <strong>Slot {slot} is held for you!</strong><br><br>I've redirected you to the booking screen to finalize payment."
    },
    es: {
        zoneQ: "Entendido, conduces un vehículo <strong>{type}</strong>. ¿Qué zona prefieres?",
        durQ: "Genial. ¿Cuánto tiempo planeas aparcar?",
        found: "Encontré un lugar perfecto para ti: <strong>Espacio {slot}</strong>.",
        rate: "Tarifa:",
        est: "Total Est.:",
        hold: "Reservar Espacio (10 min)",
        fallback: "¡Ya aseguré tu espacio! Si necesitas más ayuda, solo pregunta.",
        held: "✅ <strong>¡El espacio {slot} está reservado para ti!</strong><br><br>Te he redirigido a la pantalla de reserva para finalizar el pago."
    },
    fr: {
        zoneQ: "Compris, vous conduisez un véhicule <strong>{type}</strong>. Quelle zone préférez-vous ?",
        durQ: "Super. Combien de temps comptez-vous stationner ?",
        found: "J'ai trouvé la place parfaite pour vous : <strong>Emplacement {slot}</strong>.",
        rate: "Tarif :",
        est: "Total Est. :",
        hold: "Réserver la place (10 min)",
        fallback: "J'ai déjà sécurisé votre place ! Si vous avez besoin d'aide, demandez.",
        held: "✅ <strong>L'emplacement {slot} vous est réservé !</strong><br><br>Je vous ai redirigé vers l'écran de réservation pour finaliser le paiement."
    }
};

function detectLanguage(text) {
    const t = text.toLowerCase();
    if (t.includes('hola') || t.includes('gracias') || t.includes('español')) return 'es';
    if (t.includes('bonjour') || t.includes('merci') || t.includes('français')) return 'fr';
    return currentLang;
}

export function initAIAssistant() {
    if (!elements.fab) return;

    // Toggle Chat Window
    elements.fab.addEventListener('click', toggleChat);
    elements.closeBtn.addEventListener('click', toggleChat);

    // Form Submission
    elements.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = elements.chatInput.value.trim();
        if (text) {
            handleUserMessage(text);
            elements.chatInput.value = '';
        }
    });

    // Quick Replies (Initial)
    elements.quickReplies.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.textContent.trim().split(' ').slice(1).join(' '); // remove emoji
            handleUserMessage(text);
            // Hide quick replies after selection
            e.target.parentElement.style.display = 'none';
        });
    });
}

function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
        elements.chatWindow.classList.remove('scale-0', 'opacity-0');
        elements.chatWindow.classList.add('scale-100', 'opacity-100');
        elements.fab.querySelector('.absolute').classList.add('hidden'); // hide red dot
        setTimeout(() => elements.chatInput.focus(), 300);
    } else {
        elements.chatWindow.classList.remove('scale-100', 'opacity-100');
        elements.chatWindow.classList.add('scale-0', 'opacity-0');
    }
}

function appendUserMessage(text) {
    const msgHTML = `
        <div class="flex gap-3 max-w-[85%] self-end">
            <div class="bg-[#4318FF] text-white p-3 rounded-2xl rounded-tr-sm shadow-sm border border-[#4318FF]/20">
                <p class="font-body-md">${text}</p>
            </div>
        </div>
    `;
    elements.messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    scrollToBottom();
}

function appendAIMessage(htmlContent) {
    const msgHTML = `
        <div class="flex gap-3 max-w-[85%] ai-message">
            <div class="w-8 h-8 rounded-full bg-[#4318FF] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <span class="material-symbols-outlined text-white text-[16px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </div>
            <div class="bg-surface-container-lowest p-3 rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/20">
                ${htmlContent}
            </div>
        </div>
    `;
    elements.messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    scrollToBottom();
}

function showTyping() {
    elements.typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

function hideTyping() {
    elements.typingIndicator.classList.add('hidden');
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Simulated LLM Logic / Flow Manager
function handleUserMessage(text) {
    if (chatState === 0) currentLang = detectLanguage(text);
    
    appendUserMessage(text);
    showTyping();

    setTimeout(() => {
        hideTyping();
        processAIResponse(text);
    }, 1000 + Math.random() * 1000); // Simulate network delay
}

function processAIResponse(text) {
    const lang = i18n[currentLang];
    
    if (chatState === 0) {
        userPreferences.vehicleType = text;
        chatState++;
        
        const html = `
            <p class="font-body-md text-on-surface">${lang.zoneQ.replace('{type}', text)}</p>
            <div class="flex flex-wrap gap-2 mt-3" id="qr-zone">
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">Zone A</button>
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">Zone B</button>
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">Closest Available</button>
            </div>
        `;
        appendAIMessage(html);
        attachDynamicQuickReplies('qr-zone');
    } 
    else if (chatState === 1) {
        userPreferences.zone = text;
        chatState++;
        
        const html = `
            <p class="font-body-md text-on-surface">${lang.durQ}</p>
            <div class="flex flex-wrap gap-2 mt-3" id="qr-duration">
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">1 Hour</button>
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">2 Hours</button>
                <button class="ai-quick-reply px-3 py-1.5 bg-[#4318FF]/10 text-[#4318FF] rounded-full font-label-sm hover:bg-[#4318FF]/20 transition-colors border border-[#4318FF]/20">Full Day (8 Hrs)</button>
            </div>
        `;
        appendAIMessage(html);
        attachDynamicQuickReplies('qr-duration');
    }
    else if (chatState === 2) {
        userPreferences.duration = text;
        chatState++;
        
        // Simulating Backend Query for Slot and Pricing
        const recommendedSlot = userPreferences.zone.includes('B') ? 'B-14' : 'A-05';
        const isEV = userPreferences.vehicleType.toLowerCase().includes('ev') || userPreferences.vehicleType.toLowerCase().includes('eléctrico') || userPreferences.vehicleType.toLowerCase().includes('électrique');
        const estPrice = text.includes('8') ? 200 : (text.includes('2') ? 50 : 25);
        const finalPrice = isEV ? estPrice + 20 : estPrice;
        
        const html = `
            <p class="font-body-md text-on-surface">
                ${lang.found.replace('{slot}', recommendedSlot)}
            </p>
            <div class="bg-surface-container-low p-3 mt-2 rounded-lg border border-outline-variant/30 text-sm">
                <div class="flex justify-between mb-1"><span>${lang.rate}</span> <span>₹25/hr</span></div>
                ${isEV ? '<div class="flex justify-between mb-1 text-green-600"><span>EV Charging:</span> <span>+₹20 (Fixed)</span></div>' : ''}
                <div class="flex justify-between font-bold mt-2 pt-2 border-t border-outline-variant/20">
                    <span>${lang.est}</span> <span class="text-[#4318FF]">₹${finalPrice}.00</span>
                </div>
            </div>
            <button id="ai-hold-spot-btn" class="w-full mt-3 bg-[#4318FF] text-white py-2 rounded-lg font-label-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">bookmark</span> ${lang.hold}
            </button>
        `;
        appendAIMessage(html);
        
        setTimeout(() => {
            document.getElementById('ai-hold-spot-btn').addEventListener('click', () => {
                holdSpot(recommendedSlot, text);
            });
        }, 100);
    }
    else {
        // Fallback for general conversation
        const html = `<p class="font-body-md text-on-surface">${lang.fallback}</p>`;
        appendAIMessage(html);
    }
}

function attachDynamicQuickReplies(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('.ai-quick-reply');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.textContent.trim();
            handleUserMessage(text);
            container.style.display = 'none';
        });
    });
}

function holdSpot(slotId, durationText) {
    const lang = i18n[currentLang];
    const html = `
        <p class="font-body-md text-on-surface">
            ${lang.held.replace('{slot}', slotId)}
        </p>
    `;
    appendAIMessage(html);
    
    // Integrate with main UI
    setTimeout(() => {
        toggleChat();
        
        const navLinks = document.querySelectorAll('#nav-menu a[data-section]');
        const bookingLink = Array.from(navLinks).find(l => l.dataset.section === 'booking');
        const mapLink = Array.from(navLinks).find(l => l.dataset.section === 'map');
        
        if (mapLink && window.drawNavigationPath) {
            mapLink.click();
            setTimeout(() => window.drawNavigationPath(slotId), 100);
            
            // Wait for 2.5s to see the route, then go to booking
            setTimeout(() => {
                if (bookingLink) {
                    bookingLink.click();
                    setTimeout(() => fillBooking(slotId, durationText), 300);
                }
            }, 2500);
        } else if (bookingLink) {
            bookingLink.click();
            setTimeout(() => fillBooking(slotId, durationText), 300);
        }
    }, 1500);
}

function fillBooking(slotId, durationText) {
    const slotSelect = document.getElementById('booking-slot');
    if(slotSelect) {
        let optionExists = Array.from(slotSelect.options).some(o => o.value === slotId);
        if(!optionExists) {
            const opt = new Option(`Slot ${slotId}`, slotId);
            slotSelect.add(opt);
        }
        slotSelect.value = slotId;
    }
    
    const durationSelect = document.getElementById('booking-duration');
    if(durationSelect) {
        if (durationText.includes('1')) durationSelect.value = "1";
        else if (durationText.includes('8')) durationSelect.value = "8";
        else durationSelect.value = "2";
    }
    
    if (window.updatePriceEstimate) {
        window.updatePriceEstimate();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initAIAssistant);
