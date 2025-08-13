import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalNotice() {
  useEffect(() => {
    document.title = "Aviso Legal - Experta";
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Aviso legal da Experta. Informações sobre propriedade do website, responsabilidades legais e conformidade regulamentar em Angola.");
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Aviso Legal</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </header>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Informações do Website</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Propriedade do Website</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Nome:</strong> Experta</li>
                      <li><strong>Tipo:</strong> Plataforma Digital</li>
                      <li><strong>Domínio:</strong> experta.ao</li>
                      <li><strong>Localização:</strong> Luanda, Angola</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Contacto</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Email:</strong> legal@experta.ao</li>
                      <li><strong>WhatsApp:</strong> +244 924 000 171</li>
                      <li><strong>Suporte:</strong> suporte@experta.ao</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Natureza do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>A Experta é uma plataforma digital que oferece serviços de gestão financeira através de tecnologia de reconhecimento de voz. O serviço é fornecido como:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Software as a Service (SaaS):</strong> Aplicação web acessível através de browsers</li>
                  <li><strong>Progressive Web App (PWA):</strong> Aplicação instalável em dispositivos móveis</li>
                  <li><strong>Serviço de Consultoria Digital:</strong> Análises automáticas e insights comerciais</li>
                </ul>
                
                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="font-semibold">Importante:</p>
                  <p className="text-sm">A Experta é um website/plataforma digital e não uma empresa constituída. Operamos como prestadores de serviços digitais em conformidade com a legislação angolana para atividades digitais.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Conformidade Legal em Angola</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">3.1 Legislação Aplicável:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Constituição da República de Angola</li>
                  <li>Código Civil Angolano</li>
                  <li>Lei da Atividade Económica Privada</li>
                  <li>Regulamentos sobre serviços digitais e telecomunicações</li>
                  <li>Normas de proteção ao consumidor</li>
                </ul>

                <h4 className="font-semibold mt-6">3.2 Registo e Licenciamento:</h4>
                <p>Como plataforma digital, operamos em conformidade com os requisitos legais angolanos para prestação de serviços digitais, incluindo:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cumprimento de obrigações fiscais aplicáveis</li>
                  <li>Respeito pelas normas de proteção de dados</li>
                  <li>Conformidade com regulamentos de telecomunicações</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Direitos de Propriedade Intelectual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">4.1 Conteúdo Original:</h4>
                <p>Todo o conteúdo original da Experta, incluindo mas não limitado a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Código fonte e algoritmos</li>
                  <li>Design e interface de utilizador</li>
                  <li>Textos, imagens e gráficos</li>
                  <li>Marca e logótipos</li>
                  <li>Metodologias e processos</li>
                </ul>
                <p>Está protegido por direitos autorais e outras leis de propriedade intelectual aplicáveis em Angola e internacionalmente.</p>

                <h4 className="font-semibold mt-6">4.2 Tecnologias de Terceiros:</h4>
                <p>Utilizamos tecnologias de terceiros sob licenças apropriadas:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Bibliotecas de código aberto (licenças MIT, Apache, etc.)</li>
                  <li>APIs de reconhecimento de voz licenciadas</li>
                  <li>Serviços de infraestrutura cloud</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Responsabilidades e Limitações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">5.1 Responsabilidades da Experta:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Fornecer o serviço conforme descrito</li>
                  <li>Proteger dados pessoais conforme a lei</li>
                  <li>Manter padrões razoáveis de segurança</li>
                  <li>Cumprir obrigações contratuais</li>
                  <li>Fornecer suporte técnico adequado</li>
                </ul>

                <h4 className="font-semibold mt-6">5.2 Limitações de Responsabilidade:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Não somos responsáveis por decisões comerciais baseadas nos dados fornecidos</li>
                  <li>A precisão do reconhecimento de voz pode variar conforme fatores externos</li>
                  <li>Não garantimos resultados específicos de negócio</li>
                  <li>Não somos responsáveis por perdas resultantes de uso inadequado</li>
                </ul>

                <h4 className="font-semibold mt-6">5.3 Exclusões:</h4>
                <p>Na máxima extensão permitida por lei, excluímos responsabilidade por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Danos indiretos ou consequenciais</li>
                  <li>Perda de lucros ou oportunidades comerciais</li>
                  <li>Interrupções de serviço por motivos de força maior</li>
                  <li>Ações de terceiros fora do nosso controle</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Proteção de Dados e Privacidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">6.1 Conformidade Legal:</h4>
                <p>O tratamento de dados pessoais é realizado em conformidade com:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Legislação angolana sobre proteção de dados (quando aplicável)</li>
                  <li>Regulamento Geral sobre a Proteção de Dados (RGPD) da UE</li>
                  <li>Melhores práticas internacionais de privacidade</li>
                </ul>

                <h4 className="font-semibold mt-6">6.2 Direitos dos Utilizadores:</h4>
                <p>Os utilizadores têm direito a acesso, retificação, eliminação e portabilidade dos seus dados pessoais, conforme detalhado na nossa Política de Privacidade.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Conformidade Fiscal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">7.1 Obrigações Fiscais:</h4>
                <p>Cumprimos todas as obrigações fiscais aplicáveis em Angola para prestação de serviços digitais, incluindo:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Registo nas autoridades fiscais competentes</li>
                  <li>Pagamento de impostos sobre prestação de serviços</li>
                  <li>Emissão de faturas conforme legislação angolana</li>
                  <li>Retenção na fonte quando aplicável</li>
                </ul>

                <h4 className="font-semibold mt-6">7.2 IVA e Outros Impostos:</h4>
                <p>Os preços apresentados incluem todos os impostos aplicáveis conforme a legislação angolana vigente.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Resolução de Conflitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">8.1 Jurisdição:</h4>
                <p>Quaisquer disputas relacionadas com este website ou serviços são regidas pelas leis da República de Angola e submetidas à jurisdição dos tribunais de Luanda.</p>

                <h4 className="font-semibold">8.2 Métodos Alternativos:</h4>
                <p>Encorajamos a resolução amigável de conflitos através de:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Comunicação direta com a nossa equipa</li>
                  <li>Mediação através de entidades reconhecidas</li>
                  <li>Arbitragem quando apropriado</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Conformidade Internacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Embora baseados em Angola, reconhecemos e respeitamos normas internacionais:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>GDPR (Regulamento Geral sobre Proteção de Dados):</strong> Para utilizadores europeus</li>
                  <li><strong>Convenções da ONU:</strong> Direitos humanos e proteção do consumidor</li>
                  <li><strong>Padrões ISO:</strong> Segurança da informação e qualidade de serviço</li>
                  <li><strong>Melhores Práticas Globais:</strong> Privacidade e segurança digital</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Acessibilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Comprometemo-nos a tornar os nossos serviços acessíveis a todos os utilizadores:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Interface por voz para utilizadores com dificuldades de leitura</li>
                  <li>Design responsivo para diferentes dispositivos</li>
                  <li>Suporte a tecnologias assistivas</li>
                  <li>Conformidade com diretrizes de acessibilidade web (WCAG)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Sustentabilidade e Responsabilidade Social</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>A Experta compromete-se com:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Inclusão Digital:</strong> Democratizar o acesso a ferramentas de gestão empresarial</li>
                  <li><strong>Desenvolvimento Local:</strong> Apoiar o crescimento de pequenos negócios angolanos</li>
                  <li><strong>Sustentabilidade Ambiental:</strong> Utilizar infraestrutura cloud eficiente</li>
                  <li><strong>Ética nos Negócios:</strong> Práticas transparentes e justas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contacto e Comunicações Legais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">Para questões legais:</h4>
                <ul className="list-none space-y-2">
                  <li><strong>Email Legal:</strong> legal@experta.ao</li>
                  <li><strong>Privacidade:</strong> privacy@experta.ao</li>
                  <li><strong>Suporte Geral:</strong> suporte@experta.ao</li>
                  <li><strong>WhatsApp:</strong> +244 924 000 171</li>
                  <li><strong>Endereço:</strong> Luanda, Angola</li>
                </ul>

                <p className="mt-4">Todas as comunicações legais devem ser enviadas por escrito para os endereços indicados acima.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Atualizações e Modificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Este aviso legal pode ser atualizado periodicamente para refletir:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mudanças na legislação angolana ou internacional</li>
                  <li>Alterações nos nossos serviços ou práticas</li>
                  <li>Novos requisitos regulamentares</li>
                  <li>Melhorias nas nossas políticas de privacidade e segurança</li>
                </ul>
                
                <p className="mt-4">Recomendamos que consulte este aviso legal regularmente. A data da última atualização é sempre indicada no topo da página.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}