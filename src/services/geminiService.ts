import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeSecurityVideo(videoBase64: string, mimeType: string, targetColor?: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `Analiza este video de seguridad del municipio de Pácora (Caldas, Colombia o similar).
  
  Tu tarea es:
  1. Extraer todas las placas (matrículas) de vehículos que sean visibles.
  2. Determinar si hay algún choque (accidente) de carros en el video.
  3. Si el usuario especificó un color (${targetColor || 'cualquiera'}), identifica las placas de los carros de ese color.
  4. Identificar cualquier comportamiento sospechoso o situación de riesgo (personas merodeando, velocidad inusual, objetos abandonados, etc.).
  5. Proveer consejos específicos de seguridad para residentes de Pácora, basándote en el contexto del video y conocimientos generales de la zona.

  Responde estrictamente en formato JSON con la siguiente estructura:
  {
    "licensePlates": ["ABC-123", "XYZ-789"],
    "platesByColor": { "${targetColor || 'detectados'}": ["ABC-123"] },
    "carCrashDetected": true | false,
    "crashDescription": "Breve descripción del choque si fue detectado",
    "suspiciousActivity": {
      "description": "Descripción detallada de lo observado.",
      "riskLevel": "bajo" | "medio" | "alto",
      "recommendation": "Acción inmediata recomendada."
    },
    "pacoraSecurityTips": ["Consejo 1", "Consejo 2", "Consejo 3"]
  }`;

  const videoPart = {
    inlineData: {
      data: videoBase64,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [videoPart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            licensePlates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de todas las placas identificadas."
            },
            platesByColor: {
              type: Type.OBJECT,
              additionalProperties: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: "Placas filtradas por color."
            },
            carCrashDetected: {
              type: Type.BOOLEAN,
              description: "Indica si se detectó un choque de vehículos."
            },
            crashDescription: {
              type: Type.STRING,
              description: "Descripción del accidente detectado."
            },
            suspiciousActivity: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                riskLevel: { 
                  type: Type.STRING,
                  enum: ["bajo", "medio", "alto"]
                },
                recommendation: { type: Type.STRING }
              },
              required: ["description", "riskLevel", "recommendation"]
            },
            pacoraSecurityTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Consejos de seguridad para Pácora."
            }
          },
          required: ["licensePlates", "carCrashDetected", "suspiciousActivity", "pacoraSecurityTips"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No se obtuvo respuesta de la IA.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
}
