window.storage = {
  async get(key) {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : undefined;
  },
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  async delete(key) {
    localStorage.removeItem(key);
  },
  async list(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  },
};
