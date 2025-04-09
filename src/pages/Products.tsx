import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash, PlusCircle, Database } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, getPublicProducts, logCurrentUser } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { importProductsToSupabase } from "@/utils/product-importer";

const productsData = `Açucar (200,00 AOA); Açucar (1 200,00 AOA); Açúcar meio kilo (600,00 AOA); Afia lapis (50,00 AOA); Agrafador (2 000,00 AOA); Água e Sal Bolacha (150,00 AOA); Água e Sal Serranitas Arcor (300,00 AOA); Água Tónica Welwitschia (600,00 AOA); Alimo Margarina 200mg (500,00 AOA); Alimo para barrar Margarina (350,00 AOA); Amalfi (2 500,00 AOA); Amarula Cream (15 000,00 AOA); Amido de milho maizena (2 500,00 AOA); Apagador (500,00 AOA); Arieno (4 000,00 AOA); Armadilha de Rato cola (1 000,00 AOA); Arroz 1kg (700,00 AOA); Arroz Branco 1KG (1 100,00 AOA); Arroz branco meio Kilo 500g (550,00 AOA); Arroz castanho 1 KG (1 000,00 AOA); Arroz castanho meio kilo (500,00 AOA); Astro cola (300,00 AOA); Atum diamante (2 000,00 AOA); Atum Ngusso (1 500,00 AOA); Aveia flocos finos Cereal AL Fina (1 000,00 AOA); Azeite Camponês lata (6 000,00 AOA); Azeitona Pacote (1 300,00 AOA); Azeitona verde Frasco (1 800,00 AOA); Bacardi carta blanca (12 000,00 AOA); Balão (200,00 AOA); Ballantines finest whisky (13 000,00 AOA); Barra de sabão sem nome (250,00 AOA); Base para carregar (1 200,00 AOA); Baton Dukan (300,00 AOA); Bebe e Maman (1 200,00 AOA); Best original Whisky (1 500,00 AOA); Best Whisky (7 500,00 AOA); Bifine Insecticida lata cheotox (1 600,00 AOA); BIG bebida (250,00 AOA); Bill Beef Carne de Vaca (1 800,00 AOA); Biscoito Fresh Fresh (50,00 AOA); Biscoito Kachi (500,00 AOA); Blue (300,00 AOA); Boa mesa 500ml (2 500,00 AOA); Bolacha Água e Sal (50,00 AOA); Bolacha biscoito Kachi (100,00 AOA); Bolacha Biscoitos cacau (150,00 AOA); Bolacha Café cookers (100,00 AOA); Bolacha Choconut Lykon coco (150,00 AOA); Bolacha cremio Lykon (150,00 AOA); Bolacha de Chocolate Kachi (600,00 AOA); Bolacha Football (200,00 AOA); Bolacha Hipopó (300,00 AOA); Bolacha Integral (300,00 AOA); Bolacha Marie Crisp Lykon (100,00 AOA); Bolacha Smile (1 000,00 AOA); Bolacha Strawberry morango Lykon (150,00 AOA); B! Óleo vegetal 1L (2 500,00 AOA); B! Óleo vegetal 700 (1 800,00 AOA); Bon e Bon Garoto (150,00 AOA); Brinco (100,00 AOA); Bucha e parafuso (100,00 AOA); Bufalo grande para sapato (1 000,00 AOA); Bufalo pequeno para sapato (700,00 AOA); Cabo de carregar (1 500,00 AOA); Cabo HDMI (2 500,00 AOA); Cabo USB (2 000,00 AOA); Caderno Grande (400,00 AOA); Caderno pequeno (250,00 AOA); Caldo Jumbo (100,00 AOA); Caldo onga galinha (100,00 AOA); Caldo onga Vaca (100,00 AOA); Campeão (250,00 AOA); Cana Joy (250,00 AOA); Canela (150,00 AOA); Capa de processo (250,00 AOA); Capurroto (500,00 AOA); Carregador (2 500,00 AOA); Carregador Android (500,00 AOA); Carregador da Zap (4 000,00 AOA); Casa Velha Whisky (3 000,00 AOA); Cavalo Branco Vinho (6 000,00 AOA); cereais chocolate Gida choc (1 500,00 AOA); Chave de fenda (1 000,00 AOA); Chefe grande (500,00 AOA); Chocapic chocolate Nestle (3 000,00 AOA); Chocolate em barra Classic (600,00 AOA); Chocolate em barra Travel (350,00 AOA); Chocolate em pó (250,00 AOA); Chouriço corrente Jugais (800,00 AOA); Cigarro Aspen (100,00 AOA); Cigarro LD (50,00 AOA); Cigarro Legenda (50,00 AOA); Cigarro Pall Mall (100,00 AOA); Coca cola (350,00 AOA); Coca cola bidon (500,00 AOA); Coca cola em lata (700,00 AOA); Coco Bronze Óleo de clareador (1 500,00 AOA); Coco Ralado (250,00 AOA); Coco Vodka (750,00 AOA); Cola Bossil (2 500,00 AOA); Cola Bossil Grey Rtv (3 000,00 AOA); Cola Branca (500,00 AOA); Cola Epoxy (1 200,00 AOA); Cola patex (1 000,00 AOA); Cola patex betax (500,00 AOA); Cola Rapida (100,00 AOA); Colgate pasta de dentes (800,00 AOA); Colgate triple action pasta de dente (500,00 AOA); Colgate triple action pasta de dente (1 000,00 AOA); Colher de pedreiro (2 000,00 AOA); Colher de plástico (50,00 AOA); Colher de plástico (25,00 AOA); Comando da Zap (3 000,00 AOA); Comando DSTV (3 000,00 AOA); Compal em lata (600,00 AOA); Condicionador Sikhnees (1 500,00 AOA); Conjunto dobradiça e maçaneta (5 000,00 AOA); Conjunto Marcadores e apagador (1 500,00 AOA); Copo para antena (6 500,00 AOA); Cordão para Crachá (100,00 AOA); Corda para estender fio 10m (1 000,00 AOA); Corda para estender fio 15 metros (1 500,00 AOA); Cores de Agua 12 (900,00 AOA); Cotonetes (150,00 AOA); Cowbell Vitalico pacotes (100,00 AOA); Creme corporal Bon Fami (1 000,00 AOA); Creme corporal Familia (1 500,00 AOA); Dado (150,00 AOA); Delineador lápis (250,00 AOA); Disco (1 000,00 AOA); Disco para betão e concreto (2 000,00 AOA); Dobradiça para porta (1 500,00 AOA); Dragão para Befine (100,00 AOA); Electroides (250,00 AOA); Embalagem (400,00 AOA); Embalagem de gelado (600,00 AOA); Encosta da Aldeia Vinho (4 000,00 AOA); Envelope (150,00 AOA); Ervilhas em lata Veli (1 200,00 AOA); Escova de plastico para roupa (350,00 AOA); Escova fina para cabelo (350,00 AOA); Esfregão fino (50,00 AOA); Esfregão grosso (50,00 AOA); Esqueiro (200,00 AOA); Faca de cozinha (800,00 AOA); Fanta em Lata (600,00 AOA); Farinha de Musseque farinha de Mandioca (100,00 AOA); Farinha de trigo Tio Lucas (1 000,00 AOA); Fast vodka (500,00 AOA); Fechadura (6 500,00 AOA); Feijão amarelo 1KG (1 700,00 AOA); Feijão Branco Rosanna (1 500,00 AOA); Feijão Catarina 1KG (1 600,00 AOA); Feijão Espera cunhado 1KG (1 600,00 AOA); Feijão Macundi 1KG (1 500,00 AOA); Feijão preto 1KG (1 700,00 AOA); Femea para tomada (700,00 AOA); Femea para tomada (1 000,00 AOA); Fermento de Bolo La Granda (400,00 AOA); Fermento de Pão Boker dream (2 500,00 AOA); Fermento de Pão embalado (100,00 AOA); Festa bebida (350,00 AOA); Ficha tripla (5 000,00 AOA); Fita Cola (800,00 AOA); Fitacola pequena (250,00 AOA); Fita exoladora (500,00 AOA); Fofo sabonete (250,00 AOA); Folha A4 (25,00 AOA); Fones de Ouvido Auscutadores (1 000,00 AOA); Forro para presente (250,00 AOA); Forro para presente (250,00 AOA); Fraldas para Bebé (100,00 AOA); Fresh quick Café original (150,00 AOA); Fuba de milho amarelo 1KG (600,00 AOA); Fuba milho 1 kilo (300,00 AOA); Gasosa cola (300,00 AOA); Germol sabonete (500,00 AOA); Gilete para barbear (150,00 AOA); Gin (750,00 AOA); GIN (300,00 AOA); Gingordons (1 000,00 AOA); GIN Gordons (7 000,00 AOA); Giz para quadro (50,00 AOA); Glucose bolacha (50,00 AOA); Grampo para cable clips (600,00 AOA); Granpos para Agrafadores (500,00 AOA); Grão de Bico Crizen (1 500,00 AOA); Guardanapo mimo do Bebé (1 000,00 AOA); Guardanapo Suave (500,00 AOA); Indica (2 000,00 AOA); Indica (4 000,00 AOA); Indica (750,00 AOA); Johnnie Walker red label whisky (16 000,00 AOA); JP Azeitão Vinho (6 000,00 AOA); Justice League Champaes infantil (5 000,00 AOA); Kizomba Café rum (300,00 AOA); Kombucha inyamo (600,00 AOA); Laço vermelho Champanhes J-c-le Roux (9 000,00 AOA); Lámina para cabelo Dorco (100,00 AOA); Lampada amarela (300,00 AOA); Lampada branca J torch (1 200,00 AOA); Lampada Led (3 000,00 AOA); Lampada Led J torch (1 500,00 AOA); Lampada Led sol lâmpadas (2 500,00 AOA); Lanterna a pilha (1 000,00 AOA); Lanterna a pilha (2 000,00 AOA); Lápis de cor lapis (250,00 AOA); Lapiseira Bravo (100,00 AOA); Lapis Lápis (50,00 AOA); Leite condensado Delicia (3 500,00 AOA); Leite condensado Kiame (1 000,00 AOA); Leite condensado Kiame (1 200,00 AOA); Leite Condensado Moça (2 500,00 AOA); Leite meio gordo Nutrias (1 000,00 AOA); Lima de borracha fina e grossa (300,00 AOA); Lima fina de ferro (250,00 AOA); Linha Brasileira (150,00 AOA); Linha de custura (150,00 AOA); Lixivia Ama (600,00 AOA); Loya Leite pacote (3 000,00 AOA); Lulu Sumo 12 frutas (1 500,00 AOA); Lulu Sumo Goiaba (1 500,00 AOA); Lulu Sumo manga (1 500,00 AOA); Maionese Delicia mayonese (150,00 AOA); Maionese mebon pacotes mayonese (100,00 AOA); Manteiga (500,00 AOA); Manteiga Voila (750,00 AOA); Marcador (300,00 AOA); Margarina Alimo (450,00 AOA); Massa de tomate pacote (150,00 AOA); Massa de tumate em lata (200,00 AOA); Massa Espagueti Alice (350,00 AOA); Massa macarrão Gracia (500,00 AOA); Massa spagueti Gracia 350g (400,00 AOA); Mayonese Delicia (3 000,00 AOA); Mayonese Mebon (2 500,00 AOA); Mentol Super Fresh (100,00 AOA); Mil Caminhos (4 500,00 AOA); Milho doce Gold (1 500,00 AOA); Mix de vegetais macedonia em lata Veli (1 200,00 AOA); Mixwell leite em pó (60,00 AOA); Moinhos Vinho (2 800,00 AOA); Molas para roupa (750,00 AOA); Montex Carne de porco em lata (1 600,00 AOA); Montex carne de vaca em lata (1 800,00 AOA); Mortandela (100,00 AOA); Natas Mimosa (2 000,00 AOA); Nestum Nestle papa (300,00 AOA); Nivel (2 500,00 AOA); Nivia Dry Impact (2 500,00 AOA); Nkolo Mboka (800,00 AOA); Nutri Sumo (2 000,00 AOA); Óleo (200,00 AOA); Óleo de palma lata (5 000,00 AOA); Óleo embalado 1L (4 000,00 AOA); Óleo embalado 250ml (500,00 AOA); Óleo embalado 350ml (1 000,00 AOA); Óleo Fula (3 000,00 AOA); Óleo natural corporal Bonita (700,00 AOA); Omo Fasclean (300,00 AOA); Omo lava (50,00 AOA); Omo Lava (500,00 AOA); Omo Lava (100,00 AOA); Omo tudo Limpo (300,00 AOA); Ovo (200,00 AOA); Palanca Negra (750,00 AOA); Palinhas para beber (50,00 AOA); Palitos de dente (200,00 AOA); Pão ralado (150,00 AOA); Papel aderente Alumínio (1 500,00 AOA); Papel aderente plastico (1 500,00 AOA); Pastilha (100,00 AOA); Pastilha Gorila (100,00 AOA); Pastilha OKO (50,00 AOA); Pente fino (100,00 AOA); Pente Grosso (250,00 AOA); Pias Vinho (5 000,00 AOA); Pilha (1 000,00 AOA); Pilha (1 000,00 AOA); Pilha Alcalina (500,00 AOA); Pircing piercing brinco (300,00 AOA); Planeta cola (200,00 AOA); Plasticina (750,00 AOA); Pó Canderm (700,00 AOA); Pó Rox (700,00 AOA); Porta da Tapada (4 500,00 AOA); Powerbull (200,00 AOA); Power enegético (1 200,00 AOA); Professor Super Grain whisky (5 000,00 AOA); Próma Café (100,00 AOA); Punho para cabelo (75,00 AOA); Quadro retrato (2 500,00 AOA); Redbull (2 000,00 AOA); Rede de Banho (1 000,00 AOA); Regal leite (250,00 AOA); Regua escolar (400,00 AOA); Relvas Vinho (4 500,00 AOA); Sabão em liquido Faz (650,00 AOA); Saco Azul (600,00 AOA); Saco Papa Ngulo (150,00 AOA); Saco Papa Ngulo Pequeno (50,00 AOA); Saco preto viva (100,00 AOA); Saldo Africell (200,00 AOA); Saldo da Africell (500,00 AOA); Saldo da Unitel (500,00 AOA); Saldo da Unitel (200,00 AOA); Sal fino (150,00 AOA); Salsicha pacote (100,00 AOA); Salsichas em lata Sicasal (2 200,00 AOA); Sambapito Oko Chupachupa (100,00 AOA); Sangria Tropicana (2 500,00 AOA); Sardinha em lata Ngusso (1 000,00 AOA); Sardinha Star (1 000,00 AOA); Sardinha Vitello (800,00 AOA); Silicone (4 000,00 AOA); Silk sabonete (300,00 AOA); Smirnoff Guarana (1 500,00 AOA); Smirnoff Ice (1 000,00 AOA); Soda (100,00 AOA); Speed em lata (700,00 AOA); Sprite em lata (600,00 AOA); Spritex Insecticida cheotox insect killer (2 000,00 AOA); Suave Absorvente (600,00 AOA); Subaru (500,00 AOA); Sumo em pó Foster Clarks (400,00 AOA); Sumo Fresh Quick (100,00 AOA); Sumo Palinha Junior (100,00 AOA); Sumo palinha Lulu (200,00 AOA); Sumo palinha regal (100,00 AOA); Superblack (900,00 AOA); Suporte de plastico para lampada (250,00 AOA); Suporte para lampada (600,00 AOA); Suporte para lampada (300,00 AOA); Talocha Prancha de cimentar (2 000,00 AOA); Tcb deflise (1 000,00 AOA); Tempero Boa mesa 1L (3 500,00 AOA); Terra da Chela Branco (3 000,00 AOA); Terra da Chela Tinto pequeno (750,00 AOA); Terra da chela Vinho (3 000,00 AOA); Tesoura (300,00 AOA); Texana carne de Vaca em lata (2 000,00 AOA); Thirllz energético bidon (350,00 AOA); Toca para cabelo (50,00 AOA); Top para cabelo (500,00 AOA); Ultra sabão barra (300,00 AOA); Unhas de plástico (250,00 AOA); Vela de aniversário (500,00 AOA); Vela grande (150,00 AOA); Vela pequena (100,00 AOA); Veneno de rato Ratox (300,00 AOA); Vinagre Elisabeth 500ml (300,00 AOA); Vinagre Ngusso 1L (600,00 AOA); Vinho Fresco (700,00 AOA); Vinho tinto festa da vida (2 000,00 AOA); Vinho tinto Fresco (2 000,00 AOA); Vinho tinto Paco pacote (2 200,00 AOA); Vique (150,00 AOA); Vodca coco (300,00 AOA); Voila Margarina (750,00 AOA); Yala Ananaz (300,00 AOA); Yala Cola (300,00 AOA); Yala Laranja (300,00 AOA); Yala limão (300,00 AOA); Yolo (400,00 AOA); Yummy Bolacha (100,00 AOA); Zip (250,00 AOA)`;

