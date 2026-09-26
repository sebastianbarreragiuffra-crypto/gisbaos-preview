/* === CTA / Booking config (FINAL WEB FREEZE V1) ===
   Destino unico y centralizado de los CTA "Agenda una demo" e "Iniciar sesion".
   Cuando se defina el proveedor de booking y la URL de login del producto,
   actualizar SOLO estas dos constantes: se aplican automaticamente a todos los
   enlaces marcados con data-cta="demo" / data-cta="login" en cualquier pagina. */
const DEMO_BOOKING_URL = null; // null = conserva el href actual (#contacto). Reemplazar por la URL del proveedor de booking cuando este definido.
const LOGIN_URL = null; // null = conserva el href actual (#). Reemplazar por la URL final de la app/login cuando este definida.
if (DEMO_BOOKING_URL) {
  document.querySelectorAll('a[data-cta="demo"]').forEach((el) => { el.href = DEMO_BOOKING_URL; });
}
if (LOGIN_URL) {
  document.querySelectorAll('[data-cta="login"]').forEach((el) => { el.href = LOGIN_URL; });
}

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const navDropdowns = document.querySelectorAll('[data-nav-dropdown]');

const redirectLegacyServicesLink = () => {
  const routes = { '#servicios': 'servicios.html', '#metodo': 'como-trabajamos.html', '#preguntas': 'preguntas.html' };
  const destination = routes[window.location.hash];
  if (destination && !window.location.pathname.endsWith('/' + destination)) {
    window.location.replace(destination);
  }
};

redirectLegacyServicesLink();
window.addEventListener('hashchange', redirectLegacyServicesLink);

const pageProgress = document.createElement('span');
pageProgress.className = 'page-progress';
pageProgress.setAttribute('aria-hidden', 'true');
header?.append(pageProgress);

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 16);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  pageProgress.style.transform = `scaleX(${scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0})`;
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('open', !isOpen);
  if (isOpen) {
    navDropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  }
});

navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = !dropdown.classList.contains('open');
    navDropdowns.forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
    dropdown.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });
});

document.addEventListener('click', (event) => {
  if ([...navDropdowns].some((dropdown) => dropdown.contains(event.target))) return;
  navDropdowns.forEach((dropdown) => {
    dropdown.classList.remove('open');
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  navDropdowns.forEach((dropdown) => {
    dropdown.classList.remove('open');
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
  });
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    navDropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  revealItems.forEach((item) => {
    // Tras un refresh a mitad de página, lo que quedó por encima del viewport no debe re-animarse al volver
    if (item.getBoundingClientRect().bottom < 0) { item.classList.add('visible'); return; }
    observer.observe(item);
  });
}

// El marcador temprano ya ocultó los reveals antes del primer paint; cancela su fail-safe.
window.clearTimeout(window.__gisbaRevealFallback);

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== detail) other.removeAttribute('open');
    });
  });
});

const form = document.querySelector('[data-contact-form]');
const result = document.querySelector('[data-form-result]');

if (DEMO_BOOKING_URL) form?.setAttribute('novalidate', '');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (DEMO_BOOKING_URL) {
    window.location.assign(DEMO_BOOKING_URL);
    return;
  }
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const interests = data.getAll('interes');
  const firstInterest = form.querySelector('input[name="interes"]');
  if (!interests.length) {
    firstInterest?.setCustomValidity('Selecciona al menos una opción.');
    firstInterest?.reportValidity();
    return;
  }
  firstInterest?.setCustomValidity('');
  const request = [
    'Solicitud desde la web de GISBA',
    `Nombre: ${data.get('nombre')}`,
    `Correo: ${data.get('correo')}`,
    `Clientes activos: ${data.get('clientes') || 'No indicado'}`,
    `Intereses: ${interests.join(', ')}`,
    `Contexto: ${data.get('mensaje') || 'Sin detalles adicionales'}`
  ].join('\n');

  const subject = 'Solicitud de demo de GISBA OS';
  const destination = `mailto:contacto@gisbaos.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(request)}`;

  result.textContent = 'Abriendo tu aplicación de correo para enviar la solicitud a GISBA.';
  result.hidden = false;
  window.location.href = destination;
});

form?.querySelectorAll('input[name="interes"]').forEach((input) => {
  input.addEventListener('change', () => form.querySelector('input[name="interes"]')?.setCustomValidity(''));
});

