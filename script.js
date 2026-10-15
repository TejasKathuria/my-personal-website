/**
 * Tejas Kathuria — Portfolio Interactive Logic
 * Featuring the signature Monogram "T" Scroll Reveal Engine (inspired by gyanl.com)
 */

class TLogoReveal {
    constructor() {
        this.config = {
            drawEnd: 1,
            shrinkStart: 0.72,
            shrinkTo: 0.37,
            burstDistance: 450, // px distance over which stickers burst outward
        };

        this.elements = {
            spacer: document.getElementById('hero-spacer'),
            mark: document.getElementById('hero-mark'),
            stickers: document.getElementById('hero-stickers'),
            greeting: document.getElementById('hero-greeting'),
            cue: document.getElementById('hero-scroll-cue'),
            layers: Array.from(document.querySelectorAll('.t-reveal-layer')),
            mainPath: document.getElementById('t-reveal-path'),
        };

        if (!this.elements.mark || !this.elements.mainPath) return;

        // Calculate dynamic path length
        this.pathLength = this.elements.mainPath.getTotalLength() || 6938;

        this.elements.layers.forEach((layer) => {
            layer.setAttribute('stroke-dasharray', this.pathLength);
            layer.setAttribute('stroke-dashoffset', this.pathLength);
        });

        this.cachedWindowHeight = window.innerHeight;
        this.state = {
            lastOffsets: new Float32Array(this.elements.layers.length).fill(-1),
            lastProgress: -1,
            ticking: false,
        };

        this.bindEvents();
        this.onScroll();
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        window.addEventListener('resize', () => {
            this.cachedWindowHeight = window.innerHeight;
            this.requestTick();
        }, { passive: true });
    }

    requestTick() {
        if (!this.state.ticking) {
            this.state.ticking = true;
            requestAnimationFrame(() => {
                this.onScroll();
                this.state.ticking = false;
            });
        }
    }

    onScroll() {
        if (!this.elements.spacer) return;

        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const spacerHeight = this.elements.spacer.offsetHeight || (this.cachedWindowHeight * 1.8);
        const runway = spacerHeight - this.cachedWindowHeight;
        const progress = Math.min(Math.max(scrollY / Math.max(runway, 1), 0), 1);

        // Skip if already beyond runway and settled
        if (progress >= 1 && this.state.lastProgress >= 1) return;
        this.state.lastProgress = progress;

        // 1. Shrink mark & settle plate / avatar photo crossfade over tail of runway
        const { shrinkStart, shrinkTo, drawEnd } = this.config;
        const shrinkT = (progress - shrinkStart) / (1 - shrinkStart);
        const shrunk = shrinkT > 0 ? this.ease(shrinkT) : 0;
        const scale = 1 - (1 - shrinkTo) * shrunk;
        
        this.elements.mark.style.setProperty('--mark-shrink', scale);
        this.elements.mark.style.setProperty('--plate-settle', `${shrunk * 100}%`);
        this.elements.mark.style.setProperty('--plate-settle-val', shrunk);

        // 2. Radial sticker burst & opacity
        const burst = this.ease(scrollY / this.config.burstDistance);
        this.elements.spacer.style.setProperty('--sticker-burst', burst);
        this.elements.spacer.style.setProperty('--hero-progress', progress);
        document.documentElement.style.setProperty('--sticker-burst', burst);
        document.documentElement.style.setProperty('--hero-progress', progress);

        if (this.elements.stickers) {
            this.elements.stickers.classList.toggle('is-spent', burst >= 1);
        }

        // 3. Scroll cue & greeting visibility
        if (this.elements.cue) {
            this.elements.cue.classList.toggle('is-gone', progress > 0.04);
        }
        if (this.elements.greeting) {
            this.elements.greeting.classList.toggle('is-hidden', progress > 0.04);
        }

        // 4. Draw stroke layers with color lags (smooth hardware-accelerated dashoffsets)
        const layers = this.elements.layers;
        const len = layers.length;
        for (let index = 0; index < len; index++) {
            const layer = layers[index];
            const lag = parseFloat(layer.dataset.lag) || 0;
            const span = Math.max(drawEnd - lag, 0.0001);
            const layerDrawn = this.ease((progress - lag) / span);
            const offset = this.pathLength * (1 - layerDrawn);

            if (Math.abs(offset - this.state.lastOffsets[index]) > 0.3) {
                this.state.lastOffsets[index] = offset;
                layer.setAttribute('stroke-dashoffset', offset.toFixed(1));
            }
        }
    }

    stopBounce() {}
    startBounce() {}

    ease(t) {
        return this.clamp(t) ** 2 * (3 - 2 * this.clamp(t));
    }

