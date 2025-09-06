// app/api/admin/placas/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export async function GET() {
  try {
    // 1. Cria uma consulta na coleção "consultasapiplacas"
    // 2. Ordena os resultados pela data mais recente
    // 3. Limita a busca aos últimos 100 registros
    const q = query(collection(db, "consultasapiplacas"), orderBy("data", "desc"), limit(100));
    
    const querySnapshot = await getDocs(q);
    const consultas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      consultas,
    });
  } catch (error) {
    console.error("Erro ao buscar consultas de placa:", error);
    return NextResponse.json({ error: "Erro ao buscar consultas de placa" }, { status: 500 });
  }
}
