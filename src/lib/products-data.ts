import { Product } from '../contexts/CartContext';
import { getProductsFromStorage } from './utils';

// Re-export the Product type so it can be imported directly from this file
export type { Product };

// Função para carregar produtos, prioriza produtos do localStorage
function loadProducts(): Product[] {
  try {
    const storedProducts = getProductsFromStorage();
    
    if (storedProducts && storedProducts.length > 0) {
      return storedProducts;
    }
    
    // Produtos padrão para caso não haja produtos no localStorage
    return defaultProducts;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return defaultProducts;
  }
}

// Default products array to use when localStorage is not available
const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Arroz Premium 5kg",
    price: 29.90,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 50,
    code: "ARR001",
    description: "Arroz tipo 1, grãos nobres e selecionados.",
    isPublic: false
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
    isPublic: false
  },
  {
    id: "3",
    name: "Açúcar Refinado 1kg",
    price: 5.99,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 60,
    code: "ACU001",
    description: "Açúcar refinado de alta qualidade.",
    isPublic: false
  },
  {
    id: "4",
    name: "Café Torrado e Moído 500g",
    price: 15.90,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 40,
    code: "CAF001",
    description: "Café torrado e moído, embalagem à vácuo.",
    isPublic: false
  },
  {
    id: "5",
    name: "Óleo de Soja 900ml",
    price: 7.95,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 55,
    code: "OLE001",
    description: "Óleo de soja refinado tipo 1.",
    isPublic: false
  },
  {
    id: "6",
    name: "Leite Integral 1L",
    price: 4.79,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 70,
    code: "LEI001",
    description: "Leite integral UHT, embalagem longa vida.",
    isPublic: false
  },
  {
    id: "7",
    name: "Queijo Mussarela 500g",
    price: 25.50,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 30,
    code: "QUE001",
    description: "Queijo mussarela fatiado de primeira qualidade.",
    isPublic: false
  },
  {
    id: "8",
    name: "Iogurte Natural 500g",
    price: 8.99,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 35,
    code: "IOG001",
    description: "Iogurte natural cremoso sem açúcar.",
    isPublic: false
  },
  {
    id: "9",
    name: "Maçã Gala Kg",
    price: 9.90,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 40,
    code: "MAC001",
    description: "Maçã gala fresca, selecionada.",
    isPublic: false
  },
  {
    id: "10",
    name: "Banana Prata Kg",
    price: 6.49,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 45,
    code: "BAN001",
    description: "Banana prata madura, ideal para consumo.",
    isPublic: false
  },
  {
    id: "11",
    name: "Tomate Kg",
    price: 7.90,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 35,
    code: "TOM001",
    description: "Tomate fresco para saladas e molhos.",
    isPublic: false
  },
  {
    id: "12",
    name: "Alface Crespa Un",
    price: 3.99,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 25,
    code: "ALF001",
    description: "Alface crespa fresca, colhida no dia.",
    isPublic: false
  },
  {
    id: "13",
    name: "Carne Bovina Patinho Kg",
    price: 39.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 20,
    code: "CAR001",
    description: "Carne bovina patinho, peça inteira ou moída.",
    isPublic: false
  },
  {
    id: "14",
    name: "Frango Inteiro Kg",
    price: 15.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 30,
    code: "FRA001",
    description: "Frango inteiro resfriado.",
    isPublic: false
  },
  {
    id: "15",
    name: "Linguiça Toscana Kg",
    price: 22.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 25,
    code: "LIN001",
    description: "Linguiça toscana suína para churrasco.",
    isPublic: false
  },
  {
    id: "16",
    name: "Pão Francês Kg",
    price: 13.90,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 50,
    code: "PAO001",
    description: "Pão francês fresco, feito no dia.",
    isPublic: false
  },
  {
    id: "17",
    name: "Pão de Forma 500g",
    price: 8.49,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 40,
    code: "PAO002",
    description: "Pão de forma tradicional fatiado.",
    isPublic: false
  },
  {
    id: "18",
    name: "Bolo de Chocolate Un",
    price: 19.90,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 15,
    code: "BOL001",
    description: "Bolo de chocolate fresco, pronto para consumo.",
    isPublic: false
  },
  {
    id: "19",
    name: "Água Mineral 500ml",
    price: 2.49,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 100,
    code: "AGU001",
    description: "Água mineral sem gás, garrafa 500ml.",
    isPublic: false
  },
  {
    id: "20",
    name: "Refrigerante Cola 2L",
    price: 8.99,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 60,
    code: "REF001",
    description: "Refrigerante sabor cola, garrafa 2 litros.",
    isPublic: false
  },
  {
    id: "21",
    name: "Suco de Laranja 1L",
    price: 10.90,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 45,
    code: "SUC001",
    description: "Suco de laranja natural integral, garrafa 1 litro.",
    isPublic: false
  },
  {
    id: "22",
    name: "Cerveja Lata 350ml",
    price: 4.90,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 80,
    code: "CER001",
    description: "Cerveja pilsen, lata 350ml.",
    isPublic: false
  },
  {
    id: "23",
    name: "Sabão em Pó 1kg",
    price: 12.90,
    image: "/placeholder.svg",
    category: "Limpeza",
    stock: 40,
    code: "SAB001",
    description: "Sabão em pó multi-ação para roupas.",
    isPublic: false
  },
  {
    id: "24",
    name: "Detergente Líquido 500ml",
    price: 3.49,
    image: "/placeholder.svg",
    category: "Limpeza",
    stock: 55,
    code: "DET001",
    description: "Detergente líquido para louças, neutro.",
    isPublic: false
  },
  {
    id: "25",
    name: "Papel Higiênico 12 rolos",
    price: 19.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 35,
    code: "PAP001",
    description: "Papel higiênico folha dupla, pacote com 12 rolos.",
    isPublic: false
  },
  {
    id: "26",
    name: "Creme Dental 90g",
    price: 5.99,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 50,
    code: "CRE001",
    description: "Creme dental com flúor para proteção completa.",
    isPublic: false
  },
  {
    id: "27",
    name: "Sabonete 90g",
    price: 2.99,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 60,
    code: "SAB002",
    description: "Sabonete hidratante para banho.",
    isPublic: false
  },
  {
    id: "28",
    name: "Shampoo 350ml",
    price: 12.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 40,
    code: "SHA001",
    description: "Shampoo para todos os tipos de cabelo.",
    isPublic: false
  },
  {
    id: "29",
    name: "Condicionador 350ml",
    price: 13.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 38,
    code: "CON001",
    description: "Condicionador para todos os tipos de cabelo.",
    isPublic: false
  },
  {
    id: "30",
    name: "Desodorante Roll-on 50ml",
    price: 9.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 45,
    code: "DES001",
    description: "Desodorante roll-on antitranspirante.",
    isPublic: false
  },
];

