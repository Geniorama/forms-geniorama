// ============================================================
//  GENIORAMA — Brief Sitio Web
//  brief-web.js  |  ES6+
// ============================================================

const STORAGE_KEY = 'geniorama_brief_web_v1';
const TOTAL_STEPS  = 8;

// Configura aquí el endpoint de envío.
// Ejemplo con FormSubmit.co: 'https://formsubmit.co/ajax/hola@geniorama.co'
// Si lo dejas vacío, el formulario se descarga como JSON.
const SUBMIT_URL = 'https://hook.us1.make.com/j6ax6bpalmvsnrm84xwx51pztb7l8maj';

// ── Mapas de etiquetas para el resumen ──────────────────────
const LABELS = {
  // Objetivo
  vender:        'Vender productos o servicios online',
  leads:         'Generar leads / solicitudes de contacto',
  informar:      'Informar y educar a mi audiencia',
  marca:         'Posicionar y fortalecer mi marca',
  comunidad:     'Construir una comunidad',
  portal:        'Portal o plataforma de usuarios',
  objetivo_otro: 'Otro',
  // Tipo de sitio
  landing:       'Landing Page',
  corporativo:   'Sitio corporativo / informativo',
  catalogo:      'Catálogo de productos',
  ecommerce:     'Tienda online (e-commerce)',
  blog:          'Blog / portal de contenido',
  plataforma:    'Plataforma web / SaaS',
  educativo:     'Portal educativo',
  tipo_otro:     'Otro',
  // Fases
  estrategia:    'Estrategia y arquitectura de información',
  disenio_ux:    'Diseño UX/UI',
  contenido:     'Redacción y generación de contenido',
  foto_video:    'Fotografía y video profesional',
  desarrollo:    'Desarrollo web',
  cms:           'Configuración de CMS',
  pasarela:      'Integración de pasarela de pagos',
  despliegue:    'Despliegue y configuración',
  seo:           'SEO técnico y on-page',
  capacitacion:  'Capacitación y manual de uso',
  // Funcionalidades
  f_contacto:    'Formulario de contacto',
  f_blog:        'Blog o noticias',
  f_galeria:     'Galería de fotos / videos',
  f_carrito:     'Carrito de compras',
  f_pagos:       'Pagos online',
  f_reservas:    'Sistema de citas / reservas',
  f_privada:     'Área privada (login)',
  f_chat:        'Chat en vivo o chatbot',
  f_redes:       'Integración con redes sociales',
  f_newsletter:  'Newsletter / email marketing',
  f_buscador:    'Buscador interno',
  f_mapa:        'Mapa / geolocalización',
  f_analitica:   'Analítica web',
  f_i18n:        'Múltiples idiomas (i18n)',
  // Idiomas
  lang_es:       'Español',
  lang_en:       'Inglés',
  lang_pt:       'Portugués',
  lang_fr:       'Francés',
  lang_de:       'Alemán',
  lang_otro:     'Otro',
  // Páginas
  '1-3':  '1 – 3 páginas',
  '4-8':  '4 – 8 páginas',
  '9-15': '9 – 15 páginas',
  '16-30':'16 – 30 páginas',
  'mas30':'+30 páginas',
  // Estilo visual
  estilo_minimal:  'Minimalista y clean',
  estilo_corp:     'Corporativo y profesional',
  estilo_creativo: 'Creativo y artístico',
  estilo_tech:     'Tech / Futurista',
  estilo_calido:   'Cálido y amigable',
  estilo_elegante: 'Elegante y premium',
  estilo_libre:    'Sin preferencia',
  // Urgencia
  urgencia_flexible: 'Sin prisa / Flexible',
  urgencia_normal:   'Normal',
  urgencia_urgente:  'Urgente',
  // Presupuesto
  '600-1500':    '$600 – $1,500 USD',
  '1500-4000':   '$1,500 – $4,000 USD',
  '4000-10000':  '$4,000 – $10,000 USD',
  '10000-25000': '$10,000 – $25,000 USD',
  'mas-25000':   'Más de $25,000 USD',
  'a-discutir':  'Prefiero discutirlo en reunión',
  // Referido
  ref_redes:       'Redes sociales',
  ref_recomendado: 'Me lo recomendaron',
  ref_google:      'Búsqueda en Google',
  ref_trabaje:     'Ya trabajé con Geniorama',
  ref_evento:      'Evento o conferencia',
  ref_otro:        'Otro',
};

