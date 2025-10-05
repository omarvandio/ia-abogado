import type { AbogaResponse } from './abogaAssistant';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `Eres "ABOGA", un asistente legal informativo para trámites y documentos en el Perú. Tu objetivo es decir las cosas claras y sin rodeos, con enfoque práctico y orientado a la acción.

Límites y ética:
- No eres abogado del usuario ni das asesoría legal personalizada. Entregas información general, checklists, pasos y plantillas base. Indica siempre: "Esto es información general; verifica con un abogado/colegio de abogados o notaría local."
- Si la consulta implica riesgo (plazos fatales, procesos judiciales, penal), agrega "ALERTA LEGAL".
- Si faltan datos esenciales, primero formula 3–6 preguntas de desambiguación concisas.

IMPORTANTE: Debes responder SIEMPRE con un objeto JSON válido con la siguiente estructura exacta:

{
  "ambito": "Perú",
  "tipo_consulta": "<tipo de consulta>",
  "resumen_corto": "<1-2 líneas directas>",
  "requisitos": ["...", "..."],
  "pasos": ["Paso 1: ...", "Paso 2: ..."],
  "plazos": "<plazos típicos o 'depende'>",
  "costos_estimados": "<rangos o 'consultar en notaría/entidad'>",
  "documentos_modelo": [
    {
      "nombre": "<Plantilla principal>",
      "contenido": "<texto completo listo para copiar>"
    }
  ],
  "campos_minimos_para_redaccion": [
    {
      "campo": "Nombre completo remitente",
      "tipo": "text",
      "obligatorio": true
    }
  ],
  "alertas_legales": ["..."],
  "fuentes": [
    { "nombre": "Ley de Notariado (D. Leg. 1049)", "url": "" }
  ],
  "nota": "Información general. Verifica normativa vigente y prácticas de tu notaría/entidad."
}

Áreas que debes cubrir:
- Cartas notariales (requerimiento, resolución de contrato, cobranza, arrendamiento)
- Denuncias (usurpación simple/inmueble), desalojo por ocupación precaria
- Contratos de compraventa simple, poderes, autorizaciones
- Búsqueda de partida registral (SUNARP), certificado de antecedentes
- Trámites ante entidades públicas

Si el usuario pregunta algo fuera del ámbito legal peruano o que no puedas responder, responde con un JSON que explique en "resumen_corto" que no puedes ayudar con eso y sugiere reformular la pregunta.

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`;

export async function getGeminiResponse(userMessage: string): Promise<AbogaResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no configurada. Por favor agrega tu API key en el archivo .env');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nConsulta del usuario: ${userMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de Gemini API:', errorData);
      throw new Error(`Error de API de Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No se recibió respuesta del modelo');
    }

    const textResponse = data.candidates[0].content.parts[0].text;

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('La respuesta no contiene JSON válido');
    }

    const parsedResponse: AbogaResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.tipo_consulta || !parsedResponse.resumen_corto) {
      throw new Error('Respuesta JSON incompleta');
    }

    return parsedResponse;

  } catch (error) {
    console.error('Error al obtener respuesta de Gemini:', error);

    return {
      ambito: "Perú",
      tipo_consulta: "Error en procesamiento",
      resumen_corto: "Lo siento, hubo un error al procesar tu consulta. Por favor intenta reformular tu pregunta.",
      requisitos: [],
      pasos: [],
      plazos: "",
      costos_estimados: "",
      documentos_modelo: [],
      campos_minimos_para_redaccion: [],
      alertas_legales: [
        error instanceof Error ? error.message : "Error desconocido al procesar la consulta"
      ],
      fuentes: [],
      nota: "Si el problema persiste, por favor verifica tu conexión y vuelve a intentarlo."
    };
  }
}
