import { Tool } from '../types';

/**
 * Tool: Check Stock
 * Verifica o estoque disponível de um produto
 */
export const checkStockTool: Tool = {
  name: 'check_stock',
  description: 'Verifica estoque de um produto ESPECÍFICO. Use quando o cliente perguntar "tem X unidades?", "quando chega?". IMPORTANTE: Você precisa ter o productId (exemplo: prod-001). Se não tiver, use search_products PRIMEIRO.',
  parameters: [
    {
      name: 'productId',
      type: 'string',
      description: 'ID do produto (exemplo: "prod-001", "prod-002"). Obtenha com search_products antes.',
      required: true,
    },
  ],
  execute: async (params) => {
    const { productId } = params;

    // Fake stock database
    const stockData: Record<string, any> = {
      'prod-001': { productId: 'prod-001', available: 15, reserved: 3, incoming: 20 },
      'prod-002': { productId: 'prod-002', available: 45, reserved: 5, incoming: 0 },
      'prod-003': { productId: 'prod-003', available: 23, reserved: 2, incoming: 15 },
      'prod-004': { productId: 'prod-004', available: 8, reserved: 1, incoming: 10 },
      'prod-005': { productId: 'prod-005', available: 12, reserved: 0, incoming: 5 },
      'prod-006': { productId: 'prod-006', available: 30, reserved: 8, incoming: 25 },
      'prod-007': { productId: 'prod-007', available: 25, reserved: 4, incoming: 0 },
      'prod-008': { productId: 'prod-008', available: 50, reserved: 10, incoming: 30 },
    };

    const stock = stockData[productId];

    if (!stock) {
      return {
        error: 'Product not found',
        productId,
      };
    }

    return {
      ...stock,
      status:
        stock.available > 10 ? 'in_stock' : stock.available > 0 ? 'low_stock' : 'out_of_stock',
      estimatedRestockDate: stock.incoming > 0 ? '2025-12-20' : null,
    };
  },
};
