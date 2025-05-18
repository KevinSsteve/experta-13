
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { createDefaultProduct } from "@/utils/product-helpers";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para o dashboard quando estiver logado
    if (user) {
      navigate("/dashboard");
      
      // Criar o produto padrão quando o usuário estiver logado
      if (user.id) {
        createDefaultProduct(user.id)
          .then(product => {
            if (product) {
              console.log("Produto padrão criado ou verificado:", product);
            }
          })
          .catch(error => {
            console.error("Erro ao criar produto padrão:", error);
          });
      }
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Moloja</h1>
        <p>Por favor, faça login para acessar o sistema.</p>
      </div>
    </MainLayout>
  );
}
