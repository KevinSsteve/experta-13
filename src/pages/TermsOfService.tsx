import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Termos de Serviço - Experta";
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Termos de serviço da Experta. Condições de uso da nossa plataforma de gestão financeira por voz para comerciantes em Angola.");
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Termos de Serviço</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </header>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Aceitação dos Termos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Ao aceder e utilizar a plataforma Experta ("Serviço"), concorda em ficar vinculado por estes Termos de Serviço ("Termos"). Se não concordar com qualquer parte destes termos, não deve utilizar o nosso serviço.</p>
                <p>Estes termos aplicam-se a todos os utilizadores do serviço, incluindo visitantes, utilizadores registados e comerciantes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Descrição do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>A Experta é uma plataforma de gestão financeira por voz que permite:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Registo de vendas e despesas através de comandos de voz</li>
                  <li>Geração automática de relatórios financeiros</li>
                  <li>Análise de dados comerciais com inteligência artificial</li>
                  <li>Acompanhamento de indicadores de performance do negócio</li>
                </ul>
                <p>O serviço está disponível como Progressive Web App (PWA) e funciona online e offline.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Elegibilidade e Registo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">3.1 Requisitos de Idade:</h4>
                <p>Deve ter pelo menos 18 anos ou a idade de maioridade na sua jurisdição para utilizar este serviço.</p>
                
                <h4 className="font-semibold">3.2 Informações de Registo:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Deve fornecer informações precisas e completas</li>
                  <li>É responsável por manter as informações atualizadas</li>
                  <li>Deve proteger a confidencialidade da sua conta</li>
                  <li>É responsável por todas as atividades na sua conta</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Uso Aceitável</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">4.1 Utilizações Permitidas:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gestão financeira de negócios legítimos</li>
                  <li>Registo de transações comerciais reais</li>
                  <li>Geração de relatórios para fins comerciais</li>
                </ul>

                <h4 className="font-semibold">4.2 Utilizações Proibidas:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Atividades ilegais ou fraudulentas</li>
                  <li>Violação de direitos de propriedade intelectual</li>
                  <li>Tentativas de comprometer a segurança do sistema</li>
                  <li>Uso para fins não comerciais em grande escala</li>
                  <li>Revenda ou redistribuição do serviço sem autorização</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Propriedade Intelectual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">5.1 Propriedade da Experta:</h4>
                <p>O serviço, incluindo software, design, texto, gráficos e marcas registadas, é propriedade da Experta e está protegido por leis de direitos autorais e propriedade intelectual.</p>

                <h4 className="font-semibold">5.2 Seus Dados:</h4>
                <p>Mantém a propriedade de todos os dados comerciais que insere no sistema. Concede-nos uma licença limitada para processar estes dados para fornecer o serviço.</p>

                <h4 className="font-semibold">5.3 Feedback:</h4>
                <p>Qualquer feedback, sugestão ou ideia que nos forneça pode ser utilizada livremente pela Experta sem compensação.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Pagamentos e Reembolsos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">6.1 Planos de Preços:</h4>
                <p>Oferecemos versões gratuitas e pagas do serviço. Os preços estão disponíveis no nosso website e podem ser alterados com aviso prévio de 30 dias.</p>

                <h4 className="font-semibold">6.2 Pagamentos:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Os pagamentos são processados em Kwanzas Angolanos (AOA)</li>
                  <li>Os pagamentos são devidos antecipadamente</li>
                  <li>A falta de pagamento pode resultar na suspensão do serviço</li>
                </ul>

                <h4 className="font-semibold">6.3 Reembolsos:</h4>
                <p>Oferecemos reembolsos dentro de 30 dias da compra se não estiver satisfeito com o serviço, sujeito a análise caso a caso.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Privacidade e Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, que faz parte integrante destes termos.</p>
                <p>Comprometemo-nos a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Proteger a confidencialidade dos seus dados</li>
                  <li>Processar dados de voz localmente sempre que possível</li>
                  <li>Implementar medidas de segurança adequadas</li>
                  <li>Cumprir leis de proteção de dados aplicáveis</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Limitações de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">8.1 Disponibilidade do Serviço:</h4>
                <p>Embora nos esforcemos por manter o serviço disponível, não garantimos 100% de tempo de atividade. Podemos suspender o serviço para manutenção com aviso prévio.</p>

                <h4 className="font-semibold">8.2 Precisão dos Dados:</h4>
                <p>Embora utilizemos tecnologia avançada, a precisão do reconhecimento de voz pode variar. É responsável por verificar e validar os dados inseridos.</p>

                <h4 className="font-semibold">8.3 Limitação de Responsabilidade:</h4>
                <p>Na máxima extensão permitida por lei, a nossa responsabilidade está limitada ao valor pago pelo serviço nos 12 meses anteriores.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Suspensão e Terminação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">9.1 Suspensão:</h4>
                <p>Podemos suspender a sua conta em caso de violação destes termos, atividade suspeita ou falta de pagamento.</p>

                <h4 className="font-semibold">9.2 Terminação:</h4>
                <p>Pode terminar a sua conta a qualquer momento. Podemos terminar o serviço com 30 dias de aviso prévio ou imediatamente em caso de violação grave.</p>

                <h4 className="font-semibold">9.3 Efeitos da Terminação:</h4>
                <p>Após a terminação, terá 30 dias para exportar os seus dados antes da eliminação permanente.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Lei Aplicável e Jurisdição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Estes termos são regidos pelas leis da República de Angola. Qualquer disputa será resolvida pelos tribunais competentes de Luanda, Angola.</p>
                <p>Para utilizadores europeus, aplicam-se também as proteções do direito europeu aplicável.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Resolução de Disputas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">11.1 Resolução Amigável:</h4>
                <p>Encorajamos a resolução amigável de disputas através de contacto direto connosco.</p>

                <h4 className="font-semibold">11.2 Mediação:</h4>
                <p>Se não conseguirmos resolver uma disputa diretamente, podemos concordar em mediação através de um mediador aceite por ambas as partes.</p>

                <h4 className="font-semibold">11.3 Arbitragem:</h4>
                <p>Para disputas comerciais superiores a 100.000 AOA, podemos acordar em arbitragem através do Centro de Arbitragem Comercial de Angola.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Alterações aos Termos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações materiais serão notificadas com pelo menos 30 dias de antecedência através do website ou email.</p>
                <p>A continuação do uso do serviço após alterações constitui aceitação dos novos termos.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Para questões sobre estes termos ou o serviço:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> legal@experta.ao</li>
                  <li><strong>WhatsApp:</strong> +244 924 000 171</li>
                  <li><strong>Endereço:</strong> Luanda, Angola</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>14. Disposições Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">14.1 Acordo Completo:</h4>
                <p>Estes termos, juntamente com a Política de Privacidade, constituem o acordo completo entre si e a Experta.</p>

                <h4 className="font-semibold">14.2 Severabilidade:</h4>
                <p>Se qualquer disposição destes termos for considerada inválida, as restantes disposições permanecem em vigor.</p>

                <h4 className="font-semibold">14.3 Força Maior:</h4>
                <p>Não somos responsáveis por atrasos ou falhas causadas por circunstâncias fora do nosso controle razoável.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}