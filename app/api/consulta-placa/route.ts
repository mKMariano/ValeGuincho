// app/api/consulta-placa/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
// Importamos 'doc' e 'setDoc' e removemos 'addDoc'
import { collection, doc, setDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { placa } = await request.json();

    if (!placa) {
      return NextResponse.json({ success: false, data: { mensagem: "Placa não informada." } }, { status: 400 });
    }

    const token = process.env.PLACA_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, data: { mensagem: "Serviço indisponível." } },
        { status: 500 },
      );
    }
    
    const response = await fetch("https://api.placafipe.com.br/getplaca", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Cautoo-System/1.0" },
      body: JSON.stringify({ placa, token }),
    });

    if (!response.ok) {
        return NextResponse.json({ success: false, data: { mensagem: "Erro na API de placas." } }, { status: 500 });
    }

    const body = await response.json();

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
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        data: new Date().toISOString(),
      };

      // Criamos um ID usando apenas a placa.
      const placaId = placa.replace(/[^a-zA-Z0-9]/g, '');
      const docRef = doc(db, "consultasapiplacas", placaId);

      // Usamos setDoc para criar ou substituir o documento.
      await setDoc(docRef, dados);
      console.log("Consulta de placa salva com o ID: ", placaId);

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
      return NextResponse.json({ success: false, data: { mensagem: body.mensagem || "Veículo não encontrado." } }, { status: 404 });
    }
  } catch (error) {
    console.error("Erro na consulta de placa:", error);
    return NextResponse.json({ success: false, data: { mensagem: "Erro interno do servidor." } }, { status: 500 });
  }
}