function label(val) {
  if (!val) return '—';
  if (Array.isArray(val)) {
    const mapped = val.map(v => LABELS[v] || v);
    return mapped.length ? mapped.join(', ') : '—';
  }
  return LABELS[val] || val;
}

// ── Required fields per step ────────────────────────────────
const REQUIRED = {
  1: ['nombre', 'empresa', 'email'],
  2: ['proyectoNombre', 'descripcion', 'objetivo'],
  3: ['tipoSitio'],
  4: [],
  5: [],
  6: [],
  7: ['presupuesto'],
  8: [],
};

// ── State ────────────────────────────────────────────────────
let state = {
  step: 1,
  data: {},
};

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderStep(state.step);
  updateProgress();
  updateNav();
  renderDots();
  bindNav();
  bindTextInputs();
  bindCardGroups();
  bindCheckItems();
  bindTogglePills();
  bindConditionals();
  restoreFormValues();

  // Warn on unload only if form has been started
  window.addEventListener('beforeunload', e => {
    if (state.step > 1 || Object.keys(state.data).length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});

// ── Persistence ──────────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.step = parsed.step || 1;
      state.data = parsed.data || {};
    }
  } catch (_) {}
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  state = { step: 1, data: {} };
}

// ── Navigation ───────────────────────────────────────────────
function bindNav() {
  document.getElementById('btn-prev').addEventListener('click', goPrev);
  document.getElementById('btn-next').addEventListener('click', goNext);
  document.getElementById('btn-submit').addEventListener('click', handleSubmit);
  document.getElementById('btn-reset')?.addEventListener('click', resetForm);
}

function goNext() {
  if (!validateStep(state.step)) return;
  if (state.step >= TOTAL_STEPS) return;
  state.step++;
  onStepChange();
  if (state.step === TOTAL_STEPS) renderSummary();
}

function goPrev() {
  if (state.step <= 1) return;
  state.step--;
  onStepChange();
}

function onStepChange() {
  renderStep(state.step);
  updateProgress();
  updateNav();
  renderDots();
  saveState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Step rendering ───────────────────────────────────────────
function renderStep(step) {
  document.querySelectorAll('.step[data-step]').forEach(el => {
    el.classList.toggle('hidden', el.dataset.step !== String(step));
  });
}

function updateProgress() {
  const pct = Math.round((state.step / TOTAL_STEPS) * 100);
  const bar = document.getElementById('progress-bar');
  const indicator = document.getElementById('step-indicator');
  if (bar) bar.style.width = `${pct}%`;
  if (indicator) indicator.textContent = `Paso ${state.step} de ${TOTAL_STEPS}`;
}

function updateNav() {
  const prev   = document.getElementById('btn-prev');
  const next   = document.getElementById('btn-next');
  const submit = document.getElementById('btn-submit');

  prev.disabled = state.step === 1;

  const isLast = state.step === TOTAL_STEPS;
  next.classList.toggle('hidden', isLast);
  submit.classList.toggle('hidden', !isLast);
}

function renderDots() {
  const container = document.getElementById('step-dots');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot';
    if (i === state.step) dot.classList.add('is-active');
    else if (i < state.step) dot.classList.add('is-done');
    container.appendChild(dot);
  }
}

