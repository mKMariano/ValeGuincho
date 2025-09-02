"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { ContratoModal } from "@/components/ContratoModal"

// Interfaces
interface FormData {
  codigo: string; nome: string; cpf: string; email: string; whatsapp: string;
  placa: string; tipoUso: string; cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
}
interface VehicleData {
  marca: string; modelo: string; ano: string; cor: string; segmento: string;
}

export default function CadastroPage() {
  // Seus estados
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ codigo: "", nome: "", cpf: "", email: "", whatsapp: "", placa: "", tipoUso: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" });
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [cpfValido, setCpfValido] = useState(false);
  const [placaValida, setPlacaValida] = useState(false);
  const [cepValido, setCepValido] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nomeValido, setNomeValido] = useState(false);
  const [emailValido, setEmailValido] = useState(false);
  const [whatsappValido, setWhatsappValido] = useState(false);
  const [validandoPlaca, setValidandoPlaca] = useState(false);
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [mensagemCodigo, setMensagemCodigo] = useState("");
  const [corTextoAlternante, setCorTextoAlternante] = useState(false);
  const [mensagemErroCaminhao, setMensagemErroCaminhao] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoFromUrl = urlParams.get("codigo");
    if (!codigoFromUrl) {
      window.location.href = "https://cautoo.com.br/errodeativacao/";
      return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    setFormData((prev) => ({ ...prev, codigo: codigoFromUrl }));
    validarCodigo(codigoFromUrl);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (validandoCodigo) {
      interval = setInterval(() => setCorTextoAlternante((prev) => !prev), 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [validandoCodigo]);

  const validarCodigo = async (codigo: string) => {
    if (!codigo) return;
    setValidandoCodigo(true);
    setMensagemCodigo("Autenticando seu Vale Guincho, só um instante!");
    setLoading(true);
    try {
      const response = await fetch("/api/validar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, marcar: false }),
      });
      const result = await response.json();
      if (response.ok && result.status === "ok") {
        setCodigoValidado(true);
        setValidandoCodigo(false);
        setMensagemCodigo("Seu Vale Guincho foi autenticado!");
        toast({
          title: "Código válido!",
          description: "Preencha os dados para continuar.",
        });
      } else {
        toast({
          title: "Código inválido",
          description: result.mensagem || "Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "https://cautoo.com.br/errodeativacao/";
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "https://cautoo.com.br/errodeativacao/";
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number.parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number.parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number.parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === Number.parseInt(cpf.charAt(10));
  };

  const validarNomeCompleto = (nome: string): boolean => {
    const nomes = nome.trim().split(" ").filter((n) => n.length > 0);
    return nomes.length >= 2 && nomes.every((n) => n.length >= 2);
  };

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validarWhatsApp = (whatsapp: string): boolean => {
    const whatsappLimpo = whatsapp.replace(/[^\d]/g, "");
    return whatsappLimpo.length >= 10 && whatsappLimpo.length <= 11;
  };

  const aplicarMascaraPlaca = (placa: string): string => {
    placa = placa.replace(/[^A-Z0-9]/g, "");
    if (placa.length <= 3) return placa;
    if (placa.length <= 7) {
      if (placa.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(placa)) return `${placa.slice(0, 3)}-${placa.slice(3)}`;
      if (placa.length === 7 && /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa)) return placa;
      if (placa.length > 3) return `${placa.slice(0, 3)}-${placa.slice(3)}`;
    }
    return placa.slice(0, 8);
  };

  const aplicarMascaraCPF = (cpf: string): string => {
    cpf = cpf.replace(/[^\d]/g, "");
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const aplicarMascaraWhatsApp = (whatsapp: string): string => {
    whatsapp = whatsapp.replace(/[^\d]/g, "");
    if (whatsapp.length <= 2) return whatsapp;
    if (whatsapp.length <= 7) return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2)}`;
    if (whatsapp.length <= 11) return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2, 7)}-${whatsapp.slice(7)}`;
    return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2, 7)}-${whatsapp.slice(7, 11)}`;
  };

  const aplicarMascaraNome = (nome: string): string => {
    return nome.toLowerCase().split(" ").map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(" ");
  };

  const removerMascaraWhatsApp = (whatsapp: string): string => {
    const numeroLimpo = whatsapp.replace(/[^\d]/g, "");
    return `+55${numeroLimpo}`;
  };

  const consultarPlaca = async (placa: string) => {
    const placaLimpa = placa.replace(/[^A-Z0-9]/g, "");
    if (!placaLimpa || placaLimpa.length !== 7) return;
    setValidandoPlaca(true);
    setMensagemErroCaminhao(false);
    try {
      const response = await fetch("/api/consulta-placa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: placaLimpa }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        if (result.data.segmento && result.data.segmento.toUpperCase() === "CAMINHÃO") {
          setPlacaValida(false);
          setVehicleData(null);
          setMensagemErroCaminhao(true);
          return;
        }
        setVehicleData({
          marca: result.data.marca || "N/A", modelo: result.data.modelo || "N/A",
          ano: result.data.ano || "N/A", cor: result.data.cor || "N/A",
          segmento: result.data.segmento || "N/A",
        });
        setPlacaValida(true);
        toast({ title: "Placa válida!", description: `${result.data.marca} ${result.data.modelo}` });
      } else {
        setPlacaValida(false);
        setVehicleData(null);
        setMensagemErroCaminhao(false);
        toast({ title: "Placa não encontrada", description: "Verifique a placa e tente novamente.", variant: "destructive" });
      }
    } catch (error) {
      setPlacaValida(false);
      setVehicleData(null);
      toast({ title: "Erro na consulta", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setValidandoPlaca(false);
    }
  };

  const consultarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/[^\d]/g, "");
    if (cepLimpo.length !== 8) return;
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const result = await response.json();
      if (!result.erro) {
        setFormData((prev) => ({
          ...prev, rua: result.logradouro || "", bairro: result.bairro || "",
          cidade: result.localidade || "", estado: result.uf || "",
        }));
        setCepValido(true);
        toast({ title: "CEP encontrado!", description: `${result.localidade}/${result.uf}` });
      } else {
        setCepValido(false);
        toast({ title: "CEP não encontrado", description: "Verifique o CEP e tente novamente.", variant: "destructive" });
      }
    } catch (error) {
      setCepValido(false);
      toast({ title: "Erro na consulta", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "cpf") value = aplicarMascaraCPF(value);
    if (field === "whatsapp") value = aplicarMascaraWhatsApp(value);
    if (field === "placa") value = aplicarMascaraPlaca(value.toUpperCase());
    if (field === "nome") value = aplicarMascaraNome(value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "nome") setNomeValido(validarNomeCompleto(value));
    if (field === "cpf") setCpfValido(validarCPF(value));
    if (field === "email") setEmailValido(validarEmail(value));
    if (field === "whatsapp") setWhatsappValido(validarWhatsApp(value));
    if (field === "placa") {
      const placaLimpa = value.replace(/[^A-Z0-9]/g, "");
      if (placaLimpa.length === 7) {
        consultarPlaca(placaLimpa);
      } else {
        setPlacaValida(false);
      }
    }
    if (field === "cep" && value.replace(/[^\d]/g, "").length === 8) {
      consultarCEP(value);
    }
  };

  const finalizarCadastro = async () => {
    setLoading(true);
    try {
      const validacaoResponse = await fetch("/api/validar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: formData.codigo, marcar: true }),
      });
      const validacaoResult = await validacaoResponse.json();
      if (!validacaoResponse.ok || validacaoResult.mensagem !== "Código resgatado com sucesso e marcado como usado!") {
        throw new Error(validacaoResult.mensagem || "Erro ao marcar código como usado");
      }
      const primeiroNome = formData.nome.split(" ")[0];
      const dadosParaEnvio = {
        ...formData,
        whatsapp: removerMascaraWhatsApp(formData.whatsapp),
        primeiro_nome: primeiroNome,
        segmento: vehicleData ? "AUTOMÓVEL" : "",
      };
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnvio),
      });
      const result = await response.json();
      if (response.ok) {
        toast({
          title: "Vale Guincho ativado com sucesso!",
          description: "Você receberá a confirmação por e-mail e WhatsApp.",
        });
        window.location.href = "https://cautoo.com.br/ativado/";
      } else {
        throw new Error(result.error || "Erro na ativação");
      }
    } catch (error) {
      toast({
        title: "Erro na ativação",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getContractText = () => {
    const { nome, cpf, cep, rua, numero, complemento, bairro, cidade, estado, placa } = formData;
    const enderecoCompleto = `${rua}, ${numero}${complemento ? `, ${complemento}` : ""}, ${bairro}, ${cidade}/${estado} - CEP: ${cep}`;

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ASSISTÊNCIA VEICULAR – VALE GUINCHO CAUTOO

CONTRATADA: CAUTOO SERVIÇOS E ASSISTÊNCIAS LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 50.140.507/0001-19, com sede na Avenida Paulista, nº 1636, Conjunto 4, 15º andar, Bela Vista, São Paulo/SP, CEP 01310-200, doravante denominada simplesmente CAUTOO.

CONTRATANTE: A pessoa física ou jurídica, doravante denominada USUÁRIO, ${nome.toUpperCase()}, portador(a) do CPF/CNPJ nº ${cpf}, residente e domiciliado(a) no endereço ${enderecoCompleto.toUpperCase()}.

As partes acima qualificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas seguintes cláusulas e condições:

QUADRO RESUMO
Produto: Vale Guincho Cautoo (Gift Card)
Plano Contratado: Plano Padrão
Vigência: 6 meses
Número de Chamados: 1
Carência: 7 (sete) dias corridos após a ativação
Principal Benefício: Guincho com KM Livre (conforme Cláusula 8ª)
Cancelamento: Não aplicável (compra física, conforme Cláusula 14.1)

CLÁUSULA 1ª - DO OBJETO
1.1. O objeto deste contrato é a prestação de serviços de intermediação, pela CAUTOO, conectando o USUÁRIO a uma rede de prestadores de serviços terceirizados para a execução de assistência veicular 24 horas, em todo o território nacional.
1.2. A prestação dos serviços se dará por meio do produto denominado "Vale Guincho", que confere ao USUÁRIO o direito a 1 (um) único chamado para um conjunto de serviços de assistência, a serem utilizados em uma única ocorrência que imobilize o veículo de placa ${placa.toUpperCase()}, doravante denominado "veículo cadastrado".
1.3. Fica expressamente estabelecido que a CAUTOO atua como uma plataforma de tecnologia e intermediação, não executando diretamente os serviços de assistência, os quais são de responsabilidade exclusiva dos prestadores de serviço parceiros.

CLÁUSULA 2ª - DA ADESÃO E ATIVAÇÃO
2.1. A adesão a este contrato se efetiva com a aquisição de um "Vale Guincho" em formato de "gift card" em pontos de venda parceiros e sua posterior ativação na plataforma digital da CAUTOO.
2.2. Ao realizar a ativação do "Vale Guincho" na plataforma digital da CAUTOO, o USUÁRIO manifesta seu aceite livre, expresso e inequívoco a todos os termos e condições do presente contrato e da Política de Privacidade da empresa.
2.3. No ato da ativação, o USUÁRIO vincula o "Vale Guincho" ao veículo de placa ${placa.toUpperCase()}. A prestação de serviço de assistência é exclusiva para este veículo, não sendo permitida a alteração ou transferência para outro veículo durante o período de vigência.
2.4. Da Ativação e Guarda do Código: A prestação dos serviços está condicionada à ativação do "Vale Guincho" na plataforma digital da CAUTOO. O USUÁRIO é o único responsável pela guarda e sigilo do código de ativação contido no "gift card". A CAUTOO não se responsabiliza por perda, roubo, furto ou uso não autorizado do código de ativação antes que ele seja vinculado à conta do USUÁRIO e à placa do veículo.

CLÁUSULA 3ª - DO PREÇO E FORMA DE PAGAMENTO
3.1. A contraprestação pelos serviços objeto deste contrato consiste em um pagamento único, realizado pelo USUÁRIO no ato da aquisição do "Vale Guincho".
3.2. O valor pago remunera integralmente a intermediação e a prestação dos serviços listados na Cláusula 7ª para o chamado contratado, não havendo incidência de qualquer custo adicional, taxa ou franquia a ser paga pelo USUÁRIO ao prestador de serviço no momento do atendimento emergencial.

CLÁUSULA 4ª - DA CARÊNCIA
4.1. Os serviços de assistência veicular objeto deste contrato estarão disponíveis para utilização pelo USUÁRIO após o cumprimento de um período de carência de 7 (sete) dias corridos. O prazo de carência inicia-se a partir da data e hora da ativação do "Vale Guincho".

CLÁUSULA 5ª - DA VIGÊNCIA E UTILIZAÇÃO
5.1. O "Vale Guincho" terá validade de 6 (seis) meses a contar da data de sua ativação e dará direito a 1 (um) único chamado completo para o veículo de placa ${placa.toUpperCase()}.
5.2. Condições de Utilização: Durante o período de vigência, o USUÁRIO terá direito a acionar a CAUTOO para o chamado, referente a uma única ocorrência (evento). A solicitação dos serviços de assistência está condicionada à verificação cumulativa de que:
a) O veículo para o qual o socorro é solicitado (placa ${placa.toUpperCase()}) possui um "Vale Guincho" ativo e vinculado.
b) O período de carência, definido na Cláusula 4ª, já foi integralmente cumprido.
c) O chamado está sendo realizado dentro do prazo de validade de 6 meses.
5.3. Extinção do Contrato: Após a utilização do chamado ou o término do prazo de vigência, o que ocorrer primeiro, o "Vale Guincho" perderá sua validade e este contrato será considerado extinto.

CLÁUSULA 6ª - DAS CONDIÇÕES PARA ACIONAMENTO DOS SERVIÇOS
6.1. O acionamento dos serviços de assistência descritos neste contrato é restrito a situações de emergência, caracterizadas pela imobilização completa do veículo cadastrado (placa ${placa.toUpperCase()}). Entende-se por imobilização a incapacidade do veículo de se locomover por meios próprios de forma segura, seja por não ligar ou por apresentar falhas que impeçam sua condução.
6.2. Os eventos que justificam o acionamento são, entre outros, pane elétrica, pane mecânica, pane seca, acidente de trânsito, perda de chave ou pneu furado, que resultem na imobilização do veículo.
6.3. Não será atendido o chamado que tenha como único objetivo o transporte ou deslocamento do veículo de um ponto a outro, quando o mesmo estiver em plenas condições de funcionamento e locomoção. A título de exemplo, não haverá cobertura para a solicitação de guincho para levar um veículo que liga e anda normalmente de uma residência para uma oficina para uma revisão agendada.

CLÁUSULA 7ª - DOS SERVIÇOS INCLUSOS NO CHAMADO
7.1. O chamado a que o USUÁRIO tem direito contempla os seguintes serviços, a serem prestados por terceiros parceiros:
a) Guincho/Reboque com KM Livre: Transporte do veículo imobilizado, conforme condições específicas da Cláusula 8ª.
b) Auxílio Mecânico/Elétrico: Envio de um profissional para realizar reparos emergenciais no local, quando tecnicamente possível (ex: recarga de bateria, reparos simples).
c) Auxílio Pane Seca: Reboque do veículo até o posto de combustível mais próximo. O custo do combustível é de responsabilidade do USUÁRIO.
d) Chaveiro Automotivo: Envio de um profissional para abertura do veículo em caso de perda, quebra ou trancamento da chave em seu interior. Os custos para confecção de uma nova chave são de responsabilidade do USUÁRIO.
e) Troca de Pneu: Envio de um profissional para substituir o pneu furado ou danificado pelo estepe do veículo.
f) Transporte Alternativo: Caso o veículo precise ser rebocado, será disponibilizado um meio de transporte para o USUÁRIO e os ocupantes (respeitando a lotação oficial do veículo) seguirem até seu destino ou retornarem à sua origem, prevalecendo o que for mais próximo.

CLÁUSULA 8ª - CONDIÇÕES ESPECÍFICAS DO SERVIÇO DE GUINCHO COM KM LIVRE
8.1. O serviço de "Guincho com KM Livre" garante o reboque do veículo do local do evento até o estabelecimento qualificado mais próximo e adequado para a resolução do problema específico que imobilizou o veículo.
8.2. A definição do "estabelecimento mais próximo e adequado" será realizada pela central de operações da CAUTOO, com base na natureza da pane ou do dano informado pelo USUÁRIO.
8.3. A título de exemplo, e não se limitando a estas situações:
a) Em caso de pane elétrica, o veículo será rebocado para a oficina especializada em elétrica mais próxima, independentemente da distância (seja 1 km ou 400 km).
b) Em caso de pane mecânica, o veículo será rebocado para a oficina mecânica geral mais próxima.
c) Em caso de colisão que demande reparos de funilaria, o veículo será rebocado para a oficina de funilaria e pintura mais próxima.
d) Em caso de pneu furado sem estepe ou sem condições de troca no local, o veículo será rebocado para a borracharia mais próxima.
8.4. Caso o USUÁRIO opte por remover o veículo para um local de sua livre escolha, o mesmo deve estar em um raio de 50km do ponto de origem. Caso contrário, o USUÁRIO deve seguir a orientação da CAUTOO e aceitar a remoção para a oficina mais próxima.

CLÁUSULA 9ª - DAS OBRIGAÇÕES DA CAUTOO
9.1. Manter canais de atendimento disponíveis 24 horas por dia, 7 dias por semana, para o recebimento dos chamados de assistência.
9.2. Intermediar, com a máxima agilidade possível, o acionamento de um prestador de serviço qualificado da sua rede de parceiros para atender à solicitação do USUÁRIO.
9.3. Assegurar que a prestação dos serviços listados na Cláusula 7ª ocorra sem qualquer cobrança adicional ao USUÁRIO, nos termos deste contrato.
9.4. Prestar as informações necessárias ao USUÁRIO sobre o andamento do seu atendimento.

CLÁUSULA 10ª - DAS OBRIGAÇÕES DO USUÁRIO
10.1. Fornecer informações precisas e verdadeiras no momento do chamado, incluindo a localização exata, a placa do veículo, a descrição do problema e seus dados de contato.
10.2. Aguardar o prestador de serviço no local informado, sendo obrigatória a sua presença ou de um representante maior de 18 anos.
10.3. Apresentar a documentação do veículo e sua CNH (Carteira Nacional de Habilitação) válida, caso solicitado pelo prestador.
10.4. Zelar pela integridade do "Vale Guincho" e não utilizá-lo para fins fraudulentos ou ilícitos.

CLÁUSULA 11ª - DOS RISCOS E SERVIÇOS EXCLUÍDOS
11.1. Além das exclusões já mencionadas, a CAUTOO não intermediará e não cobrirá os custos de serviços decorrentes das seguintes situações:
a) Veículos com peso bruto total superior a 3,5 toneladas.
b) Eventos ocorridos quando o condutor estiver sob efeito de álcool ou substâncias entorpecentes, não possuir habilitação legal e apropriada, ou quando esta estiver suspensa ou cassada. A recusa do condutor em realizar testes de alcoolemia ou toxicológicos solicitados por autoridade competente no momento do evento será equiparada à constatação de condução sob efeito de tais substâncias para fins de cobertura deste contrato.
c) Danos decorrentes de atos ilícitos, dolosos, de má-fé ou culpa grave do USUÁRIO ou condutor.
d) Participação do veículo em competições, apostas, rachas ou treinos.
e) Trânsito do veículo em locais inapropriados, como praias, dunas, rios ou trilhas.
f) Atos de guerra, comoção civil, tumultos, rebeliões ou fenômenos da natureza de caráter extraordinário (terremotos, maremotos).
g) O custo de peças, componentes, materiais ou combustível necessários para o reparo do veículo. A cobertura se restringe à mão de obra para reparo emergencial no local e/ou ao serviço de reboque.
h) Perda, roubo, furto ou danos a objetos deixados no interior do veículo.
i) Despesas com lucros cessantes, paralisação do veículo ou danos morais.

CLÁUSULA 12ª - DA LIMITAÇÃO DE RESPONSABILIDADE
12.1. A responsabilidade da CAUTOO limita-se estritamente à intermediação entre o USUÁRIO e o prestador de serviço, nos termos deste contrato.
12.2. A execução técnica dos serviços, bem como quaisquer danos diretos ou indiretos causados ao veículo ou a terceiros durante a prestação do serviço, são de responsabilidade exclusiva do prestador de serviço terceirizado.
12.3. A CAUTOO não se responsabiliza por atrasos na chegada do prestador decorrentes de caso fortuito ou força maior, tais como congestionamentos, condições climáticas adversas ou bloqueios de vias.

CLÁUSULA 13ª - DA FRAUDE
13.1. A constatação de fraude, dolo ou má-fé por parte do USUÁRIO na tentativa de acionamento dos serviços, incluindo, mas não se limitando a, fornecer informações falsas sobre o evento ou tentar ativar o "Vale Guincho" após a ocorrência da pane ou acidente, resultará na recusa do atendimento e no cancelamento imediato do "Vale Guincho", sem direito a qualquer tipo de reembolso.

CLÁUSULA 14ª - DO CANCELAMENTO
14.1. Inaplicabilidade do Direito de Arrependimento: Conforme o Código de Defesa do Consumidor, o direito de arrependimento não se aplica ao "Vale Guincho" adquirido em formato de "gift card" em estabelecimentos comerciais parceiros, por se tratar de uma compra presencial. Uma vez adquirido, o "Vale Guincho" físico não será passível de cancelamento com reembolso.

CLÁUSULA 15ª - DA PROTEÇÃO DE DADOS PESSOAIS
15.1. O USUÁRIO, ao aderir a este contrato, autoriza a CAUTOO a coletar, tratar e compartilhar seus dados pessoais com a rede de prestadores e parceiros, para a finalidade exclusiva de viabilizar a prestação dos serviços de assistência, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/18) e com a Política de Privacidade da CAUTOO.

CLÁUSULA 16ª - DAS DISPOSIÇÕES GERAIS
16.1. O presente contrato rege a prestação de serviço do "Vale Guincho" ativado pelo USUÁRIO. A CAUTOO reserva-se o direito de alterar estes termos e condições para futuras aquisições do produto, sendo a versão vigente sempre aquela disponibilizada no site oficial no momento da ativação.

CLÁUSULA 17ª - DO FORO
17.1. Para dirimir quaisquer controvérsias oriundas deste contrato, fica eleito o foro do domicílio do USUÁRIO (Consumidor).

E, por estarem assim justas e contratadas, a adesão se dá pelo aceite eletrônico no momento da ativação do "Vale Guincho".
    `;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header
          className="relative h-[120px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
          style={{ backgroundImage: "url('/fundo-cabecalho.png')" }}
        >
          <div className="relative z-10 text-center">
            <img src="/logo-cautoo.png" alt="Cautoo Logo" className="h-10 mx-auto" />
            <h1 className="text-xl font-bold text-[#25D366] mt-2">Ative seu Vale Guincho</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#25D366]">Vale Guincho Ativado!</h2>
            <p className="text-gray-600">Você receberá a confirmação da ativação por e-mail e WhatsApp</p>
            <Button
              onClick={() => {
                setSuccess(false)
                setCurrentStep(1)
                setShowSummary(false)
                setFormData({
                  codigo: "", nome: "", cpf: "", email: "", whatsapp: "", placa: "", tipoUso: "",
                  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
                })
              }}
              className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 rounded-full"
            >
              Ativar Outro Vale
            </Button>
          </div>
        </div>
        <footer className="bg-black py-4 px-4 text-center">
          <p className="text-xs text-white">
            © 2023 – CNPJ 50.140.507/0001-19
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            Av. Paulista, 1636, São Paulo/SP – CEP 01310-200
          </p>
        </footer>
      </div>
    )
  }

  if (showSummary) {
    const dataAtual = new Date()
    const dataVencimento = new Date(dataAtual)
    dataVencimento.setMonth(dataVencimento.getMonth() + 6)

    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <header
            className="relative h-[120px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
            style={{ backgroundImage: "url('/fundo-cabecalho.png')" }}
          >
            <div className="relative z-10 text-center">
              <img src="/logo-cautoo.png" alt="Cautoo Logo" className="h-10 mx-auto" />
              <h1 className="text-xl font-bold text-[#25D366] mt-2">Ative seu Vale Guincho</h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-[#25D366]">🚗 Tudo pronto {formData.nome.split(" ")[0]}!</h1>
              </div>
              <div className="space-y-4 text-sm">
                <p>Você está prestes a ativar seu Vale Guincho para o veículo:</p>
                <p className="font-semibold">
                  {vehicleData?.marca} {vehicleData?.modelo} {vehicleData?.ano} – Cor: {vehicleData?.cor}
                  <br />
                  Placa: {formData.placa}
                </p>
                <p>📍 Local de residência:</p>
                <p className="font-semibold">
                  {formData.rua}, {formData.numero}, {formData.complemento} – {formData.bairro}
                  <br />
                  {formData.cidade}/{formData.estado} – CEP: {formData.cep}
                </p>
                <p>
                  📅 A validade do seu vale começa após a confirmação e vai até{" "}
                  {dataVencimento.toLocaleDateString("pt-BR")}
                </p>
                <p>⏱️ Lembre-se: há um prazo de carência de 7 dias antes de usar.</p>
                <p>
                  Se as informações estiverem todas certinhas, é só clicar abaixo para ativar seu vale e ficar numa boa!
                  😎
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsContractModalOpen(true)}
                  className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-4 rounded-full"
                >
                  CONFIRMAR E ATIVAR MEU VALE
                </Button>
                <Button
                  onClick={() => setShowSummary(false)}
                  variant="outline"
                  className="w-full border-[#25D366] text-[#25D366] hover:bg-green-50 py-3 rounded-full"
                >
                  🔙 Voltar para corrigir
                </Button>
              </div>
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>🔐 Seus dados estão seguros com a Cautoo.</p>
                <p>📲 A confirmação vai chegar por e-mail e WhatsApp.</p>
              </div>
            </div>
          </div>
          <footer className="bg-black py-4 px-4 text-center">
            <p className="text-xs text-white">
              © 2023 – CNPJ 50.140.507/0001-19
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              Av. Paulista, 1636, São Paulo/SP – CEP 01310-200
            </p>
          </footer>
        </div>
        
        {isMounted && createPortal(
          <ContratoModal
            isOpen={isContractModalOpen}
            isLoading={loading}
            onClose={() => setIsContractModalOpen(false)}
            onConfirm={finalizarCadastro}
            contractText={getContractText()}
          />,
          document.getElementById('modal-portal')!
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header
        className="relative h-[120px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/fundo-cabecalho.png')" }}
      >
        <div className="relative z-10 text-center">
          <img src="/logo-cautoo.png" alt="Cautoo Logo" className="h-10 mx-auto" />
          <h1 className="text-xl font-bold text-[#25D366] mt-2">Ative seu Vale Guincho</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-500">
              {currentStep === 1 && "Validação e dados pessoais"}
              {currentStep === 2 && "Dados do veículo"}
              {currentStep === 3 && "Endereço de residência"}
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${step <= currentStep ? "bg-[#25D366]" : "bg-gray-200"}`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {currentStep === 1 && (
              <>
                <div className="relative">
                  <Input
                    type="text"
                    value={mensagemCodigo}
                    readOnly
                    className={`w-full py-4 px-4 text-center bg-gray-100 border-gray-200 rounded-full font-medium text-lg ${
                      validandoCodigo
                        ? corTextoAlternante
                          ? "text-red-500"
                          : "text-[#25D366]"
                        : codigoValidado
                          ? "text-[#25D366]"
                          : "text-gray-700"
                    }`}
                  />
                  {codigoValidado && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="relative">
                  <img src="/icons/user.png" alt="User" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <Input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Nome completo"
                    required
                    className="w-full py-4 pl-12 pr-4 border-gray-200 rounded-full"
                  />
                  {formData.nome && nomeValido && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="relative">
                  <img src="/icons/text.png" alt="Document" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <Input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="CPF (000.000.000-00)"
                    required
                    className="w-full py-4 pl-12 pr-4 border-gray-200 rounded-full"
                  />
                  {formData.cpf && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {cpfValido ? (
                        <CheckCircle className="text-[#25D366] w-5 h-5" />
                      ) : (
                        <div className="text-red-500 w-5 h-5">✕</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <img src="/icons/mail.png" alt="Email" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email (seuemail@email.com)"
                    required
                    className="w-full py-4 pl-12 pr-4 border-gray-200 rounded-full"
                  />
                  {formData.email && emailValido && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="relative">
                  <img src="/icons/fone.png" alt="Phone" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="WhatsApp (11) 99999-9999"
                    required
                    className="w-full py-4 pl-12 pr-4 border-gray-200 rounded-full"
                  />
                  {formData.whatsapp && whatsappValido && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!codigoValidado || !nomeValido || !cpfValido || !emailValido || !whatsappValido}
                  className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-4 rounded-full text-lg mt-6"
                >
                  Prosseguir
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="relative">
                  <img src="/icons/car.png" alt="Car" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <Input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => handleInputChange("placa", e.target.value)}
                    placeholder="Placa do veículo (ABC-1234 ou ABC1D23)"
                    required
                    className="w-full py-4 pl-12 pr-4 border-gray-200 rounded-full"
                  />
                  {validandoPlaca && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5 animate-spin" />
                  )}
                  {!validandoPlaca && placaValida && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                {mensagemErroCaminhao && (
                  <div className="bg-red-50 p-3 rounded-lg text-sm border border-red-200">
                    <p className="font-semibold text-red-600">🛑 Opa, deu ruim!</p>
                    <p className="text-red-600 mt-1">
                      A gente ainda não consegue atender caminhões, tratorzões ou monstrões acima de 3,5 toneladas.
                    </p>
                    <p className="text-red-600 mt-1">
                      Tenta aí com a placa de um carro ou moto mais "na medida" pra gente poder te ajudar. 😄
                    </p>
                  </div>
                )}

                {vehicleData && (
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <p className="font-semibold text-[#25D366]">
                      🎉 Estamos falando de um {vehicleData.marca} {vehicleData.modelo} {vehicleData.ano} de cor{" "}
                      {vehicleData.cor}!
                    </p>
                    <p className="text-green-600 mt-1">
                      Tudo certo com esse veículo? Então bora garantir sua Assistência 24h!
                    </p>
                  </div>
                )}

                {!vehicleData &&
                  !validandoPlaca &&
                  formData.placa.replace(/[^A-Z0-9]/g, "").length === 7 &&
                  !mensagemErroCaminhao && (
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm border border-yellow-200 space-y-3">
                      <p className="font-semibold text-yellow-700">🤔 Ihhh... não encontramos essa placa!</p>
                      <p className="text-yellow-700">
                        A placa <strong>{formData.placa}</strong> parece estar tirando um cochilo nos nossos registros...
                      </p>
                      <p className="text-yellow-700">
                        Pode ser um erro de digitação ou um veículo fora da base pública.
                      </p>
                      <p className="text-yellow-700">
                        🔁 Dá uma conferida e tenta de novo com a placa certinha, beleza?
                      </p>
                      <p className="text-yellow-700">
                        Se o problema continuar, chama a gente no WhatsApp que damos um help rapidinho! 📲
                      </p>
                      <Button
                        onClick={() => {
                          const mensagem = encodeURIComponent(
                            `Oi, pessoal! Tô tentando ativar meu Vale Guincho, mas a placa do meu carro não tá sendo reconhecida. Me ajudam aí? Vale Guincho - ${formData.codigo}`,
                          )
                          window.open(`https://wa.me/5511955968868?text=${mensagem}`, "_blank")
                        }}
                        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-2 rounded-full text-sm"
                      >
                        📲 Chamar no WhatsApp
                      </Button>
                    </div>
                  )}

                <Select value={formData.tipoUso} onValueChange={(value) => handleInputChange("tipoUso", value)}>
                  <SelectTrigger className="w-full py-4 px-4 border-gray-200 rounded-full">
                    <SelectValue placeholder="Tipo de uso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Uso particular</SelectItem>
                    <SelectItem value="comercial">Uso comercial (Táxi, Uber, entregas, outros)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="flex-1 border-[#25D366] text-[#25D366] hover:bg-green-50 py-3 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!placaValida || !formData.tipoUso || validandoPlaca}
                    className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 rounded-full"
                  >
                    {validandoPlaca ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      "Prosseguir"
                    )}
                  </Button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="CEP da residência (00000-000)"
                    required
                    className="w-full py-4 px-4 border-gray-200 rounded-full"
                  />
                  {cepValido && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    value={formData.rua}
                    onChange={(e) => handleInputChange("rua", e.target.value)}
                    placeholder="Rua"
                    required
                    className="w-full py-4 px-4 border-gray-200 rounded-full"
                  />
                  {formData.rua && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => handleInputChange("numero", e.target.value)}
                      placeholder="Número"
                      required
                      className="w-full py-4 px-4 border-gray-200 rounded-full"
                    />
                    {formData.numero && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange("complemento", e.target.value)}
                      placeholder="Complemento"
                      className="w-full py-4 px-4 border-gray-200 rounded-full"
                    />
                    {formData.complemento && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                    placeholder="Bairro"
                    required
                    className="w-full py-4 px-4 border-gray-200 rounded-full"
                  />
                  {formData.bairro && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                  )}
                </div>

                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      placeholder="Cidade"
                      required
                      className="w-full py-4 px-4 border-gray-200 rounded-full"
                    />
                    {formData.cidade && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      placeholder="Estado"
                      required
                      className="w-20 py-4 px-4 border-gray-200 rounded-full"
                    />
                    {formData.estado && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#25D366] w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1 border-[#25D366] text-[#25D366] hover:bg-green-50 py-3 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setShowSummary(true)}
                    disabled={
                      !cepValido || !formData.rua || !formData.numero || !formData.bairro ||
                      !formData.cidade || !formData.estado
                    }
                    className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 rounded-full"
                  >
                    Finalizar
                  </Button>
                </div>
              </>
            )}
          </div>

          {currentStep === 1 && (
            <div className="text-center text-sm text-gray-500 space-y-2 mt-4">
              <p>
                Ao prosseguir, você declara que leu, compreendeu e concorda com os{" "}
                <a href="#" className="text-[#25D366] underline">
                  Termos de Uso
                </a>{" "}
                da Cautoo.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-black py-4 px-4 text-center">
        <p className="text-xs text-white">
          © 2023 – CNPJ 50.140.507/0001-19
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Av. Paulista, 1636, São Paulo/SP – CEP 01310-200
        </p>
      </footer>
    </div>
  )
}
