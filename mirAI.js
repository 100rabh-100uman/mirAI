document.addEventListener('DOMContentLoaded', () => {

    // --- 0. LOGIN SYSTEM & PERSONALIZATION (REPLACES OLD PRELOADER) ---
    const preloader = document.getElementById('preloader');
    const enterBtn = document.getElementById('enter-btn');
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const nameInput = document.getElementById('user-name-input');
    const audio = document.getElementById('welcome-audio');

    // Function: Website ko personalize karne ke liye
    function personalizeWebsite(name) {
        const greetingEl = document.getElementById('greeting');
        const firstName = name ? name.split(' ')[0] : 'User';
        
        if (greetingEl) {
            greetingEl.innerHTML = `Good Morning, <span style="color:var(--color-gold); text-shadow: 0 0 15px rgba(212,175,55,0.4);">${firstName}</span>`;
        }
    }

    // 1. Check: Kya User pehle se Login hai?
    const savedName = sessionStorage.getItem('mirAI_UserName');

    if (savedName) {
        // SCENARIO A: Already Logged In
        if (preloader) preloader.style.display = 'none';
        personalizeWebsite(savedName);
    } else {
        // SCENARIO B: New User (Show Login Flow)
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                // 1. Preloader hatao
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => { preloader.style.display = 'none'; }, 500);
                }
                
                // 2. Login Modal dikhao
                if (loginOverlay) {
                    setTimeout(() => {
                        loginOverlay.classList.add('active');
                        if(nameInput) nameInput.focus();
                    }, 300);
                }
            });
        }
    }

    // 2. Handle Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const userName = nameInput.value;
            
            if (userName) {
                sessionStorage.setItem('mirAI_UserName', userName);
                loginOverlay.classList.remove('active');
                personalizeWebsite(userName);
                
                if (audio) {
                    audio.currentTime = 0;
                    audio.volume = 1.0;
                    audio.play().catch(err => console.log("Audio Autoplay blocked"));
                }
                
                if (typeof playClickSound === "function") { 
                    playClickSound(); 
                }
            }
        });
    }

    // --- 1. THREE.JS BACKGROUND ---
    const container = document.getElementById('three-bg');

    if(container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2500);
        camera.position.z = 600;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        container.appendChild(renderer.domElement);

        function createSparkTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const context = canvas.getContext('2d');
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 220, 1)'); 
            gradient.addColorStop(0.3, 'rgba(240, 200, 120, 0.9)'); 
            gradient.addColorStop(0.6, 'rgba(212, 175, 55, 0.4)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
        const sparkTexture = createSparkTexture();

        const goldColor = 0xE6C288; 
        const mainParticleCount = 250; 
        const connectionDistance = 110; 
        const connectionDistanceSq = connectionDistance * connectionDistance;
        const ambientParticleCount = 450;

        const mainGeo = new THREE.BufferGeometry();
        const mainPos = new Float32Array(mainParticleCount * 3);
        const mainVel = [];

        for(let i = 0; i < mainParticleCount; i++) {
            const i3 = i * 3;
            mainPos[i3]      = (Math.random() - 0.5) * 1200; 
            mainPos[i3 + 1] = (Math.random() - 0.5) * 900; 
            mainPos[i3 + 2] = (Math.random() - 0.5) * 700; 
            mainVel.push({
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5,
                z: (Math.random() - 0.5) * 0.3
            });
        }
        mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPos, 3));
        const mainMat = new THREE.PointsMaterial({
            color: 0xffffff,
            map: sparkTexture,
            size: 50,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        const mainSystem = new THREE.Points(mainGeo, mainMat);
        scene.add(mainSystem);

        const lineGeo = new THREE.BufferGeometry();
        const linePos = new Float32Array(mainParticleCount * mainParticleCount * 3);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: goldColor,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            linewidth: 2
        });
        const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lineMesh);

        const ambientGeo = new THREE.BufferGeometry();
        const ambientPos = new Float32Array(ambientParticleCount * 3);
        for(let i = 0; i < ambientParticleCount; i++) {
            const i3 = i * 3;
            ambientPos[i3]      = (Math.random() - 0.5) * 1600; 
            ambientPos[i3 + 1] = (Math.random() - 0.5) * 1300; 
            ambientPos[i3 + 2] = (Math.random() - 0.5) * 1100; 
        }
        ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));
        const ambientMat = new THREE.PointsMaterial({
            color: goldColor,
            map: sparkTexture,
            size: 15,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        const ambientSystem = new THREE.Points(ambientGeo, ambientMat);
        scene.add(ambientSystem);

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2);
            mouseY = (e.clientY - window.innerHeight / 2);
        });

        const clock = new THREE.Clock();

        function animate() {
            const time = clock.getElapsedTime();
            targetX = mouseX * 0.0025; 
            targetY = mouseY * 0.0025;
            
            scene.rotation.y += 0.0002 + (targetX - scene.rotation.y) * 0.01;
            scene.rotation.x += 0.0001 + (targetY - scene.rotation.x) * 0.01;

            const mPositions = mainSystem.geometry.attributes.position.array;
            for(let i = 0; i < mainParticleCount; i++) {
                const i3 = i * 3;
                mPositions[i3]      += mainVel[i].x * 1.2;
                mPositions[i3 + 1] += mainVel[i].y * 1.2;
                mPositions[i3 + 2] += mainVel[i].z * 1.2;
                
                mPositions[i3 + 1] += Math.sin(time * 2 + i) * 0.2;
                mPositions[i3 + 1] += Math.cos(time * 2 + i) * 0.2;

                if(Math.abs(mPositions[i3]) > 700) mainVel[i].x *= -1;
                if(Math.abs(mPositions[i3+1]) > 600) mainVel[i].y *= -1;
                if(Math.abs(mPositions[i3+2]) > 500) mainVel[i].z *= -1;
            }
            mainSystem.geometry.attributes.position.needsUpdate = true;

            let vertexIndex = 0;
            const lPositions = lineMesh.geometry.attributes.position.array;
            for(let i = 0; i < mainParticleCount; i++) {
                for(let j = i + 1; j < mainParticleCount; j++) {
                    const i3 = i * 3;
                    const j3 = j * 3;
                    const dx = mPositions[i3] - mPositions[j3];
                    const dy = mPositions[i3+1] - mPositions[j3+1];
                    const dz = mPositions[i3+2] - mPositions[j3+2];
                    const distSq = dx*dx + dy*dy + dz*dz;
                    if(distSq < connectionDistanceSq) {
                        lPositions[vertexIndex++] = mPositions[i3];
                        lPositions[vertexIndex++] = mPositions[i3+1];
                        lPositions[vertexIndex++] = mPositions[i3+2];
                        lPositions[vertexIndex++] = mPositions[j3];
                        lPositions[vertexIndex++] = mPositions[j3+1];
                        lPositions[vertexIndex++] = mPositions[j3+2];
                    }
                }
            }
            lineMesh.geometry.setDrawRange(0, vertexIndex / 3);
            lineMesh.geometry.attributes.position.needsUpdate = true;

            const aPositions = ambientSystem.geometry.attributes.position.array;
            for(let i = 0; i < ambientParticleCount; i++) {
                   const i3 = i * 3;
                   aPositions[i3 + 1] += Math.sin(time * 0.1 + i) * 0.15;
            }
            ambientSystem.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- 2. 3D MIRROR TILT ---
    document.addEventListener('mousemove', (e) => {
        const mirror = document.getElementById('mirror-3d');
        if(window.innerWidth > 768 && mirror) {
            const x = (window.innerWidth / 2 - e.pageX) / 70;
            const y = (window.innerHeight / 2 - e.pageY) / 70;
            mirror.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        }
    });

    // --- 3. MIRROR MODES & COLOR SWITCHER ---
    window.setMode = function(mode) {
        const greeting = document.getElementById('greeting');
        const subtext = document.getElementById('subtext');
        const cardTitle = document.getElementById('card-title');
        const cardDesc = document.getElementById('card-desc');
        const mainIcon = document.getElementById('main-icon');
        const mirror = document.getElementById('mirror-3d');

        document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));
        
        mirror.classList.remove('emergency-mode');
        greeting.style.removeProperty('color');
        greeting.style.removeProperty('font-weight');
        greeting.style.removeProperty('text-shadow');
        greeting.style.removeProperty('font-size');
        greeting.style.removeProperty('text-transform');

        if (mode === 'morning') {
            document.querySelector("button[onclick=\"setMode('morning')\"]").classList.add('active');
            greeting.innerText = "Good Morning, Saurabh";
            greeting.style.color = "#ffffff"; 
            subtext.innerText = "You look ready to conquer the day.";
            cardTitle.innerText = "Recommendation";
            cardDesc.innerText = "Silk Blouse, Charcoal Trousers.";
            mainIcon.className = "fas fa-magic";

        } else if (mode === 'outfit') {
            document.querySelector("button[onclick=\"setMode('outfit')\"]").classList.add('active');
            greeting.innerText = "Outfit Analysis: 98% Match";
            greeting.style.color = "#E6C288"; 
            subtext.innerText = "Weather is windy. This blazer is perfect.";
            cardTitle.innerText = "Style Tip";
            cardDesc.innerText = "Add a silver watch to complete the look.";
            mainIcon.className = "fas fa-tshirt";

        } else if (mode === 'emergency') {
            document.querySelector("button[onclick=\"setMode('emergency')\"]").classList.add('active');
            mirror.classList.add('emergency-mode');
            greeting.innerText = "⚠️ FALL DETECTED"; 
            greeting.style.setProperty('color', '#FF0000', 'important');
            greeting.style.setProperty('font-weight', '900', 'important');
            greeting.style.setProperty('font-size', '2.4rem', 'important');
            greeting.style.setProperty('text-shadow', '0 0 30px red', 'important');
            greeting.style.setProperty('text-transform', 'uppercase', 'important');
            subtext.innerText = "Contacting Emergency Services in 5s...";
            cardTitle.innerText = "STATUS";
            cardDesc.innerText = "Sharing Live Location...";
            mainIcon.className = "fas fa-phone-volume";
        }
    };

    window.setFinish = function(finish) {
        const mirror = document.getElementById('mirror-3d');
        const dots = document.querySelectorAll('.finish-dot');
        
        dots.forEach(dot => dot.classList.remove('active'));
        document.querySelector(`.finish-dot.${finish}`).classList.add('active');

        if (finish === 'silver') {
            mirror.classList.add('silver-mode');
            if(typeof playClickSound === "function") playClickSound();
        } else {
            mirror.classList.remove('silver-mode');
            if(typeof playClickSound === "function") playClickSound();
        }
    };

    // --- 4. FAQ ACCORDION ---
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            question.classList.toggle("active");
            const answer = question.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // --- 5. LIVE CLOCK, DATE & SMART GREETING (UPDATED) ---
    function updateDateTime() {
        const now = new Date();

        // 1. Time Update
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const clockEl = document.getElementById('clock');
        if(clockEl) clockEl.innerText = time;

        // 2. Date Update
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        
        const monthName = months[now.getMonth()];
        const dayName = days[now.getDay()];
        const dateNum = now.getDate();

        const mEl = document.getElementById('live-month');
        const dEl = document.getElementById('live-day');
        const nEl = document.getElementById('live-date');
        
        if(mEl) mEl.innerText = monthName;
        if(dEl) dEl.innerText = dayName;
        if(nEl) nEl.innerText = dateNum;

        // --- 3. SMART GREETING LOGIC (INSAN WALA) ---
        const greetingEl = document.getElementById('greeting');
        
        // Check: Agar Jarvis "Listening..." bol raha hai, to disturb mat karo
        if (greetingEl && !greetingEl.innerText.includes("Listening") && !greetingEl.innerText.includes("Lights")) {
            
            const hrs = now.getHours();
            let greetText = "Good Morning"; // Default

            // Logic:
            if (hrs >= 0 && hrs < 5) {
                greetText = "Time to Sleep";  // Raat ke 12 se 5 baje tak
            } else if (hrs >= 5 && hrs < 12) {
                greetText = "Good Morning";   // Subah 5 se 12
            } else if (hrs >= 12 && hrs < 17) {
                greetText = "Good Afternoon"; // Dophar 12 se 5
            } else if (hrs >= 17) {
                greetText = "Good Evening";   // Shaam 5 ke baad
            }

            // User ka naam (Agar login nahi kiya to 'User' dikhayega)
            const savedName = sessionStorage.getItem('mirAI_UserName');
            const displayName = savedName ? savedName.split(' ')[0] : "User";

            // Update Text
            greetingEl.innerHTML = `${greetText}, <span style="color:var(--color-gold); text-shadow: 0 0 15px rgba(212,175,55,0.4);">${displayName}</span>`;
        }
    }
    
    // Clock ko start karo
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // --- 6. VIDEO MODAL ---
    const modal = document.getElementById("video-modal");
    const btn = document.getElementById("watch-film-btn");
    const span = document.getElementsByClassName("close-video")[0];
    const video = document.getElementById("promo-video");

    if(btn) {
        btn.onclick = function() {
            modal.style.display = "flex";
            video.play();
        }
    }
    if(span) {
        span.onclick = function() {
            modal.style.display = "none";
            video.pause();
        }
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            video.pause();
        }
    }

    // --- 7. 3D TILT CARDS ---
    const cards = document.querySelectorAll('.feature-card-3d, .super-card-3d, .health-card, .vision-card-3d, .review-card, .model-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- 8. SIDEBAR MENU & APP PAGE LOGIC ---
    window.openNav = function() { document.getElementById("myNav").style.width = "300px"; }
    window.closeNav = function() { document.getElementById("myNav").style.width = "0%"; }
    window.openAppPage = function() { closeNav(); document.getElementById("app-overlay-section").style.width = "100%"; }
    window.closeAppPage = function() { document.getElementById("app-overlay-section").style.width = "0%"; }
    window.openJourneyPage = function() { closeNav(); document.getElementById("journey-overlay-section").style.width = "100%"; }
    window.closeJourneyPage = function() { document.getElementById("journey-overlay-section").style.width = "0%"; }
    
    /* --- 7. LIVE DELHI WEATHER & AQI (UPDATED - CLEAN HEADER) --- */
function fetchDelhiLive() {
    // Delhi Coordinates
    const lat = 28.61;
    const lon = 77.20;

    // API URLs
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    // 1. Weather Fetch
    fetch(weatherUrl)
        .then(res => res.json())
        .then(wData => {
            const temp = Math.round(wData.current_weather.temperature);
            const wCode = wData.current_weather.weathercode;
            
            // Icon Logic
            let icon = '<i class="fas fa-sun"></i>'; 
            if(wCode > 3) icon = '<i class="fas fa-cloud-sun"></i>';
            if(wCode >= 45) icon = '<i class="fas fa-smog"></i>';
            if(wCode >= 51) icon = '<i class="fas fa-cloud-rain"></i>';

            // 2. AQI Fetch
            fetch(aqiUrl)
                .then(res => res.json())
                .then(aData => {
                    const aqi = aData.current.us_aqi;
                    
                    // AQI Color Logic
                    let aqiColor = "#00e400"; // Green
                    if(aqi > 50) aqiColor = "#ffff00"; // Yellow
                    if(aqi > 100) aqiColor = "#ff7e00"; // Orange
                    if(aqi > 150) aqiColor = "#ff0000"; // Red
                    if(aqi > 300) aqiColor = "#7e0023"; // Purple

                    // A. Update BIG AQI BOX (Niche wala box update hoga)
                    const aqiValText = document.querySelector('.aqi-val-text');
                    const aqiIcon = document.querySelector('.aqi-indicator i');
                    
                    if(aqiValText) {
                        aqiValText.innerText = aqi;
                        aqiValText.style.color = aqiColor;
                        if(aqiIcon) aqiIcon.style.color = aqiColor;
                    }

                    // B. Update TOP HEADER (Yahan se AQI hata diya hai)
                    const infoElement = document.querySelector('.sub-info span');
                    if(infoElement) {
                        // Ab sirf Weather Icon aur Temperature dikhega
                        infoElement.innerHTML = `${icon} ${temp}°C`; 
                    }
                });
        })
        .catch(err => console.log("Weather Error:", err));
}

// Start Function
fetchDelhiLive();
setInterval(fetchDelhiLive, 600000);

/* --- SCROLL REVEAL --- */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-zoom');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });
    // ... ऊपर initScrollReveal का कोड है ...
    reveals.forEach(element => { observer.observe(element); });
}

