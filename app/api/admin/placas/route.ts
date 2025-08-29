import { NextResponse } from "next/server"
import { getConsultasPlaca } from "../../consulta-placa/route"

export async function GET() {
  try {
    const consultas = getConsultasPlaca()

    // Ordenar por data DESC e limitar a 100 (replicando lógica do plugin)
    const consultasOrdenadas = consultas
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 100)

    return NextResponse.json({
      consultas: consultasOrdenadas,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar consultas de placa" }, { status: 500 })
  }
}