/* "Así lo ve tu cliente": navegacion manual entre las 4 vistas, sin autoplay */
const clientStoryTabs = document.querySelector('.client-story-tabs');
const clientStoryStage = document.querySelector('.client-story-stage[data-product-story]');

if (clientStoryTabs && clientStoryStage) {
  const tabs = [...clientStoryTabs.querySelectorAll('[data-story-tab]')];
  const panels = [...clientStoryStage.querySelectorAll('[data-story-panel]')];

  const showStory = (index) => {
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      if (isActive) {
        panel.hidden = false;
        panel.classList.add('active');
        if (!reducedMotion) {
          panel.classList.remove('entering');
          void panel.offsetWidth;
          panel.classList.add('entering');
        }
      } else {
        panel.hidden = true;
        panel.classList.remove('active', 'entering');
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showStory(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      showStory(nextIndex);
      tabs[nextIndex].focus();
    });
  });
}

const dashboardSwitcher = document.querySelector('[data-dashboard-switcher]');

if (dashboardSwitcher) {
  const section = dashboardSwitcher.closest('.client-dashboard-preview');
  const switchControl = section.querySelector('.dashboard-business-switch');
  const tabs = [...section.querySelectorAll('[data-dashboard-tab]')];
  const panels = [...dashboardSwitcher.querySelectorAll('[data-dashboard-panel]')];
  let activeIndex = 0;

  const showDashboard = (index, moveFocus = false) => {
    if (index === activeIndex) {
      if (moveFocus) tabs[index].focus();
      return;
    }
    const directionClass = index > activeIndex ? 'enter-from-right' : 'enter-from-left';
    section.querySelectorAll('.dashboard-marker.is-active').forEach((marker) => {
      marker.classList.remove('is-active');
      marker.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });
    switchControl.dataset.activeIndex = String(index);
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && moveFocus) tab.focus();
    });
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      panel.classList.remove('enter-from-left', 'enter-from-right');
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
      if (isActive) panel.classList.add(directionClass);
    });
    activeIndex = index;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showDashboard(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      showDashboard((index + direction + tabs.length) % tabs.length, true);
    });
  });
}

const dashboardHotspots = [...document.querySelectorAll('[data-dashboard-hotspot]')];
dashboardSwitcher?.addEventListener('click', (event) => {
  const hotspot = event.target.closest?.('[data-dashboard-hotspot]');
  if (!hotspot) return;
  const marker = hotspot.closest('.dashboard-marker');
  const willOpen = !marker.classList.contains('is-active');
  dashboardHotspots.forEach((other) => {
    other.closest('.dashboard-marker')?.classList.remove('is-active');
    other.setAttribute('aria-expanded', 'false');
  });
  marker.classList.toggle('is-active', willOpen);
  hotspot.setAttribute('aria-expanded', String(willOpen));
});
document.addEventListener('click', (event) => {
  if (event.target.closest?.('.dashboard-marker')) return;
  dashboardHotspots.forEach((hotspot) => {
  hotspot.closest('.dashboard-marker')?.classList.remove('is-active');
  hotspot.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  dashboardHotspots.forEach((hotspot) => {
    hotspot.closest('.dashboard-marker')?.classList.remove('is-active');
    hotspot.setAttribute('aria-expanded', 'false');
  });
});

const heroProduct = document.querySelector('.hero-product');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 781px)');

if (heroProduct && precisePointer.matches && !reducedMotion) {
  const resetHeroTilt = () => {
    heroProduct.classList.remove('is-interacting');
    heroProduct.style.setProperty('--hero-tilt-x', '0deg');
    heroProduct.style.setProperty('--hero-tilt-y', '0deg');
  };

  heroProduct.addEventListener('pointermove', (event) => {
    const bounds = heroProduct.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
    const vertical = (event.clientY - bounds.top) / bounds.height - .5;
    heroProduct.classList.add('is-interacting');
    heroProduct.style.setProperty('--hero-tilt-x', `${(-vertical * 2.4).toFixed(2)}deg`);
    heroProduct.style.setProperty('--hero-tilt-y', `${(horizontal * 3).toFixed(2)}deg`);
  });
  heroProduct.addEventListener('pointerleave', resetHeroTilt);
  window.addEventListener('blur', resetHeroTilt);
}

if (document.body.classList.contains('home-page')) {
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Volver al inicio');
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
  document.body.append(backToTop);
  const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 850);
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
