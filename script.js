import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDNtkM7hLeIsD2HzWxQKJFH8fsXOVKrv18", authDomain: "tanvir-gallery-free.firebaseapp.com", databaseURL: "https://tanvir-gallery-free-default-rtdb.firebaseio.com", projectId: "tanvir-gallery-free", storageBucket: "tanvir-gallery-free.firebasestorage.app", messagingSenderId: "442605910126", appId: "1:442605910126:web:b89792cb6204a5b7eb0e7f" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 1. PREMIUM SITE PRELOADER ---
const preloaderHTML = `<div id="site-preloader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#ffffff; z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; transition:opacity 0.6s ease-out;"><div class="loader-pulse"></div><div style="margin-top:20px; font-family:'Outfit', sans-serif; color:#64748b; font-size:0.9rem; letter-spacing:2px; font-weight:600; text-transform:uppercase; animation:fadeIn 1s infinite alternate;">Loading</div><style>.loader-pulse { position: relative; width: 60px; height: 60px; background: #2563eb; border-radius: 50%; animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; } .loader-pulse::after { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff; border-radius: 50%; animation: pulse-dot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; } @keyframes pulse-ring { 0% { transform: scale(0.33); } 80%, 100% { opacity: 0; } } @keyframes pulse-dot { 0% { transform: scale(0.8); } 50% { transform: scale(1); } 100% { transform: scale(0.8); } } @keyframes fadeIn { from { opacity: 0.5; } to { opacity: 1; } }</style></div>`;
if (!document.getElementById('site-preloader')) { document.body.insertAdjacentHTML('afterbegin', preloaderHTML); }

// --- 2. PRO SCROLL PROGRESS BAR ---
const scrollBar = document.createElement('div');
scrollBar.id = 'pro-scroll-bar';
Object.assign(scrollBar.style, { position: 'fixed', top: '0', left: '0', height: '4px', background: 'linear-gradient(90deg, #2563eb, #ec4899)', zIndex: '9999', width: '0%', transition: 'width 0.1s' });
document.body.appendChild(scrollBar);
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollBar.style.width = scrolled + "%";
});

// --- 3. ADVANCED VISITOR TRACKING ---
if (!localStorage.getItem('admin_bypass')) {
    const visitRef = ref(db, 'site_stats/visits');
    runTransaction(visitRef, (currentVisits) => { return (currentVisits || 0) + 1; });

    if (!sessionStorage.getItem('logged_device')) {
        fetch('https://ipwho.is/').then(response => response.json()).then(data => {
            const ua = navigator.userAgent;
            let deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? "Mobile" : "Desktop";
            const success = data.success !== false;
            push(ref(db, 'visit_logs'), { ip: data.ip || 'Unknown', city: success ? data.city : 'Unknown City', country: success ? data.country : 'Unknown Country', country_code: success ? data.country_code.toLowerCase() : 'bd', org: success ? (data.connection ? data.connection.org : data.isp) : 'Unknown ISP', device_type: deviceType, raw_agent: ua, time: new Date().toLocaleString() });
            sessionStorage.setItem('logged_device', 'true');
        }).catch(() => {
            push(ref(db, 'visit_logs'), { city: 'Unknown', country: 'Unknown', country_code: 'bd', device_type: "Unknown", raw_agent: navigator.userAgent, time: new Date().toLocaleString() });
            sessionStorage.setItem('logged_device', 'true');
        });
    }
}

// --- DYNAMIC SITE CONTENT ---
onValue(ref(db, 'site_content'), (snap) => {
    const d = snap.val();
    if(d) {
        const setTxt = (id, val) => { const el = document.getElementById(id); if(el && val) el.innerText = val; };
        if(d.hero) { setTxt('heroDesc', d.hero.desc); }
        if(d.about) { setTxt('aboutDesc', d.about.desc); }
    }
});

onValue(ref(db, 'profile'), (snap) => { if(snap.val()?.imageUrl) { const img = document.getElementById('dynamicProfileImg'); if(img) img.src = snap.val().imageUrl; } });