// ── Validation ───────────────────────────────────────────────
function validateStep(step) {
  clearErrors(step);
  const required = REQUIRED[step] || [];
  let valid = true;

  for (const field of required) {
    const value = getDataValue(field);
    const empty = !value || (Array.isArray(value) && value.length === 0) || value === '';
    if (empty) {
      markFieldError(step, field);
      valid = false;
    }
  }

  // Email format
  if (required.includes('email')) {
    const el = document.querySelector(`[data-step="${step}"] [data-field="email"]`);
    if (el && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
      el.classList.add('is-error');
      appendErrorMsg(el.parentElement, 'Ingresa un email válido');
      valid = false;
    }
  }

  if (!valid) shakeStep(step);
  return valid;
}

function getDataValue(field) {
  return state.data[field];
}

function markFieldError(step, field) {
  // Input/select/textarea
  const el = document.querySelector(`[data-step="${step}"] [data-field="${field}"]`);
  if (el) {
    el.classList.add('is-error');
    appendErrorMsg(el.parentElement, 'Este campo es requerido');
    return;
  }
  // Card groups
  const cardGroup = document.querySelector(`[data-step="${step}"] [data-group="${field}"]`);
  if (cardGroup) {
    cardGroup.style.outline = '1.5px solid #ef4444';
    cardGroup.style.borderRadius = '12px';
    appendErrorMsg(cardGroup.parentElement, 'Selecciona una opción');
  }
}

function appendErrorMsg(parent, msg) {
  if (!parent) return;
  const p = document.createElement('p');
  p.className = 'error-msg';
  p.textContent = `⚠ ${msg}`;
  parent.appendChild(p);
}

function clearErrors(step) {
  const section = document.querySelector(`.step[data-step="${step}"]`);
  if (!section) return;
  section.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
  section.querySelectorAll('.error-msg').forEach(el => el.remove());
  section.querySelectorAll('[style*="outline"]').forEach(el => el.style.removeProperty('outline'));
}

function shakeStep(step) {
  const el = document.querySelector(`.step[data-step="${step}"]`);
  if (!el) return;
  el.classList.remove('is-shaking');
  void el.offsetWidth; // reflow
  el.classList.add('is-shaking');
  el.addEventListener('animationend', () => el.classList.remove('is-shaking'), { once: true });
}

// ── Input binding ────────────────────────────────────────────
function bindTextInputs() {
  document.querySelectorAll('input[data-field], textarea[data-field], select[data-field]').forEach(el => {
    const update = () => {
      state.data[el.dataset.field] = el.value.trim();
      saveState();
    };
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });
}

// ── Card groups (single select) ──────────────────────────────
function bindCardGroups() {
  document.querySelectorAll('[data-group]').forEach(group => {
    const field    = group.dataset.group;
    const isMulti  = group.dataset.multi === 'true';

    group.querySelectorAll('.select-card, .budget-card').forEach(card => {
      card.addEventListener('click', () => {
        if (isMulti) {
          card.classList.toggle('is-selected');
          state.data[field] = getSelectedValues(group);
        } else {
          group.querySelectorAll('.select-card, .budget-card').forEach(c => c.classList.remove('is-selected'));
          card.classList.add('is-selected');
          state.data[field] = card.dataset.value;
        }
        saveState();
      });
    });
  });
}

function getSelectedValues(group) {
  return Array.from(group.querySelectorAll('.is-selected')).map(c => c.dataset.value);
}

// ── Check items (multi select) ───────────────────────────────
function bindCheckItems() {
  document.querySelectorAll('.check-items[data-group]').forEach(group => {
    const field = group.dataset.group;
    group.querySelectorAll('.check-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('is-selected');
        state.data[field] = Array.from(group.querySelectorAll('.check-item.is-selected'))
                                 .map(i => i.dataset.value);
        saveState();
      });
    });
  });
}

