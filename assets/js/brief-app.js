// ============================================================
//  GENIORAMA — Brief Aplicación Móvil
//  brief-app.js  |  ES6+
// ============================================================

const STORAGE_KEY = 'geniorama_brief_app_v1';
const TOTAL_STEPS  = 8;

// Configura aquí el endpoint de envío.
// Ejemplo con FormSubmit.co: 'https://formsubmit.co/ajax/hola@geniorama.co'
// Si lo dejas vacío, el formulario se descarga como JSON.
const SUBMIT_URL = 'https://n8n.srv1196066.hstgr.cloud/webhook/8fd6c120-aa05-46c7-8710-7dd67d713d5b';

// ── Mapas de etiquetas para el resumen ──────────────────────
const LABELS = {
  // Objetivo
  vender:        'Vender productos o servicios',
  servicio:      'Ofrecer un servicio (on-demand)',
  comunidad:     'Construir una comunidad / red social',
  gestion:       'Gestión interna o productividad',
  contenido:     'Distribuir contenido',
  fidelizacion:  'Fidelización de clientes',
  utilidad:      'Utilidad o herramienta puntual',
  marketplace:   'Marketplace',
  objetivo_otro: 'Otro',
  // Plataforma
  nativa_ios:     'Nativa iOS',
  nativa_android: 'Nativa Android',
  hibrida:        'Híbrida (iOS + Android)',
  pwa:            'Web App / PWA',
  tablet:         'Optimizada para tablet',
  wearable:       'Wearable / Smartwatch',
  desktop:        'Escritorio (Windows/Mac)',
  tipo_otro:      'No estoy seguro',
  // Fases
  estrategia:    'Estrategia y definición de producto',
  ux_research:   'UX Research',
  disenio_ux:    'Diseño UX/UI',
  prototipo:     'Prototipo navegable',
  desarrollo:    'Desarrollo de la app (frontend)',
  backend:       'Backend y API',
  panel_admin:   'Panel de administración web',
  qa:            'QA y testing',
  publicacion:   'Publicación en tiendas',
  mantenimiento: 'Mantenimiento post-lanzamiento',
  capacitacion:  'Capacitación del equipo',
  // Funcionalidades
  f_registro:      'Registro y login',
  f_perfil:        'Perfil de usuario',
  f_push:          'Notificaciones push',
  f_pagos:         'Pagos in-app',
  f_suscripcion:   'Suscripciones / membresías',
  f_geo:           'Geolocalización y mapas',
  f_chat:          'Chat en tiempo real',
  f_camara:        'Cámara y subida de archivos',
  f_offline:       'Modo offline',
  f_redes:         'Integración con redes sociales',
  f_biometria:     'Biometría (Face/Touch ID)',
  f_analitica:     'Analítica y tracking',
  f_i18n:          'Múltiples idiomas (i18n)',
  f_ia:            'Inteligencia artificial',
  f_gamificacion:  'Gamificación',
  f_integraciones: 'Integraciones con sistemas externos',
  // Idiomas
  lang_es:       'Español',
  lang_en:       'Inglés',
  lang_pt:       'Portugués',
  lang_fr:       'Francés',
  lang_de:       'Alemán',
  lang_otro:     'Otro',
  // Pantallas
  '1-5':   '1 – 5 pantallas',
  '6-15':  '6 – 15 pantallas',
  '16-30': '16 – 30 pantallas',
  '31-60': '31 – 60 pantallas',
  'mas60': '+60 pantallas',
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
  '5000-12000':   '$5,000 – $12,000 USD',
  '12000-25000':  '$12,000 – $25,000 USD',
  '25000-50000':  '$25,000 – $50,000 USD',
  '50000-100000': '$50,000 – $100,000 USD',
  'mas-100000':   'Más de $100,000 USD',
  'a-discutir':   'Prefiero discutirlo en reunión',
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
  3: ['tipoApp'],
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
  const el = document.querySelector(`[data-step="${step}"] [data-field="${field}"]`);
  if (el) {
    el.classList.add('is-error');
    appendErrorMsg(el.parentElement, 'Este campo es requerido');
    return;
  }
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
  void el.offsetWidth;
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
        document.dispatchEvent(new CustomEvent('field:change', { detail: { field, value: state.data[field] } }));
        saveState();
      });
    });
  });
}

