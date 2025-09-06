// app/api/cadastro/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  console.log("--- REQUISIÇÃO RECEBIDA EM /api/cadastro ---");
  console.log("VERIFICANDO VARIÁVEIS DE AMBIENTE...");
  console.log("A chave do projeto Firebase é:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente do Firebase não foram carregadas!");
    return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
  }

  try {
    console.log("Processando dados da requisição...");
    const data = await request.json();

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
      data_envio: new Date().toISOString(),
      primeiro_nome: (data.primeiro_nome || "").toString().trim(),
      exportado: false,
    };
    console.log("Dados prontos para salvar:", dados);

    console.log("Tentando salvar no Firestore na coleção 'valeguinchogiftcard'...");
    const docRef = await addDoc(collection(db, "valeguinchogiftcard"), dados);
    console.log("SUCESSO! Documento salvo no Firestore com ID: ", docRef.id);

    try {
      console.log("Marcando código como usado na API GiftCard...");
      await fetch("https://giftcard-api-4sk8.onrender.com/api/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: dados.codigo, marcar: true }),
      });
      console.log("Código marcado como usado.");
    } catch (error) {
      console.error("Erro ao comunicar com a API Gift Card:", error);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("--- ERRO NO BLOCO CATCH DE /api/cadastro ---");
    console.error("Ocorreu um erro ao tentar processar o cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

