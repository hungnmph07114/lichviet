import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatSession } from '../services/geminiService';
import type { ChatMessage, UserProfile } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon as ModelIcon } from './icons';

interface AIChatProps {
  userProfile: UserProfile | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const AIChat: React.FC<AIChatProps> = ({ userProfile, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const chat = getChatSession(userProfile);
      const stream = await chat.sendMessageStream({ message: currentInput });

      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if(lastMessage.role === 'model') {
                lastMessage.text = modelResponse;
            }
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userProfile, setMessages]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e as any);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto bg-slate-800/50 rounded-lg shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 flex items-center justify-center text-amber-400">
                        <ModelIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                )}
                <div className={`max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.text || '...'}</p>
                </div>
                 {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <UserCircleIcon />
                    </div>
                )}
            </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
             <div className="flex items-start gap-3 sm:gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 flex items-center justify-center text-amber-400">
                    <ModelIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-slate-700 text-slate-200 rounded-bl-none">
                    <LoadingSpinner />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700 bg-slate-800/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi AI về bất cứ điều gì..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:cursor-not-allowed"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-2 h-10 w-10 flex-shrink-0 bg-amber-600 text-white rounded-full transition-colors hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoading ? <LoadingSpinner /> : <PaperAirplaneIcon />}
          </button>
        </form>
      </div>
    </div>
  );
};