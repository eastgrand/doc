/**
 * Base Agent Class for Claude Flow Custom Agents
 * Provides common functionality for all specialized agents
 */

export interface AgentCapability {
  name: string;
  description: string;
  version: string;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  abstract skills: string[];

  /**
   * Main execution method for the agent
   */
  abstract execute(context: any): Promise<any>;

  /**
   * Get agent capabilities
   */
  getCapabilities(): AgentCapability {
    return {
      name: this.name,
      description: this.description,
      version: '1.0.0'
    };
  }

  /**
   * Handle errors consistently across agents
   */
  protected handleError(error: any): any {
    console.error(`[${this.name}] Error:`, error);
    return {
      success: false,
      message: error.message || 'Unknown error occurred',
      error: error
    };
  }

  /**
   * Log agent activity
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${this.name}] ${message}`);
  }

  /**
   * Validate required context properties
   */
  protected validateContext(context: any, requiredProps: string[]): void {
    for (const prop of requiredProps) {
      if (!context[prop]) {
        throw new Error(`Missing required context property: ${prop}`);
      }
    }
  }
}