// ── Conditional fields ───────────────────────────────────────
function bindConditionals() {
  document.addEventListener('field:change', ({ detail }) => {
    if (detail.field === 'tieneApp') {
      toggleConditional('url-actual-group', detail.value === 'si' || detail.value === 'prototipo');
    }
    if (detail.field === 'tieneIdentidad') {
      toggleConditional('logo-group', detail.value === 'si');
    }
  });
  restoreConditionals();
}

function toggleConditional(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', !show);
}

function restoreConditionals() {
  setTimeout(() => {
    toggleConditional('url-actual-group', state.data.tieneApp === 'si' || state.data.tieneApp === 'prototipo');
    toggleConditional('logo-group', state.data.tieneIdentidad === 'si');
  }, 0);
}

// ── Restore form values from state ──────────────────────────
function restoreFormValues() {
  Object.entries(state.data).forEach(([field, value]) => {
    const el = document.querySelector(`[data-field="${field}"]`);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
      el.value = value;
    }
  });

  document.querySelectorAll('[data-group]:not([data-multi])').forEach(group => {
    const val = state.data[group.dataset.group];
    if (val) {
      group.querySelectorAll('.select-card, .budget-card').forEach(c => {
        c.classList.toggle('is-selected', c.dataset.value === val);
      });
    }
  });

  document.querySelectorAll('[data-group][data-multi="true"]').forEach(group => {
    const vals = state.data[group.dataset.group] || [];
    group.querySelectorAll('.select-card').forEach(c => {
      c.classList.toggle('is-selected', vals.includes(c.dataset.value));
    });
  });

  document.querySelectorAll('.check-items[data-group]').forEach(group => {
    const vals = state.data[group.dataset.group] || [];
    group.querySelectorAll('.check-item').forEach(item => {
      item.classList.toggle('is-selected', vals.includes(item.dataset.value));
    });
  });

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

  const tieneAppLabel = d.tieneApp === 'si' ? 'Sí, tiene versión previa'
                      : d.tieneApp === 'no' ? 'No'
                      : d.tieneApp === 'prototipo' ? 'Solo un prototipo'
                      : null;

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
      title: '02 · La app',
      rows: [
        { l: 'Nombre de la app',    v: d.proyectoNombre },
        { l: '¿Tiene versión previa?', v: tieneAppLabel },
        { l: 'Enlace actual',       v: (d.tieneApp === 'si' || d.tieneApp === 'prototipo') ? d.urlActual : null },
        { l: 'Descripción',         v: d.descripcion },
        { l: 'Audiencia',           v: d.audiencia },
        { l: 'Objetivo principal',  v: label(d.objetivo) },
      ],
    },
    {
      title: '03 · Plataforma',
      rows: [{ l: 'Plataforma seleccionada', v: label(d.tipoApp) }],
    },
    {
      title: '04 · Fases',
      rows: [{ l: 'Fases requeridas', v: label(d.fases) }],
    },
    {
      title: '05 · Funcionalidades',
      rows: [
        { l: 'Pantallas aprox.', v: label(d.pantallas) },
        { l: 'Idiomas',          v: label(d.idiomas) },
        { l: 'Funcionalidades',  v: label(d.funcionalidades) },
      ],
    },
    {
      title: '06 · Diseño y marca',
      rows: [
        { l: '¿Tiene identidad visual?', v: d.tieneIdentidad === 'si' ? 'Sí' : d.tieneIdentidad === 'no' ? 'No' : d.tieneIdentidad === 'parcial' ? 'Parcial' : null },
        { l: '¿Tiene logo vectorial?',   v: d.tieneLogo === 'si' ? 'Sí' : d.tieneLogo === 'no' ? 'No' : d.tieneLogo === 'crear' ? 'Necesita diseño' : null },
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
      const { tieneApp, tipoApp, pantallas, ...rest } = state.data;
      const payload = {
        _subject:        `Brief App Móvil - ${state.data.empresa || state.data.nombre || 'Cliente'}`,
        _formType:       'brief-app',
        ...rest,
        tienePrevio:     tieneApp,
        tipoProyecto:    tipoApp,
        estructura:      label(pantallas),
        fases:           label(state.data.fases),
        funcionalidades: label(state.data.funcionalidades),
        idiomas:         label(state.data.idiomas),
      };
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
  a.download = `brief-app-${(state.data.empresa || 'cliente').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
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
