"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface CadastroData {
  id: number
  codigo: string
  nome: string
  cpf: string
  email: string
  whatsapp: string
  placa: string
  cep: string
  exportado: number
  data_envio: string
}

interface PlacaConsulta {
  id: string
  placa: string
  marca?: string
  modelo?: string
  ano?: string
  timestamp: string
}

export default function AdminPage() {
  const [cadastros, setCadastros] = useState<CadastroData[]>([])
  const [placas, setPlacas] = useState<PlacaConsulta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [placaConsulta, setPlacaConsulta] = useState("")
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const porPagina = 20

  useEffect(() => {
    loadData()
  }, [pagina])

  const loadData = async () => {
    try {
      const [cadastrosRes, placasRes] = await Promise.all([
        fetch(`/api/admin/cadastros?pagina=${pagina}&por_pagina=${porPagina}`),
        fetch("/api/admin/placas"),
      ])

      const cadastrosData = await cadastrosRes.json()
      const placasData = await placasRes.json()

      setCadastros(cadastrosData.dados || [])
      setTotalPaginas(cadastrosData.total_paginas || 1)
      setPlacas(placasData.placas || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = async () => {
    try {
      const response = await fetch("/api/admin/export")

      if (response.status === 404) {
        toast({
          title: "Nenhum novo dado",
          description: "Nenhum novo dado para exportar.",
        })
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cautoo_export_${new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]}_${new Date().toTimeString().split(" ")[0].replace(/:/g, "")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Exportação concluída",
        description: "Arquivo CSV baixado com sucesso.",
      })

      loadData() // Recarregar dados após exportação
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      })
    }
  }

  const consultarPlaca = async () => {
    if (!placaConsulta.trim()) return

    try {
      const response = await fetch("/api/consulta-placa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: placaConsulta }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Consulta realizada",
          description: `Dados da placa ${placaConsulta} consultados com sucesso.`,
        })
        setPlacaConsulta("")
        loadData() // Recarrega os dados
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const filteredCadastros = cadastros.filter(
    (cadastro) =>
      cadastro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cadastro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cadastro.cpf.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dados do Formulário</h1>
          <div className="flex gap-4">
            <Link href="/admin/placas">
              <Button variant="outline">Consultas de Placas</Button>
            </Link>
            <Link href="/admin/config">
              <Button variant="outline">Configurações</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="cadastros" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
            <TabsTrigger value="placas">Consultas de Placas</TabsTrigger>
            <TabsTrigger value="consultar">Consultar Placa</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastros">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cadastros de Clientes</CardTitle>
                    <CardDescription>Lista de todos os cadastros realizados</CardDescription>
                  </div>
                  <Button onClick={exportarCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar novos dados CSV
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>CEP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCadastros.map((linha) => (
                      <TableRow key={linha.id}>
                        <TableCell>{linha.data_envio}</TableCell>
                        <TableCell>{linha.codigo}</TableCell>
                        <TableCell>{linha.nome}</TableCell>
                        <TableCell>{linha.cpf}</TableCell>
                        <TableCell>{linha.email}</TableCell>
                        <TableCell>{linha.whatsapp}</TableCell>
                        <TableCell>{linha.placa}</TableCell>
                        <TableCell>{linha.cep}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-2 mt-6 justify-center">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
                    <Button
                      key={numeroPagina}
                      variant={pagina === numeroPagina ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPagina(numeroPagina)}
                    >
                      {numeroPagina}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placas">
            <Card>
              <CardHeader>
                <CardTitle>Consultas de Placas</CardTitle>
                <CardDescription>Histórico de consultas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Data Consulta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placas.map((placa) => (
                      <TableRow key={placa.id}>
                        <TableCell className="font-medium">{placa.placa}</TableCell>
                        <TableCell>{placa.marca || "-"}</TableCell>
                        <TableCell>{placa.modelo || "-"}</TableCell>
                        <TableCell>{placa.ano || "-"}</TableCell>
                        <TableCell>{new Date(placa.timestamp).toLocaleDateString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultar">
            <Card>
              <CardHeader>
                <CardTitle>Consultar Placa</CardTitle>
                <CardDescription>Realize uma nova consulta de placa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite a placa (ABC-1234)"
                    value={placaConsulta}
                    onChange={(e) => setPlacaConsulta(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={consultarPlaca}>
                    <Search className="mr-2 h-4 w-4" />
                    Consultar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