// --- IMPORTANT FIX HERE ---
initScrollReveal(); // 1. Animation Start karo
}); // 2. Main darwaza band karo (Yeh bahut zaruri hai!)

/* --- CLICK BOOM EFFECT --- */

/* --- CLICK BOOM EFFECT --- */
document.addEventListener('click', (e) => {
    const wave = document.createElement('div');
    wave.classList.add('metal-wave');
    wave.style.left = e.clientX + 'px';
    wave.style.top = e.clientY + 'px';
    document.body.appendChild(wave);
    setTimeout(() => { wave.remove(); }, 550);
});

/* --- AUDIO UI --- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15); 
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function playHoverSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', playClickSound);
    const interactiveElements = document.querySelectorAll('a, button, .sim-btn, .vision-card-3d, .feature-card-3d, .model-btn, .faq-question');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
    });
});

/* --- JARVIS VOICE LOGIC --- */
window.activateJarvis = function() {
    const btn = document.querySelector('.mic-btn');
    const greeting = document.getElementById('greeting');
    const subtext = document.getElementById('subtext');
    
    // 1. Sound Play karein (Agar purana sound function hai)
    if(typeof playClickSound === "function") playClickSound();

    // 2. Button ko "Listening Mode" (Red) karein
    btn.classList.add('listening');

    // 3. Text Change: Listening...
    const oldGreeting = greeting.innerText;
    const oldSub = subtext.innerText;

    greeting.innerText = "Listening...";
    greeting.style.color = "#E6C288"; // Gold Text
    subtext.innerText = "Speak now...";

    // 4. Simulation (3 second baad command execute hogi)
    setTimeout(() => {
        // Processing...
        subtext.innerText = "Processing Command...";
        
        setTimeout(() => {
            // COMMAND EXECUTED
            btn.classList.remove('listening'); // Button normal
            greeting.innerText = "Bedroom Lights: ON";
            greeting.style.color = "#fff";
            subtext.innerText = "Brightness set to 80%";
            
            // 5. Wapas Normal hone ke liye (3 sec baad)
            setTimeout(() => {
                greeting.innerText = oldGreeting;
                subtext.innerText = oldSub;
                greeting.style.color = ""; // Reset color
            }, 3000);

        }, 1500); // 1.5 sec processing time

    }, 2000); // 2 sec listening time
};

