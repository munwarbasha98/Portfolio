/* =====================================================================
   Portfolio Multi-Page Script
   ===================================================================== */

/* ── DOM References ── */
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const canvas = document.getElementById('particles');

/* ── Scroll → Sticky Header ── */
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});
// Fire once on load
header.classList.toggle('scrolled', window.scrollY > 50);

/* ── Mobile Menu Toggle ── */
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
});

// Close when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
    });
});

/* ── Prefetch Internal Pages for Faster Navigation ── */
const prefetchedPages = new Set();

function prefetchPage(href) {
    if (!href || prefetchedPages.has(href)) return;
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'prefetch';
    linkEl.href = href;
    linkEl.as = 'document';
    document.head.appendChild(linkEl);
    prefetchedPages.add(href);
}

document.querySelectorAll('a.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === window.location.pathname.split('/').pop()) return;

    link.addEventListener('mouseenter', () => prefetchPage(href), { passive: true });
    link.addEventListener('touchstart', () => prefetchPage(href), { passive: true });
});

/* ── Intersection Observer for Scroll Reveals ── */
const reveals = document.querySelectorAll('.reveal-up');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // honour any per-element transition-delay set in CSS class (delay-1, delay-2, …)
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observer.observe(el));

/* ── Project Category Filters ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const categories = card.dataset.category || '';
                if (filter === 'all' || categories.includes(filter)) {
                    card.classList.remove('filter-hide');
                    card.classList.add('filter-show');
                } else {
                    card.classList.remove('filter-show');
                    card.classList.add('filter-hide');
                }
            });
        });
    });
}

/* ── Particle Background (lightweight) ── */
if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const PARTICLE_COUNT = 60;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.5 + 0.5,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                alpha: Math.random() * 0.4 + 0.1,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
            p.x += p.dx;
            p.y += p.dy;

            // wrap around edges
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
            ctx.fill();
        }

        // Lines between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
}

/* ── Contact Form Handler ── */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = contactForm.elements.name.value.trim();
        const email = contactForm.elements.email.value.trim();
        const message = contactForm.elements.message.value.trim();

        // Basic validation
        if (!name || !email || !message) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        const btn = document.getElementById('gitSubmitBtn');
        btn.classList.add('sending');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://formsubmit.co/ajax/munwarbasha986@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to send message.');
            }

            showStatus('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
        } catch (error) {
            showStatus('Could not send your message right now. Please try again later.', 'error');
        } finally {
            btn.classList.remove('sending');
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Message</span>';
        }
    });
}

function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = 'git-form-status ' + type;
    setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'git-form-status';
    }, 5000);
}