// ── Toggle pills ─────────────────────────────────────────────
function bindTogglePills() {
  document.querySelectorAll('.toggle-group[data-group]').forEach(group => {
    const field   = group.dataset.group;
    const isMulti = group.dataset.multi === 'true';

    group.querySelectorAll('.toggle-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (isMulti) {
          pill.classList.toggle('is-selected');
          state.data[field] = Array.from(group.querySelectorAll('.toggle-pill.is-selected'))
                                   .map(p => p.dataset.value);
        } else {
          group.querySelectorAll('.toggle-pill').forEach(p => p.classList.remove('is-selected'));
          pill.classList.add('is-selected');
          state.data[field] = pill.dataset.value;
        }
        // Trigger conditional check
        document.dispatchEvent(new CustomEvent('field:change', { detail: { field, value: state.data[field] } }));
        saveState();
      });
    });
  });
}

// ── Conditional fields ───────────────────────────────────────
function bindConditionals() {
  document.addEventListener('field:change', ({ detail }) => {
    if (detail.field === 'tieneWeb') {
      toggleConditional('url-actual-group', detail.value === 'si');
    }
    if (detail.field === 'tieneIdentidad') {
      toggleConditional('logo-group', detail.value === 'si');
    }
  });
  // Restore on load
  restoreConditionals();
}

function toggleConditional(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', !show);
}

function restoreConditionals() {
  // Will be called after restoreFormValues
  setTimeout(() => {
    toggleConditional('url-actual-group', state.data.tieneWeb === 'si');
    toggleConditional('logo-group', state.data.tieneIdentidad === 'si');
  }, 0);
}

// ── Restore form values from state ──────────────────────────
function restoreFormValues() {
  Object.entries(state.data).forEach(([field, value]) => {
    // Text / textarea / select
    const el = document.querySelector(`[data-field="${field}"]`);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
      el.value = value;
    }
  });

  // Cards (single)
  document.querySelectorAll('[data-group]:not([data-multi])').forEach(group => {
    const val = state.data[group.dataset.group];
    if (val) {
      group.querySelectorAll('.select-card, .budget-card').forEach(c => {
        c.classList.toggle('is-selected', c.dataset.value === val);
      });
    }
  });

  // Cards (multi)
  document.querySelectorAll('[data-group][data-multi="true"]').forEach(group => {
    const vals = state.data[group.dataset.group] || [];
    group.querySelectorAll('.select-card').forEach(c => {
      c.classList.toggle('is-selected', vals.includes(c.dataset.value));
    });
  });

  // Check items
  document.querySelectorAll('.check-items[data-group]').forEach(group => {
    const vals = state.data[group.dataset.group] || [];
    group.querySelectorAll('.check-item').forEach(item => {
      item.classList.toggle('is-selected', vals.includes(item.dataset.value));
    });
  });

  // Toggle pills
  document.querySelectorAll('.toggle-group[data-group]').forEach(group => {
    const field  = group.dataset.group;
    const isMulti = group.dataset.multi === 'true';
    const val = state.data[field];
    if (!val) return;
    group.querySelectorAll('.toggle-pill').forEach(pill => {
      if (isMulti) {
        pill.classList.toggle('is-selected', Array.isArray(val) && val.includes(pill.dataset.value));
      } else {
        pill.classList.toggle('is-selected', pill.dataset.value === val);
      }
    });
  });
}

