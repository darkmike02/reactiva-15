// Persistencia local de perfil, fase y sesiones completadas
const PROFILE_KEY = 'reactiva15_profile_v1';
const SESSIONS_KEY = 'reactiva15_sessions_v1';

export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isStorageAvailable() {
  try {
    const testKey = '__reactiva15_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        currentPhase: profile.currentPhase,
        soundEnabled: profile.soundEnabled,
        darkMode: profile.darkMode,
        updatedAt: Date.now()
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(s => s && typeof s.dateKey === 'string')
      .sort((a, b) => (b.dateKey > a.dateKey ? 1 : -1));
  } catch {
    return [];
  }
}

export function saveSession(record) {
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.dateKey === record.dateKey);
  if (idx >= 0) {
    sessions[idx] = record;
  } else {
    sessions.unshift(record);
  }
  sessions.sort((a, b) => (b.dateKey > a.dateKey ? 1 : -1));

  let persisted = false;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    persisted = true;
  } catch {
    persisted = false;
  }

  return { sessions, persisted };
}