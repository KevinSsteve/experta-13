
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceOrdersCreatorProps {
  onListCreated: (products: string[]) => void;
}

export function VoiceOrdersCreator({ onListCreated }: VoiceOrdersCreatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const { toast } = useToast();

  // Esta função, agora, pode aceitar um callback para adicionar itens (append) ou substituir (default)
  const handleListen = (append: boolean = false) => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado!",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive",
      });
      return;
    }
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Divide produtos utilizando separadores comuns
      const items = transcript
        .toLowerCase()
        .replace(/(comprar|adicionar|lista|pendente|pagar|quero|gostaria de|por favor)/g, "")
        .split(/,| e | mais | também | com |;/gi)
        .map((item) => item.trim())
        .filter((item) => item.length > 1);

      if (append) {
        // Adiciona aos produtos já existentes, evitando duplicados exatos
        const newItems = items.filter(item => !products.includes(item));
        setProducts(prev => [...prev, ...newItems]);
        toast({
          title: "Mais produtos adicionados:",
          description: newItems.length > 0 ? newItems.join(", ") : "Nenhum novo item reconhecido.",
        });
      } else {
        setProducts(items);
        toast({
          title: "Produtos reconhecidos:",
          description: items.join(", "),
        });
      }
    };
    recognition.onerror = (e) => {
      toast({
        title: "Erro",
        description: "Houve um erro no reconhecimento de voz.",
        variant: "destructive",
      });
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleAdd = () => {
    if (products.length > 0) {
      onListCreated(products);
      setProducts([]);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border border-muted rounded-lg shadow bg-background">
      <div className="flex gap-2 items-center">
        <Button
          onClick={() => handleListen(false)}
          variant={isListening ? "secondary" : "outline"}
          size="icon"
          disabled={isListening}
        >
          {isListening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
        </Button>
        <span>
          Pressione <b>microfone</b> e fale a lista de produtos.
        </span>
      </div>
      {products.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-1">
            <List className="h-4 w-4" /><b>Itens a adicionar:</b>
          </div>
          <ul className="list-disc pl-8 text-primary">{products.map((p, i) => <li key={i}>{p}</li>)}</ul>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleAdd} size="sm">
              Salvar lista
            </Button>
            <Button
              onClick={() => handleListen(true)}
              size="sm"
              variant="ghost"
              type="button"
              disabled={isListening}
              title="Adicionar item"
            >
              <Mic className="h-5 w-5 mr-1" />
              Adicionar item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
