import { type NextRequest, NextResponse } from "next/server"
import { getFormularios } from "../../cadastro/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = Math.max(1, Number.parseInt(searchParams.get("pagina") || "1"))
    const porPagina = Number.parseInt(searchParams.get("por_pagina") || "20")

    const formularios = getFormularios()
    const total = formularios.length
    const totalPaginas = Math.ceil(total / porPagina)
    const offset = (pagina - 1) * porPagina

    // Ordenar por data_envio DESC e paginar (replicando lógica do plugin)
    const dados = formularios
      .sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime())
      .slice(offset, offset + porPagina)

    return NextResponse.json({
      dados,
      total,
      total_paginas: totalPaginas,
      pagina_atual: pagina,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar cadastros" }, { status: 500 })
  }
}
