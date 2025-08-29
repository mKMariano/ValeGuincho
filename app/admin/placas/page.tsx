"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface ConsultaPlaca {
  id: number
  placa: string
  marca: string
  modelo: string
  ano: string
  ano_modelo: string
  cor: string
  chassi: string
  motor: string
  municipio: string
  uf: string
  segmento: string
  sub_segmento: string
  cilindradas: string
  combustivel: string
  ip: string
  data: string
}

export default function ConsultasPlacaPage() {
  const [consultas, setConsultas] = useState<ConsultaPlaca[]>([])
  const [loading, setLoading] = useState(true)
  const [consultaLoading, setConsultaLoading] = useState(false)
  const [placa, setPlaca] = useState("")
  const [message, setMessage] = useState("")

  const carregarConsultas = async () => {
    try {
      const response = await fetch("/api/admin/placas")
      const result = await response.json()

      if (response.ok) {
        setConsultas(result.consultas)
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error)
    } finally {
      setLoading(false)
    }
  }

  const consultarPlaca = async (e: React.FormEvent) => {
    e.preventDefault()
    setConsultaLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/consulta-placa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Veículo encontrado: ${result.marca} ${result.modelo} ${result.ano} - ${result.cor}`)
        setPlaca("")
        carregarConsultas() // Recarregar lista
      } else {
        setMessage(result.error || "Erro na consulta")
      }
    } catch (error) {
      setMessage("Erro de conexão")
    } finally {
      setConsultaLoading(false)
    }
  }

  useEffect(() => {
    carregarConsultas()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Consultas de Placas</h1>
          <Link href="/admin">
            <Button variant="outline">Voltar aos Dados</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={consultarPlaca} className="space-y-4">
                <div>
                  <Label htmlFor="placa">Placa do Veículo</Label>
                  <Input
                    id="placa"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="ABC1234"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={consultaLoading}>
                  {consultaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Consultar Placa
                </Button>
              </form>

              {message && (
                <Alert className="mt-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Últimas 100 Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Cidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultas.map((consulta) => (
                      <TableRow key={consulta.id}>
                        <TableCell>{new Date(consulta.data).toLocaleString("pt-BR")}</TableCell>
                        <TableCell>{consulta.placa}</TableCell>
                        <TableCell>{consulta.marca}</TableCell>
                        <TableCell>{consulta.modelo}</TableCell>
                        <TableCell>{consulta.ano}</TableCell>
                        <TableCell>{consulta.cor}</TableCell>
                        <TableCell>{consulta.uf}</TableCell>
                        <TableCell>{consulta.municipio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
