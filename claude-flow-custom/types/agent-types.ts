/**
 * Agent Type Definitions for Claude Flow Custom Agents
 */

export interface AgentContext {
  sessionId?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  workingDirectory?: string;
  outputDirectory?: string;
  hexagonId?: string;
  zipCode?: string;
  state?: string;
  [key: string]: any;
}

export interface AgentResult {
  success: boolean;
  message: string;
  artifacts?: string[];
  data?: any;
  metadata?: Record<string, any>;
  error?: Error | any;
  performance?: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    memoryUsage?: string;
  };
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  context?: AgentContext;
  dependencies?: string[];
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface AgentMetrics {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
  errorCount: number;
  lastError?: string;
}

export interface AgentConfig {
  enabled: boolean;
  maxConcurrentTasks: number;
  timeoutMs: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  customSettings?: Record<string, any>;
}

export type AgentStatus = 'idle' | 'busy' | 'error' | 'disabled';

export interface AgentInfo {
  name: string;
  description: string;
  skills: string[];
  status: AgentStatus;
  version: string;
  config: AgentConfig;
  metrics: AgentMetrics;
}