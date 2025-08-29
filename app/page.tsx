"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"

interface FormData {
  // Etapa 1
  codigo: string
  nome: string
  cpf: string
  email: string
  whatsapp: string // Adicionado campo WhatsApp

  // Etapa 2
  placa: string
  tipoUso: string

  // Etapa 3
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

interface VehicleData {
  marca: string
  modelo: string
  ano: string
  cor: string
  segmento: string // Adicionado campo segmento
}

export default function CadastroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    codigo: "",
    nome: "",
    cpf: "",
    email: "",
    whatsapp: "", // Inicializado campo WhatsApp
    placa: "",
    tipoUso: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  })
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [codigoValidado, setCodigoValidado] = useState(false)
  const [cpfValido, setCpfValido] = useState(false)
  const [placaValida, setPlacaValida] = useState(false)
  const [cepValido, setCepValido] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [success, setSuccess] = useState(false)
  const [nomeValido, setNomeValido] = useState(false)
  const [emailValido, setEmailValido] = useState(false)
  const [whatsappValido, setWhatsappValido] = useState(false)
  const [validandoPlaca, setValidandoPlaca] = useState(false)
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const [mensagemCodigo, setMensagemCodigo] = useState("")
  const [corTextoAlternante, setCorTextoAlternante] = useState(false)
  const [mensagemErroCaminhao, setMensagemErroCaminhao] = useState(false) // Adicionado estado para controlar mensagem de erro para caminhões

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const codigoFromUrl = urlParams.get("codigo")

    if (!codigoFromUrl) {
      window.location.href = "https://cautoo.com.br/errodeativacao/"
      return
    }

    window.history.replaceState({}, document.title, window.location.pathname)

    setFormData((prev) => ({ ...prev, codigo: codigoFromUrl }))
    validarCodigo(codigoFromUrl)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (validandoCodigo) {
      interval = setInterval(() => {
        setCorTextoAlternante((prev) => !prev)
      }, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [validandoCodigo])

  const validarCodigo = async (codigo: string) => {
    if (!codigo) return

    setValidandoCodigo(true)
    setMensagemCodigo("Autenticando seu Vale Guincho, só um instante!")
    setLoading(true)

    try {
      const response = await fetch("/api/validar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, marcar: false }),
      })

      const result = await response.json()

      if (response.ok && result.status === "ok") {
        setCodigoValidado(true)
        setValidandoCodigo(false)
        setMensagemCodigo("Seu Vale Guincho foi autenticado!")
        toast({
          title: "Código válido!",
          description: "Preencha os dados para continuar.",
        })
      } else {
        toast({
          title: "Código inválido",
          description: result.mensagem || "Redirecionando...",
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = "https://cautoo.com.br/errodeativacao/"
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Redirecionando...",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "https://cautoo.com.br/errodeativacao/"
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, "")

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += Number.parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== Number.parseInt(cpf.charAt(9))) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += Number.parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0

    return resto === Number.parseInt(cpf.charAt(10))
  }

  const validarNomeCompleto = (nome: string): boolean => {
    const nomes = nome
      .trim()
      .split(" ")
      .filter((n) => n.length > 0)
    return nomes.length >= 2 && nomes.every((n) => n.length >= 2)
  }

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validarWhatsApp = (whatsapp: string): boolean => {
    const whatsappLimpo = whatsapp.replace(/[^\d]/g, "")
    return whatsappLimpo.length >= 10 && whatsappLimpo.length <= 11
  }

  const aplicarMascaraPlaca = (placa: string): string => {
    placa = placa.replace(/[^A-Z0-9]/g, "")

    if (placa.length <= 3) {
      return placa
    } else if (placa.length <= 7) {
      // Formato antigo: ABC-1234
      if (placa.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(placa)) {
        return `${placa.slice(0, 3)}-${placa.slice(3)}`
      }
      // Formato Mercosul: ABC1D23
      if (placa.length === 7 && /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa)) {
        return placa
      }
      // Durante digitação
      if (placa.length > 3) {
        return `${placa.slice(0, 3)}-${placa.slice(3)}`
      }
    }

    return placa.slice(0, 8) // Limita o tamanho
  }

  const aplicarMascaraCPF = (cpf: string): string => {
    cpf = cpf.replace(/[^\d]/g, "")

    if (cpf.length <= 3) {
      return cpf
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
    }
  }

  const aplicarMascaraWhatsApp = (whatsapp: string): string => {
    whatsapp = whatsapp.replace(/[^\d]/g, "")

    if (whatsapp.length <= 2) {
      return whatsapp
    } else if (whatsapp.length <= 7) {
      return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2)}`
    } else if (whatsapp.length <= 11) {
      return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2, 7)}-${whatsapp.slice(7)}`
    } else {
      return `(${whatsapp.slice(0, 2)}) ${whatsapp.slice(2, 7)}-${whatsapp.slice(7, 11)}`
    }
  }

  const aplicarMascaraNome = (nome: string): string => {
    return nome
      .toLowerCase()
      .split(" ")
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(" ")
  }

  const removerMascaraWhatsApp = (whatsapp: string): string => {
    const numeroLimpo = whatsapp.replace(/[^\d]/g, "")
    return `+55${numeroLimpo}`
  }

  const consultarPlaca = async (placa: string) => {
    const placaLimpa = placa.replace(/[^A-Z0-9]/g, "")
    if (!placaLimpa || placaLimpa.length !== 7) return

    setValidandoPlaca(true)
    setMensagemErroCaminhao(false) // Limpar mensagem de erro anterior
    try {
      const response = await fetch("/api/consulta-placa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: placaLimpa }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log("Segmento retornado:", result.data.segmento) // Log para debug

        if (result.data.segmento && result.data.segmento.toUpperCase() === "CAMINHÃO") {
          setPlacaValida(false)
          setVehicleData(null)
          setMensagemErroCaminhao(true) // Mostrar mensagem de erro no card em vez de toast
          return
        }

        setVehicleData({
          marca: result.data.marca || "N/A",
          modelo: result.data.modelo || "N/A",
          ano: result.data.ano || "N/A",
          cor: result.data.cor || "N/A",
          segmento: result.data.segmento || "N/A", // Adicionado campo segmento
        })
        setPlacaValida(true) // Sempre definir como válida se não for caminhão
        toast({
          title: "Placa válida!",
          description: `${result.data.marca} ${result.data.modelo}`,
        })
      } else {
        setPlacaValida(false)
        setVehicleData(null) // Limpar dados do veículo em caso de erro
        setMensagemErroCaminhao(false) // Garantir que não mostra mensagem de caminhão
        toast({
          title: "Placa não encontrada",
          description: "Verifique a placa e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPlacaValida(false)
      setVehicleData(null) // Limpar dados do veículo em caso de erro
      toast({
        title: "Erro na consulta",
        description: "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setValidandoPlaca(false)
    }
  }

  const consultarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/[^\d]/g, "")
    if (cepLimpo.length !== 8) return

    setLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const result = await response.json()

      if (!result.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: result.logradouro || "",
          bairro: result.bairro || "",
          cidade: result.localidade || "",
          estado: result.uf || "",
        }))
        setCepValido(true)
        toast({
          title: "CEP encontrado!",
          description: `${result.localidade}/${result.uf}`,
        })
      } else {
        setCepValido(false)
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setCepValido(false)
      toast({
        title: "Erro na consulta",
        description: "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "cpf") {
      value = aplicarMascaraCPF(value)
    }
    if (field === "whatsapp") {
      value = aplicarMascaraWhatsApp(value)
    }
    if (field === "placa") {
      value = aplicarMascaraPlaca(value.toUpperCase())
    }
    if (field === "nome") {
      value = aplicarMascaraNome(value)
    }

    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "nome") {
      setNomeValido(validarNomeCompleto(value))
    }
    if (field === "cpf") {
      setCpfValido(validarCPF(value))
    }
    if (field === "email") {
      setEmailValido(validarEmail(value))
    }
    if (field === "whatsapp") {
      setWhatsappValido(validarWhatsApp(value))
    }
    if (field === "placa") {
      const placaLimpa = value.replace(/[^A-Z0-9]/g, "")
      if (placaLimpa.length === 7) {
        consultarPlaca(placaLimpa)
      } else {
        setPlacaValida(false)
      }
    }
    if (field === "cep" && value.replace(/[^\d]/g, "").length === 8) {
      consultarCEP(value)
    }
  }

  const finalizarCadastro = async () => {
    setLoading(true)
    try {
      const validacaoResponse = await fetch("/api/validar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: formData.codigo, marcar: true }),
      })

      const validacaoResult = await validacaoResponse.json()

      if (!validacaoResponse.ok || validacaoResult.mensagem !== "Código resgatado com sucesso e marcado como usado!") {
        throw new Error(validacaoResult.mensagem || "Erro ao marcar código como usado")
      }

      const primeiroNome = formData.nome.split(" ")[0]

      const dadosParaEnvio = {
        ...formData,
        whatsapp: removerMascaraWhatsApp(formData.whatsapp), // Remove máscara para webhook
        primeiro_nome: primeiroNome, // Adicionado campo do primeiro nome
        segmento: vehicleData ? "AUTOMÓVEL" : "", // Valor padrão já que caminhões são bloqueados
      }

      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnvio),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Vale Guincho ativado com sucesso!",
          description: "Você receberá a confirmação por e-mail e WhatsApp.",
        })
        window.location.href = "https://cautoo.com.br/ativado/"
      } else {
        throw new Error(result.error || "Erro na ativação")
      }
    } catch (error) {
      toast({
        title: "Erro na ativação",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
                  codigo: "",
                  nome: "",
                  cpf: "",
                  email: "",
                  whatsapp: "",
                  placa: "",
                  tipoUso: "",
                  cep: "",
                  rua: "",
                  numero: "",
                  complemento: "",
                  bairro: "",
                  cidade: "",
                  estado: "",
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
                onClick={finalizarCadastro}
                className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-4 rounded-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  "CONFIRMAR E ATIVAR MEU VALE"
                )}
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
                  <img
                    src="/icons/user.png"
                    alt="User"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
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
                  <img
                    src="/icons/text.png"
                    alt="Document"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
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
                  <img
                    src="/icons/mail.png"
                    alt="Email"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
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
                  <img
                    src="/icons/fone.png"
                    alt="Phone"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
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
                  <img
                    src="/icons/car.png"
                    alt="Car"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
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
                        A placa <strong>{formData.placa}</strong> parece estar tirando um cochilo nos nossos
                        registros...
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
                      !cepValido ||
                      !formData.rua ||
                      !formData.numero ||
                      !formData.bairro ||
                      !formData.cidade ||
                      !formData.estado
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
