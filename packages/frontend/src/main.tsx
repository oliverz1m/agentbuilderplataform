import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { AgentsList } from './components/AgentsList';
import { AgentEditor } from './components/AgentEditor';
import { ChatInterface } from './components/ChatInterface';
import { Observability } from './components/Observability';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 0,
      staleTime: Infinity,
      gcTime: 600000,
      networkMode: 'always',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/agents" replace />} />
            <Route path="/agents" element={<AgentsList />} />
            <Route path="/agents/new" element={<AgentEditor />} />
            <Route path="/agents/:id/edit" element={<AgentEditor />} />
            <Route path="/test" element={<Navigate to="/agents" replace />} />
            <Route path="/test/:id" element={<ChatInterface />} />
            <Route path="/observability" element={<Observability />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
