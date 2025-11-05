import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import blazeNewLogo from "@/assets/blaze-new-logo.jpg";

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
    <div className="min-h-screen bg-gradient-to-br from-[#3a4d5c] via-[#2d3e4f] to-[#1e2a35] text-foreground p-6 overflow-hidden font-['Poppins',sans-serif] flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col gap-4">
        {/* Login Card with Glassmorphism */}
        <div className="w-full backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-white/10 p-2">
                <img 
                  src={blazeNewLogo} 
                  alt="Freitas Blaze" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white m-0 leading-tight flex items-center gap-2">
                  <span className="text-primary">Freitas</span> White
                </h3>
                <p className="text-white/70 text-sm mt-1 m-0">
                  Cassino Online Premium
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="bg-white/80 border-0 text-gray-800 placeholder:text-gray-500 h-12 rounded-xl shadow-sm"
                />
              )}
              <Input
                type="text"
                placeholder="Email da Betória"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/80 border-0 text-gray-800 placeholder:text-gray-500 h-12 rounded-xl shadow-sm"
              />
              <Input
                type="password"
                placeholder="Digite sua Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/80 border-0 text-gray-800 placeholder:text-gray-500 h-12 rounded-xl shadow-sm"
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold h-12 rounded-xl shadow-lg text-base"
              >
                {loading ? "CARREGANDO..." : isLogin ? "Entrar" : "CRIAR CONTA"}
              </Button>
              {isLogin && (
                <Button
                  type="button"
                  onClick={() => window.open('https://t.me/freitaswhite', '_blank')}
                  className="mt-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-12 rounded-xl shadow-lg text-base"
                >
                  Cadastrar na Freitas White
                </Button>
              )}
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-2xl">🎁</div>
                    <div className="text-xs text-white/70">Bônus</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-2xl">🔒</div>
                    <div className="text-xs text-white/70">Seguro</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-2xl">⚡</div>
                    <div className="text-xs text-white/70">Rápido</div>
                  </div>
                </div>
                <p className="text-xs text-white/50 text-center mt-3">
                  🟢 +179 cadastros hoje
                </p>
              </div>

              {!isLogin && (
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="block text-center mt-2 text-white/70 text-sm bg-transparent border-none cursor-pointer hover:text-white transition-colors"
                >
                  Já tem conta? Faça LOGIN
                </button>
              )}
            </form>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-white/40">
              Termos e Políticas ↓<br/>
              Cadastre-se com Login seguro<br/>
              Cassino com Licença. Todos os direitos reservados<br/>
              © 2023 - Freitas Blaze Bet. Todos os direitos reservados
            </p>
            <div className="text-xs text-white/50 mt-2">{currentTime}</div>
          </div>
      </div>
    </div>
  );
};

export default Login;