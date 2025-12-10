import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { agentsApi, executeApi } from '@/lib/api';
import { useChatStore } from '@/store/chat.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function ChatInterface() {
  const { id } = useParams();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, currentResponse, isStreaming, addMessage, appendToCurrentResponse, finalizeResponse, setStreaming } =
    useChatStore();

  const { data: agent } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const response = await agentsApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agent) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setIsProcessing(true);
    setStreaming(true);
    setToolCalls([]);

    try {
      for await (const event of executeApi.runStream(agent.id, userMessage.content)) {
        switch (event.type) {
          case 'start':
            break;

          case 'thinking':
            break;

          case 'token':
            appendToCurrentResponse(event.data.chunk);
            break;

          case 'tool_calls':
            setToolCalls((prev) => [...prev, ...event.data.toolCalls]);
            break;

          case 'tool_result':
            break;

          case 'tool_error':
            break;

          case 'complete':
            if (toolCalls.length > 0) {
              setToolCalls([]);
            }
            finalizeResponse();
            break;

          case 'error':
            addMessage({
              role: 'assistant',
              content: `Erro: ${event.data.error}`,
              timestamp: new Date().toISOString(),
            });
            break;
        }
      }
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: `Erro ao processar: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsProcessing(false);
      setStreaming(false);
      setToolCalls([]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Chat - {agent?.name || 'Carregando...'}</CardTitle>
            <Badge>{agent?.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-4 space-y-3">
          {messages.length === 0 && !currentResponse && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">💬 Envie uma mensagem para começar</p>
                <p className="text-sm">Este agente está pronto para ajudar você!</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-xs font-semibold mb-1.5 opacity-80">
                  {message.role === 'user' ? 'Você' : (agent?.name || 'Agente de vendas')}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div className="text-xs opacity-60 mt-1.5">
                  {formatDate(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {toolCalls.length > 0 && (
            <div className="flex justify-start animate-slide-in-from-bottom">
              <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤔</span>
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Pensando e executando ações...
                  </span>
                </div>
                <div className="space-y-2">
                  {toolCalls.map((call, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs bg-white dark:bg-amber-900/30 rounded-lg p-2">
                      <span className="text-base">🔧</span>
                      <div className="flex-1">
                        <div className="font-mono font-semibold text-amber-700 dark:text-amber-300">
                          {call.name}
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 mt-1 font-mono">
                          {JSON.stringify(call.arguments, null, 2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentResponse && (
            <div className="flex justify-start animate-slide-in-from-bottom">
              <div className="max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <div className="text-xs font-semibold mb-1.5 opacity-80">
                  {agent?.name || 'Agente de vendas'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {currentResponse}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-blue-600 animate-pulse ml-1 align-middle" />
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4 bg-gray-50 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isProcessing ? "Aguarde a resposta..." : "Digite sua mensagem..."}
              disabled={isProcessing}
              className="flex-1 rounded-full px-5 py-2 border-2 focus:border-blue-500 transition-all"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={isProcessing || !input.trim()}
              className="rounded-full px-5 min-w-[100px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
