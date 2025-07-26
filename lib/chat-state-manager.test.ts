import { ChatStateManager } from './chat-state-manager';
import { VisualizationType } from "../reference/dynamic-layers";
import { v4 as uuidv4 } from 'uuid';

describe('ChatStateManager', () => {
  let manager: ChatStateManager;
  let sessionId: string;

  beforeEach(() => {
    manager = new ChatStateManager();
    sessionId = manager.createSession(uuidv4());
  });

  afterEach(() => {
    manager.endSession(sessionId);
  });

  describe('Session Management', () => {
    it('should create a new session with default values', () => {
      const state = manager.getState(sessionId);
      expect(state.sessionId).toBe(sessionId);
      expect(state.messages).toHaveLength(0);
      expect(state.clarificationQuestions).toHaveLength(0);
      expect(state.dataContext?.visualizationType).toBe(VisualizationType.SCATTER);
    });

    it('should create a session with custom preferences', () => {
      const customSessionId = manager.createSession(uuidv4(), {
        preferredVisualizationTypes: [VisualizationType.CLUSTER],
        language: 'es'
      });
      const state = manager.getState(customSessionId);
      expect(state.userPreferences.preferredVisualizationTypes).toContain(VisualizationType.CLUSTER);
      expect(state.userPreferences.language).toBe('es');
    });

    it('should throw error when accessing non-existent session', () => {
      expect(() => manager.getState('non-existent')).toThrow();
    });
  });

  describe('Message Management', () => {
    it('should add messages to history', () => {
      manager.addMessage(sessionId, 'Hello', 'user');
      manager.addMessage(sessionId, 'Hi there!', 'system');
      
      const history = manager.getHistory(sessionId);
      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('Hello');
      expect(history[1].content).toBe('Hi there!');
    });

    it('should add messages with metadata', () => {
      const metadata = {
        visualizationType: VisualizationType.CLUSTER,
        confidence: 0.8
      };
      
      manager.addMessage(sessionId, 'Show clusters', 'user', metadata);
      const history = manager.getHistory(sessionId);
      expect(history[0].metadata).toEqual(metadata);
    });
  });

  describe('Clarification Questions', () => {
    it('should add and retrieve clarification questions', () => {
      const context = {
        originalQuery: 'Show me the data',
        currentConfidence: 0.6,
        matchedPatterns: [{
          type: VisualizationType.SCATTER,
          weight: 0.6,
          pattern: 'show.*data'
        }]
      };

      const questionId = manager.addClarificationQuestion(
        sessionId,
        'Would you like to see individual points or grouped data?',
        ['Individual points', 'Grouped data'],
        context
      );

      const questions = manager.getPendingClarifications(sessionId);
      expect(questions).toHaveLength(1);
      expect(questions[0].id).toBe(questionId);
      expect(questions[0].context.originalQuery).toBe('Show me the data');
    });

    it('should remove clarification questions', () => {
      const questionId = manager.addClarificationQuestion(
        sessionId,
        'Test question',
        ['Option 1', 'Option 2'],
        {
          originalQuery: 'test',
          currentConfidence: 0.5,
          matchedPatterns: []
        }
      );

      manager.removeClarificationQuestion(sessionId, questionId);
      expect(manager.getPendingClarifications(sessionId)).toHaveLength(0);
    });
  });

  describe('Data Context', () => {
    it('should update data context', () => {
      const newContext = {
        dataSummary: {
          totalPoints: 100,
          categories: ['A', 'B', 'C']
        },
        availableMetrics: ['metric1', 'metric2']
      };

      manager.updateDataContext(sessionId, newContext);
      const state = manager.getState(sessionId);
      
      expect(state.dataContext?.dataSummary.totalPoints).toBe(100);
      expect(state.dataContext?.dataSummary.categories).toEqual(['A', 'B', 'C']);
      expect(state.dataContext?.availableMetrics).toEqual(['metric1', 'metric2']);
    });
  });

  describe('User Preferences', () => {
    it('should update user preferences', () => {
      const newPreferences = {
        preferredVisualizationTypes: [VisualizationType.CLUSTER, VisualizationType.TRENDS],
        preferredMetrics: ['metric1']
      };

      manager.updatePreferences(sessionId, newPreferences);
      const state = manager.getState(sessionId);
      
      expect(state.userPreferences.preferredVisualizationTypes).toEqual([
        VisualizationType.CLUSTER,
        VisualizationType.TRENDS
      ]);
      expect(state.userPreferences.preferredMetrics).toEqual(['metric1']);
    });
  });
}); 