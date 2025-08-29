import { type NextRequest, NextResponse } from "next/server"

// Simulação de banco de dados em memória (replicando estrutura do WordPress)
const formularios: any[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Sanitização dos dados (replicando sanitize_text_field do WordPress)
    const dados = {
      codigo: (data.codigo || "").toString().trim(),
      nome: (data.nome || "").toString().trim(),
      cpf: (data.cpf || "").toString().trim(),
      email: (data.email || "").toString().trim().toLowerCase(),
      whatsapp: (data.whatsapp || "").toString().trim(),
      placa: (data.placa || "").toString().trim(),
      tipoUso: (data.tipoUso || "").toString().trim(),
      cep: (data.cep || "").toString().trim(),
      rua: (data.rua || "").toString().trim(),
      numero: (data.numero || "").toString().trim(),
      complemento: (data.complemento || "").toString().trim(),
      bairro: (data.bairro || "").toString().trim(),
      cidade: (data.cidade || "").toString().trim(),
      estado: (data.estado || "").toString().trim(),
      segmento: (data.segmento || "").toString().trim(),
      data_envio: new Date().toISOString().replace("T", " ").substring(0, 19), // Formato MySQL
      primeiro_nome: (data.primeiro_nome || "").toString().trim(),
    }

    // Inserir no "banco" (replicando $wpdb->insert)
    const novoId = formularios.length + 1
    const cadastro = {
      id: novoId,
      ...dados,
      exportado: 0,
    }
    formularios.push(cadastro)

    // Gift Card API (URL exata do plugin)
    try {
      await fetch("https://giftcard-api-4sk8.onrender.com/api/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: dados.codigo, marcar: true }),
      })
    } catch (error) {
      console.error("Erro Gift Card API:", error)
    }

    // Buscar dados da placa se disponível (replicando lógica do plugin)
    let dadosVeiculo = { marca: "", modelo: "", ano: "", cor: "", segmento: "" }
    if (dados.placa) {
      try {
        const token = process.env.PLACA_API_TOKEN || ""
        const respostaVeiculo = await fetch("https://api.placafipe.com.br/getplaca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placa: dados.placa,
            token: token,
          }),
          signal: AbortSignal.timeout(15000),
        })

        if (respostaVeiculo.ok) {
          const body = await respostaVeiculo.json()
          if (body.codigo === 1) {
            const info = body.informacoes_veiculo
            dadosVeiculo = {
              marca: info.marca || "",
              modelo: info.modelo || "",
              ano: info.ano || "",
              cor: info.cor || "",
              segmento: info.segmento || "",
            }
          }
        }
      } catch (error) {
        console.error("Erro consulta placa:", error)
      }
    }

    // Envio ao Google Sheets (URL exata do plugin)
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbykdyxI9wH6eQwLj1uClFah73ivYoitpNBlwXvuIhbG0x_A2RKxh3XVQjt5di3wOGrrPg/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...dados,
            segmento: dadosVeiculo.segmento || dados.segmento, // Usa segmento da API de placas
            uso: dados.tipoUso,
            planilha: "Dados",
          }),
        },
      )
    } catch (error) {
      console.error("Erro Google Sheets:", error)
    }

    // Envio ao BotConversa webhook
    try {
      await fetch("https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/21205/4aV0z3eza7Dv/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dados,
          ...dadosVeiculo,
          DDI: "55",
        }),
      })
    } catch (error) {
      console.error("Erro BotConversa webhook:", error)
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Erro no cadastro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Getter para acessar dados (usado pelas rotas admin)
export function getFormularios() {
  return formularios
}