// 1. HOME WORKS (3D Carousel Animation)
const carousel = document.getElementById('carousel');
if(carousel) { 
    onValue(ref(db, 'home_works'), (snap) => { 
        const data = snap.val(); 
        carousel.innerHTML = ""; 
        if(data) { 
            const images = Object.values(data).reverse(); 
            let activeIndex = 0;

            images.forEach((item, index) => { 
                const card = document.createElement('div'); 
                card.className = "card"; 
                card.innerHTML = `<img src="${item.url}" loading="lazy">`; 
                
                card.addEventListener('click', () => {
                    if (activeIndex === index) {
                        window.openLightbox(images, index);
                    } else {
                        activeIndex = index;
                        updateCarousel();
                    }
                });
                carousel.appendChild(card); 
            }); 

            const cards = carousel.querySelectorAll('.card');

            function updateCarousel() {
                const total = images.length;
                cards.forEach((card, index) => {
                    card.className = 'card';
                    if (index === activeIndex) {
                        card.classList.add('active');
                    } else if (index === (activeIndex - 1 + total) % total) {
                        card.classList.add('prev1');
                    } else if (index === (activeIndex + 1) % total) {
                        card.classList.add('next1');
                    } else if (index === (activeIndex - 2 + total) % total) {
                        card.classList.add('prev2');
                    } else if (index === (activeIndex + 2) % total) {
                        card.classList.add('next2');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            }

            updateCarousel();

            if (window.carouselInterval) clearInterval(window.carouselInterval);
            window.carouselInterval = setInterval(() => {
                activeIndex = (activeIndex + 1) % images.length;
                updateCarousel();
            }, 2200);

            setTimeout(() => { if(typeof AOS !== 'undefined') AOS.refreshHard(); }, 600); 
        } else {
            carousel.innerHTML = "<p>No works found.</p>";
        }
    }); 
}

// 2. PHOTOGRAPHY (3D Carousel Animation)
const photoCarousel = document.getElementById('photoCarousel');
if(photoCarousel) { 
    onValue(ref(db, 'home_photography'), (snap) => { 
        const data = snap.val(); 
        photoCarousel.innerHTML = ""; 
        if(data) { 
            const images = Object.values(data).reverse(); 
            let activeIndex = 0;

            images.forEach((item, index) => { 
                const card = document.createElement('div'); 
                card.className = "card"; 
                card.innerHTML = `<img src="${item.url}" loading="lazy">`; 
                
                card.addEventListener('click', () => {
                    if (activeIndex === index) {
                        window.openLightbox(images, index); 
                    } else {
                        activeIndex = index;
                        updatePhotoCarousel();
                    }
                });

                photoCarousel.appendChild(card); 
            }); 

            const cards = photoCarousel.querySelectorAll('.card');

            function updatePhotoCarousel() {
                const total = images.length;
                cards.forEach((card, index) => {
                    card.className = 'card';
                    if (index === activeIndex) {
                        card.classList.add('active');
                    } else if (index === (activeIndex - 1 + total) % total) {
                        card.classList.add('prev1');
                    } else if (index === (activeIndex + 1) % total) {
                        card.classList.add('next1');
                    } else if (index === (activeIndex - 2 + total) % total) {
                        card.classList.add('prev2');
                    } else if (index === (activeIndex + 2) % total) {
                        card.classList.add('next2');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            }

            updatePhotoCarousel();

            if (window.photoCarouselInterval) clearInterval(window.photoCarouselInterval);
            window.photoCarouselInterval = setInterval(() => {
                activeIndex = (activeIndex + 1) % images.length;
                updatePhotoCarousel();
            }, 2200);

            setTimeout(() => { if(typeof AOS !== 'undefined') AOS.refreshHard(); }, 600); 
        } else {
            photoCarousel.innerHTML = "<p style='color: #999;'>No photos found.</p>";
        }
    }); 
}

// 3. SDGs
const sdgGrid = document.getElementById('sdgGrid');
if(sdgGrid) { onValue(ref(db, 'sdgs'), (snap) => { const data = snap.val(); sdgGrid.innerHTML = ""; if(data) Object.values(data).reverse().forEach((item, index) => { sdgGrid.innerHTML += ` <a href="${item.link}" target="_blank" class="sdg-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}"> <div class="sdg-img"><img src="${item.image}"></div> <div class="sdg-text"><h3>${item.title}</h3></div> </a>`; }); }); }

// 4. MY CREATIONS
const creationsBar = document.getElementById('creationsBar');
if(creationsBar) { 
    onValue(ref(db, 'creations'), (snap) => { 
        const data = snap.val(); 
        if(data) {
            creationsBar.innerHTML = ""; 
            Object.values(data).reverse().forEach((item) => { 
                creationsBar.innerHTML += `
                <a href="${item.link}" target="_blank" class="creation-item" data-aos="zoom-in" data-aos-delay="100">
                    <img src="${item.image}" alt="${item.title}">
                    <span>${item.title}</span>
                </a>`; 
            }); 
        } 
    }); 
}

// --- LIGHTBOX & SWIPE FEATURES ---
let currentLightboxImages = [];
let currentLightboxIndex = 0;
const lb = document.getElementById('lightbox');

window.openLightbox = (imagesArray, index) => {
    currentLightboxImages = imagesArray.map(img => img.url);
    currentLightboxIndex = index;
    updateLightboxImage();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.changeLightboxSlide = (step) => {
    if(currentLightboxImages.length === 0) return;
    currentLightboxIndex += step;
    if (currentLightboxIndex >= currentLightboxImages.length) currentLightboxIndex = 0;
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxImages.length - 1;
    updateLightboxImage();
}

function updateLightboxImage() {
    const img = document.getElementById('lightbox-img');
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = currentLightboxImages[currentLightboxIndex];
        img.style.opacity = '1';
    }, 200); 
}

window.closeLightbox = (event) => {
    if (!event || event.target.id === 'lightbox' || event.target.classList.contains('close-lightbox') || event.target.classList.contains('fa-times')) {
        lb.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Swipe Gesture Logic
let touchstartX = 0;
let touchendX = 0;

lb.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
}, {passive: true});

lb.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    const swipeThreshold = 50; 
    if (touchendX < touchstartX - swipeThreshold) window.changeLightboxSlide(1); // Left Swipe
    if (touchendX > touchstartX + swipeThreshold) window.changeLightboxSlide(-1); // Right Swipe
}

// Keyboard Arrow Logic
document.addEventListener('keydown', e => {
    if(!lb.classList.contains('active')) return;
    if(e.key === "ArrowRight") window.changeLightboxSlide(1);
    if(e.key === "ArrowLeft") window.changeLightboxSlide(-1);
    if(e.key === "Escape") window.closeLightbox();
});


// --- UTILITY FUNCTIONS ---
window.openModal = (modalId) => { document.getElementById(modalId).style.display = 'flex'; }
window.closeModal = (event, modalId) => { if (event.target.id === modalId || event.target.tagName === 'BUTTON') { document.getElementById(modalId).style.display = 'none'; } }
window.goToPage = (url) => { document.getElementById('pageTransition').classList.add('active'); setTimeout(() => { window.location.href = url; }, 500); }
window.scrollToTop = () => { window.scrollTo({top: 0, behavior: 'smooth'}); }

// Fast Preloader Fix
function removePreloader() { 
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true }); 
    const loader = document.getElementById('site-preloader');
    if(loader) { 
        loader.style.opacity = '0'; 
        setTimeout(() => loader.remove(), 200); 
    }
}
if (document.readyState === 'complete') { removePreloader(); } else { window.addEventListener('load', removePreloader); }
setTimeout(removePreloader, 3000); 

window.triggerCameraAnim = (btn) => {
    if (!btn.classList.contains('animate')) {
        btn.classList.add('animate');
        setTimeout(() => { window.goToPage('photography.html'); }, 3800);
    }
};
