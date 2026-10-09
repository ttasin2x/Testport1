import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 1. FIREBASE INITIALIZATION & DATA FETCHING ---
const firebaseConfig = { 
  apiKey: "AIzaSyDNtkM7hLeIsD2HzWxQKJFH8fsXOVKrv18", 
  authDomain: "tanvir-gallery-free.firebaseapp.com", 
  databaseURL: "https://tanvir-gallery-free-default-rtdb.firebaseio.com", 
  projectId: "tanvir-gallery-free", 
  storageBucket: "tanvir-gallery-free.firebasestorage.app", 
  messagingSenderId: "442605910126", 
  appId: "1:442605910126:web:b89792cb6204a5b7eb0e7f" 
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Profile Images
onValue(ref(db, 'hero'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicHeroImg').src = snap.val().imageUrl; });
onValue(ref(db, 'profile'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicProfileImg').src = snap.val().imageUrl; });

// Home Works (Scouts)
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
                    if (activeIndex === index) window.openLightbox(images, index);
                    else { activeIndex = index; updateCarousel(); }
                });
                carousel.appendChild(card); 
            }); 

            const cards = carousel.querySelectorAll('.card');
            function updateCarousel() {
                const total = images.length;
                cards.forEach((card, index) => {
                    card.className = 'card';
                    if (index === activeIndex) card.classList.add('active');
                    else if (index === (activeIndex - 1 + total) % total) card.classList.add('prev1');
                    else if (index === (activeIndex + 1) % total) card.classList.add('next1');
                    else if (index === (activeIndex - 2 + total) % total) card.classList.add('prev2');
                    else if (index === (activeIndex + 2) % total) card.classList.add('next2');
                    else card.classList.add('hidden');
                });
            }
            updateCarousel();
            if (window.carouselInterval) clearInterval(window.carouselInterval);
            window.carouselInterval = setInterval(() => { activeIndex = (activeIndex + 1) % images.length; updateCarousel(); }, 2200);
        } else {
            carousel.innerHTML = "<p>No works found.</p>";
        }
    }); 
}

// Photography
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
                    if (activeIndex === index) window.openLightbox(images, index); 
                    else { activeIndex = index; updatePhotoCarousel(); }
                });
                photoCarousel.appendChild(card); 
            }); 

            const cards = photoCarousel.querySelectorAll('.card');
            function updatePhotoCarousel() {
                const total = images.length;
                cards.forEach((card, index) => {
                    card.className = 'card';
                    if (index === activeIndex) card.classList.add('active');
                    else if (index === (activeIndex - 1 + total) % total) card.classList.add('prev1');
                    else if (index === (activeIndex + 1) % total) card.classList.add('next1');
                    else if (index === (activeIndex - 2 + total) % total) card.classList.add('prev2');
                    else if (index === (activeIndex + 2) % total) card.classList.add('next2');
                    else card.classList.add('hidden');
                });
            }
            updatePhotoCarousel();
            if (window.photoCarouselInterval) clearInterval(window.photoCarouselInterval);
            window.photoCarouselInterval = setInterval(() => { activeIndex = (activeIndex + 1) % images.length; updatePhotoCarousel(); }, 2200);
        } else {
            photoCarousel.innerHTML = "<p style='color: #999;'>No photos found.</p>";
        }
    }); 
}

// SDGs
const sdgGrid = document.getElementById('sdgGrid');
if(sdgGrid) { 
    onValue(ref(db, 'sdgs'), (snap) => { 
        const data = snap.val(); 
        sdgGrid.innerHTML = ""; 
        if(data) Object.values(data).reverse().forEach((item, index) => { 
            sdgGrid.innerHTML += ` <a href="${item.link}" target="_blank" class="sdg-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}"> <div class="sdg-img"><img src="${item.image}"></div> <div class="sdg-text"><h3>${item.title}</h3></div> </a>`; 
        }); 
    }); 
}

// Creations / Apps
const creationsBar = document.getElementById('creationsBar');
if(creationsBar) { 
    onValue(ref(db, 'creations'), (snap) => { 
        const data = snap.val(); 
        if(data) {
            creationsBar.innerHTML = ""; 
            Object.values(data).reverse().forEach((item) => { 
                creationsBar.innerHTML += `
                <a href="${item.link}" target="_blank" class="creation-item">
                    <img src="${item.image}" alt="${item.title}">
                    <span>${item.title}</span>
                </a>`; 
            }); 
        } 
    }); 
}