/* =========================================
   mirAI - CORE JAVASCRIPT & INTELLIGENCE
   ========================================= */

// --- 1. CHATBOT INTELLIGENCE (THE SUPER DICTIONARY) ---
const knowledgeBase = {
    // --- IDENTITY & BASICS ---
    "hello": "Hello! I am mirAI's neural assistant. I can explain features, safety protocols, or specs.",
    "hi": "Hi there! Welcome to the future of home living.",
    "who are you": "I am the Neural Engine X1, the AI brain living inside the mirAI mirror.",
    "founder": "mirAI is the vision of Saurabh Suman, designed to merge luxury with invisible intelligence.",
    "what is mirai": "mirAI is the world's first Privacy-First Smart Mirror. It combines a 4K display, health sensors, and a personal assistant into a beautiful mirror.",

    // --- SAFETY & GUARDIAN (The Most Important) ---
    "fall": "Active Fall Detection is our flagship feature. Using skeletal tracking, I detect if someone falls (especially seniors) and instantly alert emergency contacts.",
    "emergency": "In case of falls, gas leaks, or fire, I trigger a loud alarm and send notifications to your family's phones via the mirAI App.",
    "gas": "I connect with external sensors to detect LPG/Gas leaks. If a leak is found, I sound an alarm immediately.",
    "smoke": "My visual AI discriminates between harmless incense (agarbatti) smoke and dangerous fire smoke to warn you of fires early.",
    "fire": "I use visual recognition to detect smoke patterns and alert you before a fire spreads.",
    "disaster": "I am linked to Government Disaster Management APIs. I will flash Red Alerts for Earthquakes, Cyclones, or Heatwaves seconds before they strike.",
    "alert": "I provide alerts for: Falls, Gas Leaks, Fire Smoke, and Natural Disasters.",

    // --- HEALTH & VITALS ---
    "health": "I am your invisible doctor. I track Heart Rate, Blood Pressure trends, and Stress levels daily without touching you.",
    "heart": "Using rPPG technology, I analyze facial blood-flow color changes to measure your Heart Rate accurately.",
    "bp": "I estimate Blood Pressure trends using advanced AI analysis of your facial pulse waves.",
    "stress": "I detect anxiety via micro-expressions and HRV (Heart Rate Variability). If you look stressed, I'll suggest calming music.",
    "medicine": "I use Face ID to recognize family members (like Grandma) and visually remind them: 'Time for your BP tablet.'",
    "doctor": "I am not a replacement for a doctor, but I provide clinical-grade monitoring to keep you aware of your daily vitals.",

    // --- LIFESTYLE & GROOMING ---
    "outfit": "Struggling with what to wear? I analyze your Wardrobe + Weather + Calendar to suggest the perfect look.",
    "clothes": "I act as your AI Stylist. 'Sunny day + Business Meeting? Wear the Navy Suit.'",
    "makeup": "For perfect makeup, I switch the lights to 'Daylight Mode' (5500K) so your colors look accurate.",
    "shave": "For men, I offer 'Shadow-Free Mode' lighting to ensure a sharp, cut-free shave.",
    "light": "I have smart LED rings that adjust from Warm (Evening) to Cool White (Morning) automatically.",
    "music": "I play music using 'Sonic Surface' technology—the glass itself vibrates to create sound. No visible speakers.",
    "spotify": "Yes, I sync seamlessly with Spotify, Apple Music, and Amazon Music.",

    // --- DAILY ROUTINE & PRODUCTIVITY ---
    "traffic": "I check Google Maps 30 mins before your schedule. 'Leave 10 mins early, heavy traffic on NH-8.'",
    "commute": "I proactively monitor your route to work and warn you of delays.",
    "calendar": "I sync with Google Calendar & Outlook. Your day's schedule appears on the mirror as you brush your teeth.",
    "weather": "I show real-time Weather & AQI (Air Quality). If it's raining, I'll remind you to take an umbrella.",
    "time": "I am also a beautiful clock. I keep you on time without you needing to check your phone.",

    // --- PRIVACY (Crucial) ---
    "privacy": "Privacy is our #1 priority. I function 100% Offline. Your data never leaves the NPU chip inside the mirror.",
    "record": "I do NOT record video. The camera is only for live processing (Live-Input). No footage is saved.",
    "cloud": "Unlike Alexa/Google, I do not send voice or video to the cloud. I am a 'Zero-Cloud' device for camera tasks.",
    "hack": "Since my vision data never touches the internet, there is nothing for hackers to steal.",
    "camera": "The camera has a **Physical Mechanical Shutter**. You can slide it close to physically blind the camera.",
    "shutter": "Yes, a real physical blocker covers the lens. Software cannot override it.",

    // --- TECH SPECS ---
    "screen": "I feature an 'Infinity OLED 4K' display. When off, the pixels turn true black, making the technology invisible.",
    "display": "It's a 4K OLED panel bonded directly to the glass (Zero-Gap) for a seamless look.",
    "processor": "Powered by the Neural Engine X1 chip, capable of 4 Trillion Operations per second for offline AI.",
    "wifi": "I support Wi-Fi 6E and Bluetooth 5.3 for ultra-fast connectivity with your phone and smart home.",
    "sound": "Invisible Sonic Surface Audio. The entire mirror glass acts as a high-fidelity speaker.",
    "water": "Yes, mirAI is IP65 Water-Resistant, making it perfectly safe for bathroom humidity.",
    "power": "I am energy efficient. I use an Eco-Mode when no one is around to save electricity.",
    "install": "It mounts just like a regular heavy mirror. You only need a standard power outlet behind it.",

    // --- BUSINESS & BUYING ---
    "price": "mirAI Core starts at ₹XX,999. The Luxe Gold Edition pricing will be revealed soon.",
    "cost": "It's an investment in your family's safety. Base model starts at ₹XX,999.",
    "buy": "We are currently in Beta. Please click the 'Pre-Order' button in the menu to join the waitlist.",
    "warranty": "mirAI comes with a standard 1-Year Warranty. Extended plans are available.",
    "availability": "We are accepting pre-orders now. Shipping begins late 2025.",

    // --- DEFAULT (Fallback) ---
    "default": "I am trained on mirAI's features. Try asking about: 'Privacy', 'Fall Detection', 'Price', or 'Makeup Mode'."
};

