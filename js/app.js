import { EXERCISES, EXERCISE_LIST } from './data/exercises.js';
import { PHASES, FOCUSES, buildDailyRoutine } from './data/routines.js';
import { SoundEngine } from './engine/audio.js';
import { KinematicEngine } from './engine/animator.js';
import {
  getLocalDateKey,
  isStorageAvailable,
  loadProfile,
  saveProfile,
  loadSessions,
  saveSession
} from './engine/storage.js';

// =========================================================================
// 1. ESTADO DE LA APLICACIÓN
// =========================================================================
const state = {
  activeTab: 'today',
  currentPhase: 1,
  selectedFocus: 'A',
  focusManuallyChosen: false,
  soundEnabled: true,
  darkMode: false,
  sessions: [],
  selectedLibraryCat: 'all',
  selectedLibraryExId: 'cat_cow',
  librarySpeed: 1,
  previewExId: null,
  previewSpeed: 1,
  playerSpeed: 1,
  calendarViewDate: new Date(),
  selectedFeeling: 'justo',
  storageReady: false
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  const bg = type === 'error'
    ? 'bg-rose-600 text-white'
    : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900';
  el.className = `pointer-events-auto px-4 py-3 rounded-2xl shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-300 translate-y-2 opacity-0 ${bg}`;
  el.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span><span>${message}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('translate-y-2', 'opacity-0');
  });
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// =========================================================================
// 2. PERSISTENCIA LOCAL (localStorage)
// =========================================================================
function initStorage() {
  const statusText = document.getElementById('sync-status-text');
  state.storageReady = isStorageAvailable();

  if (!state.storageReady) {
    statusText.textContent = 'Modo sesión';
    return;
  }

  statusText.textContent = 'Guardado local';

  const savedProfile = loadProfile();
  if (savedProfile) {
    if (savedProfile.currentPhase >= 1 && savedProfile.currentPhase <= 4) {
      state.currentPhase = savedProfile.currentPhase;
    }
    if (typeof savedProfile.soundEnabled === 'boolean') {
      state.soundEnabled = savedProfile.soundEnabled;
      SoundEngine.setEnabled(state.soundEnabled);
    }
    if (typeof savedProfile.darkMode === 'boolean') {
      state.darkMode = savedProfile.darkMode;
    }
  }

  state.sessions = loadSessions();
}

function persistProfile() {
  if (!state.storageReady) return;
  saveProfile({
    currentPhase: state.currentPhase,
    soundEnabled: state.soundEnabled,
    darkMode: state.darkMode
  });
}

function saveCompletedSession(feeling) {
  const todayKey = getLocalDateKey();
  const record = {
    dateKey: todayKey,
    phase: state.currentPhase,
    focus: state.selectedFocus,
    feeling: feeling || 'justo',
    minutes: 15,
    timestamp: Date.now()
  };

  if (state.storageReady) {
    const { sessions, persisted } = saveSession(record);
    state.sessions = sessions;
    renderAll();
    if (!persisted) {
      showToast('Guardado solo en esta sesión (almacenamiento lleno o bloqueado)', 'error');
      return;
    }
  } else {
    const existingIdx = state.sessions.findIndex(s => s.dateKey === todayKey);
    if (existingIdx >= 0) {
      state.sessions[existingIdx] = record;
    } else {
      state.sessions.unshift(record);
    }
    renderAll();
  }

  showToast('¡Rutina de hoy registrada! Excelente constancia.');
}

// =========================================================================
// 3. CÁLCULOS DE PROGRESO, RACHA Y RECOMENDACIÓN INTELIGENTE
// =========================================================================
function getAutoFocusForToday() {
  const focusOrder = ['A', 'B', 'C', 'D'];
  const todayKey = getLocalDateKey();
  const todaySession = state.sessions.find(s => s.dateKey === todayKey);
  if (todaySession && todaySession.focus) return todaySession.focus;
  return focusOrder[state.sessions.length % 4];
}

