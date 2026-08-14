import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PrivacyPolicyProps {
  onAccept: () => void;
  onReject: () => void;
}

export function PrivacyPolicy({ onAccept, onReject }: PrivacyPolicyProps) {
  const [accepted, setAccepted] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    setScrollBottom(isBottom);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
          <CardDescription>Última actualização: Maio de 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[60vh] mb-6 p-4 border rounded-lg"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Quem somos</h3>
                <p>
                  A Muwoyo é uma plataforma de automação de atendimento e vendas
                  via WhatsApp com inteligência artificial, desenvolvida e
                  operada por Muwoyo Lda., com sede em Cabinda, Angola. Para
                  qualquer questão relacionada com esta política, pode
                  contactar-nos através do email suporte@muwoyo.com.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  2. Que dados recolhemos
                </h3>
                <p className="mb-3">
                  Quando cria uma conta e utiliza a plataforma Muwoyo,
                  recolhemos os seguintes dados pessoais:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Nome completo, endereço de email e número de telefone
                    fornecidos no momento do registo.
                  </li>
                  <li>
                    Dados do negócio como nome da empresa, descrição, produtos e
                    preços introduzidos na plataforma.
                  </li>
                  <li>
                    Dados de utilização como mensagens enviadas e recebidas,
                    número de atendimentos, pedidos registados e visitas à loja.
                  </li>
                  <li>
                    Dados de pagamento necessários para processar a taxa de
                    activação e a compra de pacotes de mensagens.
                  </li>
                  <li>
                    Informações técnicas como endereço IP, tipo de dispositivo e
                    browser utilizados para aceder à plataforma.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  3. Como utilizamos os seus dados
                </h3>
                <p className="mb-3">
                  Os dados recolhidos são utilizados exclusivamente para os
                  seguintes fins:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criar e gerir a sua conta na plataforma Muwoyo.</li>
                  <li>
                    Treinar e configurar o agente de inteligência artificial com
                    as informações do seu negócio.
                  </li>
                  <li>
                    Processar pedidos, agendamentos e transações feitas pelos
                    seus clientes.
                  </li>
                  <li>
                    Gerar relatórios de desempenho e métricas de utilização no
                    seu painel.
                  </li>
                  <li>
                    Prestar suporte técnico e responder a questões enviadas pelo
                    utilizador.
                  </li>
                  <li>
                    Enviar notificações relacionadas com a conta, como alertas
                    de mensagens e confirmações de pagamento.
                  </li>
                  <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
                </ul>
                <p className="mt-3 font-medium">
                  A Muwoyo não utiliza os seus dados para fins publicitários nem
                  os partilha com terceiros para efeitos de marketing.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  4. Partilha de dados com terceiros
                </h3>
                <p className="mb-3">
                  A Muwoyo pode partilhar dados com terceiros apenas nas
                  seguintes circunstâncias:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Com prestadores de serviços tecnológicos necessários para o
                    funcionamento da plataforma, como serviços de alojamento,
                    bases de dados e processamento de pagamentos, sempre sob
                    acordos de confidencialidade.
                  </li>
                  <li>
                    Com o Google, no âmbito das integrações com Google Sheets,
                    Google Analytics e Google Calendar, que são ferramentas
                    pré-configuradas na plataforma.
                  </li>
                  <li>
                    Em cumprimento de obrigações legais, mediante ordem judicial
                    ou solicitação de autoridade competente.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  5. Dados dos clientes do utilizador
                </h3>
                <p>
                  Ao utilizar a Muwoyo, o seu agente de inteligência artificial
                  recolhe automaticamente dados das pessoas que interagem com o
                  seu WhatsApp, como nome, localização, número de telefone e
                  produtos solicitados. O utilizador é o responsável pelo
                  tratamento desses dados perante os seus clientes. A Muwoyo
                  actua como subcontratante e trata esses dados apenas para
                  prestar o serviço contratado.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  6. Segurança dos dados
                </h3>
                <p>
                  A Muwoyo adopta medidas técnicas e organizacionais adequadas
                  para proteger os seus dados contra acesso não autorizado,
                  perda, alteração ou divulgação indevida. Os dados são
                  armazenados em servidores seguros com encriptação em trânsito
                  e em repouso.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  7. Conservação dos dados
                </h3>
                <p>
                  Os seus dados são conservados enquanto a sua conta estiver
                  activa. Após o encerramento da conta, os dados são eliminados
                  no prazo de 90 dias, salvo obrigação legal de conservação por
                  período superior.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  8. Os seus direitos
                </h3>
                <p>
                  Tem o direito de aceder aos seus dados pessoais, corrigir
                  informações incorrectas, solicitar a eliminação da sua conta e
                  dos dados associados, e opor-se ao tratamento dos seus dados
                  em determinadas circunstâncias. Para exercer qualquer um
                  destes direitos, contacte-nos através de suporte@muwoyo.com.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  9. Alterações a esta política
                </h3>
                <p>
                  A Muwoyo reserva-se o direito de actualizar esta política
                  sempre que necessário. Qualquer alteração relevante será
                  comunicada por email ou através de notificação na plataforma.
                  O uso continuado da plataforma após a notificação implica a
                  aceitação das novas condições.
                </p>
              </section>
            </div>
          </ScrollArea>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept-privacy"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                disabled={!scrollBottom}
              />
              <Label
                htmlFor="accept-privacy"
                className={!scrollBottom ? "text-muted-foreground" : ""}
              >
                {!scrollBottom
                  ? "Por favor, leia até o final para activar a aceitação"
                  : "Li e concordo com a Política de Privacidade"}
              </Label>
            </div>

            <div className="flex gap-3">
              <Button onClick={onReject} variant="outline" className="flex-1">
                Recusar
              </Button>
              <Button
                onClick={onAccept}
                disabled={!accepted}
                className="flex-1"
              >
                Aceitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