// --- 2. CHATBOT FUNCTIONS ---

function toggleChat() {
    const chat = document.getElementById('chatbot');
    const toggler = document.querySelector('.chatbot-toggler');
    chat.classList.toggle('active');
    
    // Hide notification pulse when opened
    if(chat.classList.contains('active')) {
        const pulse = document.querySelector('.chat-btn-pulse');
        if(pulse) pulse.style.display = 'none';
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

function quickAsk(topic) {
    const input = document.getElementById('chat-input');
    input.value = topic;
    sendMessage();
}

function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const userText = inputField.value.trim();

    if (userText === "") return;

    // 1. Add User Message
    addMessage(userText, 'user');
    inputField.value = ""; 

    // 2. Simulate Thinking (Delay with dots)
    const loadingId = 'loading-' + Date.now();
    addMessage('<span class="typing-dots">...</span>', 'bot', loadingId);

    setTimeout(() => {
        // Remove loading message
        const loadingMsg = document.getElementById(loadingId);
        if(loadingMsg) loadingMsg.remove();

        // Get Logic-based Response
        const botResponse = findBestMatch(userText);
        addMessage(botResponse, 'bot');
    }, 800); // 800ms delay looks more natural
}

function addMessage(text, sender, id = null) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    if(id) msgDiv.id = id;
    msgDiv.innerHTML = sender === 'bot' && !text.includes('<span') ? `<p>${text}</p>` : text; // Format simple text
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- 3. THE BRAIN ALGORITHM (Keyword Matching) ---
function findBestMatch(userInput) {
    userInput = userInput.toLowerCase();
    
    // Priority Keywords (agar ye words hain to pehle ye check karo)
    if (userInput.includes("price") || userInput.includes("cost") || userInput.includes("much")) return knowledgeBase["price"];
    if (userInput.includes("buy") || userInput.includes("order")) return knowledgeBase["buy"];
    if (userInput.includes("privacy") || userInput.includes("safe") || userInput.includes("secure")) return knowledgeBase["privacy"];
    if (userInput.includes("fall")) return knowledgeBase["fall"];

    // Loop through all keys
    for (let key in knowledgeBase) {
        if (userInput.includes(key)) {
            return knowledgeBase[key];
        }
    }
    
    // Smart Replies for Greetings
    if (userInput.includes("thank")) return "You are welcome! Let me know if you need anything else.";
    if (userInput.includes("bye")) return "Goodbye! Stay safe and smart.";

    return knowledgeBase["default"];
}

// --- 4. WEBSITE INTERACTION LOGIC (Clock, Greeting, etc.) ---

// Clock & Date
function updateTime() {
    const now = new Date();
    
    // Time
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const timeString = `${hours}:${minutes} ${ampm}`;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = timeString;

    // Date
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    const liveMonth = document.getElementById('live-month');
    const liveDay = document.getElementById('live-day');
    const liveDate = document.getElementById('live-date');

    if(liveMonth) liveMonth.innerText = months[now.getMonth()];
    if(liveDay) liveDay.innerText = days[now.getDay()];
    if(liveDate) liveDate.innerText = now.getDate();
}
setInterval(updateTime, 1000);
updateTime();

// Preloader
window.addEventListener('load', () => {
    const enterBtn = document.getElementById('enter-btn');
    if(enterBtn) {
        enterBtn.addEventListener('click', () => {
            document.getElementById('preloader').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('preloader').style.display = 'none';
                // document.getElementById('welcome-audio').play().catch(e => console.log("Audio requires interaction"));
            }, 800);
        });
    }
});

