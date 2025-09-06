// app/api/admin/cadastros/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, getCountFromServer, doc, getDoc } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = Math.max(1, Number.parseInt(searchParams.get("pagina") || "1"));
    const porPagina = Number.parseInt(searchParams.get("por_pagina") || "20");

    const cadastrosRef = collection(db, "valeguinchogiftcard");
    
    // 1. Contar o total de documentos para a paginação
    const countSnapshot = await getCountFromServer(cadastrosRef);
    const total = countSnapshot.data().count;
    const totalPaginas = Math.ceil(total / porPagina);

    let q = query(cadastrosRef, orderBy("data_envio", "desc"), limit(porPagina));

    // 2. Lógica para buscar a página correta
    if (pagina > 1) {
      // Para encontrar o ponto de partida da página atual, precisamos buscar
      // os documentos até a página anterior.
      const offsetQuery = query(collection(db, "valeguinchogiftcard"), orderBy("data_envio", "desc"), limit((pagina - 1) * porPagina));
      const previousDocsSnapshot = await getDocs(offsetQuery);
      // O "cursor" para a nossa busca será o último documento da página anterior.
      const lastVisible = previousDocsSnapshot.docs[previousDocsSnapshot.docs.length - 1];
      q = query(cadastrosRef, orderBy("data_envio", "desc"), startAfter(lastVisible), limit(porPagina));
    }

    const querySnapshot = await getDocs(q);
    const dados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      dados,
      total,
      total_paginas: totalPaginas,
      pagina_atual: pagina,
    });
  } catch (error) {
    console.error("Erro ao buscar cadastros:", error);
    return NextResponse.json({ error: "Erro ao buscar cadastros" }, { status: 500 });
  }
}
