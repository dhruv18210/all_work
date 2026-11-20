/* ═══════════════════════════════════════════════
   Memory Persistence — localStorage wrapper
   ═══════════════════════════════════════════════ */

const MEMORY_KEY = 'gis_memory';

export function saveMemory(companyName, data) {
  try {
    const all = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    const key = companyName.toLowerCase().replace(/\s+/g, '_');
    all[key] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(MEMORY_KEY, JSON.stringify(all));
    return true;
  } catch (e) {
    console.error('Memory save failed:', e);
    return false;
  }
}

export function loadMemory(companyName) {
  try {
    const all = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    const key = companyName.toLowerCase().replace(/\s+/g, '_');
    return all[key] || null;
  } catch (e) {
    console.error('Memory load failed:', e);
    return null;
  }
}

export function clearMemory(companyName) {
  try {
    const all = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    const key = companyName.toLowerCase().replace(/\s+/g, '_');
    delete all[key];
    localStorage.setItem(MEMORY_KEY, JSON.stringify(all));
    return true;
  } catch (e) {
    return false;
  }
}

export function listCompanies() {
  try {
    const all = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    return Object.keys(all);
  } catch (e) {
    return [];
  }
}