function computeStats() {
  const uniqueDates = new Set(state.sessions.map(s => s.dateKey));
  const totalSessions = state.sessions.length;
  const totalMinutes = state.sessions.reduce((acc, s) => acc + (s.minutes || 15), 0);
  const todayKey = getLocalDateKey();
  const completedToday = uniqueDates.has(todayKey);

  let streak = 0;
  const cursor = new Date();
  if (!completedToday) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (uniqueDates.has(getLocalDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const phaseSessions = state.sessions.filter(s => s.phase === state.currentPhase);
  const phaseCount = phaseSessions.length;

  const lastThree = phaseSessions.slice(0, 3);
  const allVeryEasy = lastThree.length === 3 && lastThree.every(s => s.feeling === 'suave');
  const shouldRecommendNext = state.currentPhase < 4 && (phaseCount >= 6 || (phaseCount >= 4 && allVeryEasy));

  return {
    totalSessions,
    totalMinutes,
    completedToday,
    streak,
    phaseCount,
    shouldRecommendNext,
    allVeryEasy
  };
}

// =========================================================================
// 4. RENDERIZADO DE LA INTERFAZ
// =========================================================================
function applyTheme() {
  document.documentElement.classList.toggle('dark', state.darkMode);
  document.getElementById('icon-theme-moon').classList.toggle('hidden', state.darkMode);
  document.getElementById('icon-theme-sun').classList.toggle('hidden', !state.darkMode);
}

function updateSoundButtons() {
  const on = state.soundEnabled;
  document.getElementById('icon-sound-on').classList.toggle('hidden', !on);
  document.getElementById('icon-sound-off').classList.toggle('hidden', on);
  document.querySelectorAll('.player-sound-on').forEach(el => el.classList.toggle('hidden', !on));
  document.querySelectorAll('.player-sound-off').forEach(el => el.classList.toggle('hidden', on));
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const active = btn.dataset.tab === tabName;
    btn.className = active
      ? 'nav-tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slatewarm-800 text-sage-700 dark:text-sage-300 shadow-sm transition-all'
      : 'nav-tab-btn px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all';
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    const active = btn.dataset.tab === tabName;
    btn.className = active
      ? 'mobile-nav-btn flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-bold text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-500/15 transition-colors'
      : 'mobile-nav-btn flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-semibold text-stone-500 dark:text-stone-400 transition-colors';
  });

  if (tabName === 'library') {
    renderLibrary();
  } else if (tabName === 'progress') {
    renderProgress();
  }
}

