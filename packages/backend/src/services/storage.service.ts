import fs from 'fs/promises';
import path from 'path';
import { Agent } from '../types';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service for persisting data
 */
export class StorageService {
  private agentsFile: string;
  private logsFile: string;
  private memoryFile: string;

  constructor() {
    const dataPath = config.data.path;
    this.agentsFile = path.join(dataPath, 'agents.json');
    this.logsFile = path.join(dataPath, 'logs.json');
    this.memoryFile = path.join(dataPath, 'memory.json');
  }

  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    await fs.mkdir(config.data.path, { recursive: true });

    // Create files if they don't exist
    await this.ensureFile(this.agentsFile, []);
    await this.ensureFile(this.logsFile, []);
    await this.ensureFile(this.memoryFile, []);
  }

  /**
   * Ensure file exists
   */
  private async ensureFile(filePath: string, defaultContent: any): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
    }
  }

  /**
   * Read JSON file
   */
  private async readJson<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Write JSON file
   */
  private async writeJson(filePath: string, data: any): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // === AGENTS ===

  async getAllAgents(): Promise<Agent[]> {
    return this.readJson<Agent[]>(this.agentsFile);
  }

  async getAgent(id: string): Promise<Agent | null> {
    const agents = await this.getAllAgents();
    return agents.find((a) => a.id === id) || null;
  }

  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const agents = await this.getAllAgents();

    const newAgent: Agent = {
      ...agentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    agents.push(newAgent);
    await this.writeJson(this.agentsFile, agents);

    return newAgent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    const agents = await this.getAllAgents();
    const index = agents.findIndex((a) => a.id === id);

    if (index === -1) {
      return null;
    }

    agents[index] = {
      ...agents[index],
      ...updates,
      id, // Prevent ID change
      updatedAt: new Date().toISOString(),
    };

    await this.writeJson(this.agentsFile, agents);
    return agents[index];
  }

  async deleteAgent(id: string): Promise<boolean> {
    const agents = await this.getAllAgents();
    const filtered = agents.filter((a) => a.id !== id);

    if (filtered.length === agents.length) {
      return false;
    }

    await this.writeJson(this.agentsFile, filtered);
    return true;
  }

  // === LOGS ===

  async getLogs(limit: number = 100): Promise<any[]> {
    const logs = await this.readJson<any[]>(this.logsFile);
    return logs.slice(-limit);
  }

  async addLog(logEntry: any): Promise<void> {
    const logs = await this.readJson<any[]>(this.logsFile);
    logs.push(logEntry);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    await this.writeJson(this.logsFile, logs);
  }

  async clearLogs(): Promise<void> {
    await this.writeJson(this.logsFile, []);
  }
}

export const storage = new StorageService();