// Login Logic
const loginForm = document.getElementById('login-form');
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('user-name-input').value;
        if (name) {
            document.getElementById('login-overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('greeting').innerText = `Good Morning, ${name}`;
                document.getElementById('welcome-audio').play().catch(e => console.log("Autoplay blocked"));
            }, 800);
        }
    });
}

// Mic / Jarvis Trigger
function activateJarvis() {
    const micBtn = document.querySelector('.mic-btn');
    const icon = document.querySelector('.mic-btn i');
    
    micBtn.classList.add('listening');
    icon.classList.remove('fa-microphone');
    icon.classList.add('fa-wave-square'); // Visual feedback
    
    setTimeout(() => {
        micBtn.classList.remove('listening');
        icon.classList.add('fa-microphone');
        icon.classList.remove('fa-wave-square');
        alert("🎤 Listening Simulation: 'Show me my schedule for today.'");
    }, 3000);
}

// Side Nav
function openNav() { document.getElementById("myNav").style.width = "100%"; }
function closeNav() { document.getElementById("myNav").style.width = "0%"; }

// Video Modal
const watchBtn = document.getElementById('watch-film-btn');
const videoModal = document.getElementById('video-modal');
const closeVideo = document.querySelector('.close-video');

if(watchBtn) {
    watchBtn.addEventListener('click', () => {
        videoModal.style.display = "flex";
        document.getElementById('promo-video').play();
    });
}
if(closeVideo) {
    closeVideo.addEventListener('click', () => {
        videoModal.style.display = "none";
        document.getElementById('promo-video').pause();
    });
}

