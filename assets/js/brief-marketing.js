// ============================================================
//  GENIORAMA — Brief Estratégico de Marketing
//  brief-marketing.js  |  ES6+
// ============================================================

const STORAGE_KEY = 'geniorama_brief_mkt_v1';
const TOTAL_STEPS  = 8;

// Configura el webhook de envío
const SUBMIT_URL = 'https://hook.us1.make.com/mwkymp2moacwe79h20sk65n2hsdci781';

// ── Etiquetas legibles para el payload ──────────────────────
const CHANNEL_LABELS = {
  web:      'Página web',
  ig:       'Instagram',
  fb:       'Facebook',
  tiktok:   'TikTok',
  yt:       'YouTube',
  linkedin: 'LinkedIn',
  gm:       'Google Maps / Perfil de Negocio',
  wa:       'WhatsApp Business',
};

const MATERIAL_LABELS = {
  logo:        'Logo en buena calidad',
  manual:      'Manual o guía de marca',
  fotos_prod:  'Fotos de producto/servicio',
  fotos_equipo:'Fotos del equipo',
  videos:      'Videos previos',
  testimonios: 'Testimonios de clientes',
  casos:       'Antes/después o casos de éxito',
  nada:        'No tengo nada aún',
};

function labelList(arr, map) {
  if (!arr || !arr.length) return '—';
  return arr.map(v => map[v] || v).join(', ');
}

// ── Required fields per step ────────────────────────────────
const REQUIRED = {
  1: ['nombre', 'empresa', 'email'],
  2: ['negocio', 'productos', 'modelo'],
  3: ['clienteIdeal', 'dolor', 'objeciones'],
  4: ['competencia', 'razonElegir'],
  5: ['diferencial', 'fortaleza', 'debilidad'],
  6: [],
  7: ['objetivo', 'presupuesto'],
  8: ['decisor'],
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
  bindCheckItems();
  bindTogglePills();
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
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
    const value = state.data[field];
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
        saveState();
      });
    });
  });
}

// ── Restore form values from state ──────────────────────────
function restoreFormValues() {
  Object.entries(state.data).forEach(([field, value]) => {
    const el = document.querySelector(`[data-field="${field}"]`);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
      el.value = value;
    }
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
    const field   = group.dataset.group;
    const isMulti = group.dataset.multi === 'true';
    const val     = state.data[field];
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

// ── Sanitización para Google Sheets ─────────────────────────
// Prefija con ' los valores que Sheets interpreta como fórmula
// (cadenas que empiezan con +, =, - o @)
function ss(val) {
  if (typeof val === 'string' && /^[+=\-@]/.test(val)) return "'" + val;
  return val ?? '';
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
  if (!validateStep(state.step)) return;
  saveState();

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  try {
    if (SUBMIT_URL) {
      const d = state.data;
      const payload = {
        _subject:         `Brief Marketing — ${d.empresa || d.nombre || 'Cliente'}`,
        nombre:           d.nombre,
        empresa:          d.empresa,
        email:            d.email,
        telefono:         ss(d.telefono),
        pais:             d.pais,
        ciudad:           d.ciudad,
        negocio:          d.negocio,
        productos:        d.productos,
        modelo:           d.modelo,
        ubicacion:        d.ubicacion,
        clienteIdeal:     d.clienteIdeal,
        dolor:            d.dolor,
        objeciones:       d.objeciones,
        antiCliente:      d.antiCliente,
        competencia:      d.competencia,
        razonElegir:      d.razonElegir,
        preciosComp:      d.preciosComp,
        diferencial:      d.diferencial,
        fortaleza:        d.fortaleza,
        debilidad:        d.debilidad,
        personalidad:     d.personalidad,
        canales:          labelList(d.canales, CHANNEL_LABELS),
        urlWeb:           d.urlWeb,
        urlIg:            d.urlIg,
        urlFb:            d.urlFb,
        urlOtro:          d.urlOtro,
        pautaPrevia:      d.pautaPrevia,
        ratingDigital:    d.ratingDigital,
        frustracion:      d.frustracion,
        objetivo:         d.objetivo,
        plazo:            d.plazo,
        presupuesto:      d.presupuesto,
        experienciaPrevia:d.experienciaPrevia,
        referencias:      d.referencias,
        antireferencias:  d.antireferencias,
        materiales:       labelList(d.materiales, MATERIAL_LABELS),
        decisor:          d.decisor,
        adicional:        d.adicional,
      };

      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }

    showSuccess();
    clearState();
  } catch (err) {
    console.error('Brief marketing submit error:', err);
    btn.disabled = false;
    btn.textContent = 'Enviar Brief →';
    alert('Ocurrió un error al enviar. Por favor inténtalo de nuevo.');
  }
}

function showSuccess() {
  document.getElementById('form-wrapper').classList.add('hidden');
  document.getElementById('success-screen').classList.add('is-visible');
  document.getElementById('bottom-nav').classList.add('hidden');
}
