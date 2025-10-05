export interface AbogaResponse {
  ambito: string;
  tipo_consulta: string;
  resumen_corto: string;
  requisitos: string[];
  pasos: string[];
  plazos: string;
  costos_estimados: string;
  documentos_modelo: Array<{
    nombre: string;
    contenido: string;
  }>;
  campos_minimos_para_redaccion: Array<{
    campo: string;
    tipo: string;
    obligatorio: boolean;
  }>;
  alertas_legales: string[];
  fuentes: Array<{
    nombre: string;
    url: string;
  }>;
  nota: string;
}

export async function getAbogaResponse(userMessage: string): Promise<AbogaResponse> {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('carta') && lowerMessage.includes('notarial')) {
    return getCartaNotarialResponse(userMessage);
  } else if (lowerMessage.includes('denuncia') || lowerMessage.includes('usurpación')) {
    return getDenunciaResponse(userMessage);
  } else if (lowerMessage.includes('desalojo') || lowerMessage.includes('precari')) {
    return getDesalojoResponse(userMessage);
  } else if (lowerMessage.includes('contrato') && lowerMessage.includes('compraventa')) {
    return getContratoCompraventaResponse(userMessage);
  } else if (lowerMessage.includes('sunarp') || lowerMessage.includes('partida')) {
    return getSunarpResponse(userMessage);
  } else {
    return getGeneralResponse(userMessage);
  }
}

function getCartaNotarialResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Carta notarial de requerimiento",
    resumen_corto: "Documento formal con fe notarial para comunicar un requerimiento legal. Sirve como prueba fehaciente de notificación.",
    requisitos: [
      "DNI o RUC del remitente",
      "Datos completos del destinatario",
      "Exposición clara de los hechos",
      "Indicación precisa de lo que se requiere",
      "Plazo para cumplimiento",
      "Documentos sustentatorios (contratos, recibos, etc.)"
    ],
    pasos: [
      "Paso 1: Redactar la carta con todos los datos (remitente, destinatario, hechos, requerimiento, plazo)",
      "Paso 2: Reunir documentos de respaldo (contratos, pagos, comunicaciones previas)",
      "Paso 3: Acudir a la notaría con la carta, DNI y documentos",
      "Paso 4: El notario certifica y genera cargo de recepción",
      "Paso 5: La notaría notifica al destinatario por courier o personalmente",
      "Paso 6: Conservar cargo y constancia de notificación como prueba"
    ],
    plazos: "Notificación: 3-7 días hábiles. Plazo de cumplimiento: según lo indicado en carta (típicamente 5-15 días hábiles).",
    costos_estimados: "S/ 80-150 en Lima. Varía según notaría y departamento. Consultar tarifas locales.",
    documentos_modelo: [
      {
        nombre: "Carta Notarial de Requerimiento",
        contenido: `SEÑOR(A) NOTARIO(A):

Sírvase cursar CARTA NOTARIAL a:

DESTINATARIO: [Nombre completo o razón social]
DNI/RUC: [Número]
DOMICILIO: [Dirección completa]

REMITENTE: [Nombre completo]
DNI: [Número]
DOMICILIO: [Dirección completa]

De mi consideración:

Por medio de la presente me dirijo a usted para comunicarle lo siguiente:

I. ANTECEDENTES

[Describir brevemente los hechos relevantes que motivan el requerimiento. Ej: "El día [fecha] celebramos contrato de arrendamiento sobre el inmueble ubicado en [dirección]..." o "Mantiene deuda pendiente desde [fecha] por concepto de [detalle]..."]

II. OBJETO

Por lo expuesto, le REQUIERO para que en el plazo de [número] días hábiles contados desde la recepción de la presente:

[Indicar claramente lo que se solicita. Ej:
- Proceda a desocupar el inmueble y hacer entrega del mismo
- Efectúe el pago de la suma de S/ [monto] correspondiente a [concepto]
- Cumpla con [obligación específica]]

III. APERCIBIMIENTO

De no atender el presente requerimiento en el plazo indicado, me veré en la necesidad de iniciar las acciones legales que correspondan para salvaguardar mis derechos, reservándome el derecho de reclamar daños y perjuicios.

Sin otro particular, quedo a la espera de su pronta respuesta.

Atentamente,

_______________________
[Firma]
[Nombre completo]
DNI: [Número]

[Ciudad], [Fecha]

ADJUNTO:
- [Listar documentos que se acompañan como sustento]`
      }
    ],
    campos_minimos_para_redaccion: [
      { campo: "Nombre completo remitente", tipo: "text", obligatorio: true },
      { campo: "DNI remitente", tipo: "text", obligatorio: true },
      { campo: "Domicilio remitente", tipo: "text", obligatorio: true },
      { campo: "Nombre/Razón social destinatario", tipo: "text", obligatorio: true },
      { campo: "DNI/RUC destinatario", tipo: "text", obligatorio: false },
      { campo: "Domicilio destinatario", tipo: "text", obligatorio: true },
      { campo: "Hechos resumidos", tipo: "textarea", obligatorio: true },
      { campo: "Lo que se requiere", tipo: "textarea", obligatorio: true },
      { campo: "Plazo otorgado (días hábiles)", tipo: "number", obligatorio: true },
      { campo: "Adjuntos (lista)", tipo: "textarea", obligatorio: false }
    ],
    alertas_legales: [
      "ALERTA LEGAL: Si el requerimiento tiene plazos fatales (ej: resolución contractual, desalojo), verifica plazos legales antes de redactar.",
      "La carta notarial NO garantiza cumplimiento; es requisito previo para acciones judiciales.",
      "Conserva SIEMPRE el cargo de notificación como prueba.",
      "Si el destinatario no se encuentra, solicita notificación mediante cedulón (dejada en domicilio)."
    ],
    fuentes: [
      { nombre: "Ley del Notariado (D. Leg. 1049)", url: "" },
      { nombre: "Colegio de Notarios de Lima", url: "https://www.cnl.org.pe" }
    ],
    nota: "Información general. Verifica normativa vigente y prácticas de tu notaría local. Para situaciones urgentes o complejas, consulta con un abogado."
  };
}

function getDenunciaResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Denuncia por usurpación",
    resumen_corto: "Denuncia penal por ocupación ilegal de inmueble. Requiere prueba de propiedad y despojo violento o clandestino.",
    requisitos: [
      "DNI del denunciante",
      "Documento de propiedad (escritura pública, contrato compraventa)",
      "Pruebas de ocupación ilegal (fotos, videos, testigos)",
      "Constancia de despojo o ingreso ilegal",
      "Certificado de búsqueda catastral SUNARP (recomendado)"
    ],
    pasos: [
      "Paso 1: Reunir documentos de propiedad y pruebas del despojo",
      "Paso 2: Acudir a la comisaría de la jurisdicción del inmueble",
      "Paso 3: Presentar denuncia verbal o escrita con documentos",
      "Paso 4: La policía realiza constatación in situ",
      "Paso 5: Caso pasa a Fiscalía Provincial Penal",
      "Paso 6: Seguimiento del proceso penal"
    ],
    plazos: "Denuncia: inmediata. Investigación fiscal: 30-60 días. Proceso penal: 6-24 meses (variable).",
    costos_estimados: "Gratuito en comisaría y Ministerio Público. Si contratas abogado: S/ 1,500-5,000 (según complejidad).",
    documentos_modelo: [
      {
        nombre: "Denuncia por Usurpación",
        contenido: `SEÑOR COMISARIO DE LA COMISARÍA [NOMBRE]:

Yo, [NOMBRE COMPLETO], identificado con DNI N° [NÚMERO], con domicilio en [DIRECCIÓN], ante usted respetuosamente me presento y digo:

I. PETITORIO
Formulo DENUNCIA PENAL por el delito de USURPACIÓN en agravio de mi persona.

II. HECHOS
[Narrar cronológicamente:
- Cómo adquiriste la propiedad (fecha, forma)
- Cuándo y cómo te enteraste del despojo
- Quién ocupa ilegalmente (si lo conoces)
- Descripción del inmueble (dirección exacta, características)]

Ejemplo: "Soy propietario del inmueble ubicado en [dirección] según Escritura Pública de fecha [fecha] inscrita en la Partida N° [número] de Registros Públicos. El día [fecha] al acudir al inmueble constaté que personas desconocidas habían forzado la puerta e ingresado al inmueble, cambiando las cerraduras..."

III. FUNDAMENTO JURÍDICO
Los hechos constituyen el delito de USURPACIÓN previsto en el artículo 202° del Código Penal.

IV. SOLICITO
- Se reciba la presente denuncia
- Se realice constatación policial en el inmueble
- Se identifique a los ocupantes ilegales
- Se remita lo actuado al Ministerio Público

Adjunto:
- Copia de DNI
- Copia de escritura pública o documento de propiedad
- [Otros documentos]

[Ciudad], [Fecha]

_______________________
Firma
[Nombre completo]
DNI: [Número]`
      }
    ],
    campos_minimos_para_redaccion: [
      { campo: "Nombre completo denunciante", tipo: "text", obligatorio: true },
      { campo: "DNI denunciante", tipo: "text", obligatorio: true },
      { campo: "Domicilio denunciante", tipo: "text", obligatorio: true },
      { campo: "Dirección exacta del inmueble", tipo: "text", obligatorio: true },
      { campo: "Datos del documento de propiedad", tipo: "textarea", obligatorio: true },
      { campo: "Narración de hechos", tipo: "textarea", obligatorio: true },
      { campo: "Fecha del despojo/ocupación", tipo: "text", obligatorio: true }
    ],
    alertas_legales: [
      "ALERTA LEGAL: Usurpación requiere prueba de despojo violento, clandestino o mediante engaño.",
      "Si la ocupación es pacífica por años, podría NO ser usurpación sino precariedad (vía civil).",
      "Denuncia penal NO recupera inmediatamente el inmueble; es proceso separado.",
      "Para recuperación rápida, evalúa también desalojo civil (si aplica)."
    ],
    fuentes: [
      { nombre: "Código Penal - Art. 202° (Usurpación)", url: "" },
      { nombre: "Ministerio Público", url: "https://www.mpfn.gob.pe" }
    ],
    nota: "Información general. Para casos urgentes, consulta inmediatamente con un abogado penalista. El Ministerio Público puede archivarse si no hay elementos suficientes."
  };
}

function getDesalojoResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Desalojo por ocupación precaria",
    resumen_corto: "Proceso judicial civil para recuperar inmueble ocupado sin título válido. Procedimiento rápido (vía sumarísima).",
    requisitos: [
      "Documento de propiedad inscrito en SUNARP",
      "Certificado de búsqueda catastral",
      "Prueba de ocupación del demandado (fotos, testigos)",
      "Carta notarial de requerimiento de desocupación (recomendado)",
      "Pago de aranceles judiciales"
    ],
    pasos: [
      "Paso 1: Obtener certificado literal de SUNARP",
      "Paso 2: Enviar carta notarial requiriendo desocupación",
      "Paso 3: Contratar abogado y preparar demanda de desalojo",
      "Paso 4: Presentar demanda en Juzgado Civil (vía sumarísima)",
      "Paso 5: Notificación al demandado (tiene 5 días para contestar)",
      "Paso 6: Audiencia única (contestación, pruebas, sentencia)",
      "Paso 7: Apelación (si hay) ante Sala Civil",
      "Paso 8: Ejecución de sentencia (lanzamiento con policía)"
    ],
    plazos: "Trámite completo: 6-12 meses (sin apelación). Con apelación: 12-18 meses. Lanzamiento: 30-60 días desde sentencia firme.",
    costos_estimados: "Aranceles judiciales: S/ 400-800. Honorarios abogado: S/ 2,000-5,000. Certificados SUNARP: S/ 20-50. Total estimado: S/ 2,500-6,000.",
    documentos_modelo: [
      {
        nombre: "Esquema de Demanda de Desalojo",
        contenido: `SEÑOR JUEZ DEL [NÚMERO] JUZGADO CIVIL DE [CIUDAD]:

[NOMBRE COMPLETO], identificado con DNI N° [NÚMERO], con domicilio real en [DIRECCIÓN] y domicilio procesal en [DIRECCIÓN], ante usted respetuosamente me presento y digo:

I. PETITORIO
Interpongo demanda de DESALOJO POR OCUPACIÓN PRECARIA contra [NOMBRE DEL OCUPANTE], para que cumpla con desocupar y restituir el inmueble ubicado en [DIRECCIÓN EXACTA].

II. FUNDAMENTOS DE HECHO

1. Soy propietario del inmueble según [especificar: Escritura Pública de fecha X, Partida Electrónica N° X de SUNARP].

2. El demandado ocupa el inmueble SIN TÍTULO ALGUNO que justifique su permanencia [o: su título feneció el día X].

3. He requerido mediante Carta Notarial de fecha [fecha] la desocupación voluntaria, sin obtener respuesta positiva.

4. La ocupación es precaria al carecer de derecho alguno para poseer el bien.

III. FUNDAMENTOS DE DERECHO
Artículos 586°, 911° del Código Civil. Artículo 546° y ss. del Código Procesal Civil.

IV. MEDIOS PROBATORIOS
- Copia literal de SUNARP
- Carta notarial de requerimiento
- [Otros documentos]

V. ANEXOS
- [Listar según CPC]

POR TANTO:
Solicito se admita la demanda y se declare FUNDADA en su oportunidad.

[Ciudad], [Fecha]

_______________________
Firma del demandante

_______________________
Firma y sello del abogado
Reg. CAL N°`
      }
    ],
    campos_minimos_para_redaccion: [
      { campo: "Nombre completo demandante", tipo: "text", obligatorio: true },
      { campo: "DNI demandante", tipo: "text", obligatorio: true },
      { campo: "Domicilio procesal", tipo: "text", obligatorio: true },
      { campo: "Nombre del ocupante", tipo: "text", obligatorio: true },
      { campo: "Dirección exacta del inmueble", tipo: "text", obligatorio: true },
      { campo: "Datos de propiedad (partida SUNARP)", tipo: "textarea", obligatorio: true },
      { campo: "Datos de carta notarial previa", tipo: "text", obligatorio: false }
    ],
    alertas_legales: [
      "ALERTA LEGAL: Proceso judicial requiere OBLIGATORIAMENTE abogado.",
      "Ocupante precario = sin título o título fenecido. Si hay contrato vigente, NO procede este proceso.",
      "Lanzamiento requiere sentencia FIRME (consentida o ejecutoriada).",
      "Acto de lanzamiento lo ejecuta policía con presencia judicial.",
      "Si ocupante opone título, proceso puede volverse más largo (ordinario)."
    ],
    fuentes: [
      { nombre: "Código Procesal Civil - Art. 546° y 586°", url: "" },
      { nombre: "Código Civil - Art. 911°", url: "" },
      { nombre: "Poder Judicial", url: "https://www.pj.gob.pe" }
    ],
    nota: "Información general. Proceso judicial requiere asesoría legal especializada. Consulta con abogado civilista antes de iniciar demanda."
  };
}

function getContratoCompraventaResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Contrato de compraventa simple",
    resumen_corto: "Acuerdo privado de compraventa de bien. Puede elevarse a escritura pública ante notario para bienes inmuebles.",
    requisitos: [
      "DNI de comprador y vendedor",
      "Datos del bien (descripción detallada)",
      "Precio acordado",
      "Forma y plazo de pago",
      "Documento de propiedad del vendedor (si es inmueble: partida SUNARP)"
    ],
    pasos: [
      "Paso 1: Negociar precio y condiciones",
      "Paso 2: Verificar propiedad en SUNARP (si es inmueble)",
      "Paso 3: Redactar contrato con datos completos de partes y bien",
      "Paso 4: Revisar cláusulas (precio, pago, entrega, garantías)",
      "Paso 5: Firmar ante notario (obligatorio para inmuebles)",
      "Paso 6: Inscribir en SUNARP (inmuebles)",
      "Paso 7: Pagar impuestos (si aplica)"
    ],
    plazos: "Minuta: 1-3 días. Escritura pública: 5-10 días. Inscripción SUNARP: 7-15 días hábiles.",
    costos_estimados: "Minuta notarial: S/ 150-300. Escritura pública: 1-3% del valor. SUNARP: S/ 30-100. Impuesto Alcabala: 3% del valor (sobre exceso de 10 UIT).",
    documentos_modelo: [
      {
        nombre: "Contrato de Compraventa Simple",
        contenido: `CONTRATO DE COMPRAVENTA

Conste por el presente documento, el Contrato de Compraventa que celebran:

EL VENDEDOR: [Nombre completo], identificado con DNI N° [Número], con domicilio en [Dirección].

EL COMPRADOR: [Nombre completo], identificado con DNI N° [Número], con domicilio en [Dirección].

En los términos y condiciones siguientes:

PRIMERA: EL VENDEDOR declara ser propietario de [descripción del bien. Ej: "el inmueble ubicado en [dirección], inscrito en la Partida N° [número] del Registro de Propiedad Inmueble de [lugar]"].

SEGUNDA: Por el presente contrato, EL VENDEDOR transfiere en venta real y enajenación perpetua a EL COMPRADOR el bien descrito.

TERCERA: El precio de la compraventa es de S/ [monto en números] ([monto en letras] Soles), que EL COMPRADOR pagará de la siguiente forma: [especificar: "al contado al momento de la firma" o "en X cuotas de S/ Y cada una..."].

CUARTA: La entrega del bien se realizará el día [fecha] en [lugar].

QUINTA: EL VENDEDOR garantiza que el bien está libre de gravámenes, cargas y/o medidas judiciales, obligándose al saneamiento por evicción.

SEXTA: Los gastos de inscripción registral serán asumidos por [EL COMPRADOR/EL VENDEDOR/ambas partes].

SÉPTIMA: Para cualquier controversia, las partes se someten a la jurisdicción de los jueces de [ciudad], renunciando a cualquier otro fuero.

Firmado en [ciudad], el [fecha].

____________________          ____________________
    EL VENDEDOR                  EL COMPRADOR
   [Nombre y firma]              [Nombre y firma]
    DNI: [Número]                DNI: [Número]`
      }
    ],
    campos_minimos_para_redaccion: [
      { campo: "Nombre completo vendedor", tipo: "text", obligatorio: true },
      { campo: "DNI vendedor", tipo: "text", obligatorio: true },
      { campo: "Domicilio vendedor", tipo: "text", obligatorio: true },
      { campo: "Nombre completo comprador", tipo: "text", obligatorio: true },
      { campo: "DNI comprador", tipo: "text", obligatorio: true },
      { campo: "Domicilio comprador", tipo: "text", obligatorio: true },
      { campo: "Descripción completa del bien", tipo: "textarea", obligatorio: true },
      { campo: "Precio total (S/)", tipo: "number", obligatorio: true },
      { campo: "Forma de pago", tipo: "textarea", obligatorio: true },
      { campo: "Fecha de entrega", tipo: "text", obligatorio: true }
    ],
    alertas_legales: [
      "ALERTA LEGAL: Compraventa de INMUEBLES requiere ESCRITURA PÚBLICA ante notario e inscripción en SUNARP para transferir propiedad.",
      "Contrato privado de inmueble NO transfiere propiedad, solo genera obligación de otorgar escritura.",
      "Verifica SIEMPRE en SUNARP que el vendedor es propietario registral y que no hay cargas.",
      "Consulta con abogado antes de pagar el total del precio."
    ],
    fuentes: [
      { nombre: "Código Civil - Art. 1529° y ss.", url: "" },
      { nombre: "SUNARP", url: "https://www.sunarp.gob.pe" }
    ],
    nota: "Información general. Para compraventas de inmuebles, consulta OBLIGATORIAMENTE con abogado y notario. No pagues sin verificar titularidad."
  };
}

function getSunarpResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Búsqueda de partida registral en SUNARP",
    resumen_corto: "Obtención de certificado de propiedad de inmueble o vehículo. Consulta en línea o presencial.",
    requisitos: [
      "Número de partida registral (si lo tienes) o",
      "Dirección exacta del inmueble o",
      "Placa del vehículo",
      "Pago de tasa registral (en línea o presencial)"
    ],
    pasos: [
      "Paso 1: Ingresar a www.sunarp.gob.pe",
      "Paso 2: Ir a 'Servicios en Línea' > 'Publicidad Registral'",
      "Paso 3: Elegir tipo (inmueble/vehículo/persona jurídica)",
      "Paso 4: Buscar por número de partida, dirección o placa",
      "Paso 5: Pagar tasa en línea (tarjeta/banca)",
      "Paso 6: Descargar certificado literal o de gravámenes",
      "Paso 7: Alternativamente, acudir a oficina SUNARP con DNI y pagar en ventanilla"
    ],
    plazos: "En línea: inmediato (24/7). Presencial: mismo día (espera de 30-60 min).",
    costos_estimados: "Certificado literal en línea: S/ 18. Búsqueda catastral: S/ 7. Certificado de gravámenes: S/ 13. Presencial: mismas tarifas + S/ 3 comisión.",
    documentos_modelo: [],
    campos_minimos_para_redaccion: [],
    alertas_legales: [
      "Certificado literal muestra historial completo de propiedad.",
      "Certificado de gravámenes indica cargas, hipotecas, embargos.",
      "SIEMPRE verifica antes de comprar inmueble o vehículo.",
      "Búsqueda por dirección puede arrojar múltiples partidas; verifica bien."
    ],
    fuentes: [
      { nombre: "SUNARP - Servicios en Línea", url: "https://www.sunarp.gob.pe/seccion/servicios/servicios-registrales-en-linea.html" },
      { nombre: "Tarifario SUNARP", url: "https://www.sunarp.gob.pe" }
    ],
    nota: "Información general. Para dudas sobre interpretación de asientos registrales, consulta con abogado."
  };
}

function getGeneralResponse(message: string): AbogaResponse {
  return {
    ambito: "Perú",
    tipo_consulta: "Consulta general",
    resumen_corto: "Para brindarte información precisa, necesito más detalles sobre tu situación legal.",
    requisitos: [],
    pasos: [],
    plazos: "Depende del tipo de trámite",
    costos_estimados: "Varía según procedimiento",
    documentos_modelo: [],
    campos_minimos_para_redaccion: [],
    alertas_legales: [
      "Para asistencia precisa, especifica: tipo de documento (carta notarial, denuncia, contrato), área legal (civil, penal, laboral), y tu situación concreta."
    ],
    fuentes: [],
    nota: "Puedo ayudarte con: cartas notariales, denuncias, desalojo, contratos, búsquedas SUNARP, poderes, certificados. ¿Qué necesitas?"
  };
}
