# Guide: Implementing Full Contextual Chat (Minimal Approach)

This guide outlines the simplest way to add full contextual chat to your AI-driven query/response system. The goal is to allow the system to use previous queries, responses, and visualization state as context for all new queries—not just for clarification.

---

## 1. **What is Full Contextual Chat?**
- The system remembers the conversation history (queries, responses, clarifications, visualizations).
- Each new user query is processed with access to this history, enabling follow-up questions, references to previous results, and more natural dialog.

---

## 2. **Minimal Implementation Steps**

### **A. Store Full Chat History per Session**
- **Extend your chat state manager** to keep an ordered list of all messages (user and system) for each session.
- Each message should include:
  - `role`: 'user' | 'system' | 'ai'
  - `content`: the text of the message
  - `timestamp`: when the message was sent
  - (Optional) `metadata`: e.g., visualization type, confidence, etc.

### **B. Build Context for Each New Query**
- When a new query arrives, **gather the last N messages** (e.g., last 5-10 exchanges) from the session history.
- Create a `context` object or string that summarizes these messages.
- Example context payload:
  ```json
  {
    "history": [
      { "role": "user", "content": "Show income by region." },
      { "role": "system", "content": "Displaying choropleth map of income by region." },
      { "role": "user", "content": "Now show education for the same areas." }
    ],
    "currentVisualization": "choropleth",
    "lastQuery": "Show income by region."
  }
  ```

### **C. Pass Context to Classifier/AI API**
- **Modify the query handler** so that, when calling the ML classifier or Claude API, it includes the context object as part of the request payload.
- For example:
  ```js
  const payload = {
    query: userQuery,
    context: chatStateManager.getRecentHistory(sessionId, N)
  };
  ```
- Update the API endpoints and service classes to accept and use this context.

### **D. (Optional) Use Context in Pattern/Keyword Fallback**
- If using pattern/keyword fallback, you can also pass the context to help disambiguate queries (e.g., if the user says "now show education," use the last visualization as a hint).

### **E. UI/UX Notes**
- Display the full chat history in the UI, not just the last message.
- Optionally, highlight when the AI uses context (e.g., "Based on your previous question...").

---

## 3. **Example: Minimal Code Changes**

**A. Chat State Manager**
```ts
// Add to chat-state-manager.ts
addMessage(sessionId, content, role, metadata = {}) {
  // ...existing logic...
  this.sessions[sessionId].history.push({ role, content, timestamp: Date.now(), ...metadata });
}
getRecentHistory(sessionId, N = 5) {
  return this.sessions[sessionId].history.slice(-N);
}
```

**B. Query Handler**
```ts
// In processQuery
const context = chatStateManager.getRecentHistory(sessionId, 5);
const classification = await classifier.classifyQuery(query, context);
```

**C. ML/Claude API**
- Update the API and service to accept a `context` parameter and use it in the prompt or model input.

---

## 4. **Further Enhancements (Optional)**
- Summarize long histories to fit model input limits.
- Use vector search or embeddings for smarter context retrieval.
- Allow users to reference previous visualizations by name or number.

---

## 5. **Summary**
- **Store full chat history.**
- **Pass recent history as context** to every query classification/AI call.
- **Update UI** to show threaded conversation.
- **Minimal code changes** can enable powerful contextual chat.

---

*This approach provides a simple, extensible foundation for full contextual chat in your AI system.* 