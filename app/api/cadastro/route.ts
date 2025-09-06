// app/api/cadastro/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
// Importamos 'doc' e 'setDoc' e removemos 'addDoc'
import { collection, doc, setDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
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

    // 1. Criamos um ID de documento personalizado combinando a placa e o código.
    // Removemos caracteres especiais para garantir um ID válido.
    const placaLimpa = dados.placa.replace(/[^a-zA-Z0-9]/g, '');
    const codigoLimpo = dados.codigo.replace(/[^a-zA-Z0-9]/g, '');
    const documentoId = `${placaLimpa}-${codigoLimpo}`;

    // 2. Criamos uma referência ao documento usando o ID personalizado.
    const docRef = doc(db, "valeguinchogiftcard", documentoId);

    // 3. Usamos setDoc para guardar os dados nesse documento.
    await setDoc(docRef, dados);
    console.log("Documento salvo no Firestore com o ID (placa-codigo): ", documentoId);

    // ... (resto da lógica continua igual) ...
    try {
      await fetch("https://giftcard-api-4sk8.onrender.com/api/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: dados.codigo, marcar: true }),
      });
    } catch (error) {
      console.error("Erro Gift Card API:", error);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

