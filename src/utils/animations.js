// Custom Cursor
export const initCustomCursor = () => {
  const cursorDot = document.createElement('div');
  const cursorOutline = document.createElement('div');
  
  cursorDot.className = 'cursor-dot';
  cursorOutline.className = 'cursor-outline';
  
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorOutline);
  
  let cursorVisible = true;
  let cursorEnlarged = false;
  
  const endX = window.innerWidth / 2;
  const endY = window.innerHeight / 2;
  
  let distanceX = 0;
  let distanceY = 0;
  
  let mouse = { x: endX, y: endY };
  
  function updateCursor() {
    if (cursorVisible) {
      distanceX = mouse.x - cursorDot.offsetLeft;
      distanceY = mouse.y - cursorDot.offsetTop;
      
      cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      cursorOutline.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
    }
    
    requestAnimationFrame(updateCursor);
  }
  
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  document.addEventListener('mouseenter', () => {
    cursorVisible = true;
    cursorDot.style.opacity = 1;
    cursorOutline.style.opacity = 1;
  });
  
  document.addEventListener('mouseleave', () => {
    cursorVisible = false;
    cursorDot.style.opacity = 0;
    cursorOutline.style.opacity = 0;
  });
  
  document.addEventListener('mousedown', () => {
    cursorEnlarged = true;
    cursorOutline.style.transform = `translate(${mouse.x}px, ${mouse.y}px) scale(0.8)`;
  });
  
  document.addEventListener('mouseup', () => {
    cursorEnlarged = false;
    cursorOutline.style.transform = `translate(${mouse.x}px, ${mouse.y}px) scale(1)`;
  });
  
  // Hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('button, a, input, .glass-card');
  
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseover', () => {
      cursorEnlarged = true;
      cursorOutline.style.transform = `translate(${mouse.x}px, ${mouse.y}px) scale(1.5)`;
      cursorOutline.style.borderColor = 'var(--secondary-light)';
      cursorDot.style.backgroundColor = 'var(--secondary-light)';
    });
    
    el.addEventListener('mouseout', () => {
      cursorEnlarged = false;
      cursorOutline.style.transform = `translate(${mouse.x}px, ${mouse.y}px) scale(1)`;
      cursorOutline.style.borderColor = 'var(--primary-light)';
      cursorDot.style.backgroundColor = 'var(--primary-light)';
    });
  });
  
  updateCursor();
};

// Scroll Reveal Animation
export const initScrollReveal = () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
};

// Parallax Effect
export const initParallax = () => {
  const parallaxElements = document.querySelectorAll('.parallax-element');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(el => {
      const speed = el.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  });
};

// 3D Card Effect
export const init3DCards = () => {
  const cards = document.querySelectorAll('.card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = -(x - centerX) / 10;
      
      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
};

// Button Ripple Effect
export const initRippleEffect = () => {
  document.querySelectorAll('.gradient-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 1000);
    });
  });
};

// Initialize all animations
export const initAllAnimations = () => {
  initCustomCursor();
  initScrollReveal();
  initParallax();
  init3DCards();
  initRippleEffect();
}; 