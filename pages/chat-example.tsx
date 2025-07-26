import React from 'react';
import AIChatInterface from '@/components/ai-chat-interface';
import { useChatContext } from '@/components/chat-context-provider';
import Head from 'next/head';

const ChatExample: React.FC = () => {
  const { contextSummary } = useChatContext();
  
  return (
    <>
      <Head>
        <title>AI Chat with Context Awareness</title>
        <meta name="description" content="Example of an AI chat interface with conversation context" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900">Contextual AI Chat Example</h1>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md h-[calc(100vh-12rem)]">
                <AIChatInterface 
                  title="Geospatial Data Assistant"
                  initialMessage="Hello! I'm your geospatial data assistant. I can help you analyze maps, understand demographic data, or explore spatial trends. What would you like to know?"
                  placeholder="Ask about geospatial data, maps, or demographic trends..."
                  systemPrompt="You are a geospatial data assistant helping users understand mapping and demographic information. Be concise and helpful, offering insights about geographic data when possible."
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Conversation Context</h2>
                <div className="prose">
                  {contextSummary ? (
                    <>
                      <p>{contextSummary}</p>
                      <p className="text-sm text-gray-500 mt-4">
                        This summary is generated automatically and helps the AI maintain context
                        across your conversation. The longer you chat, the more context the AI will have.
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No conversation context available yet. Start chatting to build context!
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Example Questions</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>• What factors affect population distribution in urban areas?</li>
                  <li>• How do income levels correlate with demographic patterns?</li>
                  <li>• Can you explain what a choropleth map is?</li>
                  <li>• What are some ways to visualize geospatial data?</li>
                  <li>• How do I analyze trends across different ZIP codes?</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>© 2023 Context-Aware AI Chat Demo</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ChatExample; 