import { NextResponse } from "next/server"
import { getFormularios } from "../../cadastro/route"

export async function GET() {
  try {
    const formularios = getFormularios()

    // Filtrar apenas não exportados (exportado = 0)
    const novos = formularios.filter((f) => f.exportado === 0)

    if (novos.length === 0) {
      return NextResponse.json({ error: "Nenhum novo dado para exportar." }, { status: 404 })
    }

    // Gerar CSV (replicando formato do plugin)
    const csvLines = ["codigo,nome,cpf,email,whatsapp,placa,cep,data_envio"]

    novos.forEach((linha) => {
      csvLines.push(
        [
          linha.codigo,
          linha.nome,
          linha.cpf,
          linha.email,
          linha.whatsapp,
          linha.placa,
          linha.cep,
          linha.data_envio,
        ].join(","),
      )
    })

    const csvContent = csvLines.join("\n")

    // Marcar como exportados (exportado = 1)
    novos.forEach((linha) => {
      linha.exportado = 1
    })

    const fileName = `cautoo_export_${new Date().toISOString().split("T")[0].replace(/-/g, "")}_${new Date().toTimeString().split(" ")[0].replace(/:/g, "")}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
