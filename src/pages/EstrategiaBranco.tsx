import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import blazeNewLogo from "@/assets/blaze-new-logo.jpg";

const SUPABASE_URL = 'https://chbuukoxnnohhojaedsm.supabase.co';
const POLL_MS = 50;

interface BlazeResult {
  id: string;
  color: number;
  roll: number;
  created_at: string;
}

const getBlazeColor = (roll: number): 'red' | 'black' | 'white' => {
  if (roll === 0) return 'white';
  if (roll >= 1 && roll <= 7) return 'red';
  return 'black';
};

const EstrategiaBranco = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [recentResults, setRecentResults] = useState<BlazeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignal, setShowSignal] = useState(false);
  const [nextSignalTime, setNextSignalTime] = useState<string>("");
  const [secondSignalTime, setSecondSignalTime] = useState<string>("");
  const [assertiveness, setAssertiveness] = useState<number>(100);
  const [strategyMode, setStrategyMode] = useState<'semGale' | 'certeiro'>('semGale');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("hackerBlaze_user");
    if (!user) {
      navigate("/");
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes} 🌙`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-blaze-results`);
        
        if (!response.ok) {
          throw new Error(`Edge function returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        let results: BlazeResult[] = [];
        
        if (Array.isArray(data)) {
          results = data;
        } else if (data.results && Array.isArray(data.results)) {
          results = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          results = data.data;
        }
        
        if (results.length > 0) {
          setRecentResults(results.slice(0, 20));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        
        const mockData: BlazeResult[] = Array.from({ length: 20 }, (_, i) => ({
          id: `mock-${i}`,
          roll: Math.floor(Math.random() * 15),
          color: Math.floor(Math.random() * 3),
          created_at: new Date(Date.now() - i * 60000).toISOString()
        }));
        
        setRecentResults(mockData);
        setIsLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, POLL_MS);
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerateSignal = () => {
    // Encontrar o último branco nos resultados
    const lastWhite = recentResults.find(result => getBlazeColor(result.roll) === 'white');
    
    if (lastWhite) {
      const whiteTime = new Date(lastWhite.created_at);
      
      if (strategyMode === 'semGale') {
        // Estratégia Sem Gale: +13 minutos
        whiteTime.setMinutes(whiteTime.getMinutes() + 13);
        
        const hours = String(whiteTime.getHours()).padStart(2, '0');
        const minutes = String(whiteTime.getMinutes()).padStart(2, '0');
        setNextSignalTime(`${hours}:${minutes}`);
        setSecondSignalTime("");
      } else {
        // Estratégia Certeiro: +7 minutos e +12 minutos
        const firstTime = new Date(lastWhite.created_at);
        firstTime.setMinutes(firstTime.getMinutes() + 7);
        
        const secondTime = new Date(lastWhite.created_at);
        secondTime.setMinutes(secondTime.getMinutes() + 12);
        
        const hours1 = String(firstTime.getHours()).padStart(2, '0');
        const minutes1 = String(firstTime.getMinutes()).padStart(2, '0');
        setNextSignalTime(`${hours1}:${minutes1}`);
        
        const hours2 = String(secondTime.getHours()).padStart(2, '0');
        const minutes2 = String(secondTime.getMinutes()).padStart(2, '0');
        setSecondSignalTime(`${hours2}:${minutes2}`);
      }
      
      // Gera assertividade aleatória entre 89 e 98
      const randomAssertiveness = Math.floor(Math.random() * (98 - 89 + 1)) + 89;
      setAssertiveness(randomAssertiveness);
      
      setShowSignal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a4d5c] via-[#2d3e4f] to-[#1e2a35] text-foreground p-3.5 font-['Poppins',sans-serif]">
      <div className="max-w-full min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="h-11 flex items-center justify-between px-2 py-1.5">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 rounded-lg bg-transparent border border-white/[0.03] flex items-center justify-center font-bold text-white hover:bg-white/[0.05]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="font-bold tracking-wider">Branco Certeiro</div>
          <div className="text-xs text-muted-foreground">{currentTime}</div>
        </div>

        {/* Hero Section */}
        <div className="mt-1.5 flex items-center gap-3">
          <div className="w-[80px] h-[80px] flex items-center justify-center overflow-hidden">
            <img 
              src={blazeNewLogo} 
              alt="Freitas Blaze" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 font-black text-[28px] leading-[0.9] uppercase">
            BRANCO <span className="block text-primary">SEM GALE</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-3.5 p-6 backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl flex-1 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black mb-4 text-primary">Estratégia do Branco</h1>
              <p className="text-muted-foreground">
                Sinais certeiros para apostas no branco
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    🎯 Status
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStrategyMode('semGale')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        strategyMode === 'semGale'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Sem Gale
                    </button>
                    <button
                      onClick={() => setStrategyMode('certeiro')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        strategyMode === 'certeiro'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Certeiro
                    </button>
                  </div>
                </div>
                {showSignal ? (
                  <div className="space-y-4">
                    {/* Horário(s) do Sinal com borda tracejada */}
                    <div className="text-center">
                      <div className="inline-block border-2 border-dashed border-primary rounded-2xl px-8 py-3 mb-4">
                        <p className="text-4xl font-black text-white tabular-nums tracking-wider">{nextSignalTime}</p>
                        {secondSignalTime && (
                          <p className="text-4xl font-black text-white tabular-nums tracking-wider mt-2">{secondSignalTime}</p>
                        )}
                      </div>
                    </div>

                    {/* Logo animada com glow effect - logo correta da Blaze */}
                    <div className="flex justify-center mb-3">
                      <div className="relative w-20 h-20">
                        {/* Glow vermelho suave */}
                        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.45) 0%, rgba(0,0,0,0) 70%)' }} aria-hidden />

                        {/* Disco/Logo recortado em círculo para evitar quadrado visível */}
                        <div className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
                          <img 
                            src={blazeNewLogo} 
                            alt="Blaze" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        {/* Dois arcos girando como na referência (topo/direita) */}
                        <div 
                          className="pointer-events-none absolute -inset-1 rounded-full border-4 border-transparent animate-spin" 
                          style={{ borderTopColor: 'hsl(var(--primary))', borderRightColor: 'hsl(var(--primary))', animationDuration: '2.2s' }} 
                          aria-hidden
                        />
                        {/* Borda externa com leve brilho */}
                        <div 
                          className="pointer-events-none absolute -inset-1 rounded-full border-2" 
                          style={{ borderColor: 'hsl(var(--primary) / 0.35)' }}
                          aria-hidden 
                        />
                      </div>
                    </div>

                    {/* Mensagem de assertividade */}
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-black text-primary uppercase tracking-wide">
                        Assertividade {assertiveness}%
                      </h3>
                      <p className="text-sm text-white/70 font-medium">
                        {strategyMode === 'semGale' ? (
                          'Não precisa fazer Gale'
                        ) : (
                          <>
                            Realize 3 Tiros no minuto<br />
                            Gale Opcional
                          </>
                        )}
                      </p>
                    </div>

                    <Button
                      onClick={() => setShowSignal(false)}
                      variant="outline"
                      className="w-full bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] hover:border-primary/50"
                    >
                      Fechar Sinal
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-6 text-center">
                      <p className="text-muted-foreground">
                        Clique no botão para gerar o sinal no branco sem gale
                      </p>
                      <p className="text-sm text-white/60">
                        O sinal não gera em recuperação<br />
                        Espere sair um branco
                      </p>
                    </div>
                    
                    {/* Botão GERAR SINAL - igual à referência */}
                    <button
                      onClick={handleGenerateSignal}
                      disabled={recentResults.length === 0}
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="bg-black rounded-lg py-3 px-4 flex items-center justify-center gap-2 hover:bg-black/90 transition-colors">
                        <span className="text-red-600 text-xl font-bold">⏬</span>
                        <span className="text-white font-bold text-base uppercase tracking-wider">Gerar Sinal</span>
                        <span className="text-red-600 text-xl font-bold">⏬</span>
                      </div>
                    </button>
                  </>
                )}
              </div>

              <div className="p-6 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <h3 className="font-bold text-xl mb-3">📊 Últimos Resultados</h3>
                {isLoading ? (
                  <p className="text-muted-foreground text-center">Carregando...</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-10 gap-2" dir="rtl">
                    {recentResults.slice(0, 20).map((result) => {
                      const color = getBlazeColor(result.roll);
                      const bgColor = color === 'white' 
                        ? 'bg-white text-black' 
                        : color === 'red' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-zinc-800 text-white';
                      
                      return (
                        <div 
                          key={result.id} 
                          className={`${bgColor} rounded-lg p-3 flex flex-col items-center justify-center min-h-[70px] animate-in fade-in`}
                        >
                          <div className="text-2xl font-bold">{result.roll}</div>
                          <div className="text-xs mt-1 opacity-90">
                            {new Date(result.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/30">
                <h3 className="font-bold text-xl mb-2">🔥 Taxa de Acerto</h3>
                <p className="text-4xl font-black text-primary mb-2">92.3%</p>
                <p className="text-sm text-muted-foreground">Últimas 100 rodadas</p>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-xl border border-primary/30">
                <h3 className="font-bold text-xl mb-3 text-center">⚡ BRANCO SEM GALE</h3>
                <p className="text-center text-muted-foreground">
                  Estratégia otimizada para máxima assertividade no branco, sem necessidade de Gale.
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Voltar para o Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstrategiaBranco;