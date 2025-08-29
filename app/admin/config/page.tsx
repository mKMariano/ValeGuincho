"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ConfigPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const carregarToken = async () => {
    try {
      const response = await fetch("/api/admin/config")
      const result = await response.json()

      if (response.ok) {
        setToken(result.token || "")
      }
    } catch (error) {
      console.error("Erro ao carregar token:", error)
    }
  }

  const salvarToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Token salvo com sucesso!")
      } else {
        setMessage(result.error || "Erro ao salvar token")
      }
    } catch (error) {
      setMessage("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarToken()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configurações Cautoo</h1>
          <Link href="/admin">
            <Button variant="outline">Voltar aos Dados</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Token da API</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={salvarToken} className="space-y-4">
              <div>
                <Label htmlFor="token">Token da API PlacaFipe</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Digite o token da API"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </form>

            {message && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
