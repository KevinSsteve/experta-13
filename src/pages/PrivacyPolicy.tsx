import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Política de Privacidade - Experta";
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Política de privacidade da Experta. Como coletamos, usamos e protegemos os seus dados pessoais em conformidade com a legislação angolana e internacional.");
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </header>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Introdução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>A Experta ("nós", "nosso", "nossa") respeita a sua privacidade e está comprometida em proteger os seus dados pessoais. Esta política explica como coletamos, usamos e protegemos as suas informações quando utiliza o nosso website e serviços.</p>
                <p>Esta política está em conformidade com:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Lei de Proteção de Dados Pessoais de Angola (quando aprovada)</li>
                  <li>Regulamento Geral sobre a Proteção de Dados (RGPD/GDPR) da União Europeia</li>
                  <li>Princípios internacionais de proteção de dados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Dados que Coletamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">2.1 Dados fornecidos diretamente por si:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nome e informações de contato</li>
                  <li>Dados de registo e acesso à conta</li>
                  <li>Informações comerciais que escolhe partilhar</li>
                  <li>Comunicações connosco</li>
                </ul>

                <h4 className="font-semibold">2.2 Dados coletados automaticamente:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dados de utilização do website (páginas visitadas, tempo de permanência)</li>
                  <li>Informações técnicas (endereço IP, tipo de browser, dispositivo)</li>
                  <li>Dados de localização geral (país, cidade)</li>
                </ul>

                <h4 className="font-semibold">2.3 Dados de voz:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gravações de voz processadas localmente no seu dispositivo</li>
                  <li>Apenas texto transcrito é enviado para os nossos servidores</li>
                  <li>Nenhuma gravação de áudio é armazenada nos nossos servidores</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Como Usamos os Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Utilizamos os seus dados para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e melhorar os nossos serviços</li>
                  <li>Processar transações e pedidos</li>
                  <li>Comunicar consigo sobre os serviços</li>
                  <li>Personalizar a sua experiência</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Proteger contra fraude e abuso</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Base Legal para Processamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Processamos os seus dados com base em:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Consentimento:</strong> Para comunicações de marketing e análises avançadas</li>
                  <li><strong>Execução de contrato:</strong> Para fornecer os serviços solicitados</li>
                  <li><strong>Interesse legítimo:</strong> Para melhorar serviços e segurança</li>
                  <li><strong>Obrigação legal:</strong> Para cumprir requisitos regulamentares</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Partilha de Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Não vendemos os seus dados pessoais. Podemos partilhar dados limitados com:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecedores de serviços que nos ajudam a operar (com contratos de proteção de dados)</li>
                  <li>Parceiros comerciais (apenas com o seu consentimento explícito)</li>
                  <li>Autoridades legais quando exigido por lei</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Segurança dos Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Implementamos medidas técnicas e organizacionais apropriadas:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encriptação de dados em trânsito e em repouso</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Auditorias de segurança regulares</li>
                  <li>Processamento local de dados de voz</li>
                  <li>Servidores localizados em jurisdições com proteção adequada</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Os Seus Direitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
                  <li><strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</li>
                  <li><strong>Apagamento:</strong> Solicitar a eliminação dos seus dados</li>
                  <li><strong>Limitação:</strong> Restringir o processamento dos seus dados</li>
                  <li><strong>Portabilidade:</strong> Receber os seus dados em formato estruturado</li>
                  <li><strong>Oposição:</strong> Opor-se ao processamento baseado em interesse legítimo</li>
                  <li><strong>Retirada de consentimento:</strong> A qualquer momento</li>
                </ul>
                <p className="mt-4">Para exercer estes direitos, contacte-nos através de: privacy@experta.ao</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Retenção de Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Retemos os seus dados apenas pelo tempo necessário para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer os serviços solicitados</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Resolver disputas e fazer cumprir acordos</li>
                </ul>
                <p>Quando eliminar a sua conta, os seus dados serão removidos dentro de 30 dias, exceto quando requerido por lei.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Transferências Internacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Se transferirmos os seus dados para fora de Angola, garantimos proteção adequada através de:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Decisões de adequação da Comissão Europeia</li>
                  <li>Cláusulas contratuais padrão</li>
                  <li>Certificações de proteção adequada</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Cookies e Tecnologias Similares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Utilizamos cookies essenciais para o funcionamento do website e cookies analíticos (apenas com consentimento) para melhorar a experiência do utilizador.</p>
                <p>Pode gerir as suas preferências de cookies nas configurações do seu browser.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Para questões sobre esta política ou os seus dados pessoais:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> privacy@experta.ao</li>
                  <li><strong>WhatsApp:</strong> +244 924 000 171</li>
                  <li><strong>Endereço:</strong> Luanda, Angola</li>
                </ul>
                <p>Tem também o direito de apresentar uma queixa à autoridade de proteção de dados competente.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Alterações a Esta Política</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Podemos atualizar esta política ocasionalmente. Notificaremos sobre alterações significativas através do website ou email. A continuação do uso dos serviços após alterações constitui aceitação da política revista.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}