const Products = () => {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("store");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportButton, setShowImportButton] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: userProductsData, isLoading: isLoadingUserProducts, error: userProductsError, refetch: refetchUserProducts } = useQuery({
    queryKey: ['userProducts'],
    queryFn: async () => {
      console.log("Fetching user products...");
      await logCurrentUser();
      
      if (!user) {
        console.error("No user found when trying to fetch products");
        throw new Error("You must be logged in to view products");
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) {
        console.error("Error fetching user products:", error);
        throw error;
      }
      
      console.log("User products fetched:", data);
      return data as Product[];
    },
    enabled: !!user,
  });

  const { data: publicProductsData, isLoading: isLoadingPublicProducts, error: publicProductsError } = useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => {
      console.log("Fetching public products...");
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_public', true)
        .order('name');
      
      if (error) {
        console.error("Error fetching public products:", error);
        throw error;
      }
      
      console.log("Public products fetched:", data);
      return data as Product[];
    }
  });

  useEffect(() => {
    if (userProductsData) {
      setUserProducts(userProductsData);
    }
  }, [userProductsData]);

  useEffect(() => {
    if (publicProductsData) {
      setPublicProducts(publicProductsData);
    }
  }, [publicProductsData]);

  useEffect(() => {
    if (user?.email === "admin@example.com" || user?.email === "demo@example.com") {
      setShowImportButton(true);
    }
  }, [user]);

  const filteredProducts = (activeTab === "store" ? publicProducts : userProducts).filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToStock = async (product: Product) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos ao estoque");
      return;
    }

    const existingProduct = userProducts.find(p => 
      p.name === product.name && 
      p.category === product.category
    );

    if (existingProduct) {
      toast.error("Este produto já existe no seu estoque");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        stock: 10,
        description: product.description || '',
        code: product.code || '',
        image: product.image || "/placeholder.svg",
        user_id: user.id,
        is_public: false
      };

      console.log("Adding product to stock:", newProduct);

      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) {
        console.error("Error details when adding to stock:", error);
        throw error;
      }

      console.log("Product added to stock successfully:", insertedProduct);
      toast.success("Produto adicionado ao seu estoque com sucesso!");
      
      refetchUserProducts();
      
      setActiveTab("my-products");
    } catch (error: any) {
      console.error("Detailed error adding product to stock:", error);
      toast.error(`Erro ao adicionar produto ao estoque: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (data: ProductFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Adding product with user_id:", user.id);
      console.log("Product data:", {
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
        description: data.description || null,
        code: data.code || null,
        image: data.image || "/placeholder.svg",
        user_id: user.id
      });

      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description || null,
          code: data.code || null,
          image: data.image || "/placeholder.svg",
          user_id: user.id
        }])
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Product added successfully:", insertedProduct);
      toast.success("Produto adicionado com sucesso!");
      refetchUserProducts();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error("Detailed error adding product:", error);
      toast.error(`Erro ao adicionar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: ProductFormValues) => {
    if (!editingProduct || !user) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description || null,
          code: data.code || null,
          image: data.image || "/placeholder.svg",
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success("Produto atualizado com sucesso!");
      refetchUserProducts();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
      console.error("Erro ao atualizar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Produto excluído com sucesso!");
      refetchUserProducts();
    } catch (error: any) {
      toast.error(`Erro ao excluir produto: ${error.message}`);
      console.error("Erro ao excluir produto:", error);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleImportProducts = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para importar produtos");
      return;
    }
    
    try {
      setIsImporting(true);
      await importProductsToSupabase(productsData);
      toast.success("Produtos importados com sucesso!");
      
      refetchUserProducts();
      setShowImportButton(false);
    } catch (error: any) {
      console.error("Error importing products:", error);
      toast.error(`Erro ao importar produtos: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoadingUserProducts && activeTab === "my-products") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando produtos...</p>
        </div>
      </MainLayout>
    );
  }

  if (userProductsError && activeTab === "my-products") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar produtos: {(userProductsError as Error).message}</p>
            <Button onClick={() => refetchUserProducts()} className="mt-2">Tentar novamente</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoadingPublicProducts && activeTab === "store") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando produtos da loja...</p>
        </div>
      </MainLayout>
    );
  }

  if (publicProductsError && activeTab === "store") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar produtos da loja: {(publicProductsError as Error).message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Produtos</h1>
            
            <div className="flex gap-2">
              {showImportButton && (
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={handleImportProducts}
                  disabled={isImporting}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isImporting ? "Importando..." : "Importar Produtos"}
                </Button>
              )}
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {!isMobile && "Adicionar Produto"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do produto e clique em salvar.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="store">Loja de Produtos</TabsTrigger>
                  <TabsTrigger value="my-products">Meus Produtos</TabsTrigger>
                </TabsList>

                <CardTitle>
                  {activeTab === "store" ? "Loja de Produtos" : "Meus Produtos"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "store" 
                    ? "Adicione produtos da loja ao seu estoque." 
                    : "Gerencie os produtos disponíveis no seu estoque."}
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou categoria..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="store" className="mt-0">
                    {isMobile ? (
                      <div className="grid gap-4">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            {publicProducts.length === 0
                              ? "Nenhum produto disponível na loja."
                              : "Nenhum produto encontrado com os critérios de busca."}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <Card key={product.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{product.name}</h3>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      {product.code || "Sem código"} • {product.category}
                                    </div>
                                    <div className="font-medium">{formatCurrency(product.price)}</div>
                                  </div>
                                  <Button 
                                    onClick={() => addToStock(product)}
                                    disabled={isSubmitting}
                                    size="sm"
                                  >
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    Adicionar ao estoque
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Nome</th>
                            <th className="px-4 py-2 text-left">Código</th>
                            <th className="px-4 py-2 text-left">Categoria</th>
                            <th className="px-4 py-2 text-left">Preço</th>
                            <th className="px-4 py-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                {publicProducts.length === 0
                                  ? "Nenhum produto disponível na loja."
                                  : "Nenhum produto encontrado com os critérios de busca."}
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-2">{product.name}</td>
                                <td className="px-4 py-2">{product.code || "-"}</td>
                                <td className="px-4 py-2">{product.category}</td>
                                <td className="px-4 py-2">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-2 text-right">
                                  <Button 
                                    onClick={() => addToStock(product)}
                                    disabled={isSubmitting}
                                    size="sm"
                                    variant="secondary"
                                  >
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    Adicionar ao estoque
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="my-products" className="mt-0">
                    {isMobile ? (
                      <div className="grid gap-4">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            {userProducts.length === 0
                              ? "Nenhum produto no seu estoque. Adicione produtos da loja ou crie um novo produto."
                              : "Nenhum produto encontrado com os critérios de busca."}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <Card key={product.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{product.name}</h3>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      {product.code || "Sem código"} • {product.category}
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                      <div className="font-medium">{formatCurrency(product.price)}</div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          product.stock === 0
                                            ? "bg-red-100 text-red-700"
                                            : product.stock < 10
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                      >
                                        {product.stock} un
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(product)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirmar exclusão
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o produto "{product.name}"?
                                            Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Nome</th>
                            <th className="px-4 py-2 text-left">Código</th>
                            <th className="px-4 py-2 text-left">Categoria</th>
                            <th className="px-4 py-2 text-left">Preço</th>
                            <th className="px-4 py-2 text-left">Estoque</th>
                            <th className="px-4 py-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                {userProducts.length === 0
                                  ? "Nenhum produto no seu estoque. Adicione produtos da loja ou crie um novo produto."
                                  : "Nenhum produto encontrado com os critérios de busca."}
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-2">{product.name}</td>
                                <td className="px-4 py-2">{product.code || "-"}</td>
                                <td className="px-4 py-2">{product.category}</td>
                                <td className="px-4 py-2">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      product.stock === 0
                                        ? "bg-red-100 text-red-700"
                                        : product.stock < 10
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {product.stock} un
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(product)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirmar exclusão
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o produto "{product.name}"?
                                            Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              onSubmit={handleEditProduct}
              defaultValues={editingProduct}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;
