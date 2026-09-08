import type { Alert, EventType } from '../types';
import { mockAlerts } from '../mock';

const ALERTS_STORAGE_KEY = 'ai_offmarket_alerts';

export const alertService = {
  getAlerts(): Alert[] {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading alerts from storage', e);
    }
    this.saveAlerts(mockAlerts);
    return mockAlerts;
  },

  saveAlerts(alerts: Alert[]): void {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Error saving alerts to storage', e);
    }
  },

  createAlert(name: string, type: EventType | 'HIGH_OPPORTUNITY' | 'CRITICAL_OPPORTUNITY', condition: string, location: string): Alert {
    const alerts = this.getAlerts();
    const newAlert: Alert = {
      id: `al-${Date.now()}`,
      name,
      type,
      condition,
      location,
      isActive: true
    };
    alerts.push(newAlert);
    this.saveAlerts(alerts);
    return newAlert;
  },

  toggleAlert(id: string): Alert[] {
    const alerts = this.getAlerts();
    const updated = alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    this.saveAlerts(updated);
    return updated;
  },

  deleteAlert(id: string): Alert[] {
    const alerts = this.getAlerts();
    const updated = alerts.filter(a => a.id !== id);
    this.saveAlerts(updated);
    return updated;
  }
};
