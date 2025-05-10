
import { supabase } from '@/integrations/supabase/client';

// Tipo para definir um produto de carne
type MeatProduct = {
  name: string;
  phonetic_variations: string[];
  description: string;
  category: string;
  purchase_price: number;
  price: number;
  stock: number;
};

// Função para importar produtos de carne diretamente para product_backups
export async function importMeatProducts(): Promise<void> {
  try {
    console.log("Iniciando importação de produtos de carne...");
    
    // Lista de produtos de carne conforme especificado
    const meatProducts: MeatProduct[] = [
      {
        name: "1 kilo de Tibone",
        phonetic_variations: ["Tiboni", "Tchibone", "Tibon"],
        description: "Tibone de boi, ideal para caldos e cozidos",
        category: "Bovino",
        purchase_price: 3500,
        price: 6500,
        stock: 15
      },
      {
        name: "1 kilo de Bife",
        phonetic_variations: ["Bife de boy", "Bifi", "Bife de vaca"],
        description: "Bife bovino para grelhar ou fritar",
        category: "Bovino",
        purchase_price: 3500,
        price: 6500,
        stock: 20
      },
      {
        name: "1 kilo de Picanha",
        phonetic_variations: ["Picanha de boy", "Pikaña", "Picanha premium"],
        description: "Corte nobre para churrasco, com capa de gordura",
        category: "Bovino",
        purchase_price: 4500,
        price: 8000,
        stock: 8
      },
      {
        name: "1 kilo de Lombinho",
        phonetic_variations: ["Lombinho de boi", "Lombiño", "Lombinhu"],
        description: "Lombinho suculento, perfeito para assar",
        category: "Bovino",
        purchase_price: 4500,
        price: 8000,
        stock: 10
      },
      {
        name: "1 kilo de Lombo",
        phonetic_variations: ["Lombo de boy", "Lombu", "Lombo inteiro"],
        description: "Lombo bovino macio, versátil para vários pratos",
        category: "Bovino",
        purchase_price: 4000,
        price: 7500,
        stock: 12
      },
      {
        name: "1 kilo de Alcatra",
        phonetic_variations: ["Alcatra de boy", "Alcatraa", "Alcatra premium"],
        description: "Corte macio e saboroso, ideal para bifes",
        category: "Bovino",
        purchase_price: 3500,
        price: 6500,
        stock: 10
      },
      {
        name: "1 kilo de Carne Moída",
        phonetic_variations: ["Carne moida", "Carni moída", "Moída de boy"],
        description: "Carne moída bovina para hambúrgueres ou molhos",
        category: "Bovino",
        purchase_price: 3500,
        price: 6500,
        stock: 25
      },
      {
        name: "1 kilo de Carne para Guizar",
        phonetic_variations: ["Carne pra guizar", "Guisado", "Carne de panela"],
        description: "Carne bovina para estufados e guisados",
        category: "Bovino",
        purchase_price: 3000,
        price: 6000,
        stock: 18
      },
      {
        name: "1 kilo de Costela",
        phonetic_variations: ["Costela de boy", "Costella", "Costela de vaca"],
        description: "Costela bovina para churrasco ou cozinhar",
        category: "Bovino",
        purchase_price: 2500,
        price: 5000,
        stock: 15
      },
      {
        name: "1 kilo de Peito Alto",
        phonetic_variations: ["Peito de boy", "Peito bovino", "Peito gordo"],
        description: "Peito bovino com gordura, bom para cozinhar",
        category: "Bovino",
        purchase_price: 2500,
        price: 5000,
        stock: 12
      },
      {
        name: "1 kilo de Carne com Osso",
        phonetic_variations: ["Carne c/ osso", "Carne osso boy", "Carne para sopa"],
        description: "Carne bovina com osso, ideal para sopas",
        category: "Bovino",
        purchase_price: 2000,
        price: 4500,
        stock: 20
      },
      {
        name: "1 kilo de Osso Buco",
        phonetic_variations: ["Osso buco de boy", "Osso buko", "Osso buco premium"],
        description: "Osso buco para pratos especiais e cozidos",
        category: "Bovino",
        purchase_price: 2000,
        price: 4500,
        stock: 10
      },
      {
        name: "1 kilo de Fígado",
        phonetic_variations: ["Figado de boy", "Figadu", "Fígado bovino"],
        description: "Fígado bovino rico em ferro, para guisados",
        category: "Miúdos",
        purchase_price: 2000,
        price: 4500,
        stock: 15
      },
      {
        name: "1 kilo de Miodesa",
        phonetic_variations: ["Miodesa de boy", "Miodesa bovina", "Miodesa gorda"],
        description: "Miodesa bovina, saborosa e nutritiva",
        category: "Miúdos",
        purchase_price: 1500,
        price: 3500,
        stock: 10
      },
      {
        name: "1 kilo de Dobrada",
        phonetic_variations: ["Dobrada de boy", "Dobrada bovina", "Dobrada fresca"],
        description: "Dobrada bovina para pratos tradicionais",
        category: "Miúdos",
        purchase_price: 2000,
        price: 4000,
        stock: 12
      },
      {
        name: "1 kilo de Osso para Sopa",
        phonetic_variations: ["Osso boy sopa", "Ossu para sopa", "Osso canhoto"],
        description: "Ossos bovinos para caldos e sopas nutritivas",
        category: "Bovino",
        purchase_price: 1000,
        price: 2500,
        stock: 30
      },
      {
        name: "1 kilo de Mocoto",
        phonetic_variations: ["Mocoto de boy", "Mocotu", "Mocoto bovino"],
        description: "Mocoto bovino para pratos tradicionais",
        category: "Bovino",
        purchase_price: 2000,
        price: 4000,
        stock: 10
      },
      {
        name: "Cabeça de Boy",
        phonetic_variations: ["Cabeça de boi", "Cabeça bovina", "Cabeça inteira"],
        description: "Cabeça de boi completa, para pratos especiais",
        category: "Bovino",
        purchase_price: 12000,
        price: 22000,
        stock: 5
      }
    ];
    
    // Preparar os dados para inserção no banco de dados
    const productsToInsert = meatProducts.map(product => {
      return {
        name: product.name,
        price: product.price,
        purchase_price: product.purchase_price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        // Armazenar variações fonéticas na descrição ou em um campo específico
        code: product.phonetic_variations.join(', '),
        is_active: true,
        is_public: true
      };
    });
    
    console.log(`Preparados ${productsToInsert.length} produtos para importação`);
    
    // Inserir produtos na tabela product_backups
    const { data, error } = await supabase
      .from('product_backups')
      .insert(productsToInsert)
      .select();
    
    if (error) {
      console.error("Erro ao importar produtos de carne:", error);
      throw error;
    }
    
    console.log(`Importados com sucesso ${data?.length || 0} produtos de carne`);
    return;
    
  } catch (error) {
    console.error("Erro durante importação de produtos de carne:", error);
    throw error;
  }
}
