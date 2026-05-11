import { assetUrl } from "@/lib/asset-url";
import type { Order } from "@/types";

const orderRows: Order[] = [
  {
    id: "BRV-1001",
    createdAt: "2025-03-22T14:32:00-03:00",
    items: [
      {
        productId: "pr01",
        slug: "camisa-oficial-i-2025",
        name: "Camisa Oficial I 2025",
        price: 249.9,
        image: "/products/camisa-i-1.jpg",
        size: "G",
        quantity: 1,
      },
      {
        productId: "pr07",
        slug: "meiao-oficial",
        name: "Meião Oficial Bravura",
        price: 49.9,
        image: "/products/meiao-1.jpg",
        size: "M",
        quantity: 2,
      },
    ],
    subtotal: 349.7,
    shipping: 25,
    total: 374.7,
    customer: {
      name: "Gabriel Torres",
      email: "gabriel@example.com",
      phone: "(11) 98888-0000",
      address: "Rua das Acácias, 120",
      city: "São Paulo",
      state: "SP",
      zip: "01010-000",
    },
    status: "pago",
  },
  {
    id: "BRV-1002",
    createdAt: "2025-04-01T10:12:00-03:00",
    items: [
      {
        productId: "pr05",
        slug: "jaqueta-bravura",
        name: "Jaqueta Oficial Bravura",
        price: 299.9,
        image: "/products/jaqueta-1.jpg",
        size: "M",
        quantity: 1,
      },
    ],
    subtotal: 299.9,
    shipping: 30,
    total: 329.9,
    customer: {
      name: "Mariana Lopes",
      email: "mari@example.com",
      phone: "(11) 97777-0000",
      address: "Av. Brasil, 500",
      city: "São Paulo",
      state: "SP",
      zip: "02020-000",
    },
    status: "enviado",
  },
  {
    id: "BRV-1003",
    createdAt: "2025-04-10T17:45:00-03:00",
    items: [
      {
        productId: "pr08",
        slug: "bone-bravura-preto",
        name: "Boné Bravura Preto",
        price: 89.9,
        image: "/products/bone-1.jpg",
        size: "M",
        quantity: 1,
      },
    ],
    subtotal: 89.9,
    shipping: 20,
    total: 109.9,
    customer: {
      name: "Rafael Silva",
      email: "rafa@example.com",
      phone: "(11) 96666-0000",
      address: "Rua do Sol, 77",
      city: "Guarulhos",
      state: "SP",
      zip: "07070-000",
    },
    status: "entregue",
  },
];

export const orders: Order[] = orderRows.map((order) => ({
  ...order,
  items: order.items.map((item) => ({ ...item, image: assetUrl(item.image) })),
}));