    easeOvershoot(t, pull = 1.2) {
        const from = this.clamp(t) - 1;
        return 1 + (pull + 1) * from ** 3 + pull * from ** 2;
    }

    clamp(t) {
        return Math.min(Math.max(t, 0), 1);
    }
}

/* ==========================================================================
   Init All Features on Load
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    new TLogoReveal();
    initTheme();
    initThinkingAnimation();
    initStickerInteractions();
    initScrollCue();
    initScrollReveal();
    initModals();
    initGithubGrid();
    initLiveClock();
    initCertStack();
    initFooterCuteSticker();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme ? savedTheme : 'light';

    applyTheme(initialTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

/* ==========================================================================
   2. Dynamic Thinking Status Animator
   ========================================================================== */
function initThinkingAnimation() {
    const verbEl = document.getElementById('thinking-verb');
    if (!verbEl) return;

    const phrases = [
        'arranging stickers',
        'building AI agents',
        'playing guitar riffs',
        'tinkering with Go',
        'exploring Swift code',
        'tuning motorcycles'
    ];

    let currentIndex = 0;

    setInterval(() => {
        verbEl.style.opacity = '0';
        verbEl.style.transform = 'translateY(3px)';

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % phrases.length;
            verbEl.textContent = phrases[currentIndex];
            verbEl.style.opacity = '1';
            verbEl.style.transform = 'translateY(0)';
        }, 220);
    }, 3800);
}

/* ==========================================================================
   3. Interactive Stickers & Project Cards Modal Triggers
   ========================================================================== */
function initStickerInteractions() {
    const stickers = document.querySelectorAll('.hero-sticker');
    stickers.forEach((sticker) => {
        const btn = sticker.querySelector('.hero-sticker__btn');
        const targetModal = sticker.getAttribute('data-target');

        if (btn && targetModal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModalById(targetModal);
            });
        }
    });

    // Project cards that open modals
    document.querySelectorAll('.project[data-action="open-modal"]').forEach((card) => {
        const target = card.getAttribute('data-target');
        if (target) {
            card.addEventListener('click', () => openModalById(target));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModalById(target);
                }
            });
        }
    });
}

/* ==========================================================================
   4. Scroll Cue Smooth Scroll
   ========================================================================== */
function initScrollCue() {
    const scrollBtn = document.getElementById('scroll-cue-btn');
    if (!scrollBtn) return;

    scrollBtn.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/* ==========================================================================
   5. Scroll Reveal Observer
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-item');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   6. Modal Dialog Controller
   ========================================================================== */
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function initModals() {
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close-modal');
            closeModalById(modalId);
        });
    });

    document.querySelectorAll('.modal-layer').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalById(modal.id);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-layer.is-open').forEach((m) => {
                closeModalById(m.id);
            });
        }
    });
}

/* ==========================================================================
   7. GitHub Contribution Heatmap Grid
   ========================================================================== */
/* ==========================================================================
   7. Real Live GitHub Activity Heatmap Sync
   ========================================================================== */
