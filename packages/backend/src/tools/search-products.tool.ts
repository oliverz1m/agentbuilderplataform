import { Tool } from '../types';

/**
 * Tool: Search Products
 * Busca produtos em um catálogo fake
 */
export const searchProductsTool: Tool = {
  name: 'search_products',
  description: 'Busca produtos no catálogo. Use quando o cliente perguntar "tem notebook?", "qual o preço do mouse?", "produtos de eletrônicos?". Exemplo: query="notebook" retorna lista de notebooks disponíveis.',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'Palavra-chave para buscar. Exemplos: "notebook", "mouse", "eletrônicos", "teclado"',
      required: true,
    },
    {
      name: 'maxResults',
      type: 'number',
      description: 'Quantos produtos mostrar (padrão: 10)',
      required: false,
      default: 10,
    },
  ],
  execute: async (params) => {
    const { query, maxResults = 10 } = params;

    // Fake product database
    const products = [
      {
        id: 'prod-001',
        name: 'Notebook Dell Inspiron',
        category: 'Eletrônicos',
        price: 3499.99,
        stock: 15,
        description: 'Notebook com Intel i5, 8GB RAM, 256GB SSD',
      },
      {
        id: 'prod-002',
        name: 'Mouse Logitech MX Master',
        category: 'Periféricos',
        price: 349.99,
        stock: 45,
        description: 'Mouse ergonômico sem fio',
      },
      {
        id: 'prod-003',
        name: 'Teclado Mecânico Keychron',
        category: 'Periféricos',
        price: 599.99,
        stock: 23,
        description: 'Teclado mecânico RGB hot-swappable',
      },
      {
        id: 'prod-004',
        name: 'Monitor LG UltraWide 34"',
        category: 'Eletrônicos',
        price: 2199.99,
        stock: 8,
        description: 'Monitor ultrawide 21:9, 3440x1440',
      },
      {
        id: 'prod-005',
        name: 'Cadeira Gamer DXRacer',
        category: 'Móveis',
        price: 1499.99,
        stock: 12,
        description: 'Cadeira ergonômica para escritório e gaming',
      },
      {
        id: 'prod-006',
        name: 'Webcam Logitech C920',
        category: 'Periféricos',
        price: 449.99,
        stock: 30,
        description: 'Webcam Full HD 1080p',
      },
      {
        id: 'prod-007',
        name: 'Headset HyperX Cloud',
        category: 'Áudio',
        price: 399.99,
        stock: 25,
        description: 'Headset gamer com microfone removível',
      },
      {
        id: 'prod-008',
        name: 'SSD Samsung 1TB',
        category: 'Armazenamento',
        price: 549.99,
        stock: 50,
        description: 'SSD NVMe M.2 de alta performance',
      },
    ];

    // Filter products
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );

    const results = filtered.slice(0, maxResults);

    return {
      query,
      totalResults: filtered.length,
      results,
    };
  },
};
