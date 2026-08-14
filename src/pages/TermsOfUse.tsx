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

interface TermsOfUseProps {
  onAccept: () => void;
  onReject: () => void;
}

export function TermsOfUse({ onAccept, onReject }: TermsOfUseProps) {
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
          <CardTitle className="text-2xl">Termos de Uso</CardTitle>
          <CardDescription>
            Última actualização: 10 Maio de 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[60vh] mb-6 p-4 border rounded-lg"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  1. Aceitação dos termos
                </h3>
                <p>
                  Ao criar uma conta e utilizar a plataforma Muwoyo, o
                  utilizador declara ter lido, compreendido e aceite na
                  totalidade os presentes Termos de Uso. Caso não concorde com
                  alguma das condições aqui estabelecidas, deverá abster-se de
                  utilizar a plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  2. Descrição do serviço
                </h3>
                <p className="mb-3">
                  A Muwoyo é uma plataforma de automação de atendimento e vendas
                  via WhatsApp que disponibiliza as seguintes funcionalidades:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Agente de inteligência artificial treinado com as
                    informações do negócio do utilizador, capaz de responder
                    automaticamente a clientes 24 horas por dia.
                  </li>
                  <li>
                    Loja online personalizada com link e QR Code únicos,
                    integrada com o WhatsApp do utilizador.
                  </li>
                  <li>
                    Painel de gestão com métricas de desempenho, registo de
                    pedidos, agendamentos e relatórios automáticos.
                  </li>
                  <li>
                    Integrações pré-configuradas com Google Sheets, Google
                    Analytics e Google Calendar.
                  </li>
                  <li>
                    Pacotes de mensagens adquiridos pelo utilizador conforme o
                    volume do seu negócio.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  3. Registo e conta
                </h3>
                <p>
                  Para utilizar a Muwoyo, o utilizador deve criar uma conta com
                  informações verdadeiras, completas e actualizadas. O
                  utilizador é responsável pela confidencialidade das suas
                  credenciais de acesso e por todas as actividades realizadas na
                  sua conta. A Muwoyo reserva-se o direito de suspender ou
                  encerrar contas que forneçam informações falsas ou que violem
                  estes termos.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  4. Taxa de activação e pacotes de mensagens
                </h3>
                <p className="mb-3">
                  A activação da conta Muwoyo está sujeita ao pagamento de uma
                  taxa única de 22.500 Kz, que inclui todas as funcionalidades
                  descritas na plataforma. Não existem mensalidades nem custos
                  recorrentes obrigatórios associados à activação. Após a
                  activação, o utilizador pode adquirir pacotes de mensagens
                  conforme necessário, nos seguintes volumes disponíveis: 1.000,
                  2.500, 7.500 e 15.000 mensagens. Os pacotes adquiridos não têm
                  data de expiração mensal e podem ser utilizados ao ritmo do
                  negócio do utilizador. Os pagamentos são processados através
                  dos meios disponibilizados na plataforma e não são
                  reembolsáveis após a activação do serviço ou do pacote
                  adquirido.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Uso aceitável</h3>
                <p className="mb-3">
                  O utilizador compromete-se a utilizar a plataforma Muwoyo
                  exclusivamente para fins legítimos e em conformidade com a
                  legislação angolana e internacional aplicável. É expressamente
                  proibido:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Utilizar a plataforma para enviar mensagens não solicitadas
                    em massa, spam ou conteúdo enganoso.
                  </li>
                  <li>
                    Difundir conteúdo ilegal, ofensivo, discriminatório ou que
                    viole direitos de terceiros.
                  </li>
                  <li>
                    Tentar aceder a sistemas, dados ou contas de outros
                    utilizadores sem autorização.
                  </li>
                  <li>
                    Utilizar a plataforma para fins que violem os Termos de
                    Serviço do WhatsApp ou da Meta.
                  </li>
                  <li>
                    Revender, sublicenciar ou transferir o acesso à plataforma a
                    terceiros sem autorização expressa da Muwoyo.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  6. Responsabilidades do utilizador
                </h3>
                <p>
                  O utilizador é o único responsável pelo conteúdo introduzido
                  na plataforma, incluindo informações sobre produtos, preços,
                  descrições e regras de atendimento configuradas no agente de
                  inteligência artificial. A Muwoyo não se responsabiliza por
                  informações incorrectas fornecidas pelo utilizador nem pelas
                  consequências das interações entre o agente de IA e os
                  clientes do utilizador.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  7. Disponibilidade do serviço
                </h3>
                <p>
                  A Muwoyo empenha-se em garantir a máxima disponibilidade da
                  plataforma. No entanto, não garante disponibilidade
                  ininterrupta e não se responsabiliza por interrupções causadas
                  por manutenção programada, falhas técnicas fora do seu
                  controlo ou indisponibilidade de serviços de terceiros como o
                  WhatsApp ou os serviços Google.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  8. Propriedade intelectual
                </h3>
                <p>
                  Todos os elementos da plataforma Muwoyo, incluindo o nome,
                  logótipo, design, código e funcionalidades, são propriedade
                  exclusiva da Muwoyo Lda. e estão protegidos por legislação de
                  propriedade intelectual. O utilizador não adquire qualquer
                  direito de propriedade sobre a plataforma pelo facto de a
                  utilizar.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  9. Suspensão e encerramento
                </h3>
                <p>
                  A Muwoyo reserva-se o direito de suspender ou encerrar o
                  acesso de qualquer utilizador que viole estes Termos de Uso,
                  sem aviso prévio e sem direito a reembolso. O utilizador pode
                  encerrar a sua conta a qualquer momento através do painel ou
                  contactando o suporte. O encerramento da conta não implica o
                  reembolso de valores já pagos.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  10. Limitação de responsabilidade
                </h3>
                <p>
                  A Muwoyo não se responsabiliza por perdas de receita, perda de
                  dados, danos indirectos ou qualquer prejuízo resultante do uso
                  ou da impossibilidade de uso da plataforma. A responsabilidade
                  máxima da Muwoyo perante o utilizador em qualquer
                  circunstância não excede o valor pago pelo utilizador nos
                  últimos 30 dias.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  11. Alterações aos termos
                </h3>
                <p>
                  A Muwoyo pode actualizar estes Termos de Uso a qualquer
                  momento. As alterações serão comunicadas por email ou por
                  notificação na plataforma com um mínimo de 7 dias de
                  antecência. O uso continuado da plataforma após a entrada em
                  vigor das alterações implica a aceitação das novas condições.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  12. Lei aplicável e foro
                </h3>
                <p>
                  Estes Termos de Uso são regidos pela legislação da República
                  de Angola. Qualquer litígio decorrente da utilização da
                  plataforma será submetido aos tribunais competentes de Cabinda,
                  Angola.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">13. Contacto</h3>
                <p>
                  Para qualquer questão relacionada com estes Termos de Uso,
                  pode contactar-nos através de suporte@muwoyo.com ou pelo
                  WhatsApp +244 928663898.
                </p>
              </section>
            </div>
          </ScrollArea>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                disabled={!scrollBottom}
              />
              <Label
                htmlFor="accept-terms"
                className={!scrollBottom ? "text-muted-foreground" : ""}
              >
                {!scrollBottom
                  ? "Por favor, leia até o final para activar a aceitação"
                  : "Li e concordo com os Termos de Uso"}
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
