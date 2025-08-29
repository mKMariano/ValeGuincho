import { type NextRequest, NextResponse } from "next/server"

// Simulação de armazenamento de configuração
const config = {
  token: process.env.CAUTOO_API_TOKEN || "",
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ token: config.token })
  } catch (error) {
    console.error("Erro ao buscar configuração:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    config.token = token

    return NextResponse.json({ message: "Token salvo com sucesso!" })
  } catch (error) {
    console.error("Erro ao salvar configuração:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
