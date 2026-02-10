
export const getStorageItem = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
};

export const setStorageItem = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};
