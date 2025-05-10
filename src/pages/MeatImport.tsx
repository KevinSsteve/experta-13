
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { importMeatProducts } from "@/utils/meat-products-importer";

const MeatImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();
  
  const handleImport = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para importar produtos");
      return;
    }
    
    try {
      setIsImporting(true);
      await importMeatProducts();
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
              Importe a lista pré-definida de produtos de carne para o banco de dados de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Esta operação importará 18 produtos de carne com suas variações fonéticas, descrições, 
                preços e quantidades em estoque. Os produtos serão adicionados à tabela de backup 
                e estarão disponíveis na página de sugestões.
              </p>
              
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full sm:w-auto"
              >
                {isImporting ? "Importando..." : "Importar Produtos de Carne"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MeatImport;
