document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // === Mobile Toggle ===
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navList) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // === Header scroll effect ===
  const header = document.querySelector('.header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // === Scroll Reveal ===
  const revealElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // === Smooth Scroll ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === Form Validation ===
  const form = document.querySelector('.contact-form form');
  if (form) {
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const formContent = form.querySelector('.form-content');
    const successMessage = form.querySelector('.form-success');

    const showError = (input, message) => {
      const errorEl = input.parentElement.querySelector('.form-error');
      input.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    };

    const clearError = input => {
      const errorEl = input.parentElement.querySelector('.form-error');
      input.classList.remove('has-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
    };

    const validateField = input => {
      clearError(input);

      if (input.hasAttribute('required') && !input.value.trim()) {
        showError(input, 'Este campo é obrigatório.');
        return false;
      }

      if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          showError(input, 'Informe um e-mail válido.');
          return false;
        }
      }

      return true;
    };

    const validateForm = () => {
      let isValid = true;
      [nameInput, emailInput, messageInput].forEach(input => {
        if (input && !validateField(input)) {
          isValid = false;
        }
      });
      return isValid;
    };

    // Live validation on blur
    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('has-error')) {
            validateField(input);
          }
        });
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      if (!validateForm()) return;

      // Simulate submission
      const submitBtn = form.querySelector('.btn');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
          if (formContent) formContent.style.display = 'none';
          if (successMessage) successMessage.classList.add('visible');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 1200);
      }
    });
  }
});
