import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { logsApi, ragApi, healthApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function Observability() {
  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await logsApi.getAll(10);
      return response.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });

  const { data: vectorStats } = useQuery({
    queryKey: ['vector-stats'],
    queryFn: async () => {
      const response = await ragApi.stats();
      return response.data;
    },
    enabled: false,
    staleTime: Infinity,
  });

  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await healthApi.check();
      return response.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
    retry: 0,
  });

  const levelColors: Record<string, string> = {
    info: 'default',
    warning: 'secondary',
    error: 'destructive',
  };

  const levelIcons: Record<string, any> = {
    info: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Observabilidade</h1>
        <p className="text-muted-foreground">Monitore o status e logs do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Ollama</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? (
                <span className="text-sm text-muted-foreground">Carregando...</span>
              ) : healthError ? (
                <Badge variant="destructive">Erro</Badge>
              ) : health?.services?.ollama ? (
                <Badge variant="default">Online</Badge>
              ) : (
                <Badge variant="destructive">Offline</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vector Store</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? (
                <span className="text-sm text-muted-foreground">Carregando...</span>
              ) : healthError ? (
                <Badge variant="destructive">Erro</Badge>
              ) : health?.services?.vectorStore ? (
                <Badge variant="default">Online</Badge>
              ) : (
                <Badge variant="destructive">Offline</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memórias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vectorStats?.count || 0}</div>
            <p className="text-xs text-muted-foreground">entradas no vetor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum log disponível</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const Icon = levelIcons[log.level] || CheckCircle;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={levelColors[log.level] as any}>{log.level}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm">{log.message}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
