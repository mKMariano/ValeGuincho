import { type NextRequest, NextResponse } from "next/server"

const API_TOKEN = process.env.CAUTOO_API_TOKEN
const GIFTCARD_API_URL = "https://giftcard.cautoo.com.br/api/resgatar"

export async function POST(request: NextRequest) {
  try {
    if (!API_TOKEN) {
      console.error("CAUTOO_API_TOKEN não está configurado nas variáveis de ambiente")
      return NextResponse.json({ status: "erro", mensagem: "Configuração do servidor incompleta" }, { status: 500 })
    }

    const { codigo, marcar = false } = await request.json()

    if (!codigo) {
      return NextResponse.json({ status: "erro", mensagem: "Código é obrigatório" }, { status: 400 })
    }

    const codigoLimpo = codigo.trim().toUpperCase()

    // Código de teste especial
    if (codigoLimpo === "TESTE1234567890") {
      console.log(`Código de teste detectado: ${codigoLimpo}, marcar: ${marcar}`)

      if (marcar) {
        return NextResponse.json({
          status: "ok",
          mensagem: "Código resgatado com sucesso e marcado como usado!",
        })
      } else {
        return NextResponse.json({
          status: "ok",
          mensagem: "Código de teste válido",
        })
      }
    }

    console.log(`Validando código: ${codigo}, marcar: ${marcar}`)

    const response = await fetch(GIFTCARD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        codigo: codigoLimpo,
        marcar: marcar,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: response.status })
    }
  } catch (error) {
    console.error("Erro na validação do código:", error)
    return NextResponse.json({ status: "erro", mensagem: "Erro interno do servidor" }, { status: 500 })
  }
}