// 3D Tilt Effect on Cards
const cards = document.querySelectorAll('.feature-card-3d, .vision-card-3d');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});

// Scroll Reveal Animation
function reveal() {
    var reveals = document.querySelectorAll(".reveal, .reveal-zoom");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);

// Journey & App Pages (Overlays)
function openJourneyPage() { document.getElementById("journey-overlay-section").classList.add('active'); closeNav(); }
function closeJourneyPage() { document.getElementById("journey-overlay-section").classList.remove('active'); }
function openAppPage() { document.getElementById("app-overlay-section").classList.add('active'); closeNav(); }
function closeAppPage() { document.getElementById("app-overlay-section").classList.remove('active'); }
function openHospitalityPage() {
    document.getElementById("hospitality-overlay-section").style.display = "block";
    closeNav(); // मेनू बंद करने के लिए
}

function closeHospitalityPage() {
    document.getElementById("hospitality-overlay-section").style.display = "none";
}

// Simulation Mode Switcher
function setMode(mode) {
    const title = document.getElementById('card-title');
    const desc = document.getElementById('card-desc');
    const icon = document.getElementById('main-icon');
    const btns = document.querySelectorAll('.sim-btn');
    
    btns.forEach(b => b.classList.remove('active'));

    if(mode === 'morning') {
        title.innerText = "Recommendation";
        desc.innerText = "Silk Blouse, Charcoal Trousers.";
        icon.className = "fas fa-magic";
        btns[0].classList.add('active');
        document.querySelector('.mirror-capsule').style.boxShadow = "0 0 50px rgba(212, 175, 55, 0.3)";
    } 
    else if(mode === 'outfit') {
        title.innerText = "Style AI";
        desc.innerText = "Rainy today. Suggested: Trench Coat.";
        icon.className = "fas fa-tshirt";
        btns[1].classList.add('active');
        document.querySelector('.mirror-capsule').style.boxShadow = "0 0 50px rgba(0, 200, 255, 0.3)";
    }
    else if(mode === 'emergency') {
        title.innerText = "FALL DETECTED";
        desc.innerText = "Calling Emergency Contact (Son)...";
        icon.className = "fas fa-first-aid";
        btns[2].classList.add('active');
        document.querySelector('.mirror-capsule').style.boxShadow = "0 0 80px rgba(255, 0, 0, 0.6)";
        alert("🚨 Simulation: Fall Detected! Initiating SOS Protocol.");
    }
}

