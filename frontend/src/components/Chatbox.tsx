import { useState, useEffect, useRef } from 'react';
import { chatService, ChatMessage, ChatStatus } from '../services/chatService';

interface ChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function Chatbox({ isOpen, onClose, onUpdate }: ChatboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ChatStatus>({ ready: false, tools: [] });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      // Add welcome message if no messages
      if (messages.length === 0) {
        addWelcomeMessage();
      }
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkStatus = async () => {
    try {
      const statusResponse = await chatService.getStatus();
      setStatus(statusResponse);
    } catch (error) {
      console.error('Failed to check chat status:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: chatService.generateMessageId(),
      type: 'assistant',
      content: "👋 Hi! I'm your expense tracking assistant. I can help you add expenses, view your spending history, get summaries, and convert currencies. What would you like to do?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !status.ready) return;

    const userMessage: ChatMessage = {
      id: chatService.generateMessageId(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await chatService.sendMessage(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: chatService.generateMessageId(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Trigger update if the response indicates an expense was modified
      if (response.includes('added') || response.includes('updated') || response.includes('deleted')) {
        onUpdate?.();
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: chatService.generateMessageId(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or check if the server is running.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    try {
      await chatService.clearContext();
      setMessages([]);
      addWelcomeMessage();
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to clear chat context:', error);
    }
  };

  const formatMessageContent = (content: string): JSX.Element => {
    // Simple formatting for bold, italic, and line breaks
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .split('\n');

    return (
      <div>
        {formatted.map((line, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: line || '<br>' }} />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="chatbox-overlay">
      <div className="chatbox">
        {/* Header */}
        <div className="chatbox-header">
          <div className="chatbox-title">
            <span className="chatbox-icon">🤖</span>
            <span>Expense Assistant</span>
            <div className={`status-indicator ${status.ready ? 'ready' : 'loading'}`}>
              {status.ready ? '●' : '○'}
            </div>
          </div>
          <div className="chatbox-controls">
            <button 
              onClick={handleClearChat} 
              className="clear-btn"
              title="Clear conversation"
            >
              🗑️
            </button>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbox-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {formatMessageContent(message.content)}
              </div>
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div className="chatbox-suggestions">
            <div className="suggestions-title">Try asking:</div>
            <div className="suggestions-list">
              {chatService.getSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chatbox-input">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={status.ready ? "Type your message..." : "Starting up..."}
              disabled={isLoading || !status.ready}
              className="message-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !status.ready}
              className="send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          {!status.ready && (
            <div className="status-message">
              Starting chat assistant... Please wait.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}