// ── Summary ──────────────────────────────────────────────────
function renderSummary() {
  const container = document.getElementById('summary-content');
  if (!container) return;

  const d = state.data;

  const sections = [
    {
      title: '01 · Contacto',
      rows: [
        { l: 'Nombre',    v: d.nombre },
        { l: 'Empresa',   v: d.empresa },
        { l: 'Email',     v: d.email },
        { l: 'Teléfono',  v: d.telefono },
        { l: 'País',      v: d.pais },
      ],
    },
    {
      title: '02 · El proyecto',
      rows: [
        { l: 'Nombre del proyecto', v: d.proyectoNombre },
        { l: '¿Tiene sitio web?',   v: d.tieneWeb === 'si' ? 'Sí' : d.tieneWeb === 'no' ? 'No' : null },
        { l: 'URL actual',          v: d.tieneWeb === 'si' ? d.urlActual : null },
        { l: 'Descripción',         v: d.descripcion },
        { l: 'Objetivo principal',  v: label(d.objetivo) },
      ],
    },
    {
      title: '03 · Tipo de sitio',
      rows: [{ l: 'Tipo seleccionado', v: label(d.tipoSitio) }],
    },
    {
      title: '04 · Fases',
      rows: [{ l: 'Fases requeridas', v: label(d.fases) }],
    },
    {
      title: '05 · Funcionalidades',
      rows: [
        { l: 'Páginas aprox.', v: label(d.paginas) },
        { l: 'Idiomas',        v: label(d.idiomas) },
        { l: 'Funcionalidades',v: label(d.funcionalidades) },
      ],
    },
    {
      title: '06 · Diseño y marca',
      rows: [
        { l: '¿Tiene identidad visual?', v: d.tieneIdentidad === 'si' ? 'Sí' : d.tieneIdentidad === 'no' ? 'No' : null },
        { l: '¿Tiene logo vectorial?',   v: d.tieneLogo === 'si' ? 'Sí' : d.tieneLogo === 'no' ? 'No' : null },
        { l: 'Estilo visual',            v: label(d.estiloVisual) },
        { l: 'Referencias',              v: [d.ref1, d.ref2, d.ref3].filter(Boolean).join(' · ') || null },
        { l: '¿Qué no quiere?',          v: d.noQuiere },
        { l: 'Colores de referencia',    v: d.colores },
      ],
    },
    {
      title: '07 · Tiempos y presupuesto',
      rows: [
        { l: 'Inicio deseado',  v: d.fechaInicio },
        { l: 'Fecha límite',    v: d.fechaLimite },
        { l: 'Urgencia',        v: label(d.urgencia) },
        { l: 'Presupuesto',     v: label(d.presupuesto) },
      ],
    },
  ];

  container.innerHTML = sections.map(sec => {
    const validRows = sec.rows.filter(r => r.v);
    if (!validRows.length) return '';
    return `
      <div class="summary-section">
        <div class="summary-section-title">${sec.title}</div>
        ${validRows.map(r => `
          <div class="summary-row">
            <span class="summary-row-label">${r.l}</span>
            <span class="summary-row-value">${r.v}</span>
          </div>`).join('')}
      </div>`;
  }).join('');
}

// ── Reset ────────────────────────────────────────────────────
function resetForm() {
  if (!confirm('¿Reiniciar el formulario? Se perderán todos los datos ingresados.')) return;
  clearState();
  location.reload();
}

// ── Submit ───────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  state.data.comoDerived = document.querySelector('[data-field="comoLlegaste"]')?.value || '';
  state.data.infoAdicional = document.querySelector('[data-field="infoAdicional"]')?.value || '';
  saveState();

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  try {
    if (SUBMIT_URL) {
      const payload = {
        _subject:        `Brief Sitio Web - ${state.data.empresa || state.data.nombre || 'Cliente'}`,
        ...state.data,
        fases:           label(state.data.fases),
        funcionalidades: label(state.data.funcionalidades),
        idiomas:         label(state.data.idiomas),
      };
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } else {
      downloadJSON();
    }
    showSuccess();
    clearState();
  } catch (err) {
    console.error('Brief submit error:', err);
    btn.disabled = false;
    btn.textContent = 'Enviar Brief';
    alert('Ocurrió un error al enviar. Por favor inténtalo de nuevo.');
  }
}

function downloadJSON() {
  const payload = JSON.stringify(state.data, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `brief-web-${(state.data.empresa || 'cliente').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showSuccess() {
  document.getElementById('form-wrapper').classList.add('hidden');
  document.getElementById('success-screen').classList.add('is-visible');
  document.getElementById('bottom-nav').classList.add('hidden');
}
