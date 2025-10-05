import React, { useState } from 'react';
import { Copy, Check, FileText, AlertTriangle } from 'lucide-react';
import type { AbogaResponse } from '../lib/abogaAssistant';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: AbogaResponse;
}

export function ChatMessage({ role, content, structuredResponse }: ChatMessageProps) {
  const [copiedDocument, setCopiedDocument] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDocument(index);
    setTimeout(() => setCopiedDocument(null), 2000);
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-2xl">
          {content}
        </div>
      </div>
    );
  }

  if (!structuredResponse) {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-4xl w-full shadow-sm">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{structuredResponse.tipo_consulta}</h3>
          <p className="text-gray-600 mt-1">{structuredResponse.resumen_corto}</p>
        </div>

        {structuredResponse.alertas_legales.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-2">Alertas Legales</h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {structuredResponse.alertas_legales.map((alerta, i) => (
                    <li key={i}>{alerta}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {structuredResponse.requisitos.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Requisitos</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {structuredResponse.requisitos.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {structuredResponse.pasos.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Pasos a seguir</h4>
            <ol className="space-y-2">
              {structuredResponse.pasos.map((paso, i) => (
                <li key={i} className="text-gray-700">{paso}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Plazos</h4>
            <p className="text-sm text-gray-700">{structuredResponse.plazos}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Costos estimados</h4>
            <p className="text-sm text-gray-700">{structuredResponse.costos_estimados}</p>
          </div>
        </div>

        {structuredResponse.documentos_modelo.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText size={18} className="mr-2" />
              Documentos modelo
            </h4>
            {structuredResponse.documentos_modelo.map((doc, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{doc.nombre}</h5>
                  <button
                    onClick={() => copyToClipboard(doc.contenido, i)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copiedDocument === i ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200 max-h-96 overflow-y-auto">
                  {doc.contenido}
                </pre>
              </div>
            ))}
          </div>
        )}

        {structuredResponse.fuentes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Fuentes</h4>
            <ul className="space-y-1">
              {structuredResponse.fuentes.map((fuente, i) => (
                <li key={i} className="text-sm text-gray-700">
                  {fuente.url ? (
                    <a href={fuente.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {fuente.nombre}
                    </a>
                  ) : (
                    fuente.nombre
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">
          {structuredResponse.nota}
        </div>
      </div>
    </div>
  );
}