async function initGithubGrid() {
    const track = document.getElementById('gh-grid-track');
    const tooltip = document.getElementById('gh-tooltip');
    const metricText = document.getElementById('gh-metric-text');
    if (!track || !tooltip) return;

    function updateTooltipPosition(e) {
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
    }

    function renderGrid(daysArray) {
        track.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // Slice to max 52-53 weeks if necessary
        const startIdx = Math.max(0, daysArray.length - 371);
        const activeDays = daysArray.slice(startIdx);

        for (let i = 0; i < activeDays.length; i += 7) {
            const weekDays = activeDays.slice(i, i + 7);
            const col = document.createElement('div');
            col.className = 'gh-col';

            weekDays.forEach((day) => {
                const cell = document.createElement('div');
                const level = day.level !== undefined ? day.level : (day.count > 0 ? (day.count >= 8 ? 4 : day.count >= 4 ? 3 : day.count >= 2 ? 2 : 1) : 0);
                cell.className = `gh-cell lvl-${level}`;
                cell.setAttribute('role', 'img');

                const dateObj = new Date(day.date);
                const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : day.date;
                const label = `${day.count || 0} contribution${day.count === 1 ? '' : 's'} on ${formattedDate}`;
                cell.setAttribute('aria-label', label);

                cell.addEventListener('mouseenter', (e) => {
                    tooltip.textContent = label;
                    tooltip.classList.add('is-visible');
                    updateTooltipPosition(e);
                });

                cell.addEventListener('mousemove', (e) => {
                    updateTooltipPosition(e);
                });

                cell.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('is-visible');
                });

                col.appendChild(cell);
            });

            fragment.appendChild(col);
        }

        track.appendChild(fragment);
    }

    try {
        const [contribRes, userRes] = await Promise.all([
            fetch('https://github-contributions-api.jogruber.de/v4/TejasKathuria?y=last').catch(() => null),
            fetch('https://api.github.com/users/TejasKathuria').catch(() => null)
        ]);

        let repos = 18;
        if (userRes && userRes.ok) {
            const userData = await userRes.json();
            if (userData && userData.public_repos) {
                repos = userData.public_repos;
            }
        }

        if (contribRes && contribRes.ok) {
            const data = await contribRes.json();
            const contribList = data.contributions || [];
            const total = (data.total && data.total.lastYear) || contribList.reduce((acc, d) => acc + (d.count || 0), 0);

            if (metricText) {
                metricText.textContent = `${total} contributions in the last year · ${repos} Repositories`;
            }

            if (contribList.length > 0) {
                renderGrid(contribList);
                return;
            }
        }
    } catch (err) {
        console.warn('Live GitHub fetch error:', err);
    }

    // Fallback if network offline
    if (metricText) {
        metricText.textContent = `54 contributions in the last year · 18 Repositories`;
    }
    renderFallbackGrid();

    function renderFallbackGrid() {
        const totalWeeks = 52;
        const daysPerWeek = 7;
        const now = new Date();
        const fallbackList = [];
        for (let w = 0; w < totalWeeks; w++) {
            for (let d = 0; d < daysPerWeek; d++) {
                const dayOffset = (totalWeeks - 1 - w) * 7 + (6 - d);
                const date = new Date(now);
                date.setDate(date.getDate() - dayOffset);
                fallbackList.push({
                    date: date.toISOString().split('T')[0],
                    count: 0,
                    level: 0
                });
            }
        }
        renderGrid(fallbackList);
    }
}

/* ==========================================================================
   8. Live Real-Time India Clock
   ========================================================================== */
function initLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    function updateClock() {
        const options = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        clockEl.textContent = `${formatter.format(new Date())} IST`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   9. Interactive Certificate Stack Deck Engine (No Captions)
   ========================================================================== */
function initCertStack() {
    const deck = document.getElementById('cert-deck');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('.cert-stack-card'));
    const dots = Array.from(document.querySelectorAll('.cert-dot'));
    const counter = document.getElementById('cert-counter');
    const total = cards.length;
    let activeIndex = 0;
    let isFlipping = false;

    function updateDeck() {
        cards.forEach((card, i) => {
            const stackIndex = (i - activeIndex + total) % total;
            card.dataset.index = stackIndex;
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === activeIndex);
        });

        if (counter) {
            counter.textContent = `${activeIndex + 1} of ${total} · Click to cycle ↻`;
        }
    }

    function cycleNext() {
        if (isFlipping) return;
        isFlipping = true;

        const currentTop = cards.find(card => card.dataset.index === "0");
        if (currentTop) {
            currentTop.classList.add('is-flipping');
        }

        setTimeout(() => {
            activeIndex = (activeIndex + 1) % total;
            updateDeck();
            if (currentTop) {
                currentTop.classList.remove('is-flipping');
            }
            setTimeout(() => {
                isFlipping = false;
            }, 80);
        }, 200);
    }

    deck.addEventListener('click', cycleNext);

    // Keyboard accessibility
    deck.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            cycleNext();
        }
    });

    // Dot indicators
    dots.forEach((dot, index) => {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeIndex !== index) {
                activeIndex = index;
                updateDeck();
            }
        });
    });

    updateDeck();
}

/* ==========================================================================
   10. Footer Cute Sticker (Double-Tap Easter Egg)
   ========================================================================== */
function initFooterCuteSticker() {
    const sticker = document.querySelector('.footer-cute-sticker');
    if (!sticker) return;

    let lastTap = 0;
    let hideTimeout = null;

    function triggerReveal(e) {
        if (e) e.preventDefault();
        sticker.classList.toggle('is-revealed');

        clearTimeout(hideTimeout);
        if (sticker.classList.contains('is-revealed')) {
            hideTimeout = setTimeout(() => {
                sticker.classList.remove('is-revealed');
            }, 3800);
        }
    }

    // Double-click for mouse desktop users
    sticker.addEventListener('dblclick', triggerReveal);

    // Double-tap detector for touch / mobile phone users
    sticker.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 380 && tapLength > 40) {
            triggerReveal(e);
        }
        lastTap = currentTime;
    });

    // Dismiss if user clicks/taps outside
    document.addEventListener('click', (e) => {
        if (!sticker.contains(e.target)) {
            sticker.classList.remove('is-revealed');
        }
    });
}
