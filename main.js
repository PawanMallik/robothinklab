import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* -------------------------------------------------------------------------- */
/* 1. LENIS SMOOTH SCROLLING                                                  */
/* -------------------------------------------------------------------------- */
const lenis = new Lenis({
  autoRaf: true,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  syncTouch: false,
  touchMultiplier: 2
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* -------------------------------------------------------------------------- */
/* 2. CUSTOM CURSOR                                                           */
/* -------------------------------------------------------------------------- */
const cursor = document.getElementById('cursor');
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouch && cursor) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  const quickX = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
  const quickY = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
  let cursorVisible = false;

  window.addEventListener('mousemove', (e) => {
    if (!cursorVisible) {
      cursorVisible = true;
      gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
    }
    quickX(e.clientX);
    quickY(e.clientY);
  });

  const onHoverIn = () => {
    gsap.to(cursor, {
      scale: 3.5,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      duration: 0.3,
      ease: 'expo.out'
    });
  };

  const onHoverOut = () => {
    gsap.to(cursor, {
      scale: 1,
      background: 'white',
      border: '0px solid transparent',
      duration: 0.3,
      ease: 'expo.out'
    });
  };

  const bindCursorHovers = () => {
    document.querySelectorAll('a, button, [contenteditable="true"]').forEach((el) => {
      if (!el.dataset.cursorBound) {
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
        el.dataset.cursorBound = 'true';
      }
    });
  };

  bindCursorHovers();
  const cursorObserver = new MutationObserver(() => bindCursorHovers());
  cursorObserver.observe(document.body, { childList: true, subtree: true });
}

/* -------------------------------------------------------------------------- */
/* 3. HEADER & MOBILE NAVIGATION                                              */
/* -------------------------------------------------------------------------- */
const header = document.getElementById('main-header');
const logo = document.getElementById('logo');
const navItems = document.querySelectorAll('#nav .nav-item');
const headerActions = document.getElementById('header-actions');
const menuBtn = document.getElementById('menu-btn');
const menuIcon = document.getElementById('menu-icon');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

// Smooth Anchor Link Handler
function scrollToTarget(e, targetId) {
  if (e) e.preventDefault();
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }
  lenis.scrollTo(targetId, {
    offset: -40,
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t))
  });
}

// Bind all internal anchor jumps
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId !== '#') {
      scrollToTarget(e, targetId);
    }
  });
});

