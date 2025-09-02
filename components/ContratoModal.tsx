"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ContratoModalProps {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
  contractText: string
}

export function ContratoModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  contractText,
}: ContratoModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    // Fundo escuro (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      {/* Container do Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Contrato de Prestação de Serviços – Vale Guincho
          </h2>
        </div>
        
        {/* Corpo com scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line text-justify">
            {contractText}
          </p>
        </div>
        
        {/* Rodapé com os botões */}
        <div className="p-6 border-t bg-gray-50 flex gap-4 justify-end rounded-b-lg">
          <Button onClick={onClose} variant="outline" className="px-6" disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#25D366] hover:bg-[#1da851] text-white px-6 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ativando...
              </>
            ) : (
              "Li, Concordo e Ativar Vale"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