/* =========================================
   HOSPITALITY SUITE - FIXED LOGIC
   ========================================= */

// 1. Function: Hospitality Overlay खोलने के लिए
window.openHospitalityPage = function() {
    const hospitalityOverlay = document.getElementById("hospitality-overlay-section");
    if (hospitalityOverlay) {
        hospitalityOverlay.style.width = "100%"; // CSS width: 0 को 100% करेगा
        closeNav(); // साइडबार मेनू को बंद करेगा
        console.log("Hospitality Suite Opened");
    } else {
        console.error("Error: hospitality-overlay-section ID not found in HTML!");
    }
};

// 2. Function: Hospitality Overlay बंद करने के लिए
window.closeHospitalityPage = function() {
    const hospitalityOverlay = document.getElementById("hospitality-overlay-section");
    if (hospitalityOverlay) {
        hospitalityOverlay.style.width = "0%"; // वापस छिपा देगा
    }
};

/* --- Consistency Fix for other Overlays --- */
// सुनिश्चित करें कि Journey और App पेज भी इसी तरह काम करें (width के साथ)
window.openJourneyPage = function() { 
    document.getElementById("journey-overlay-section").style.width = "100%"; 
    closeNav(); 
};
window.closeJourneyPage = function() { 
    document.getElementById("journey-overlay-section").style.width = "0%"; 
};

