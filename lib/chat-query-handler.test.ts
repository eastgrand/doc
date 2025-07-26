import { ChatQueryHandler } from './chat-query-handler';
import { QueryClassifier } from './query-classifier';
import { VisualizationType } from "../reference/dynamic-layers";
import { chatStateManager } from './chat-state-manager';
import { v4 as uuidv4 } from 'uuid';

describe('ChatQueryHandler', () => {
  let handler: ChatQueryHandler;
  let mockClassifier: jest.Mocked<QueryClassifier>;
  let sessionId: string;

  beforeEach(() => {
    // Create a mock classifier
    mockClassifier = {
      classifyQuery: jest.fn(),
    } as any;

    // Create mock ML classifier and Claude service
    const mockMLClassifier = {
      classifyQuery: jest.fn(),
    } as any;

    const mockClaudeService = {
      analyze: jest.fn(),
    } as any;

    handler = new ChatQueryHandler(mockClassifier, mockMLClassifier, mockClaudeService);
    
    // Create a new session before each test
    sessionId = chatStateManager.createSession(uuidv4(), {
      preferredVisualizationTypes: [VisualizationType.SCATTER],
      language: 'en'
    });
  });

  afterEach(() => {
    // Clean up the session
    chatStateManager.endSession(sessionId);
  });

  describe('processQuery', () => {
    it('should handle a clear query with high confidence', async () => {
      mockClassifier.classifyQuery.mockResolvedValue({
        visualizationType: VisualizationType.SCATTER,
        confidence: 0.9,
      });

      const result = await handler.processQuery(sessionId, 'show me all points');

      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      expect(result.confidence).toBe(0.9);
      expect(result.needsClarification).toBe(false);
      expect(result.response).toContain('scatter');
    });

    it('should request clarification for low confidence queries', async () => {
      mockClassifier.classifyQuery.mockResolvedValue({
        visualizationType: VisualizationType.SCATTER,
        confidence: 0.6,
      });

      const result = await handler.processQuery(sessionId, 'show me something');

      expect(result.needsClarification).toBe(true);
      expect(result.response).toContain('Would you like to see');
    });

    it('should handle clarification responses', async () => {
      // First query with low confidence
      mockClassifier.classifyQuery.mockResolvedValue({
        visualizationType: VisualizationType.SCATTER,
        confidence: 0.6,
      });

      await handler.processQuery(sessionId, 'show me something');

      // Response to clarification
      const result = await handler.processQuery(sessionId, 'all points');

      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.needsClarification).toBe(false);
    });

    it('should handle unclear clarification responses', async () => {
      // First query with low confidence
      mockClassifier.classifyQuery.mockResolvedValue({
        visualizationType: VisualizationType.SCATTER,
        confidence: 0.6,
      });

      await handler.processQuery(sessionId, 'show me something');

      // Unclear response to clarification
      const result = await handler.processQuery(sessionId, 'maybe');

      expect(result.needsClarification).toBe(true);
      expect(result.response).toContain("I didn't quite understand");
    });

    it('should handle queries with no visualization type', async () => {
      mockClassifier.classifyQuery.mockResolvedValue({
        confidence: 0.5,
      });

      const result = await handler.processQuery(sessionId, 'what is this');

      expect(result.needsClarification).toBe(true);
      expect(result.response).toContain('Would you like to see');
    });

    it('should handle error cases', async () => {
      mockClassifier.classifyQuery.mockResolvedValue({
        confidence: 0,
        error: 'Invalid query format',
      });

      const result = await handler.processQuery(sessionId, 'invalid query');

      expect(result.needsClarification).toBe(false);
      expect(result.response).toContain('Invalid query format');
      expect(result.confidence).toBe(0);
    });
  });

  describe('chat history', () => {
    it('should maintain chat history', async () => {
      mockClassifier.classifyQuery.mockResolvedValue({
        visualizationType: VisualizationType.SCATTER,
        confidence: 0.9,
      });

      await handler.processQuery(sessionId, 'show me all points');
      const history = chatStateManager.getHistory(sessionId);

      expect(history).toHaveLength(2); // User message + system response
      expect(history[0].content).toBe('show me all points');
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('system');
    });
  });
}); 