// --- 2. MODALS & LIGHTBOX GLOBALS ---
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
    setTimeout(() => { img.src = currentLightboxImages[currentLightboxIndex]; img.style.opacity = '1'; }, 200); 
}
window.closeLightbox = (event) => {
    if (!event || event.target.id === 'lightbox' || event.target.classList.contains('close-lightbox') || event.target.classList.contains('fa-times')) {
        lb.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}
window.openModal = (modalId) => { document.getElementById(modalId).style.display = 'flex'; }
window.closeModal = (event, modalId) => { if (event.target.id === modalId || event.target.tagName === 'BUTTON') { document.getElementById(modalId).style.display = 'none'; } }


// --- 3. PREMIUM UI INTERACTIONS (GSAP, MOPRHSVG) ---
const haptic = window.WebHaptics ? new window.WebHaptics() : { trigger: () => {} };

document.addEventListener("DOMContentLoaded", () => {
  if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    
  const siteSwitcher = document.querySelector(".site-switcher");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const heroTitle = document.querySelector(".hero__title");
  const stackBurstTrigger = document.querySelector("[data-stack-burst-trigger]");
  const skillBurstLayer = document.querySelector("[data-skill-burst]");
  const dock = document.querySelector(".dock");
  const switcherButtons = [...document.querySelectorAll(".site-switcher__button")];
  const staggerTexts = [...document.querySelectorAll(".words-stagger")];
  const navItems = [...document.querySelectorAll(".nav-item")];
  const viewToggles = [...document.querySelectorAll("[data-view-toggle]")];
  
  const projectScreen = document.querySelector("#project-screen");
  const projectTitle = document.querySelector("#project-title");
  const projectEyebrow = document.querySelector(".project-screen__eyebrow");
  const projectLede = document.querySelector(".project-screen__lede");
  
  const genericProjectPanel = document.querySelector('[data-project-panel="generic"]');
  const projectPanelsByView = new Map([
    ["experience", document.querySelector('[data-project-panel="experience"]')],
    ["education", document.querySelector('[data-project-panel="education"]')],
    ["skills", document.querySelector('[data-project-panel="skills"]')],
    ["scouts", document.querySelector('[data-project-panel="scouts"]')],
    ["sdgs", document.querySelector('[data-project-panel="sdgs"]')],
    ["photography", document.querySelector('[data-project-panel="photography"]')],
    ["apps", document.querySelector('[data-project-panel="apps"]')],
    ["contact", document.querySelector('[data-project-panel="contact"]')],
    ["about", document.querySelector('[data-project-panel="about"]')],
  ]);
  
  const aboutTypingHost = document.querySelector("[data-about-typing]");
  const aboutTypingTemplate = document.querySelector("#about-typing-template");
  const pageTransition = document.querySelector(".page-transition");
  const pageTransitionPath = document.querySelector(".page-transition__path");
  const cursorDot = document.querySelector("[data-cursor-dot]");
  
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cursorFrame = 0; let cursorX = 0; let cursorY = 0;
  let aboutTypingTimers = [];

  const initCursorDot = () => {
    if (isTouch || !(cursorDot instanceof HTMLElement)) return;
    document.documentElement.dataset.cursor = "dot";
    document.body.dataset.cursor = "dot";
    const renderCursor = () => {
      cursorFrame = 0;
      cursorDot.style.left = `${cursorX}px`;
      cursorDot.style.top = `${cursorY}px`;
    };
    window.addEventListener("pointermove", (event) => {
      cursorX = event.clientX; cursorY = event.clientY;
      cursorDot.classList.add("is-visible");
      if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
    });
    window.addEventListener("pointerleave", () => {
      cursorDot.classList.remove("is-visible");
      document.documentElement.removeAttribute("data-cursor");
      document.body.removeAttribute("data-cursor");
    });
  };

  const isAboutTypingActive = () => Boolean(aboutTypingHost?.classList.contains("is-typing") && !aboutTypingHost.classList.contains("is-revealed"));
  const clearAboutTyping = () => {
    aboutTypingTimers.forEach((timerId) => window.clearTimeout(timerId));
    aboutTypingTimers = [];
    if (!aboutTypingHost) return;
    aboutTypingHost.classList.remove("is-typing");
    aboutTypingHost.classList.remove("is-revealed");
    aboutTypingHost.textContent = "";
  };
  const revealAboutTyping = () => {
    if (!isAboutTypingActive()) return;
    aboutTypingTimers.forEach((timerId) => window.clearTimeout(timerId));
    aboutTypingTimers = [];
    if (!aboutTypingHost) return;
    aboutTypingHost.classList.remove("is-typing");
    aboutTypingHost.classList.add("is-revealed");
  };

  const createAboutMeasureProbe = (paragraphClassName) => {
    if (!aboutTypingHost) return null;
    const paragraph = document.createElement("p");
    paragraph.className = paragraphClassName;
    paragraph.style.position = "absolute";
    paragraph.style.visibility = "hidden";
    paragraph.style.pointerEvents = "none";
    paragraph.style.inset = "0 auto auto -9999px";
    paragraph.style.width = `${Math.floor(aboutTypingHost.getBoundingClientRect().width)}px`;
    paragraph.style.maxWidth = "none";
    const line = document.createElement("span");
    const styles = window.getComputedStyle(paragraph);
    line.style.display = "inline-block"; line.style.whiteSpace = "nowrap";
    line.style.font = styles.font; line.style.letterSpacing = styles.letterSpacing;
    paragraph.append(line); document.body.append(paragraph);
    return { paragraph, line };
  };

  const splitAboutParagraphIntoLines = (text, paragraphClassName) => {
    if (!aboutTypingHost) return [];
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const maxWidth = Math.floor(aboutTypingHost.getBoundingClientRect().width);
    if (!maxWidth) return [normalized];
    const probe = createAboutMeasureProbe(paragraphClassName);
    if (!probe) return [normalized];
    const words = normalized.split(" ");
    const lines = [];
    let currentLine = "";
    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      probe.line.textContent = candidate;
      if (currentLine && probe.line.getBoundingClientRect().width > maxWidth) {
        lines.push(currentLine); currentLine = word; return;
      }
      currentLine = candidate;
    });
    if (currentLine) lines.push(currentLine);
    probe.paragraph.remove();
    return lines;
  };

  const renderAboutTyping = () => {
    if (!aboutTypingHost || !(aboutTypingTemplate instanceof HTMLTemplateElement)) return;
    if (!aboutTypingHost.getBoundingClientRect().width) {
      aboutTypingTimers.push(window.setTimeout(renderAboutTyping, 60)); return;
    }
    clearAboutTyping();
    const sourceParagraphs = [...aboutTypingTemplate.content.querySelectorAll(".about-screen__paragraph")];
    let totalDurationMs = 0;
    sourceParagraphs.forEach((sourceParagraph) => {
      const paragraph = document.createElement("p");
      paragraph.className = sourceParagraph.className;
      const text = (sourceParagraph.textContent ?? "").trim();
      const lines = splitAboutParagraphIntoLines(text, sourceParagraph.className);
      aboutTypingHost.append(paragraph);
      const probe = createAboutMeasureProbe(sourceParagraph.className);
      lines.forEach((lineText) => {
        const line = document.createElement("span");
        line.className = "about-screen__type-line";
        line.textContent = lineText;
        if (probe) {
          probe.line.textContent = lineText;
          line.style.setProperty("--target-width", `${Math.ceil(probe.line.getBoundingClientRect().width + 8)}px`);
        }
        const chars = Math.max(1, [...lineText].length);
        const duration = Math.max(0.62, chars * 0.028);
        line.style.setProperty("--chars", String(chars));
        line.style.setProperty("--duration", `${duration}s`);
        paragraph.append(line);
      });
      probe?.paragraph.remove();
    });
    
    if (prefersReducedMotion) { aboutTypingHost.classList.add("is-revealed"); return; }
    aboutTypingHost.classList.add("is-typing");
    
    let delay = 0.14;
    const lines = [...aboutTypingHost.querySelectorAll(".about-screen__type-line")];
    lines.forEach((line) => {
      const duration = Number.parseFloat(line.style.getPropertyValue("--duration")) || 0.8;
      const paragraph = line.parentElement;
      const isLastInParagraph = paragraph?.lastElementChild === line;
      line.style.setProperty("--delay", `${delay}s`);
      delay += duration + (isLastInParagraph ? 0.34 : 0.08);
    });
    
    aboutTypingTimers.push(window.setTimeout(() => { if (!aboutTypingHost.textContent?.trim()) revealAboutTyping(); }, 420));
    aboutTypingTimers.push(window.setTimeout(() => { if (aboutTypingHost.classList.contains("is-typing")) revealAboutTyping(); }, Math.ceil(delay * 1000) + 600));
  };

  const syncAboutTyping = (view) => {
    if (!aboutTypingHost) return;
    if (view === "about") {
      renderAboutTyping();
      aboutTypingTimers.push(window.setTimeout(() => { if (!aboutTypingHost.textContent?.trim()) renderAboutTyping(); }, 180));
    } else clearAboutTyping();
  };

  document.addEventListener("pointerdown", () => { if (document.body.dataset.view === "about") revealAboutTyping(); });

  const initProjectTransition = () => {
    const PROJECT_META = Object.freeze({
      experience: { eyebrow: "Professional Journey", title: "Work Experience", lede: "My roles in graphic design and creative work." },
      education: { eyebrow: "Academic Background", title: "Education", lede: "My academic journey from school to university." },
      skills: { eyebrow: "Expertise", title: "Skills", lede: "Tools and technologies I use to create." },
      scouts: { eyebrow: "Activities", title: "Bangladesh Scouts", lede: "A collection of my graphic design and scouting memories." },
      sdgs: { eyebrow: "Initiatives", title: "SDGs Projects", lede: "Sustainable Development Goals Activities." },
      photography: { eyebrow: "Gallery", title: "My Photography", lede: "Moments captured through my lens." },
      apps: { eyebrow: "Development", title: "My Creations", lede: "Websites and applications I've built." },
      contact: { eyebrow: "Connect", title: "Get in Touch", lede: "Feel free to reach out to me anytime." }
    });
    
    const SHAPES = Object.freeze({
      collapsed: "M 0 100 V 100 Q 50 100 100 100 V 100 z",
      crest: "M 0 100 V 50 Q 50 0 100 50 V 100 z",
      covered: "M 0 100 V 0 Q 50 0 100 0 V 100 z",
    });
    
    const FILLS = Object.freeze({
      glass: "rgba(255, 255, 255, 0.88)",
      glassDark: "rgba(18, 17, 16, 0.88)",
      white: "#ffffff",
      tints: {
        experience: { light: "#E8B86D", dark: "#745C37" },
        education: { light: "#B4C9DF", dark: "#5A6570" },
        skills: { light: "#C9A86A", dark: "#655435" },
        scouts: { light: "#D4867D", dark: "#6A433F" },
        sdgs: { light: "#8FB89A", dark: "#485C4D" },
        photography: { light: "#D4AF8F", dark: "#6B5D4F" },
        apps: { light: "#BDBAB4", dark: "#5F5D5A" },
        contact: { light: "#7EB7AA", dark: "#DCEBE4" },
        about: { light: "#BDBAB4", dark: "#5F5D5A" }
      },
    });

    const getGlassFill = () => document.body.dataset.theme === "dark" ? FILLS.glassDark : FILLS.glass;
    const validViews = new Set(["home", "about", ...Object.keys(PROJECT_META)]);
    let currentView = validViews.has(document.body.dataset.view) ? document.body.dataset.view : "home";
    let isAnimating = false;

    const getProjectTransitionFill = (view) => {
      const tint = FILLS.tints[view];
      if (!tint) return getGlassFill();
      return document.body.dataset.theme === "dark" ? tint.dark : tint.light;
    };

    const setOverlayShape = (shape) => { if (pageTransitionPath) window.gsap.set(pageTransitionPath, { attr: { d: shape } }); };
    const setOverlayVisibility = (isVisible) => {
      pageTransition.classList.toggle("is-active", isVisible);
      window.gsap.set(pageTransition, { autoAlpha: isVisible ? 1 : 0 });
    };

    const resetOverlay = () => {
      setOverlayVisibility(false);
      setOverlayShape(SHAPES.collapsed);
      if (pageTransitionPath) window.gsap.set(pageTransitionPath, { autoAlpha: 1 });
    };

    const syncProjectContent = (view) => {
      const project = PROJECT_META[view];
      if (!project) return;
      if (projectTitle) projectTitle.textContent = project.title;
      if (projectEyebrow) projectEyebrow.textContent = project.eyebrow;
      if (projectLede) projectLede.textContent = project.lede;
    };

    const syncProjectPanels = (view) => {
      const isHome = view === "home";
      const isAbout = view === "about";
      const isCaseStudy = validViews.has(view) && !isHome && !isAbout;

      if (projectScreen) {
        if (isHome) projectScreen.removeAttribute("data-layout");
        else projectScreen.dataset.layout = isCaseStudy ? "case-study" : isAbout ? "about" : "generic";
      }

      if (genericProjectPanel) genericProjectPanel.hidden = isHome || isCaseStudy || isAbout;

      projectPanelsByView.forEach((panel, panelView) => {
        if (panel) panel.hidden = panelView !== view;
        if (panel) panel.toggleAttribute("inert", panelView !== view);
      });
    };

    const applyView = (view) => {
      if (!validViews.has(view)) return;
      if (projectScreen) projectScreen.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      currentView = view;
      document.body.dataset.view = view;
      document.body.dataset.project = view === "home" ? "" : view;

      if (projectScreen) {
        projectScreen.setAttribute("aria-hidden", String(view === "home"));
        projectScreen.dataset.project = view === "home" ? "" : view;
      }

      syncProjectContent(view);
      syncProjectPanels(view);
      syncAboutTyping(view);
      if(typeof AOS !== 'undefined') AOS.refresh();
    };

    applyView(currentView);

    if (!pageTransition || !pageTransitionPath || typeof window.gsap === "undefined" || typeof window.MorphSVGPlugin === "undefined") {
      viewToggles.forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
          event.preventDefault();
          applyView(toggle.dataset.viewToggle);
        });
      });
      return;
    }

    window.gsap.registerPlugin(window.MorphSVGPlugin);
    window.gsap.set(pageTransition, { autoAlpha: 0 });
    setOverlayShape(SHAPES.collapsed);

    const animateOpen = (targetView) => {
      if (isAnimating || currentView === targetView) return;
      const transitionFill = getProjectTransitionFill(targetView);
      isAnimating = true;
      window.gsap.killTweensOf(pageTransition);
      window.gsap.killTweensOf(pageTransitionPath);
      setOverlayVisibility(true);
      window.gsap.set(pageTransition, { autoAlpha: 1 });
      window.gsap.set(pageTransitionPath, { attr: { d: SHAPES.collapsed }, fill: transitionFill, stroke: transitionFill, autoAlpha: 1 });

      window.gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: () => { resetOverlay(); isAnimating = false; } })
        .to(pageTransitionPath, { duration: 0.5, morphSVG: SHAPES.crest, ease: "power2.in" })
        .to(pageTransitionPath, { duration: 0.5, morphSVG: SHAPES.covered, ease: "power2.out" })
        .add(() => { applyView(targetView); })
        .to(pageTransition, { autoAlpha: 0, delay: 0.12, duration: 1.1, ease: "power1.out" });
    };

    const animateClose = () => {
      if (isAnimating || currentView === "home") return;
      const transitionFill = getProjectTransitionFill(currentView);
      isAnimating = true;
      applyView("home");
      setOverlayVisibility(true);
      setOverlayShape(SHAPES.covered);
      window.gsap.set(pageTransitionPath, { fill: transitionFill, stroke: transitionFill });

      window.gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: () => { resetOverlay(); isAnimating = false; } })
        .to(pageTransitionPath, { duration: 0.5, morphSVG: SHAPES.crest, ease: "power2.in" })
        .to(pageTransitionPath, { duration: 0.5, morphSVG: SHAPES.collapsed, ease: "power2.out" });
    };

    const transitionToView = (nextView) => {
      if (isAnimating) {
        if (nextView && nextView !== currentView) {
          window.gsap.killTweensOf(pageTransitionPath);
          window.gsap.killTweensOf(pageTransition);
          isAnimating = false; resetOverlay(); applyView(nextView);
        }
        return;
      }
      if (!nextView || nextView === currentView) return;
      if (nextView === "home") {
        if (currentView !== "home") animateClose();
        else applyView("home");
        return;
      }
      animateOpen(nextView);
    };

    viewToggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const nextView = toggle.dataset.viewToggle;
        if (!nextView) return;
        if (prefersReducedMotion) applyView(nextView);
        else transitionToView(nextView);
      });
    });
  };

  const initWordsStagger = () => {
    staggerTexts.forEach((element) => {
      const text = (element.textContent ?? "").trim();
      const delay = Number(element.dataset.delay || 0);
      const stagger = Number(element.dataset.stagger || 100);
      const duration = Number(element.dataset.duration || 500);
      const words = text.split(/\s+/).filter(Boolean);
      element.setAttribute("aria-label", text);
      element.textContent = "";

      words.forEach((word, index) => {
        const span = document.createElement("span");
        span.className = "words-stagger__word";
        span.textContent = word;
        span.style.transitionDuration = `${duration}ms`;
        element.appendChild(span);
        if (prefersReducedMotion) { span.classList.add("is-visible"); return; }
        window.setTimeout(() => { span.classList.add("is-visible"); }, delay + index * stagger);
      });
    });
  };

  const initHeroSkillBurst = () => {
    if (!stackBurstTrigger || !skillBurstLayer || typeof window.gsap === "undefined") return;
    const SKILL_LABELS = ["Canva", "Illustrator", "HTML/CSS", "App Dev", "Graphic Design", "UI/UX", "Firebase", "JS"];
    const PALETTE = [
      { bg: "rgba(255, 224, 230, 0.86)", ink: "#8b3354", shadow: "rgba(139, 51, 84, 0.14)" },
      { bg: "rgba(228, 231, 255, 0.86)", ink: "#4650b8", shadow: "rgba(70, 80, 184, 0.16)" },
      { bg: "rgba(220, 246, 255, 0.88)", ink: "#1d6e8e", shadow: "rgba(29, 110, 142, 0.15)" },
      { bg: "rgba(232, 245, 224, 0.88)", ink: "#4b7b3a", shadow: "rgba(75, 123, 58, 0.14)" }
    ];
    let activeBurstTimeline = null;
    const clearBurst = () => { if (activeBurstTimeline) { activeBurstTimeline.kill(); activeBurstTimeline = null; } skillBurstLayer.textContent = ""; };

    const launchBurst = () => {
      if (document.body.dataset.view !== "home") return;
      clearBurst();
      window.gsap.killTweensOf(stackBurstTrigger);
      window.gsap.fromTo(stackBurstTrigger, { scale: 1, y: 0 }, { keyframes: [{ scale: 1.08, y: -2, duration: 0.14 }, { scale: 0.98, y: 1, duration: 0.12 }, { scale: 1, y: 0, duration: 0.18 }]});
      
      const containerRect = skillBurstLayer.getBoundingClientRect();
      const triggerRect = stackBurstTrigger.getBoundingClientRect();
      const startX = triggerRect.left - containerRect.left + triggerRect.width / 2;
      const startY = triggerRect.top - containerRect.top + triggerRect.height / 2;
      
      activeBurstTimeline = window.gsap.timeline({ onComplete: clearBurst });
      
      SKILL_LABELS.forEach((label, index) => {
        const pill = document.createElement("span");
        const theme = PALETTE[index % PALETTE.length];
        pill.className = "hero__skill-pill"; pill.textContent = label;
        pill.style.setProperty("--skill-pill-bg", theme.bg); pill.style.setProperty("--skill-pill-ink", theme.ink);
        skillBurstLayer.appendChild(pill);
        
        const angle = (index / SKILL_LABELS.length) * Math.PI * 2;
        const targetX = startX + Math.cos(angle) * 150;
        const targetY = startY + Math.sin(angle) * 100;
        
        window.gsap.set(pill, { x: startX, y: startY, xPercent: -50, yPercent: -50, scale: 0.5, opacity: 0 });
        activeBurstTimeline.to(pill, { x: targetX, y: targetY, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, index * 0.05);
        activeBurstTimeline.to(pill, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power1.out" }, 1.5 + index * 0.05);
      });
    };

    stackBurstTrigger.addEventListener("click", (e) => { e.preventDefault(); launchBurst(); });
  };

  initCursorDot();
  initWordsStagger();
  initProjectTransition();
  initHeroSkillBurst();

  if (siteSwitcher && themeToggle instanceof HTMLButtonElement) {
    const applyTheme = (theme) => {
      document.body.dataset.theme = theme;
      siteSwitcher.dataset.theme = theme;
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    };
    applyTheme("light");
    themeToggle.addEventListener("click", () => {
      applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
    });
  }
  
  if (navItems.length > 0 && !isTouch) {
    const clearState = () => { navItems.forEach(item => item.classList.remove("hover", "sibling-close", "sibling-far")); };
    const activateItem = (index) => {
      clearState();
      const item = navItems[index]; if (!item) return;
      item.classList.add("hover");
      if (navItems[index - 1]) navItems[index - 1].classList.add("sibling-close");
      if (navItems[index + 1]) navItems[index + 1].classList.add("sibling-close");
    };
    navItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => activateItem(index));
      item.addEventListener("mouseleave", clearState);
    });
  }
});
