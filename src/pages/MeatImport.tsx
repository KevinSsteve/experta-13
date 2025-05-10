
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { importMeatProducts } from "@/utils/meat-products-importer";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MeatImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Verificar quantos produtos já existem na tabela de backup
  useEffect(() => {
    const checkImportedProducts = async () => {
      try {
        setIsLoading(true);
        const { count, error } = await supabase
          .from('product_backups')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        setImportedCount(count || 0);
        
        // Buscar as categorias únicas
        const { data: products, error: catError } = await supabase
          .from('product_backups')
          .select('category');
          
        if (catError) throw catError;
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (error: any) {
        console.error("Erro ao verificar produtos:", error);
        toast.error(`Erro ao verificar produtos: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkImportedProducts();
  }, []);
  
  const handleImport = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para importar produtos");
      return;
    }
    
    try {
      setIsImporting(true);
      await importMeatProducts();
      
      // Atualizar o contador
      const { count, error } = await supabase
        .from('product_backups')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setImportedCount(count || 0);
      
      // Atualizar categorias
      const { data: products, error: catError } = await supabase
        .from('product_backups')
        .select('category');
        
      if (catError) throw catError;
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      setCategories(uniqueCategories);
      
      toast.success("Produtos de carne importados com sucesso!");
    } catch (error: any) {
      console.error("Erro ao importar produtos:", error);
      toast.error(`Erro ao importar produtos: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Importação de Produtos de Carne</CardTitle>
            <CardDescription>
              Gerencie a importação de produtos de carne para o banco de dados de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : importedCount && importedCount > 0 ? (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <AlertTitle>Produtos já importados</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Existem atualmente <strong>{importedCount}</strong> produtos de carne no banco de dados de backup.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {categories.map((category) => (
                        <Badge key={category} variant="outline">{category}</Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-sm">
                      Estes produtos já estão disponíveis na página de Sugestões. Você pode importar novamente se desejar atualizar os dados.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <InfoIcon className="h-5 w-5" />
                  <AlertTitle>Nenhum produto importado</AlertTitle>
                  <AlertDescription>
                    Não existem produtos de carne no banco de dados de backup. Clique no botão abaixo para importar.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-muted-foreground">
                Esta operação importará 18 produtos de carne com suas variações fonéticas, descrições, 
                preços e quantidades em estoque. Os produtos serão adicionados à tabela de backup 
                e estarão disponíveis na página de sugestões.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleImport} 
              disabled={isImporting || isLoading}
              className="w-full sm:w-auto"
            >
              {isImporting 
                ? "Importando..." 
                : importedCount && importedCount > 0 
                  ? "Importar Novamente" 
                  : "Importar Produtos de Carne"
              }
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MeatImport;
