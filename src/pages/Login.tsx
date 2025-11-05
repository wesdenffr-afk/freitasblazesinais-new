import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import blazeIcon from "@/assets/blaze-icon.png";
import blazeLogo from "@/assets/blaze-logo.png";
import freitasBlazeLogo from "@/assets/freitas-blaze-logo.png";

interface User {
  user: string;
  pass: string;
}

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes} 🌙`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const validateCredentials = async (username: string, password: string): Promise<boolean> => {
    try {
      // Tenta buscar do cache primeiro
      const cachedUsers = localStorage.getItem("hackerBlaze_users");
      let users: User[] = [];

      if (cachedUsers) {
        users = JSON.parse(cachedUsers);
      } else {
        // Se não tem cache, tenta buscar do GitHub
        const response = await fetch(
          "https://raw.githubusercontent.com/wesdenffr-afk/2025/refs/heads/main/Users"
        );
        
        if (!response.ok) {
          // Se falhar (rate limit ou outro erro), usa lista local de fallback
          console.warn("GitHub rate limit atingido, usando dados locais");
          users = [
            { "user": "marlon", "pass": "8785" },
            { "user": "Bielln", "pass": "Theduel1." },
            { "user": "ivanlimadossantos14", "pass": "Manu2592" },
            { "user": "Valzaza", "pass": "@Valzaza" },
            { "user": "Coringa", "pass": "Agencia@17" },
            { "user": "R.martins", "pass": "34886428Rd" },
            { "user": "mesquita10", "pass": "12345" },
            { "user": "joaovitorara12", "pass": "senhatestjoao" },
            { "user": "danilo019", "pass": "HP224568" },
            { "user": "Nasekle", "pass": "fab9837" }
          ];
        } else {
          const text = await response.text();
          users = JSON.parse(text);
          // Salva no cache para próximas vezes
          localStorage.setItem("hackerBlaze_users", JSON.stringify(users));
        }
      }
      
      return users.some(
        (user) => user.user === username && user.pass === password
      );
    } catch (error) {
      console.error("Erro ao validar credenciais:", error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível validar as credenciais. Tente novamente.",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const isValid = await validateCredentials(username, password);
        
        if (isValid) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao Hacker Blaze",
          });
          localStorage.setItem("hackerBlaze_user", username);
          navigate("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao fazer login",
            description: "Usuário ou senha incorretos",
          });
        }
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Agora você pode fazer login",
        });
        setIsLogin(true);
        setName("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--hacker-bg-from))] to-[hsl(var(--hacker-bg-to))] text-foreground p-3.5 overflow-hidden font-['Poppins',sans-serif]">
      <div className="max-w-full h-screen flex flex-col">
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
        <div className="mt-3.5 p-3 bg-gradient-to-b from-white/[0.02] to-white/[0.01] rounded-2xl min-h-[480px] relative">
          {/* Login Modal */}
          <div className="w-[86%] max-w-[320px] mx-auto bg-gradient-to-b from-white/[0.03] to-black/45 rounded-xl p-3.5 shadow-[var(--shadow-glow)] border border-white/[0.04]">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={freitasBlazeLogo} 
                  alt="Freitas Blaze" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 leading-tight">APP BLAZE FREITAS WHITE</h3>
                <p className="text-muted-foreground text-[13px] mt-1 m-0">
                  {isLogin 
                    ? "Realize o Login no app para continuar seu acesso!"
                    : "Crie sua conta para começar!"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="bg-white/[0.02] border-white/[0.03] text-white placeholder:text-muted-foreground focus:border-primary/50"
                />
              )}
              <Input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/[0.02] border-white/[0.03] text-white placeholder:text-muted-foreground focus:border-primary/50"
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.02] border-white/[0.03] text-white placeholder:text-muted-foreground focus:border-primary/50"
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-1.5 bg-primary hover:bg-primary/90 text-white font-bold shadow-[var(--shadow-red)] transition-[var(--transition-smooth)]"
              >
                {loading ? "CARREGANDO..." : isLogin ? "LOGIN" : "CRIAR CONTA"}
              </Button>
              {isLogin ? (
                <a
                  href="https://t.me/freitaswhite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center mt-2 text-[#ff9b9b] text-[13px] bg-transparent border-none cursor-pointer hover:text-[#ff7b7b] transition-[var(--transition-smooth)] no-underline"
                >
                  Não tem conta? Registre-se AQUI
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="block text-center mt-2 text-[#ff9b9b] text-[13px] bg-transparent border-none cursor-pointer hover:text-[#ff7b7b] transition-[var(--transition-smooth)]"
                >
                  Já tem conta? Faça LOGIN
                </button>
              )}
            </form>
          </div>

          {/* Lower Banner */}
          <div className="mt-4.5 flex gap-3 items-center">
            <div className="flex-none w-[84px] h-16 rounded-[10px] bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/[0.03] flex items-center justify-center text-primary font-extrabold text-2xl">
              🎯
            </div>
            <div className="banner-text">
              <h4 className="text-lg font-extrabold m-0">
                BRANCO <span className="text-primary">SEM GALE</span>
              </h4>
              <p className="text-muted-foreground text-[13px] mt-1.5 m-0">
                Servidor • <span className="text-green-400">Ativo</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;