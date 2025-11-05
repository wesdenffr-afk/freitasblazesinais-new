import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import blazeNewLogo from "@/assets/blaze-new-logo.jpg";
import redSignalIcon from "@/assets/red-signal-icon.png";
import blackSignalIcon from "@/assets/black-signal-icon.png";

// Configuração da estratégia
const SUPABASE_URL = 'https://chbuukoxnnohhojaedsm.supabase.co';
const POLL_MS = 50;

interface BlazeResult {
  id: string;
  color: number; // 0=branco, 1=vermelho, 2=preto
  roll: number;
  created_at: string;
}

const getColorEmoji = (color: number): string => {
  if (color === 0) return '⚪️';
  if (color === 1) return '🔴';
  return '⚫️';
};

const getBlazeColor = (roll: number): 'red' | 'black' | 'white' => {
  if (roll === 0) return 'white';
  if (roll >= 1 && roll <= 7) return 'red';
  return 'black';
};

const getNextColor = (sequence: string[]): string | null => {
  // Verifica se há pelo menos 4 resultados para as novas estratégias
  if (sequence.length >= 4) {
    const lastFour = sequence.slice(0, 4);
    
    // 🔴⚫️⚫️⚫️ = entrar 🔴
    if (lastFour[0] === '🔴' && lastFour[1] === '⚫️' && lastFour[2] === '⚫️' && lastFour[3] === '⚫️') {
      return '🔴';
    }
    
    // ⚫️🔴🔴🔴 = entrar ⚫️
    if (lastFour[0] === '⚫️' && lastFour[1] === '🔴' && lastFour[2] === '🔴' && lastFour[3] === '🔴') {
      return '⚫️';
    }
  }
  
  // Verifica estratégias com 2 resultados
  if (sequence.length >= 2) {
    const lastTwo = sequence.slice(0, 2);
    
    // ⚫️⚫️ = entrar 🔴
    if (lastTwo[0] === '⚫️' && lastTwo[1] === '⚫️') {
      return '🔴';
    }
    
    // 🔴🔴 = entrar ⚫️
    if (lastTwo[0] === '🔴' && lastTwo[1] === '🔴') {
      return '⚫️';
    }
  }
  
  return null;
};

const getNextColorContinua = (results: BlazeResult[]): string | null => {
  if (results.length < 3) return null;
  
  // Pega os 3 últimos rolls (números de 0-14)
  const lastThree = results.slice(0, 3).map(r => r.roll);
  
  // Soma os 3 números
  let sum = lastThree.reduce((acc, curr) => acc + curr, 0);
  
  // Se soma > 14, subtrai 14
  if (sum > 14) {
    sum = sum - 14;
  }
  
  // Determina a cor do número resultante
  const resultColor = getBlazeColor(sum);
  
  // Retorna a cor oposta
  if (resultColor === 'red') return '⚫️'; // Oposto do vermelho é preto
  if (resultColor === 'black') return '🔴'; // Oposto do preto é vermelho
  if (resultColor === 'white') return '🔴'; // Se der branco (0), considerar vermelho como oposto
  
  return null;
};

const EstrategiaCores = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [recentResults, setRecentResults] = useState<BlazeResult[]>([]);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [recommendedColor, setRecommendedColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [strategyMode, setStrategyMode] = useState<'padronizada' | 'continua'>('padronizada');
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
        console.log('Chamando edge function...');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-blaze-results`);
        
        if (!response.ok) {
          throw new Error(`Edge function returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Dados recebidos da edge function:', data);
        
        // Verifica se data é um array ou se está dentro de uma propriedade
        let results: BlazeResult[] = [];
        
        if (Array.isArray(data)) {
          results = data;
        } else if (data.results && Array.isArray(data.results)) {
          results = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          results = data.data;
        }
        
        console.log('Resultados processados:', results);
        
        if (results.length > 0) {
          setRecentResults(results.slice(0, 20));
          
          // Converte os resultados em sequência de emojis
          const sequence = results.map(result => getColorEmoji(result.color));
          setColorSequence(sequence);
          
          // Verifica se há um padrão e atualiza automaticamente baseado na estratégia selecionada
          const nextColor = strategyMode === 'padronizada' 
            ? getNextColor(sequence) 
            : getNextColorContinua(results);
          setRecommendedColor(nextColor);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        console.log('Usando dados de exemplo devido ao erro');
        
        // Dados mockados para teste
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
  }, [strategyMode]);

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
          <div className="flex items-center gap-2">
            <img src={blazeNewLogo} alt="Freitas Blaze" className="h-8" />
          </div>
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
            CORES <span className="block text-primary">PRECISAS</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-3.5 p-6 backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl flex-1 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black mb-4 text-primary">Estratégia de Cores</h1>
              <p className="text-muted-foreground">
                Sinais precisos para apostas em cores
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
                      onClick={() => setStrategyMode('padronizada')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        strategyMode === 'padronizada'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Padronizada
                    </button>
                    <button
                      onClick={() => setStrategyMode('continua')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        strategyMode === 'continua'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Contínua
                    </button>
                  </div>
                </div>
                {isLoading ? (
                  <p className="text-muted-foreground mb-4 text-center">
                    Carregando estratégia...
                  </p>
                ) : recommendedColor ? (
                  <div className="space-y-4">
                    {/* Logo animada com glow effect */}
                    <div className="flex justify-center mb-3">
                      <div className="relative w-32 h-32">
                        {/* Glow com cor do sinal */}
                        <div 
                          className="absolute inset-0 rounded-full" 
                          style={{ 
                            background: recommendedColor === '🔴' 
                              ? 'radial-gradient(circle, rgba(255,0,0,0.45) 0%, rgba(0,0,0,0) 70%)' 
                              : 'radial-gradient(circle, rgba(50,50,50,0.45) 0%, rgba(0,0,0,0) 70%)'
                          }} 
                          aria-hidden 
                        />

                        {/* Ícone do sinal */}
                        <div className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center">
                          <img 
                            src={recommendedColor === '🔴' ? redSignalIcon : blackSignalIcon}
                            alt={recommendedColor === '🔴' ? 'Entrar no Vermelho' : 'Entrar no Preto'}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Dois arcos girando */}
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
                        {recommendedColor === '🔴' ? 'ENTRAR NO VERMELHO' : 'ENTRAR NO PRETO'}
                      </h3>
                      <p className="text-sm text-white/70 font-medium">
                        Sem Gale
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 text-center">
                    Aguardando próximo sinal...
                  </p>
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
                <h3 className="font-bold text-xl mb-2">🔥 Últimos Resultados</h3>
                <div className="flex gap-2 text-4xl mb-3 justify-center flex-wrap">
                  {colorSequence.slice(0, 4).map((color, idx) => (
                    <span key={idx} className="animate-in fade-in">{color}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {recommendedColor ? '✅ Padrão detectado! Faça sua entrada agora!' : '⏳ Aguardando padrão...'}
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

export default EstrategiaCores;