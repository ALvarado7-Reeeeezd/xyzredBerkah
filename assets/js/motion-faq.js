// ============================================
// MOTION FAQ - INTERACTIVE ANIMATIONS
// ReeezdBaraqah - Advanced UI/UX Upgrade
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 Motion FAQ initialized');
  
  // Initialize all effects
  initParticlesBackground();
  initScrollReveal();
  initRippleEffect();
  initAdvancedAccordion();
  initFloatingElements();
});

// ----------------------------------------
// PARTICLES BACKGROUND
// ----------------------------------------
function initParticlesBackground() {
  // Create particles container
  const container = document.createElement('div');
  container.id = 'faq-particles';
  document.body.insertBefore(container, document.body.firstChild);
  
  // Check if particles.js is loaded
  if (typeof particlesJS !== 'undefined') {
    particlesJS('faq-particles', {
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: ['#0f766e', '#34d399', '#f4d06f']
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 4,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.5,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#0f766e',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.5,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  } else {
    console.warn('⚠️ Particles.js not loaded - background disabled');
  }
}

// ----------------------------------------
// SCROLL REVEAL WITH STAGGER
// ----------------------------------------
function initScrollReveal() {
  const items = document.querySelectorAll('.faq-item');
  
  if (!items.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  items.forEach(item => observer.observe(item));
}

// ----------------------------------------
// RIPPLE EFFECT ON CLICK
// ----------------------------------------
function initRippleEffect() {
  const items = document.querySelectorAll('.faq-item');
  
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (!question) return;
    
    question.addEventListener('click', function(e) {
      // Add ripple class
      item.classList.add('ripple');
      
      // Remove after animation
      setTimeout(() => {
        item.classList.remove('ripple');
      }, 600);
    });
  });
}

// ----------------------------------------
// ADVANCED ACCORDION WITH GSAP
// ----------------------------------------
function initAdvancedAccordion() {
  const items = document.querySelectorAll('.faq-item');
  
  if (!items.length) return;
  
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (!btn || !answer) return;
    
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all items first
      items.forEach(i => {
        const ans = i.querySelector('.faq-answer');
        if (ans) {
          i.classList.remove('open');
          ans.hidden = true;
          
          // GSAP animation for closing
          if (typeof gsap !== 'undefined') {
            gsap.to(ans, {
              duration: 0.4,
              maxHeight: 0,
              opacity: 0,
              ease: 'power2.inOut'
            });
          }
        }
      });
      
      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.hidden = false;
        
        // GSAP animation for opening with spring
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(answer,
            {
              maxHeight: 0,
              opacity: 0
            },
            {
              duration: 0.6,
              maxHeight: answer.scrollHeight,
              opacity: 1,
              ease: 'elastic.out(1, 0.5)'
            }
          );
        } else {
          // Fallback if GSAP not loaded
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.opacity = '1';
        }
      }
    });
  });
}

// ----------------------------------------
// FLOATING ELEMENTS (PARALLAX ON SCROLL)
// ----------------------------------------
function initFloatingElements() {
  const sideCard = document.querySelector('.faq-side-card');
  
  if (!sideCard) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const offset = scrolled * 0.05;
    
    sideCard.style.transform = `translateY(${offset}px)`;
  });
}

// ----------------------------------------
// GSAP SCROLL TRIGGER (OPTIONAL - IF NEEDED)
// ----------------------------------------
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.from('.faq-layout', {
    scrollTrigger: {
      trigger: '.faq-layout',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  });
}
