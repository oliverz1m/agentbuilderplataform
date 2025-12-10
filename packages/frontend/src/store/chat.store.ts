import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentResponse: string;
  addMessage: (message: ChatMessage) => void;
  appendToCurrentResponse: (text: string) => void;
  finalizeResponse: () => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  currentResponse: '',
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  appendToCurrentResponse: (text) =>
    set((state) => ({ currentResponse: state.currentResponse + text })),
  finalizeResponse: () =>
    set((state) => {
      if (state.currentResponse) {
        return {
          messages: [
            ...state.messages,
            {
              role: 'assistant' as const,
              content: state.currentResponse,
              timestamp: new Date().toISOString(),
            },
          ],
          currentResponse: '',
        };
      }
      return state;
    }),
  clearMessages: () => set({ messages: [], currentResponse: '' }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
