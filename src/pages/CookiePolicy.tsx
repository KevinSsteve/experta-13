import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicy() {
  useEffect(() => {
    document.title = "Política de Cookies - Experta";
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Política de cookies da Experta. Como utilizamos cookies e tecnologias similares para melhorar a sua experiência no nosso website.");
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </header>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. O que são Cookies?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Cookies são pequenos ficheiros de texto colocados no seu dispositivo (computador, smartphone ou tablet) quando visita um website. São amplamente utilizados para fazer os websites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.</p>
                <p>Os cookies permitem que o website "lembre" das suas ações e preferências durante um período de tempo, para que não tenha de as reintroduzir sempre que regressar ao site ou navegar de uma página para outra.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Como Utilizamos Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>A Experta utiliza cookies para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Garantir o funcionamento básico do website</li>
                  <li>Lembrar as suas preferências de utilizador</li>
                  <li>Manter a sua sessão de login ativa</li>
                  <li>Analisar como utiliza o nosso website (apenas com consentimento)</li>
                  <li>Melhorar a performance e experiência do utilizador</li>
                  <li>Fornecer funcionalidades de segurança</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Tipos de Cookies que Utilizamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">3.1 Cookies Estritamente Necessários</h4>
                  <p className="mb-3">Estes cookies são essenciais para o funcionamento do website e não podem ser desativados.</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Exemplos:</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Cookies de autenticação e sessão</li>
                      <li>Cookies de segurança e prevenção de fraude</li>
                      <li>Cookies de balanceamento de carga</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">3.2 Cookies de Funcionalidade</h4>
                  <p className="mb-3">Permitem que o website se lembre das suas escolhas e forneça funcionalidades melhoradas.</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Exemplos:</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Preferências de idioma</li>
                      <li>Configurações de tema (modo escuro/claro)</li>
                      <li>Dados de formulários guardados</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">3.3 Cookies Analíticos</h4>
                  <p className="mb-3">Ajudam-nos a entender como os visitantes utilizam o website (requer consentimento).</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Exemplos:</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Google Analytics (anonimizado)</li>
                      <li>Estatísticas de uso de páginas</li>
                      <li>Métricas de performance</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">3.4 Cookies de Marketing</h4>
                  <p className="mb-3">Utilizados para fornecer publicidade relevante (requer consentimento explícito).</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Nota:</strong> Atualmente não utilizamos cookies de marketing, mas esta secção será atualizada se implementarmos tais funcionalidades.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Cookies de Terceiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas páginas:</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground">Utilizado para análise de tráfego do website (anonimizado)</p>
                    <p className="text-sm">Política: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Google Privacy Policy</a></p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Supabase</h4>
                    <p className="text-sm text-muted-foreground">Plataforma de backend para autenticação e dados</p>
                    <p className="text-sm">Política: <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className="underline">Supabase Privacy Policy</a></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Duração dos Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Cookies de Sessão</h4>
                    <p className="text-sm text-muted-foreground">Eliminados quando fecha o browser</p>
                    <ul className="list-disc pl-6 text-sm mt-2">
                      <li>Cookies de autenticação temporária</li>
                      <li>Dados de formulário não salvos</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Cookies Persistentes</h4>
                    <p className="text-sm text-muted-foreground">Permanecem até expirar ou serem eliminados</p>
                    <ul className="list-disc pl-6 text-sm mt-2">
                      <li>Preferências do utilizador (até 1 ano)</li>
                      <li>Dados analíticos (até 2 anos)</li>
                      <li>Tokens de autenticação (até 30 dias)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Gestão de Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">6.1 Consentimento e Controle</h4>
                <p>Quando visita o nosso website pela primeira vez, mostramos um banner de cookies onde pode:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Aceitar todos os cookies</li>
                  <li>Aceitar apenas cookies essenciais</li>
                  <li>Personalizar as suas preferências</li>
                </ul>

                <h4 className="font-semibold mt-6">6.2 Configurações do Browser</h4>
                <p>Pode controlar cookies através das configurações do seu browser:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Chrome:</strong> Configurações {'>'}  Privacidade e segurança {'>'} Cookies</li>
                  <li><strong>Firefox:</strong> Opções {'>'} Privacidade e Segurança {'>'} Cookies</li>
                  <li><strong>Safari:</strong> Preferências {'>'} Privacidade {'>'} Cookies</li>
                  <li><strong>Edge:</strong> Configurações {'>'} Privacidade {'>'} Cookies</li>
                </ul>

                <h4 className="font-semibold mt-6">6.3 Ferramentas de Opt-out</h4>
                <p>Para cookies analíticos específicos:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" className="underline">Browser Opt-out</a></li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Impacto da Desativação de Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Se desativar cookies, algumas funcionalidades podem ser afetadas:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Cookies Essenciais Desativados</h4>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Impossibilidade de fazer login</li>
                      <li>Perda de dados de sessão</li>
                      <li>Funcionalidades de segurança comprometidas</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-600">Cookies Analíticos Desativados</h4>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Menos capacidade de melhorar o site</li>
                      <li>Análises de uso limitadas</li>
                      <li>Dificuldade em otimizar performance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Armazenamento Local</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Além de cookies, utilizamos outras tecnologias de armazenamento:</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Local Storage</h4>
                    <p className="text-sm text-muted-foreground">Para dados que precisam persistir entre sessões</p>
                    <ul className="list-disc pl-6 text-sm">
                      <li>Configurações da aplicação</li>
                      <li>Dados temporários offline</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">Session Storage</h4>
                    <p className="text-sm text-muted-foreground">Para dados temporários da sessão atual</p>
                    <ul className="list-disc pl-6 text-sm">
                      <li>Estado da aplicação</li>
                      <li>Dados de formulários temporários</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">IndexedDB</h4>
                    <p className="text-sm text-muted-foreground">Para funcionalidade offline da aplicação</p>
                    <ul className="list-disc pl-6 text-sm">
                      <li>Cache de dados para uso offline</li>
                      <li>Dados de sincronização pendente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Para questões sobre a nossa utilização de cookies:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> privacy@experta.ao</li>
                  <li><strong>WhatsApp:</strong> +244 924 000 171</li>
                  <li><strong>Endereço:</strong> Luanda, Angola</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Alterações a Esta Política</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Podemos atualizar esta política de cookies ocasionalmente para refletir mudanças na nossa utilização de cookies ou por outros motivos operacionais, legais ou regulamentares.</p>
                <p>Recomendamos que reveja esta política periodicamente para se manter informado sobre como utilizamos cookies.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}