// Header Intro Animation
const mm = gsap.matchMedia();
mm.add({
  isMobile: '(max-width: 767px)',
  isDesktop: '(min-width: 768px)'
}, (context) => {
  const { isMobile, isDesktop } = context.conditions;
  const headerTl = gsap.timeline({ delay: 0.2 });

  gsap.set(header, { width: '0px', opacity: 0, overflow: 'hidden' });
  gsap.set(logo, { autoAlpha: 0, y: 15, scale: 0.95 });
  gsap.set(headerActions, { autoAlpha: 0, x: 10 });
  if (isDesktop) gsap.set(navItems, { autoAlpha: 0, y: 15 });

  headerTl.to(header, {
    width: isMobile ? 'calc(100% - 2rem)' : '100%',
    maxWidth: '896px',
    opacity: 1,
    duration: 1.2,
    ease: 'expo.inOut'
  }).to(logo, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: 1.2,
    ease: 'expo.out'
  }, '-=0.2');

  if (isDesktop) {
    headerTl.to(navItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.5');
  }

  headerTl.to(headerActions, {
    autoAlpha: 1,
    x: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.5');

  return () => headerTl.kill();
});

// Mobile Menu Toggle
let isMobileMenuOpen = false;
function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen;
  if (isMobileMenuOpen) {
    menuIcon.innerHTML = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
    gsap.timeline()
      .to(mobileMenu, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .fromTo(mobileLinks, {
        y: 20,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.4');
  } else {
    menuIcon.innerHTML = '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>';
    gsap.to(mobileMenu, {
      autoAlpha: 0,
      clipPath: 'inset(0% 100% 0% 0%)',
      duration: 0.6,
      ease: 'power2.inOut'
    });
  }
}
menuBtn.addEventListener('click', toggleMobileMenu);

/* -------------------------------------------------------------------------- */
/* 4. HERO SECTION ANIMATION & PARALLAX                                       */
/* -------------------------------------------------------------------------- */
const heroField = document.getElementById('hero-field');
const heroLines = document.querySelectorAll('.hero-line');
const heroSub = document.getElementById('hero-sub');
const heroBtns = document.getElementById('hero-btns');

const heroTl = gsap.timeline({ delay: 0.2 });
gsap.set(heroField, { autoAlpha: 0, scale: 1.05 });
gsap.set(heroLines, { yPercent: 120, rotateZ: 2 });
gsap.set([heroSub, heroBtns], { y: 20, autoAlpha: 0 });

heroTl.to(heroField, {
  autoAlpha: 0.6,
  scale: 1,
  duration: 2.5,
  ease: 'power2.out'
})
.to(heroLines, {
  yPercent: 0,
  rotateZ: 0,
  duration: 1.4,
  stagger: 0.1,
  ease: 'expo.out'
}, '-=1.5')
.to(heroSub, {
  y: 0,
  autoAlpha: 1,
  duration: 1.2,
  ease: 'power3.out'
}, '-=1.0')
.to(heroBtns, {
  y: 0,
  autoAlpha: 1,
  duration: 1.2,
  ease: 'power3.out'
}, '-=1.0');

// Mousemove Hero Parallax (Desktop)
if (window.innerWidth > 768) {
  window.addEventListener('mousemove', (e) => {
    const n = (e.clientX / window.innerWidth - 0.5) * 20;
    const r = (e.clientY / window.innerHeight - 0.5) * 20;
    gsap.to(heroField, {
      x: n * -1,
      y: r * -1,
      duration: 2,
      ease: 'power2.out'
    });
    gsap.to(heroLines, {
      x: n,
      y: r,
      duration: 1.5,
      ease: 'power2.out',
      stagger: 0.01
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 5. MANIFESTO WORD-BY-WORD SCROLL SCRUB                                     */
/* -------------------------------------------------------------------------- */
const manifestoTextEl = document.getElementById('manifesto-text');
const manifestoContent = "At Robo Think Lab, we believe robotics is not just about machines, but about creating smarter solutions that simplify lives, enhance industries, and open doors to limitless possibilities. We blend creativity with cutting-edge technology to deliver advanced robotic systems for education, research, and real-world intelligence.";

manifestoTextEl.innerHTML = manifestoContent.split(' ').map((word) => {
  return `<span class="word text-white/10 transition-colors duration-300 pointer-events-none">${word}</span>`;
}).join(' ');

const manifestoWords = manifestoTextEl.querySelectorAll('.word');
gsap.to(manifestoWords, {
  color: 'rgba(255, 255, 255, 1)',
  stagger: 0.1,
  ease: 'none',
  scrollTrigger: {
    trigger: manifestoTextEl,
    start: 'top 80%',
    end: 'bottom 50%',
    scrub: 1
  }
});

/* -------------------------------------------------------------------------- */
/* 6. INFINITE MARQUEE TICKER                                                 */
/* -------------------------------------------------------------------------- */
gsap.to('.marquee-track', {
  xPercent: -50,
  repeat: -1,
  duration: 25,
  ease: 'none'
});

/* -------------------------------------------------------------------------- */
/* 7. CORE DISCIPLINES / SERVICES GRID                                        */
/* -------------------------------------------------------------------------- */
const serviceCards = document.querySelectorAll('.service-grid-card');
gsap.fromTo(serviceCards, {
  y: 60,
  autoAlpha: 0
}, {
  y: 0,
  autoAlpha: 1,
  duration: 1.2,
  stagger: 0.15,
  ease: 'expo.out',
  scrollTrigger: {
    trigger: '#services-grid',
    start: 'top 80%'
  }
});

/* -------------------------------------------------------------------------- */
/* 8. CLIENT VOICES / TESTIMONIALS SLIDER                                     */
/* -------------------------------------------------------------------------- */
const testimonials = [
  {
    name: "School Principal",
    role: "Premier K-12 Institution",
    text: "RoboThinkLab transformed our school's STEM ecosystem. Our students are building autonomous rovers and working AI models with genuine excitement."
  },
  {
    name: "Academic Director",
    role: "CBSE Affiliated Campus",
    text: "The dedicated professional trainer and complete turnkey lab setup took away all operational hurdles for our administration. Truly future-ready education."
  },
  {
    name: "Head of Science & Tech",
    role: "Progressive International School",
    text: "Our faculty gained immense confidence in teaching machine learning and robotics thanks to RoboThinkLab's hands-on educator workshops."
  }
];

let activeTestimonialIndex = 0;
let isAnimatingTestimonial = false;
let testimonialInterval;

const quoteEl = document.getElementById('testimonial-quote');
const authorWrapper = document.getElementById('testimonial-author-wrapper');
const nameEl = document.getElementById('testimonial-name');
const roleEl = document.getElementById('testimonial-role');
const dots = document.querySelectorAll('#testimonial-dots button');

function setTestimonialSlide(index) {
  if (index === activeTestimonialIndex || isAnimatingTestimonial) return;
  isAnimatingTestimonial = true;

  if (testimonialInterval) clearInterval(testimonialInterval);

  gsap.to([quoteEl, authorWrapper], {
    autoAlpha: 0,
    y: 10,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      activeTestimonialIndex = index;
      quoteEl.innerText = `"${testimonials[index].text}"`;
      nameEl.innerText = testimonials[index].name;
      roleEl.innerText = testimonials[index].role;

      // Update dots
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.className = "w-2 h-2 rounded-full transition-all duration-500 cursor-pointer bg-white scale-125";
        } else {
          dot.className = "w-2 h-2 rounded-full transition-all duration-500 cursor-pointer bg-white/20 hover:bg-white/50";
        }
      });

      gsap.fromTo([quoteEl, authorWrapper], {
        autoAlpha: 0,
        y: -10
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        onComplete: () => {
          isAnimatingTestimonial = false;
          testimonialInterval = setInterval(nextTestimonial, 6000);
        }
      });
    }
  });
}

function nextTestimonial() {
  if (!isAnimatingTestimonial) {
    const nextIdx = (activeTestimonialIndex + 1) % testimonials.length;
    setTestimonialSlide(nextIdx);
  }
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => setTestimonialSlide(i));
});

testimonialInterval = setInterval(nextTestimonial, 6000);

/* -------------------------------------------------------------------------- */
/* 9. METRIC COUNTERS                                                         */
/* -------------------------------------------------------------------------- */
const counters = document.querySelectorAll('.counterData');
counters.forEach((counter) => {
  const targetVal = parseFloat(counter.getAttribute('data-limit'));
  const counterObj = { val: 0 };

  gsap.to(counterObj, {
    val: targetVal,
    duration: 2.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#stats-section',
      start: 'top 80%'
    },
    onUpdate: () => {
      counter.innerText = Math.ceil(counterObj.val).toLocaleString();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 10. FAQ ACCORDION                                                          */
/* -------------------------------------------------------------------------- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-button');
  const answer = item.querySelector('.faq-answer');
  const iconV = item.querySelector('.icon-v');

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    // Close other items
    faqItems.forEach((other) => {
      if (other !== item) {
        const otherBtn = other.querySelector('.faq-button');
        const otherAns = other.querySelector('.faq-answer');
        const otherIconV = other.querySelector('.icon-v');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAns.classList.remove('open');
        if (otherIconV) otherIconV.style.opacity = '1';
      }
    });

    // Toggle current item
    if (isOpen) {
      button.setAttribute('aria-expanded', 'false');
      answer.classList.remove('open');
      if (iconV) iconV.style.opacity = '1';
    } else {
      button.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
      if (iconV) iconV.style.opacity = '0';
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 11. SCHOOL PARTNERSHIP FORM INTERACTION                                    */
/* -------------------------------------------------------------------------- */
const partnerForm = document.getElementById('partner-form');
const formStatus = document.getElementById('form-status');

if (partnerForm) {
  partnerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = partnerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    submitBtn.innerText = "Sending Inquiry...";
    submitBtn.disabled = true;
    if (formStatus) {
      formStatus.classList.remove('hidden', 'text-red-400');
      formStatus.classList.add('text-[#3B82F6]');
      formStatus.innerText = "Connecting to mail server...";
    }

    const formData = new FormData(partnerForm);
    const dataObj = Object.fromEntries(formData.entries());

    let sent = false;
    let errorMessage = '';

    // 1. Try sending to Nodemailer Netlify Function endpoint
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          sent = true;
        } else {
          errorMessage = result.error || 'Failed to send';
        }
      } else if (response.status === 404) {
        // Fallback: Check if hosted on standard PHP environment
        const phpResponse = await fetch('/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataObj)
        });
        if (phpResponse.ok) {
          const phpResult = await phpResponse.json();
          if (phpResult.success) sent = true;
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        errorMessage = errJson.error || 'Server error occurred.';
      }
    } catch (err) {
      console.warn('Direct mail function error, falling back to static Netlify form POST:', err);
    }

    // 2. Fallback: If running purely on static Netlify without functions configured yet
    if (!sent && !errorMessage) {
      try {
        const netlifyResponse = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if (netlifyResponse.ok) {
          sent = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (sent) {
      partnerForm.reset();
      submitBtn.innerText = "✓ Inquiry Sent Successfully!";
      submitBtn.classList.add('bg-green-600', 'text-white');
      if (formStatus) {
        formStatus.classList.remove('hidden', 'text-red-400');
        formStatus.classList.add('text-green-400');
        formStatus.innerText = "✓ Thank you! We have received your inquiry and sent the notification directly to our team inbox.";
      }

      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-green-600', 'text-white');
      }, 6000);
    } else {
      submitBtn.innerText = "Retry Submission";
      submitBtn.disabled = false;
      if (formStatus) {
        formStatus.classList.remove('hidden', 'text-green-400');
        formStatus.classList.add('text-red-400');
        formStatus.innerText = errorMessage || "Unable to send right now. Please email us directly or check SMTP configuration.";
      }
    }
  });
}

