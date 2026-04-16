// ===== UTILITY FUNCTIONS =====
const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollEffects();
  initAnimations();
  initCounters();
  initTestimonials();
  initFAQ();
  initServiceModal();
  initContactForm();
  initParallax();
  initLazyLoading();
  initVisitorCounter();
  initVideoShowcase();
  initCarouselPause();
});

// ===== THEME MANAGEMENT =====
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  // Force light mode only
  html.setAttribute('data-theme', 'light');
  
  // Hide theme toggle button
  if (themeToggle) {
    themeToggle.style.display = 'none';
  }
}

// ===== NAVIGATION =====
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Hamburger menu toggle
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu?.classList.toggle('active');
    document.body.style.overflow = navMenu?.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close menu when clicking on a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target) && navMenu?.classList.contains('active')) {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Smooth scroll with offset
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  
  const highlightNav = () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLink?.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', throttle(highlightNav, 100));
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');
  const floatingCta = document.querySelector('.floating-cta');
  let lastScroll = 0;
  
  const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    // Progress bar
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (currentScroll / scrollHeight) * 100;
    if (progressBar) {
      progressBar.style.width = `${scrollPercentage}%`;
    }
    
    // Navbar hide/show on scroll
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar?.classList.add('hidden');
    } else {
      navbar?.classList.remove('hidden');
    }
    
    // Navbar background on scroll
    if (currentScroll > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    
    // Show/hide floating CTA
    if (floatingCta) {
      if (currentScroll > 500) {
        floatingCta.style.opacity = '1';
        floatingCta.style.pointerEvents = 'auto';
      } else {
        floatingCta.style.opacity = '0';
        floatingCta.style.pointerEvents = 'none';
      }
    }
    
    lastScroll = currentScroll;
  };
  
  window.addEventListener('scroll', throttle(handleScroll, 100));
}

// ===== ANIMATIONS (AOS Alternative) =====
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        
        // Stagger children if they exist
        const children = entry.target.querySelectorAll('[data-aos-delay]');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('aos-animate');
          }, parseInt(child.dataset.aosDelay) || index * 100);
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with data-aos attribute
  document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
  });
}

// ===== COUNTERS =====
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200;
  
  const observerOptions = {
    threshold: 0.5
  };
  
  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-count'));
    const increment = target / speed;
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.ceil(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + (target > 1 ? '+' : '');
      }
    };
    
    updateCounter();
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => observer.observe(counter));
}

// ===== TESTIMONIALS SLIDER =====
function initTestimonials() {
  const track = document.querySelector('.testimonial-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (!track || cards.length === 0) return;
  
  let currentIndex = 0;
  const totalCards = cards.length;
  
  const showCard = (index) => {
    cards.forEach(card => card.classList.remove('active'));
    cards[index].classList.add('active');
  };
  
  const nextCard = () => {
    currentIndex = (currentIndex + 1) % totalCards;
    showCard(currentIndex);
  };
  
  const prevCard = () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    showCard(currentIndex);
  };
  
  prevBtn?.addEventListener('click', prevCard);
  nextBtn?.addEventListener('click', nextCard);
  
  // Auto-rotate
  let autoRotate = setInterval(nextCard, 5000);
  
  // Pause on hover
  track.addEventListener('mouseenter', () => {
    clearInterval(autoRotate);
  });
  
  track.addEventListener('mouseleave', () => {
    autoRotate = setInterval(nextCard, 5000);
  });
  
  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  const handleSwipe = () => {
    if (touchEndX < touchStartX - 50) nextCard();
    if (touchEndX > touchStartX + 50) prevCard();
  };
}

// ===== FAQ ACCORDION =====
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active', !isActive);
    });
  });
}

