import { useState } from 'react';

export function useFeedback(teamLeadId) {
  const key = `feedback_${teamLeadId}`;

  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  const addEntry = (text) => {
    if (!text.trim()) return;
    const entry = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    localStorage.setItem(key, JSON.stringify(updated));
    setEntries(updated);
  };

  const deleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setEntries(updated);
  };

  return { entries, addEntry, deleteEntry };
}
