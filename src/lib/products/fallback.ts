
import { Product } from './types';

// Produtos hardcoded para fallback
const hardcodedProducts: Product[] = [
  {
    id: "1",
    name: "Arroz Premium 5kg",
    price: 29.90,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 50,
    code: "ARR001",
    description: "Arroz tipo 1, grãos nobres e selecionados.",
    purchase_price: 22.50,
  },
  {
    id: "2",
    name: "Feijão Carioca 1kg",
    price: 8.49,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 45,
    code: "FEI001",
    description: "Feijão carioca tipo 1, colheita recente.",
    purchase_price: 6.25,
  },
  // ... Restante dos produtos hardcoded (mantidos para referência)
  {
    id: "30",
    name: "Desodorante Roll-on 50ml",
    price: 9.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 45,
    code: "DES001",
    description: "Desodorante roll-on antitranspirante.",
    purchase_price: 7.15,
  },
];

export default hardcodedProducts;
