import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Send } from "lucide-react";
import blazeIcon from "@/assets/blaze-icon.png";
import blazeLogo from "@/assets/blaze-logo.png";
import coresPrecisas from "@/assets/cores-precisas.png";
import brancoCerteiro from "@/assets/branco-certeiro.png";
import freitasBlazeLogo from "@/assets/freitas-blaze-logo.png";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("hackerBlaze_user");
    if (!user) {
      navigate("/");
      return;
    }
    setUsername(user);

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

  const handleLogout = () => {
    localStorage.removeItem("hackerBlaze_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--hacker-bg-from))] to-[hsl(var(--hacker-bg-to))] text-foreground p-3.5 font-['Poppins',sans-serif]">
      <div className="max-w-full min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="h-11 flex items-center justify-between px-2 py-1.5">
          <button className="w-8 h-8 rounded-lg bg-transparent border border-white/[0.03] flex items-center justify-center font-bold text-white">
            ≡
          </button>
          <div className="font-bold tracking-wider">Freitas Blaze</div>
          <div className="text-xs text-muted-foreground">{currentTime}</div>
        </div>

        {/* Hero Section */}
        <div className="mt-1.5 flex items-center gap-3">
          <div className="w-[62px] h-[62px] bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-[10px] flex items-center justify-center border-2 border-white/[0.02] overflow-hidden p-2">
            <img 
              src={blazeLogo} 
              alt="Blaze" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 font-black text-[34px] leading-[0.9] uppercase">
            BRANCO <span className="block text-primary">SEMGALE</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-3.5 p-6 bg-gradient-to-b from-white/[0.02] to-white/[0.01] rounded-2xl flex-1 flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-center space-y-6 max-w-md w-full">
            <div className="w-48 h-48 mx-auto flex items-center justify-center">
              <img 
                src={freitasBlazeLogo} 
                alt="Freitas Blaze" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-black mb-2">Bem-vindo!</h1>
              <p className="text-muted-foreground text-lg">
                Olá, <span className="text-primary font-bold">{username}</span>
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <h3 className="font-bold text-lg mb-2">🎯 Status do Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Servidor • <span className="text-green-400">Ativo</span>
                </p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <h3 className="font-bold text-lg mb-2">📊 Estratégia</h3>
                <p className="text-sm text-muted-foreground">
                  BRANCO CERTEIRO • <span className="text-green-400">Ativo</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  CORES PRECISAS • <span className="text-green-400">Ativo</span>
                </p>
              </div>
            </div>

            {/* Strategy Cards */}
            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-black mb-4">Escolha sua Estratégia</h2>
              
              <button
                onClick={() => navigate("/estrategia/cores")}
                className="w-full overflow-hidden rounded-xl border-2 border-primary/20 hover:border-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <img 
                  src={coresPrecisas} 
                  alt="Cores Precisas - Estratégia" 
                  className="w-full h-auto"
                />
              </button>

              <button
                onClick={() => navigate("/estrategia/branco")}
                className="w-full overflow-hidden rounded-xl border-2 border-primary/20 hover:border-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <img 
                  src={brancoCerteiro} 
                  alt="Branco Certeiro - Estratégia" 
                  className="w-full h-auto"
                />
              </button>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="mt-6 bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] hover:border-primary/50"
            >
              Sair da Conta
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="h-[58px] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl flex items-center justify-around border border-white/[0.03] mt-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex flex-col items-center text-[11px] text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            <Home className="mb-1 w-5 h-5" />
            <div>Início</div>
          </button>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center text-[11px] text-red-400 font-semibold hover:opacity-80 transition-opacity"
          >
            <LogOut className="mb-1 w-5 h-5" />
            <div>Sair</div>
          </button>
          <a 
            href="https://t.me/freitaswhite"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-[11px] text-blue-400 font-semibold hover:opacity-80 transition-opacity"
          >
            <Send className="mb-1 w-5 h-5" />
            <div>Telegram</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;