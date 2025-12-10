import { Tool } from '../types';

/**
 * Tool: Send Message
 * Simula o envio de mensagens (email, SMS, notificação)
 */
export const sendMessageTool: Tool = {
  name: 'send_message',
  description: 'Envia email, SMS ou notificação para um cliente. Use quando precisar avisar algo. Exemplo: type="email", recipient="cliente@email.com", subject="Pedido confirmado", body="Seu pedido foi processado"',
  parameters: [
    {
      name: 'type',
      type: 'string',
      description: 'Escolha UMA opção: "email" OU "sms" OU "notification"',
      required: true,
    },
    {
      name: 'recipient',
      type: 'string',
      description: 'Email (exemplo: cliente@email.com) OU telefone (exemplo: +5511999999999)',
      required: true,
    },
    {
      name: 'subject',
      type: 'string',
      description: 'Título do email (apenas para type="email")',
      required: false,
    },
    {
      name: 'body',
      type: 'string',
      description: 'Texto da mensagem',
      required: true,
    },
  ],
  execute: async (params) => {
    const { type, recipient, subject, body } = params;

    // Simulate sending (fake implementation)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      messageId,
      type,
      recipient,
      subject,
      sentAt: new Date().toISOString(),
      status: 'sent',
      message: `${type} sent to ${recipient}`,
    };
  },
};
