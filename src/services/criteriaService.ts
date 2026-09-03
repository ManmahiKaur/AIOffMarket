import type { MonitoringCriteria } from '../types';
import { mockCriteria } from '../mock';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const criteriaService = {
  async getCriteria(): Promise<MonitoringCriteria> {
    await delay(300);
    return mockCriteria;
  },

  async updateCriteria(newCriteria: MonitoringCriteria): Promise<MonitoringCriteria> {
    await delay(300);
    // In a real app, this would be an API call to save
    return newCriteria;
  }
};