window.openAppPage = function() { 
    document.getElementById("app-overlay-section").style.width = "100%"; 
    closeNav(); 
};
window.closeAppPage = function() { 
    document.getElementById("app-overlay-section").style.width = "0%"; 
};

function reportIssue(element, department) {
    // 1. UI State Update
    element.classList.add('reported');
    const dot = element.querySelector('.status-dot');
    if(dot) {
        dot.style.background = "#00ff88";
        dot.style.boxShadow = "0 0 10px #00ff88";
    }

    // 2. Dashboard Notification Update
    const statusPanel = document.getElementById('issue-status-panel');
    const itemName = element.querySelector('span').innerText;
    
    statusPanel.innerHTML = `
        <span style="color:#00ff88; font-weight:700; animation: fadeIn 0.5s;">
            <i class="fas fa-check-double"></i> 
            Success: Ticket #8819 for <strong>${itemName}</strong> sent to <strong>${department} Dept</strong>. 
            Estimated resolution: 15 mins.
        </span>
    `;
    
    if(typeof playClickSound === "function") playClickSound();
}

// --- MIRAI LIVE LOCATION ENGINE ---
function updateLiveLocation() {
    const locElement = document.getElementById('live-location');

    // 1. Check if Browser supports Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                // 2. Reverse Geocoding API (Free & No Key needed for basic use)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                
                // 3. Extract City and State (e.g., Kota, RJ)
                const city = data.address.city || data.address.town || data.address.village || "Unknown";
                const state = data.address.state || "";
                const stateShort = state ? state.substring(0, 2).toUpperCase() : "";

                locElement.innerHTML = `<i class="fas fa-location-dot"></i> ${city.toUpperCase()}, ${stateShort}`;
            } catch (error) {
                locElement.innerHTML = `<i class="fas fa-location-dot"></i> KOTA, RJ (Default)`;
            }
        }, () => {
            locElement.innerHTML = `<i class="fas fa-location-dot"></i> ACCESS DENIED`;
        });
    } else {
        locElement.innerHTML = `<i class="fas fa-location-dot"></i> NOT SUPPORTED`;
    }
}

// Side Nav खुलने पर लोकेशन अपडेट करें
document.querySelector('.menu-icon')?.addEventListener('click', updateLiveLocation);
// पेज लोड होने पर भी एक बार रन करें
updateLiveLocation();
