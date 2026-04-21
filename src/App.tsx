import { useState, useRef, ChangeEvent } from "react";
import { 
  Shield, 
  Upload, 
  Car, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Loader2,
  X,
  Play,
  Activity,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeSecurityVideo } from "./services/geminiService";
import { AnalysisResult } from "./types";

export default function App() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [targetColor, setTargetColor] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("El video es demasiado grande. Por favor sube uno menor a 20MB.");
        return;
      }
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!video) return;

    setAnalyzing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(video);
      const analysis = await analyzeSecurityVideo(base64, video.type, targetColor);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Error al analizar el video. Por favor intenta de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setVideo(null);
    setVideoUrl(null);
    setTargetColor("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans selection:bg-[#3b82f6] selection:text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-[#1e293b] border-b border-[#334155] px-6 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">P</div>
          <h1 className="text-xl font-semibold tracking-tight">Pacora SafeGuard AI</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="hidden sm:inline">Sistema Activo: Municipio de Pacora</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700 mx-2" />
          <MapPin className="w-4 h-4" />
          <span className="font-medium text-slate-200">PÁCORA, CALDAS</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-[#1e293b] border-r border-[#334155] p-6 flex flex-col gap-6 overflow-y-auto hidden md:flex">
          {/* Filtro de Color */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Car className="w-3 h-3" />
              Filtro de Vehículo
            </h2>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Color del Auto</label>
              <input 
                type="text" 
                value={targetColor}
                onChange={(e) => setTargetColor(e.target.value)}
                placeholder="Ej: Rojo, Azul, Blanco..."
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                disabled={analyzing}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              Consejos de Seguridad
            </h2>
            <div className="space-y-4">
              {result ? (
                result.pacoraSecurityTips.map((tip, index) => (
                  <div key={index} className="text-sm leading-relaxed text-slate-400 border-b border-[#334155] pb-4 last:border-0">
                    <p>{tip}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="text-sm leading-relaxed text-slate-400 border-b border-[#334155] pb-4">
                    <strong>Rondas Vecinales:</strong> Se recomienda reportar vehículos desconocidos en Calle 3ra.
                  </div>
                  <div className="text-sm leading-relaxed text-slate-400 border-b border-[#334155] pb-4">
                    <strong>Iluminación:</strong> Pacora Centro reporta baja luminosidad; refuerce sus luminarias exteriores.
                  </div>
                  <div className="text-sm leading-relaxed text-slate-400">
                    <strong>Contactos:</strong> Estación de Policía Pacora: (507) 291-0000.
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-xs text-blue-300 font-medium">
                <span className="block mb-1 text-blue-400 font-bold uppercase tracking-wider text-[10px]">Tip IA</span>
                El 80% de los incidentes en Pacora ocurren entre las 10pm y 2am. Refuerce vigilancia perimetral.
              </p>
            </div>
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 p-6 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#1e293b,#0f172a)] custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Crash Alert */}
            <AnimatePresence>
              {result?.carCrashDetected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/50 p-6 rounded-xl flex items-center gap-6 shadow-lg shadow-red-500/10"
                >
                  <div className="p-3 bg-red-500 rounded-lg animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400 uppercase tracking-tight">ALERTA: Accidente Detectado</h3>
                    <p className="text-sm text-red-200 mt-1">{result.crashDescription || "Se ha identificado un posible choque de vehículos en el video."}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Area */}
            <section className="relative">
              {!videoUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#3b82f6] rounded-xl bg-blue-600/5 p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/10 transition-all group"
                >
                  <Upload className="w-12 h-12 mb-4 text-[#3b82f6] group-hover:scale-110 transition-transform" />
                  <h2 className="text-lg font-medium text-slate-200 mb-1 leading-none">Subir video para análisis perimetral</h2>
                  <p className="text-sm text-slate-400">MP4, MOV, WEBM (Máx 20MB)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#334155] bg-black group">
                    <video 
                      src={videoUrl} 
                      className="w-full aspect-video" 
                      controls
                    />
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {!result && !analyzing && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleAnalyze}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Iniciar Análisis Perimetral
                    </motion.button>
                  )}
                </div>
              )}

              {analyzing && (
                <div className="mt-4 bg-[#1e293b]/80 backdrop-blur-md border border-[#334155] p-6 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-semibold text-slate-200 uppercase tracking-widest">IA Procesando Fotogramas...</span>
                        <span className="text-blue-400 font-bold">ACTIVO</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 15, ease: "easeInOut" }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 border-l-4 border-red-500 bg-red-500/10 p-4 rounded-r-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </section>

            {/* Results Grid */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12"
                >
                  {/* Plate Detection Card */}
                  <div className="bg-[#1e293b]/50 border border-[#334155] rounded-xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-500" />
                        Placas Identificadas
                      </h3>
                      <span className="text-blue-400 text-xs font-bold bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                        {result.licensePlates.length} Detectadas
                      </span>
                    </div>

                    {/* All Plates */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">Todas las Placas</p>
                        <div className="grid grid-cols-2 gap-2">
                          {result.licensePlates.length > 0 ? (
                            result.licensePlates.map((plate, index) => (
                              <div key={index} className="bg-[#334155] text-slate-300 px-3 py-1.5 rounded-lg font-mono text-xs border border-[#475569] flex items-center justify-center">
                                {plate}
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 py-2 text-center text-slate-600 text-[10px] italic">Ninguna</div>
                          )}
                        </div>
                      </div>

                      {/* Filtered Plates */}
                      {result.platesByColor && Object.keys(result.platesByColor).some(color => result.platesByColor![color].length > 0) && (
                        <div className="pt-4 border-t border-[#334155]">
                          {(Object.entries(result.platesByColor) as [string, string[]][]).map(([color, plates]) => (
                            <div key={color} className={plates.length > 0 ? "" : "hidden"}>
                              <p className="text-[10px] text-blue-400 mb-2 uppercase tracking-widest font-bold">
                                Vehículos Color: {color}
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {plates.map((plate, index) => (
                                  <div key={index} className="bg-[#334155] text-[#3b82f6] px-3 py-2 rounded-lg font-mono font-bold text-sm border-l-4 border-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/5">
                                    {plate}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#334155]">
                      <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">Integridad de Análisis</p>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Suspicious Events Card */}
                  <div className="bg-[#1e293b]/50 border border-[#334155] rounded-xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${result.suspiciousActivity.riskLevel === 'alto' ? 'text-red-400' : 'text-slate-200'}`}>
                        <Activity className="w-4 h-4" />
                        Situaciones Sospechosas
                      </h3>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        result.suspiciousActivity.riskLevel === 'alto' ? 'bg-red-500/20 text-red-500' :
                        result.suspiciousActivity.riskLevel === 'medio' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           result.suspiciousActivity.riskLevel === 'alto' ? 'bg-red-500' :
                           result.suspiciousActivity.riskLevel === 'medio' ? 'bg-orange-500' :
                           'bg-green-500'
                        }`} />
                        Riesgo {result.suspiciousActivity.riskLevel}
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded-r-xl">
                        <p className="text-xs font-bold uppercase text-red-400 mb-1">Detección Prioritaria</p>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {result.suspiciousActivity.description}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-[#3b82f6]/10 rounded-xl border border-[#3b82f6]/20">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Acción Sugerida</p>
                        <p className="text-sm text-blue-100 font-medium italic">
                          "{result.suspiciousActivity.recommendation}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <span>Cámara de Vigilancia</span>
                      <span>Análisis en Tiempo Real</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}