// ===== SERVICE MODAL =====
function initServiceModal() {
  const modal = document.getElementById('serviceModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.querySelector('.modal-close');
  const modalOverlay = document.querySelector('.modal-overlay');
  const serviceCards = document.querySelectorAll('.service-card');
  
  const serviceContent = {
    1: {
      title: 'HR Management',
      description: 'Streamline your HR processes with real-time employee tracking, performance insights, and automated payroll systems. Our platform offers intuitive dashboards and seamless integration for efficient workforce management.',
      features: ['Employee tracking', 'Automated payroll', 'Performance analytics', 'Leave management']
    },
    2: {
      title: 'IT Infrastructure & Support',
      description: 'Manage your IT infrastructure with cloud integration, 24/7 technical support, and advanced security features to ensure uptime and efficiency.',
      features: ['Cloud integration', '24/7 support', 'Security monitoring', 'System maintenance']
    },
    3: {
      title: 'Accounting & Finance',
      description: 'Simplify accounting with automated financial reports, real-time insights, and secure transaction management for better financial control.',
      features: ['Automated reports', 'Real-time insights', 'Transaction management', 'Tax compliance']
    },
    4: {
      title: 'Quality Control',
      description: 'Ensure product and service quality with advanced monitoring tools, compliance tracking, and detailed quality reports.',
      features: ['Quality monitoring', 'Compliance tracking', 'Detailed reports', 'Process optimization']
    },
    5: {
      title: 'Professional Design',
      description: 'Create stunning visuals with our professional design tools, customizable templates, and brand-aligned graphics.',
      features: ['Design tools', 'Custom templates', 'Brand guidelines', 'Asset management']
    },
    6: {
      title: 'Marketing & Outreach',
      description: 'Boost your brand with targeted marketing campaigns, SEO tools, and powerful outreach analytics for maximum reach.',
      features: ['Campaign management', 'SEO optimization', 'Analytics dashboard', 'Social media tools']
    },
    7: {
      title: 'Team Developers',
      description: 'Empower your development team with collaborative tools, version control, and seamless integration for web and app development projects.',
      features: ['Version control', 'Collaboration tools', 'CI/CD pipeline', 'Code review']
    },
    8: {
      title: 'Inventory Management',
      description: 'Track and manage inventory with real-time updates, automated stock alerts, and efficient supply chain integration.',
      features: ['Real-time tracking', 'Stock alerts', 'Supply chain', 'Order management']
    },
    9: {
      title: 'Call Center Setup',
      description: 'Optimize customer support with scalable call center solutions, real-time analytics, and seamless CRM integration.',
      features: ['Call routing', 'CRM integration', 'Analytics', 'Quality monitoring']
    },
    10: {
      title: 'Delivery Management',
      description: 'Manage deliveries with secure tracking, real-time updates, and optimized logistics for efficiency.',
      features: ['Real-time tracking', 'Route optimization', 'Delivery scheduling', 'Customer notifications']
    },
    11: {
      title: 'Data Analysis & Decision Support',
      description: 'Leverage data with advanced analytics, predictive insights, and decision-making tools for better business outcomes.',
      features: ['Advanced analytics', 'Predictive insights', 'Data visualization', 'Business intelligence']
    }
  };
  
  const openModal = (serviceId, videoSrc) => {
    const service = serviceContent[serviceId];
    if (!service) return;
    
    const videoHTML = videoSrc ? `
      <div style="margin-top: 2rem;">
        <video controls style="width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
          <source src="${videoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    ` : '';
    
    modalBody.innerHTML = `
      <h2>${service.title}</h2>
      <p>${service.description}</p>
      ${videoHTML}
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Key Features:</h3>
      <ul style="list-style: none; padding: 0;">
        ${service.features.map(feature => `
          <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <i class="fas fa-check-circle" style="color: var(--success);"></i>
            <span>${feature}</span>
          </li>
        `).join('')}
      </ul>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const serviceId = card.getAttribute('data-service');
      const videoSrc = card.getAttribute('data-video');
      openModal(serviceId, videoSrc);
    });
  });
  
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.querySelector('.contact-form');
  
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      submitBtn.style.background = 'var(--success)';
      
      setTimeout(() => {
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 2000);
    }, 1500);
  });
  
  // Add ripple effect to form inputs
  const inputs = form?.querySelectorAll('input, textarea');
  inputs?.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });
}

// ===== PARALLAX EFFECT =====
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  if (parallaxElements.length === 0) return;
  
  const handleMouseMove = throttle((e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    parallaxElements.forEach(el => {
      const speed = el.dataset.speed || 0.05;
      const x = (clientX - centerX) * speed;
      const y = (clientY - centerY) * speed;
      
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  }, 50);
  
  window.addEventListener('mousemove', handleMouseMove);
}

// ===== LAZY LOADING =====
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    return;
  }
  
  // Fallback for browsers that don't support native lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ===== REAL VISITOR COUNTER =====
function initVisitorCounter() {
  const counterElement = document.getElementById('visitorCount');
  if (!counterElement) return;
  
  // Generate unique session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('visitorSessionId');
    if (!sessionId) {
      sessionId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('visitorSessionId', sessionId);
    }
    return sessionId;
  };
  
  // Store visitor data in localStorage
  const updateVisitorData = () => {
    const now = Date.now();
    const sessionId = getSessionId();
    const visitorData = JSON.parse(localStorage.getItem('foundixVisitors') || '{}');
    
    // Clean up old sessions (older than 5 minutes)
    Object.keys(visitorData).forEach(key => {
      if (now - visitorData[key] > 5 * 60 * 1000) {
        delete visitorData[key];
      }
    });
    
    // Add/update current session
    visitorData[sessionId] = now;
    localStorage.setItem('foundixVisitors', JSON.stringify(visitorData));
    
    return Object.keys(visitorData).length;
  };
  
  // Initial count
  let count = updateVisitorData();
  counterElement.textContent = count;
  
  // Update count every 10 seconds
  setInterval(() => {
    const newCount = updateVisitorData();
    
    if (newCount !== count) {
      // Animate the change
      counterElement.style.transform = 'scale(1.15)';
      counterElement.style.color = 'var(--primary)';
      
      setTimeout(() => {
        count = newCount;
        counterElement.textContent = count;
        
        setTimeout(() => {
          counterElement.style.transform = 'scale(1)';
          counterElement.style.color = '';
        }, 200);
      }, 100);
    }
  }, 10000);
  
  // Broadcast channel for cross-tab communication
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('foundix_visitors');
    
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'visitor_update') {
        count = updateVisitorData();
        counterElement.textContent = count;
      }
    });
    
    // Notify other tabs when this tab loads
    channel.postMessage({ type: 'visitor_update' });
  }
}

// ===== RIPPLE EFFECT =====
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// Add ripple effect to all buttons
document.querySelectorAll('.btn, .service-card, .pricing-card').forEach(element => {
  element.addEventListener('click', createRipple);
});

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Add scroll to top on logo click
document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
  e.preventDefault();
  scrollToTop();
});

// ===== PERFORMANCE MONITORING =====
if ('PerformanceObserver' in window) {
  // Monitor Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
  });
  
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  
  // Monitor First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  });
  
  fidObserver.observe({ entryTypes: ['first-input'] });
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  // Close modal on Escape
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal.active');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Close mobile menu
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    if (navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamburger?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});

// ===== PRELOAD CRITICAL RESOURCES =====
function preloadResources() {
  const criticalImages = [
    'Resource/logo_foundix.jpg',
    'Resource/foundix.mp4'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = src.endsWith('.mp4') ? 'video' : 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const createObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// ===== SMOOTH SCROLL POLYFILL =====
if (!('scrollBehavior' in document.documentElement.style)) {
  const smoothScrollPolyfill = () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 1000;
          let start = null;
          
          const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
          };
          
          const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
          };
          
          requestAnimationFrame(animation);
        }
      });
    });
  };
  
  smoothScrollPolyfill();
}

// ===== CONSOLE EASTER EGG =====
console.log('%c🚀 Foundix - Foundation meets growth', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cBuilt with ❤️ using modern web technologies', 'font-size: 14px; color: #8b5cf6;');
console.log('%cInterested in joining our team? Visit the Careers section!', 'font-size: 12px; color: #ec4899;');

// ===== SERVICE WORKER REGISTRATION (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable PWA
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered:', registration))
    //   .catch(error => console.log('SW registration failed:', error));
  });
}

// ===== VIDEO SHOWCASE =====
function initVideoShowcase() {
  const video = document.querySelector('.showcase-video');
  
  if (!video) return;
  
  // Enable inline playback for iOS
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  
  // Add click to play/pause
  video.addEventListener('click', function(e) {
    // Don't interfere with native controls
    if (e.target === video) {
      if (this.paused) {
        this.play().catch(err => {
          console.log('Play prevented:', err);
        });
      } else {
        this.pause();
      }
    }
  });
  
  // Ensure video works on mobile
  video.addEventListener('loadedmetadata', function() {
    console.log('Video loaded successfully');
  });
  
  video.addEventListener('error', function(e) {
    console.error('Video error:', e);
  });
}

// ===== CAROUSEL PAUSE ON HOVER =====
function initCarouselPause() {
  const carousel = document.querySelector('.hero-trusted-carousel');
  const track = document.querySelector('.carousel-track');
  
  if (!carousel || !track) return;
  
  carousel.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  
  carousel.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

// ===== NEON GLOW EFFECT ON MOUSE MOVE =====
document.addEventListener('mousemove', throttle((e) => {
  const neonCards = document.querySelectorAll('.neon-card');
  
  neonCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  });
}, 50));

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    throttle,
    createRipple,
    scrollToTop
  };
}
