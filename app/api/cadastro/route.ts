// app/api/cadastro/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// A simulação de banco de dados em memória não é mais necessária
// const formularios: any[] = []

export async function POST(request: NextRequest) {
  // LINHA DE DIAGNÓSTICO: Verifica se a variável de ambiente está sendo lida
  console.log("A chave do projeto Firebase é:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  try {
    const data = await request.json();

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
      data_envio: new Date().toISOString(), // Usando formato padrão ISO 8601
      primeiro_nome: (data.primeiro_nome || "").toString().trim(),
      exportado: false, // Usando booleano para mais clareza
    };

    // Salvar no Firestore na coleção "valeguinchogiftcard"
    const docRef = await addDoc(collection(db, "valeguinchogiftcard"), dados);
    console.log("Documento salvo no Firestore com ID: ", docRef.id);

    // Gift Card API (URL exata do plugin)
    try {
      await fetch("https://giftcard-api-4sk8.onrender.com/api/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: dados.codigo, marcar: true }),
      });
    } catch (error) {
      console.error("Erro Gift Card API:", error);
    }

    // ... (o restante do seu código para consultar a placa, enviar ao Google Sheets e BotConversa continua igual) ...

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// A função getFormularios não é mais necessária neste arquivo, pois os dados vêm do Firestore.
// Vamos removê-la para evitar confusão.