function renderTodayTab() {
  const stats = computeStats();
  const phaseObj = PHASES.find(p => p.id === state.currentPhase) || PHASES[0];
  const focusObj = FOCUSES.find(f => f.id === state.selectedFocus) || FOCUSES[0];

  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());
  document.getElementById('today-date-label').textContent = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  document.getElementById('header-streak-count').textContent = `${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`;

  document.getElementById('today-completed-pill').classList.toggle('hidden', !stats.completedToday);
  document.getElementById('btn-manual-complete-text').textContent = stats.completedToday
    ? 'Actualizar sensación de hoy'
    : 'Marcar rutina de hoy hecha';

  document.getElementById('hero-greeting').textContent = `${focusObj.label}: ${focusObj.title}`;
  document.getElementById('hero-focus-subtitle').textContent = `${focusObj.desc} Nivel actual: ${phaseObj.title} (${phaseObj.subtitle}).`;

  document.getElementById('phase-progress-mini').textContent = state.currentPhase < 4
    ? `${Math.min(stats.phaseCount, 6)} / 6 sesiones para siguiente fase`
    : `${stats.phaseCount} sesiones en Fase 4`;

  const recBanner = document.getElementById('phase-recommendation-banner');
  if (stats.shouldRecommendNext) {
    recBanner.classList.remove('hidden');
    document.getElementById('phase-rec-next-num').textContent = state.currentPhase + 1;
    document.getElementById('phase-rec-desc').textContent = stats.phaseCount >= 6
      ? `¡Completaste ${stats.phaseCount} sesiones en ${phaseObj.title}! Tu cuerpo ya tiene base para avanzar a la Fase ${state.currentPhase + 1}.`
      : `Tus últimas sesiones se sintieron muy suaves. Si te sientes con confianza, ya puedes probar la Fase ${state.currentPhase + 1}.`;
  } else {
    recBanner.classList.add('hidden');
  }

  const phaseGrid = document.getElementById('phase-selector-grid');
  phaseGrid.innerHTML = PHASES.map(p => {
    const active = p.id === state.currentPhase;
    return `
      <button type="button" data-phase="${p.id}" class="phase-btn text-left p-3 rounded-2xl border transition-all ${
        active
          ? 'bg-white dark:bg-slatewarm-900 border-sage-500 ring-2 ring-sage-500/20 shadow-sm'
          : 'bg-white/60 dark:bg-slatewarm-900/50 border-cream-200 dark:border-stone-800 hover:border-sage-300 dark:hover:border-stone-700'
      }">
        <div class="flex items-center justify-between gap-1">
          <span class="text-xs font-extrabold ${active ? 'text-sage-700 dark:text-sage-400' : 'text-stone-700 dark:text-stone-300'}">${p.name}</span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${active ? 'bg-sage-100 dark:bg-sage-500/20 text-sage-700 dark:text-sage-300' : 'bg-cream-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}">${p.subtitle}</span>
        </div>
        <p class="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1 line-clamp-1">${p.title}</p>
      </button>
    `;
  }).join('');

  phaseGrid.querySelectorAll('.phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextPhase = Number(btn.dataset.phase);
      if (nextPhase !== state.currentPhase) {
        state.currentPhase = nextPhase;
        persistProfile();
        renderAll();
        showToast(`Nivel cambiado a Fase ${nextPhase}: ${PHASES[nextPhase - 1].title}`);
      }
    });
  });

  const focusRow = document.getElementById('focus-selector-row');
  focusRow.innerHTML = FOCUSES.map(f => {
    const active = f.id === state.selectedFocus;
    return `
      <button type="button" data-focus="${f.id}" class="focus-btn text-left px-3 py-2.5 rounded-2xl border transition-all ${
        active
          ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
          : 'bg-white/70 dark:bg-slatewarm-900/60 text-stone-700 dark:text-stone-300 border-cream-200 dark:border-stone-800 hover:border-sage-300'
      }">
        <span class="block text-[10px] font-bold uppercase tracking-wider ${active ? 'text-sage-100' : 'text-stone-400'}">${f.label}</span>
        <span class="block text-xs font-bold mt-0.5 truncate">${f.short}</span>
      </button>
    `;
  }).join('');

  focusRow.querySelectorAll('.focus-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedFocus = btn.dataset.focus;
      state.focusManuallyChosen = true;
      renderTodayTab();
    });
  });

  const routine = buildDailyRoutine(state.currentPhase, state.selectedFocus);
  const container = document.getElementById('routine-blocks-container');
  let globalIdx = 0;

  container.innerHTML = routine.blocks.map(block => `
    <div class="rounded-3xl bg-white dark:bg-slatewarm-900 border border-cream-200 dark:border-stone-800 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-cream-50/80 dark:bg-slatewarm-800/40 border-b border-cream-200 dark:border-stone-800 flex items-center justify-between">
        <h4 class="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white">${block.title}</h4>
        <span class="px-2.5 py-1 rounded-xl text-xs font-bold ${block.badgeClass}">${block.durationMin} min</span>
      </div>
      <div class="divide-y divide-cream-100 dark:divide-stone-800/80">
        ${block.items.map(item => {
          globalIdx++;
          return `
            <button type="button" data-preview-ex="${item.exercise.id}" class="w-full text-left px-4 sm:px-5 py-3.5 hover:bg-cream-50 dark:hover:bg-slatewarm-800/40 transition-colors flex items-center justify-between gap-3 group">
              <div class="flex items-center gap-3.5 min-w-0">
                <span class="w-8 h-8 rounded-xl bg-cream-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-display font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-sage-100 group-hover:text-sage-700 dark:group-hover:bg-sage-500/20 dark:group-hover:text-sage-300 transition-colors">
                  ${globalIdx}
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-sm text-stone-900 dark:text-white truncate">${item.exercise.name}</p>
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span class="text-xs font-medium text-terra-600 dark:text-terra-400">${item.exercise.muscleLabel}</span>
                    <span class="text-stone-300 dark:text-stone-700">•</span>
                    <span class="text-xs text-stone-500 dark:text-stone-400">${item.workSec}s activo${item.restSec ? ` + ${item.restSec}s pausa` : ''}</span>
                  </div>
                </div>
              </div>
              <span class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cream-100 dark:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-300 group-hover:bg-sage-600 group-hover:text-white transition-colors">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span class="hidden sm:inline">Ver guía</span>
              </span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-preview-ex]').forEach(btn => {
    btn.addEventListener('click', () => openPreviewModal(btn.dataset.previewEx));
  });
}

