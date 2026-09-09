import { apiRequest } from '../lib/api';

export type AssistantResponse = {
  status: string;
  answer: string;
  source: string;
  usedOllama: boolean;
};

export const assistantService = {
  ask(question: string, useOllama = false) {
    return apiRequest<AssistantResponse>('/api/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ question, useOllama }),
    });
  },
};
