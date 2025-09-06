// app/api/consulta-placa/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// A simulação de banco de dados não é mais necessária
// const consultasPlaca: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { placa } = await request.json();

    if (!placa) {
      return NextResponse.json({ success: false, data: { mensagem: "Placa não informada." } }, { status: 400 });
    }

    const token = process.env.PLACA_API_TOKEN;
    if (!token) {
      console.error("Token PLACA_API_TOKEN não configurado");
      return NextResponse.json(
        { success: false, data: { mensagem: "Serviço de consulta temporariamente indisponível." } },
        { status: 500 },
      );
    }

    console.log("Consultando placa:", placa);

    const response = await fetch("https://api.placafipe.com.br/getplaca", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Cautoo-System/1.0",
      },
      body: JSON.stringify({ placa, token }),
      signal: AbortSignal.timeout(15000),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.error("Erro na API PlacaFipe:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, data: { mensagem: "Erro na conexão com a API de placas." } },
        { status: 500 },
      );
    }

    const body = await response.json();
    console.log("Response body:", body);

    if (body.codigo === 1) {
      const info = body.informacoes_veiculo;

      const dados = {
        placa: placa,
        marca: info.marca || "",
        modelo: info.modelo || "",
        ano: info.ano || "",
        ano_modelo: info.ano_modelo || "",
        cor: info.cor || "",
        chassi: info.chassi || "",
        motor: info.motor || "",
        municipio: info.municipio || "",
        uf: info.uf || "",
        segmento: info.segmento || "",
        sub_segmento: info.sub_segmento || "",
        cilindradas: info.cilindradas || "",
        combustivel: info.combustivel || "",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
        data: new Date().toISOString(),
      };

      // Salvar o log da consulta no Firestore
      await addDoc(collection(db, "consultasapiplacas"), dados);

      // ... (O restante da sua lógica para o Google Sheets continua aqui, se necessário) ...

      return NextResponse.json({
        success: true,
        data: {
          marca: dados.marca,
          modelo: dados.modelo,
          ano: dados.ano,
          cor: dados.cor,
          segmento: dados.segmento,
        },
      });
    } else {
      const mensagem = body.mensagem || "Veículo não encontrado para a placa informada.";
      console.log("Placa não encontrada:", placa, "Mensagem:", mensagem);
      return NextResponse.json({ success: false, data: { mensagem } }, { status: 404 });
    }
  } catch (error) {
    console.error("Erro na consulta de placa:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, data: { mensagem: "Timeout na consulta. Tente novamente." } },
        { status: 408 },
      );
    }
    return NextResponse.json({ success: false, data: { mensagem: "Erro interno do servidor." } }, { status: 500 });
  }
}

// A função getConsultasPlaca não é mais necessária, pois os dados virão do Firestore.
// export function getConsultasPlaca() {
//   return consultasPlaca
// }