const products = loadProducts();

export function getProducts(search = '', category = '', minPrice = 0, maxPrice = Infinity, inStock = false): Product[] {
  let filteredProducts = [...products];
  
  // Filtrar por busca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.code && product.code.toLowerCase().includes(searchLower))
    );
  }
  
  // Filtrar por categoria
  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === category
    );
  }
  
  // Filtrar por preço
  filteredProducts = filteredProducts.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
  
  // Filtrar por estoque
  if (inStock) {
    filteredProducts = filteredProducts.filter(
      (product) => product.stock > 0
    );
  }
  
  return filteredProducts;
}

export function getProduct(id: string): Product | undefined {
  // Buscar nos produtos do localStorage primeiro
  const storedProducts = getProductsFromStorage();
  if (storedProducts && storedProducts.length > 0) {
    const storedProduct = storedProducts.find((product) => product.id === id);
    if (storedProduct) return storedProduct;
  }
  
  // Se não encontrou no localStorage, buscar nos produtos padrão
  return products.find((product) => product.id === id);
}

export function getCategories(): string[] {
  // Buscar categorias dos produtos do localStorage
  const storedProducts = getProductsFromStorage();
  if (storedProducts && storedProducts.length > 0) {
    return Array.from(new Set(storedProducts.map((product) => product.category)));
  }
  
  // Se não encontrou no localStorage, buscar nos produtos padrão
  return Array.from(new Set(products.map((product) => product.category)));
}

export function getTopSellingProducts(limit: number = 5): Product[] {
  // Em um app real, isso seria baseado em dados de vendas
  // Por enquanto, vamos apenas simular produtos populares
  const storedProducts = getProductsFromStorage();
  const productsToUse = storedProducts && storedProducts.length > 0 ? storedProducts : products;
  
  return [...productsToUse]
    .sort((a, b) => b.stock > a.stock ? 1 : -1) // Inverter a lógica para simular popularidade
    .slice(0, limit);
}

export function getProductsInStock(): Product[] {
  const storedProducts = getProductsFromStorage();
  const productsToUse = storedProducts && storedProducts.length > 0 ? storedProducts : products;
  
  return productsToUse.filter((product) => product.stock > 0);
}

export function getLowStockProducts(threshold: number = 10): Product[] {
  const storedProducts = getProductsFromStorage();
  const productsToUse = storedProducts && storedProducts.length > 0 ? storedProducts : products;
  
  return productsToUse.filter((product) => product.stock > 0 && product.stock <= threshold);
}

export function getOutOfStockProducts(): Product[] {
  const storedProducts = getProductsFromStorage();
  const productsToUse = storedProducts && storedProducts.length > 0 ? storedProducts : products;
  
  return productsToUse.filter((product) => product.stock === 0);
}

export default products;
