import { Tool } from '../types';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

/**
 * Tool: Save Log
 * Salva logs de eventos ou ações do agente
 */
export const saveLogTool: Tool = {
  name: 'save_log',
  description: 'Salva um log de evento ou ação realizada pelo agente',
  parameters: [
    {
      name: 'level',
      type: 'string',
      description: 'Nível do log: info, warning, error',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Mensagem do log',
      required: true,
    },
    {
      name: 'metadata',
      type: 'object',
      description: 'Dados adicionais do log',
      required: false,
    },
  ],
  execute: async (params) => {
    const { level, message, metadata = {} } = params;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    try {
      const logsPath = path.join(config.data.path, 'logs.json');

      // Read existing logs
      let logs: any[] = [];
      try {
        const content = await fs.readFile(logsPath, 'utf-8');
        logs = JSON.parse(content);
      } catch {
        // File doesn't exist yet
      }

      // Append new log
      logs.push(logEntry);

      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }

      // Write back
      await fs.mkdir(path.dirname(logsPath), { recursive: true });
      await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));

      return {
        success: true,
        logId: logs.length - 1,
        timestamp: logEntry.timestamp,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
