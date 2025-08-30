import { type NextRequest, NextResponse } from "next/server"

// Lendo as configurações das variáveis de ambiente
const API_TOKEN = process.env.CAUTOO_API_TOKEN
const GIFTCARD_API_URL = process.env.GIFTCARD_API_URL

export async function POST(request: NextRequest) {
  console.log("\n--- [ValeGuincho API] Nova requisição recebida em /api/validar-codigo ---");

  try {
    if (!API_TOKEN || !GIFTCARD_API_URL) {
      console.error("[ERRO DE CONFIGURAÇÃO] Variáveis de ambiente CAUTOO_API_TOKEN ou GIFTCARD_API_URL não configuradas no servidor.");
      return NextResponse.json({ status: "erro", mensagem: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const body = await request.json();
    const { codigo, marcar = false } = body;
    console.log("[DADO RECEBIDO] Código:", codigo, "| Marcar:", marcar);

    if (!codigo) {
      console.log("[ERRO DE VALIDAÇÃO] Código não foi fornecido no corpo da requisição.");
      return NextResponse.json({ status: "erro", mensagem: "Código é obrigatório" }, { status: 400 });
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    // Código de teste especial (lógica original mantida)
    if (codigoLimpo === "TESTE1234567890") {
      console.log(`[CASO DE TESTE] Código de teste detectado: ${codigoLimpo}, marcar: ${marcar}`);
      if (marcar) {
        return NextResponse.json({ status: "ok", mensagem: "Código resgatado com sucesso e marcado como usado!" });
      } else {
        return NextResponse.json({ status: "ok", mensagem: "Código de teste válido" });
      }
    }

    console.log(`[CHAMADA EXTERNA] Preparando para chamar a giftcard-api em: ${GIFTCARD_API_URL}`);
    
    const requestBody = {
      codigo: codigoLimpo,
      marcar: marcar,
    };

    const response = await fetch(GIFTCARD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[RESPOSTA RECEBIDA] Status da giftcard-api: ${response.status} ${response.statusText}`);
    
    // Lê a resposta como texto para evitar erro de JSON.parse
    const responseText = await response.text();
    console.log(`[RESPOSTA RECEBIDA] Corpo da resposta (texto): ${responseText}`);

    let result;
    try {
      // Tenta converter o texto para JSON
      result = JSON.parse(responseText);
    } catch (e) {
      // Se falhar, sabemos que a resposta não foi um JSON válido
      console.error("[ERRO DE PARSE] A resposta da giftcard-api não é um JSON válido.");
      throw new Error(`Resposta inválida da API interna: ${responseText}`);
    }

    if (response.ok) {
      console.log("[SUCESSO] Retornando resposta de sucesso para o cliente.");
      return NextResponse.json(result);
    } else {
      console.warn("[FALHA] Retornando resposta de erro da giftcard-api para o cliente.");
      return NextResponse.json(result, { status: response.status });
    }
  } catch (error) {
    console.error("[ERRO INESPERADO] Erro no bloco try...catch:", error);
    const message = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json({ status: "erro", mensagem: message }, { status: 500 });
  }
}