function renderLibrary() {
  document.querySelectorAll('.lib-cat-btn').forEach(btn => {
    const active = btn.dataset.cat === state.selectedLibraryCat;
    btn.className = active
      ? 'lib-cat-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-sage-600 text-white shadow-sm transition-all'
      : 'lib-cat-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slatewarm-900 text-stone-600 dark:text-stone-300 border border-cream-200 dark:border-stone-800 hover:border-sage-400 transition-all';
  });

  const filtered = state.selectedLibraryCat === 'all'
    ? EXERCISE_LIST
    : EXERCISE_LIST.filter(ex => ex.category === state.selectedLibraryCat);

  if (!filtered.some(ex => ex.id === state.selectedLibraryExId) && filtered.length > 0) {
    state.selectedLibraryExId = filtered[0].id;
  }

  const listEl = document.getElementById('library-exercise-list');
  listEl.innerHTML = filtered.map(ex => {
    const active = ex.id === state.selectedLibraryExId;
    return `
      <button type="button" data-lib-ex="${ex.id}" class="w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        active
          ? 'bg-white dark:bg-slatewarm-900 border-sage-500 ring-2 ring-sage-500/20 shadow-sm'
          : 'bg-white/70 dark:bg-slatewarm-900/50 border-cream-200 dark:border-stone-800 hover:bg-white dark:hover:bg-slatewarm-900'
      }">
        <div class="min-w-0">
          <p class="font-bold text-sm text-stone-900 dark:text-white truncate">${ex.name}</p>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">${ex.muscleLabel} · Fase ${ex.minPhase}+</p>
        </div>
        <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
          active ? 'bg-sage-600 text-white' : 'bg-cream-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
        }">${ex.category}</span>
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('[data-lib-ex]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedLibraryExId = btn.dataset.libEx;
      renderLibrary();
    });
  });

  const ex = EXERCISES[state.selectedLibraryExId] || EXERCISE_LIST[0];
  document.getElementById('lib-muscle-badge').textContent = ex.muscleLabel;
  document.getElementById('lib-phase-badge').textContent = `Desde Fase ${ex.minPhase}`;
  document.getElementById('lib-ex-name').textContent = ex.name;
  document.getElementById('lib-ex-goal').textContent = ex.goal;
  document.getElementById('lib-ex-tips').innerHTML = ex.tips.map(t => `
    <li class="flex items-start gap-2">
      <span class="w-5 h-5 rounded-full bg-sage-100 dark:bg-sage-500/20 text-sage-700 dark:text-sage-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
      <span>${t}</span>
    </li>
  `).join('');
  document.getElementById('lib-ex-mistake').textContent = ex.mistake;
  document.getElementById('lib-ex-easier').textContent = ex.easier;

  updateSpeedButtons('.lib-speed-btn', state.librarySpeed);
}

function renderProgress() {
  const stats = computeStats();
  document.getElementById('stat-streak').textContent = stats.streak;
  document.getElementById('stat-total-sessions').textContent = stats.totalSessions;
  document.getElementById('stat-total-minutes').textContent = stats.totalMinutes;
  document.getElementById('stat-phase-num').textContent = state.currentPhase;
  document.getElementById('stat-phase-sessions').textContent = Math.min(stats.phaseCount, 6);
  const pct = Math.min(100, Math.round((stats.phaseCount / 6) * 100));
  document.getElementById('stat-phase-bar').style.width = `${pct}%`;

  const tipEl = document.getElementById('progress-smart-tip');
  const recent = state.sessions.slice(0, 3);
  if (recent.length > 0 && recent.every(s => s.feeling === 'retadora')) {
    tipEl.textContent = 'Tus últimas sesiones han sido retadoras. ¡Muy bien hecho por escuchar tu cuerpo! Mantente en esta fase unos días más y usa la "Opción más suave" cuando haga falta.';
  } else if (stats.shouldRecommendNext) {
    tipEl.textContent = `Ya tienes una base excelente en la Fase ${state.currentPhase}. Cuando te apetezca, sube a la Fase ${state.currentPhase + 1} desde la pestaña "Rutina de Hoy".`;
  } else if (stats.streak >= 3) {
    tipEl.textContent = `¡Llevas ${stats.streak} días seguidos! Estás construyendo el hábito matutino más valioso para tu movilidad y energía a largo plazo.`;
  } else {
    tipEl.textContent = 'Las primeras semanas buscan despertar tus articulaciones y crear el hábito sin fatiga excesiva. 15 minutos cada mañana transforman cómo se siente tu cuerpo el resto del día.';
  }

  renderCalendar();
  renderRecentSessions();
}

function renderCalendar() {
  const viewDate = state.calendarViewDate;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthTitle = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(viewDate);
  document.getElementById('calendar-month-title').textContent = monthTitle;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const todayKey = getLocalDateKey();

  const sessionByDate = new Map();
  state.sessions.forEach(s => sessionByDate.set(s.dateKey, s));

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push('<div class="aspect-square"></div>');
  }

  const feelingDot = {
    suave: 'bg-sky-400',
    justo: 'bg-emerald-300',
    retadora: 'bg-terra-400'
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const session = sessionByDate.get(key);
    const isToday = key === todayKey;

    if (session) {
      const dotClass = feelingDot[session.feeling] || 'bg-emerald-300';
      cells.push(`
        <div class="aspect-square rounded-2xl bg-sage-600 text-white flex flex-col items-center justify-center relative shadow-sm ${isToday ? 'ring-2 ring-terra-400 ring-offset-2 dark:ring-offset-slatewarm-900' : ''}" title="Completado · Fase ${session.phase} · Día ${session.focus}">
          <span class="text-xs sm:text-sm font-bold leading-none">${day}</span>
          <span class="w-1.5 h-1.5 rounded-full ${dotClass} mt-1"></span>
        </div>
      `);
    } else {
      cells.push(`
        <div class="aspect-square rounded-2xl flex items-center justify-center text-xs sm:text-sm font-medium ${
          isToday
            ? 'bg-cream-200 dark:bg-stone-800 text-stone-900 dark:text-white font-bold ring-2 ring-sage-500/60'
            : 'bg-cream-50 dark:bg-slatewarm-800/40 text-stone-600 dark:text-stone-400'
        }">
          ${day}
        </div>
      `);
    }
  }

  document.getElementById('calendar-grid').innerHTML = cells.join('');
}

function renderRecentSessions() {
  const el = document.getElementById('recent-sessions-list');
  if (state.sessions.length === 0) {
    el.innerHTML = `
      <div class="text-center py-6 px-3 rounded-2xl bg-cream-50 dark:bg-slatewarm-800/40 border border-dashed border-cream-300 dark:border-stone-700">
        <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">Aún no hay sesiones registradas</p>
        <p class="text-xs text-stone-400 mt-1">Completa tus primeros 15 minutos hoy y verás tu historial aquí.</p>
      </div>
    `;
    return;
  }

  const feelingMeta = {
    suave: { label: 'Muy suave', badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300' },
    justo: { label: 'En su punto', badge: 'bg-sage-100 text-sage-800 dark:bg-sage-500/20 dark:text-sage-300' },
    retadora: { label: 'Retadora', badge: 'bg-terra-100 text-terra-800 dark:bg-terra-500/20 dark:text-terra-300' }
  };

  el.innerHTML = state.sessions.slice(0, 12).map(s => {
    const meta = feelingMeta[s.feeling] || feelingMeta.justo;
    const focusObj = FOCUSES.find(f => f.id === s.focus) || FOCUSES[0];
    const parts = s.dateKey.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const label = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(dateObj);
    return `
      <div class="p-3 rounded-2xl bg-cream-50 dark:bg-slatewarm-800/50 border border-cream-200/70 dark:border-stone-800 flex items-center justify-between gap-2">
        <div>
          <p class="text-xs font-bold text-stone-900 dark:text-white capitalize">${label} · Fase ${s.phase} (${focusObj.label})</p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400">${focusObj.short} · ${s.minutes || 15} min</p>
        </div>
        <span class="px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 ${meta.badge}">${meta.label}</span>
      </div>
    `;
  }).join('');
}

function updateSpeedButtons(selector, currentSpeed) {
  document.querySelectorAll(selector).forEach(btn => {
    const active = Number(btn.dataset.speed) === currentSpeed;
    btn.className = active
      ? `${selector.replace('.', '')} px-2.5 py-1 rounded-lg text-xs font-bold bg-sage-600 text-white transition-colors`
      : `${selector.replace('.', '')} px-2.5 py-1 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-cream-100 dark:hover:bg-stone-800 transition-colors`;
  });
}

function renderAll() {
  applyTheme();
  updateSoundButtons();
  renderTodayTab();
  if (state.activeTab === 'library') renderLibrary();
  if (state.activeTab === 'progress') renderProgress();
}

// =========================================================================
// 5. MODAL DE VISTA PREVIA RÁPIDA DE UN EJERCICIO
// =========================================================================
function openPreviewModal(exId) {
  const ex = EXERCISES[exId];
  if (!ex) return;
  state.previewExId = exId;

  document.getElementById('preview-muscle-badge').textContent = ex.muscleLabel;
  document.getElementById('preview-ex-name').textContent = ex.name;
  document.getElementById('preview-ex-goal').textContent = ex.goal;
  document.getElementById('preview-ex-tips').innerHTML = ex.tips.map(t => `
    <li class="flex items-start gap-2">
      <span class="w-5 h-5 rounded-full bg-sage-100 dark:bg-sage-500/20 text-sage-700 dark:text-sage-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
      <span>${t}</span>
    </li>
  `).join('');
  document.getElementById('preview-ex-mistake').textContent = ex.mistake;
  document.getElementById('preview-ex-easier').textContent = ex.easier;
  updateSpeedButtons('.preview-speed-btn', state.previewSpeed);

  document.getElementById('preview-modal').classList.remove('hidden');
}

function closePreviewModal() {
  state.previewExId = null;
  document.getElementById('preview-modal').classList.add('hidden');
}

// =========================================================================
// 6. REPRODUCTOR GUIADO DE SESIÓN (15:00 EXACTOS)
// =========================================================================
const Player = {
  isOpen: false,
  isRunning: false,
  steps: [],
  stepIndex: 0,
  stepRemaining: 0,
  totalSeconds: 900,
  intervalId: null,

  open() {
    const routine = buildDailyRoutine(state.currentPhase, state.selectedFocus);
    this.steps = routine.flatSteps;
    this.totalSeconds = routine.totalSeconds;
    this.stepIndex = 0;
    this.stepRemaining = this.steps[0].duration;
    this.isRunning = false;
    this.isOpen = true;
    this.stopInterval();

    document.getElementById('player-easier-box').classList.add('hidden');
    document.getElementById('player-easier-chevron').classList.remove('rotate-180');

    document.getElementById('player-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    updateSpeedButtons('.player-speed-btn', state.playerSpeed);
    this.syncUI();
  },

  close() {
    this.stopInterval();
    this.isRunning = false;
    this.isOpen = false;
    document.getElementById('player-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  },

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  togglePlay() {
    if (this.isRunning) {
      this.isRunning = false;
      this.stopInterval();
    } else {
      this.isRunning = true;
      SoundEngine.playStart();
      this.intervalId = setInterval(() => this.tick(), 1000);
    }
    this.syncPlayButton();
  },

  tick() {
    if (!this.isRunning) return;
    this.stepRemaining--;

    if (this.stepRemaining > 0 && this.stepRemaining <= 3) {
      SoundEngine.playTick();
    }

    if (this.stepRemaining <= 0) {
      if (this.stepIndex < this.steps.length - 1) {
        this.stepIndex++;
        const nextStep = this.steps[this.stepIndex];
        this.stepRemaining = nextStep.duration;
        if (nextStep.type === 'rest') {
          SoundEngine.playRest();
        } else {
          SoundEngine.playStart();
        }
        this.syncUI();
      } else {
        this.stopInterval();
        this.isRunning = false;
        SoundEngine.playFinish();
        this.close();
        openCompleteModal();
      }
      return;
    }

    this.syncTimers();
  },

  prevStep() {
    const curr = this.steps[this.stepIndex];
    if (curr.duration - this.stepRemaining > 3) {
      this.stepRemaining = curr.duration;
    } else if (this.stepIndex > 0) {
      this.stepIndex--;
      this.stepRemaining = this.steps[this.stepIndex].duration;
    }
    this.syncUI();
  },

  nextStep() {
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
      this.stepRemaining = this.steps[this.stepIndex].duration;
      this.syncUI();
    } else {
      this.stopInterval();
      this.isRunning = false;
      SoundEngine.playFinish();
      this.close();
      openCompleteModal();
    }
  },

  restart() {
    this.stopInterval();
    this.isRunning = false;
    this.stepIndex = 0;
    this.stepRemaining = this.steps[0].duration;
    this.syncUI();
  },

  getCurrentExercise() {
    const step = this.steps[this.stepIndex];
    return step ? step.exercise : null;
  },

  computeTotalRemaining() {
    let sum = this.stepRemaining;
    for (let i = this.stepIndex + 1; i < this.steps.length; i++) {
      sum += this.steps[i].duration;
    }
    return sum;
  },

  formatTime(sec) {
    const s = Math.max(0, sec);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  syncPlayButton() {
    document.getElementById('player-icon-play').classList.toggle('hidden', this.isRunning);
    document.getElementById('player-icon-pause').classList.toggle('hidden', !this.isRunning);
    document.getElementById('player-playpause-label').textContent = this.isRunning ? 'Pausar' : 'Iniciar';
  },

  syncTimers() {
    const step = this.steps[this.stepIndex];
    if (!step) return;
    document.getElementById('player-step-timer').textContent = this.formatTime(this.stepRemaining);

    const stepPct = Math.round((this.stepRemaining / step.duration) * 100);
    document.getElementById('player-step-bar').style.width = `${stepPct}%`;

    const totalRem = this.computeTotalRemaining();
    document.getElementById('player-total-remaining').textContent = this.formatTime(totalRem);
    const globalPct = Math.round(((this.totalSeconds - totalRem) / this.totalSeconds) * 100);
    document.getElementById('player-global-bar').style.width = `${globalPct}%`;
  },

  syncUI() {
    const step = this.steps[this.stepIndex];
    if (!step) return;
    const isRest = step.type === 'rest';
    const ex = step.exercise;

    document.getElementById('player-block-label').textContent = isRest ? (step.nextBlockTitle || step.blockTitle) : step.blockTitle;
    document.getElementById('player-step-counter').textContent = isRest
      ? `Pausa de transición · Sigue ${step.nextExerciseIndex} de ${step.totalExercises}`
      : `Ejercicio ${step.exerciseIndex} de ${step.totalExercises}`;

    const banner = document.getElementById('player-mode-banner');
    const dot = document.getElementById('player-mode-dot');
    const modeText = document.getElementById('player-mode-text');
    const stepBar = document.getElementById('player-step-bar');

    if (isRest) {
      banner.className = 'rounded-2xl px-4 py-2.5 flex items-center justify-between bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200';
      dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse';
      modeText.textContent = 'Pausa 15s · Vista previa del siguiente';
      stepBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
    } else {
      banner.className = 'rounded-2xl px-4 py-2.5 flex items-center justify-between bg-sage-100 dark:bg-sage-500/20 text-sage-800 dark:text-sage-200';
      dot.className = 'w-2.5 h-2.5 rounded-full bg-sage-600 animate-pulse';
      modeText.textContent = 'En movimiento · A tu ritmo';
      stepBar.className = 'h-full bg-terra-500 rounded-full transition-all duration-300';
    }

    document.getElementById('player-next-up-kicker').classList.toggle('hidden', !isRest);
    document.getElementById('player-muscle-label').textContent = ex.muscleLabel;
    document.getElementById('player-ex-name').textContent = ex.name;
    document.getElementById('player-ex-cue').textContent = step.cue || ex.goal;
    document.getElementById('player-ex-tips').innerHTML = ex.tips.map(t => `
      <li class="flex items-start gap-2">
        <span class="w-5 h-5 rounded-full bg-sage-100 dark:bg-sage-500/20 text-sage-700 dark:text-sage-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
        <span>${t}</span>
      </li>
    `).join('');
    document.getElementById('player-ex-mistake').textContent = ex.mistake;
    document.getElementById('player-ex-easier').textContent = ex.easier;

    let nextWork = null;
    for (let i = this.stepIndex + 1; i < this.steps.length; i++) {
      if (this.steps[i].type === 'work') {
        nextWork = this.steps[i];
        break;
      }
    }
    const upcomingCard = document.getElementById('player-upcoming-card');
    if (nextWork && !isRest) {
      upcomingCard.classList.remove('hidden');
      document.getElementById('player-upcoming-name').textContent = nextWork.exercise.name;
      document.getElementById('player-upcoming-duration').textContent = `${nextWork.duration}s`;
    } else if (isRest) {
      upcomingCard.classList.add('hidden');
    } else {
      upcomingCard.classList.remove('hidden');
      document.getElementById('player-upcoming-name').textContent = '¡Final de tus 15 minutos!';
      document.getElementById('player-upcoming-duration').textContent = '🌿';
    }

    this.syncPlayButton();
    this.syncTimers();
  }
};

// =========================================================================
// 7. MODAL DE REGISTRO DE SENSACIÓN AL COMPLETAR
// =========================================================================
function openCompleteModal() {
  state.selectedFeeling = 'justo';
  syncFeelingButtons();
  document.getElementById('complete-modal').classList.remove('hidden');
}

function closeCompleteModal() {
  document.getElementById('complete-modal').classList.add('hidden');
}

function syncFeelingButtons() {
  document.querySelectorAll('.feeling-choice-btn').forEach(btn => {
    const active = btn.dataset.feeling === state.selectedFeeling;
    btn.className = active
      ? 'feeling-choice-btn p-3.5 rounded-2xl border-2 border-sage-500 bg-sage-50 dark:bg-sage-500/15 transition-all flex items-center gap-3 shadow-sm'
      : 'feeling-choice-btn p-3.5 rounded-2xl border-2 border-cream-200 dark:border-stone-700 hover:border-sage-300 bg-cream-50 dark:bg-slatewarm-800/60 transition-all flex items-center gap-3';
  });
}

// =========================================================================
// 8. BUCLE DE ANIMACIÓN GLOBAL (60 FPS)
// =========================================================================
let animLastTime = performance.now();
const animPhases = { library: 0, preview: 0, player: 0 };

function updateBreathIndicator(dotId, textId, exercise, u) {
  const b = KinematicEngine.getBreathState(exercise, u);
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;
  text.textContent = b.label;
  dot.className = b.isInhale
    ? 'w-2.5 h-2.5 rounded-full bg-sage-500 scale-125 transition-all duration-300'
    : 'w-2.5 h-2.5 rounded-full bg-terra-400 scale-90 transition-all duration-300';
}

function animationLoop(now) {
  const dt = Math.min(0.1, (now - animLastTime) / 1000);
  animLastTime = now;
  const isDark = state.darkMode;

  if (state.activeTab === 'library' && !Player.isOpen && !state.previewExId) {
    const ex = EXERCISES[state.selectedLibraryExId];
    if (ex) {
      animPhases.library = (animPhases.library + (dt * state.librarySpeed) / ex.cycleSec) % 1;
      KinematicEngine.render(document.getElementById('library-canvas'), ex, animPhases.library, isDark);
      updateBreathIndicator('lib-breath-dot', 'lib-breath-text', ex, animPhases.library);
    }
  }

  if (state.previewExId) {
    const ex = EXERCISES[state.previewExId];
    if (ex) {
      animPhases.preview = (animPhases.preview + (dt * state.previewSpeed) / ex.cycleSec) % 1;
      KinematicEngine.render(document.getElementById('preview-canvas'), ex, animPhases.preview, isDark);
      updateBreathIndicator('preview-breath-dot', 'preview-breath-text', ex, animPhases.preview);
    }
  }

  if (Player.isOpen) {
    const ex = Player.getCurrentExercise();
    if (ex) {
      animPhases.player = (animPhases.player + (dt * state.playerSpeed) / ex.cycleSec) % 1;
      KinematicEngine.render(document.getElementById('player-canvas'), ex, animPhases.player, isDark);
      updateBreathIndicator('player-breath-dot', 'player-breath-text', ex, animPhases.player);
    }
  }

  requestAnimationFrame(animationLoop);
}

// =========================================================================
// 9. EVENTOS E INICIALIZACIÓN
// =========================================================================
function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('btn-toggle-theme').addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyTheme();
    persistProfile();
  });

  const toggleSound = () => {
    state.soundEnabled = !state.soundEnabled;
    SoundEngine.setEnabled(state.soundEnabled);
    updateSoundButtons();
    persistProfile();
    if (state.soundEnabled) SoundEngine.playTick();
  };
  document.getElementById('btn-toggle-sound').addEventListener('click', toggleSound);
  document.getElementById('btn-player-sound').addEventListener('click', toggleSound);

  document.getElementById('btn-accept-phase-up').addEventListener('click', () => {
    if (state.currentPhase < 4) {
      state.currentPhase++;
      persistProfile();
      renderAll();
      showToast(`¡Bienvenido a la Fase ${state.currentPhase}: ${PHASES[state.currentPhase - 1].title}!`);
    }
  });

  document.getElementById('btn-start-session').addEventListener('click', () => Player.open());
  document.getElementById('btn-manual-complete').addEventListener('click', () => openCompleteModal());

  document.querySelectorAll('.lib-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedLibraryCat = btn.dataset.cat;
      renderLibrary();
    });
  });
  document.querySelectorAll('.lib-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.librarySpeed = Number(btn.dataset.speed);
      updateSpeedButtons('.lib-speed-btn', state.librarySpeed);
    });
  });

  document.getElementById('btn-close-preview').addEventListener('click', closePreviewModal);
  document.getElementById('preview-modal').addEventListener('click', (e) => {
    if (e.target.id === 'preview-modal') closePreviewModal();
  });
  document.querySelectorAll('.preview-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.previewSpeed = Number(btn.dataset.speed);
      updateSpeedButtons('.preview-speed-btn', state.previewSpeed);
    });
  });

  document.getElementById('btn-close-player').addEventListener('click', () => Player.close());
  document.getElementById('btn-player-playpause').addEventListener('click', () => Player.togglePlay());
  document.getElementById('btn-player-prev').addEventListener('click', () => Player.prevStep());
  document.getElementById('btn-player-next').addEventListener('click', () => Player.nextStep());
  document.getElementById('btn-player-restart').addEventListener('click', () => Player.restart());
  document.querySelectorAll('.player-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.playerSpeed = Number(btn.dataset.speed);
      updateSpeedButtons('.player-speed-btn', state.playerSpeed);
    });
  });
  document.getElementById('btn-player-easier').addEventListener('click', () => {
    const box = document.getElementById('player-easier-box');
    const chev = document.getElementById('player-easier-chevron');
    box.classList.toggle('hidden');
    chev.classList.toggle('rotate-180');
  });

  document.querySelectorAll('.feeling-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedFeeling = btn.dataset.feeling;
      syncFeelingButtons();
    });
  });
  document.getElementById('btn-cancel-complete').addEventListener('click', closeCompleteModal);
  document.getElementById('btn-save-complete').addEventListener('click', () => {
    closeCompleteModal();
    saveCompletedSession(state.selectedFeeling);
  });

  document.getElementById('btn-cal-prev').addEventListener('click', () => {
    state.calendarViewDate = new Date(state.calendarViewDate.getFullYear(), state.calendarViewDate.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById('btn-cal-next').addEventListener('click', () => {
    state.calendarViewDate = new Date(state.calendarViewDate.getFullYear(), state.calendarViewDate.getMonth() + 1, 1);
    renderCalendar();
  });
  document.getElementById('btn-cal-today').addEventListener('click', () => {
    state.calendarViewDate = new Date();
    renderCalendar();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.previewExId) closePreviewModal();
      if (!document.getElementById('complete-modal').classList.contains('hidden')) closeCompleteModal();
    }
  });
}

window.addEventListener('load', () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.darkMode = true;
  }
  initStorage();
  bindEvents();
  state.selectedFocus = getAutoFocusForToday();
  switchTab('today');
  renderAll();
  requestAnimationFrame(animationLoop);
});