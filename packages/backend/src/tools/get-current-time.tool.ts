import { Tool } from '../types';

/**
 * Tool: Get Current Time
 * Retorna data e hora atual
 */
export const getCurrentTimeTool: Tool = {
  name: 'get_current_time',
  description: 'Retorna a data e hora atual',
  parameters: [],
  execute: async () => {
    const now = new Date();

    return {
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      unixTimestamp: Math.floor(now.getTime() / 1000),
    };
  },
};
