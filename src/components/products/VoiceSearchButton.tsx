
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  onMultiSearch?: (products: string[]) => void;
}

export const VoiceSearchButton = ({ onResult, onMultiSearch }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    
    // Inicializa o reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Verifica se a transcrição contém palavras-chave para lista
      const productListKeywords = ['buscar', 'busque', 'procurar', 'procure', 'encontrar', 'encontre', 'lista', 'liste'];
      const separators = ['e', ',', 'mais', 'também', 'com'];
      
      // Verifica se é uma busca de múltiplos produtos
      const lowerTranscript = transcript.toLowerCase();
      const containsListKeyword = productListKeywords.some(keyword => lowerTranscript.includes(keyword));
      
      if (containsListKeyword && onMultiSearch) {
        // Extrai produtos da frase
        let productsText = lowerTranscript;
        
        // Remove palavras-chave de busca
        for (const keyword of productListKeywords) {
          productsText = productsText.replace(keyword, '');
        }
        
        // Separa os produtos baseados nos separadores
        let products: string[] = [productsText];
        
        for (const separator of separators) {
          const tempProducts: string[] = [];
          for (const prod of products) {
            tempProducts.push(...prod.split(` ${separator} `));
          }
          products = tempProducts;
        }
        
        // Limpa os produtos (remove espaços extras e tokens vazios)
        products = products
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        // Remove qualquer "por favor" ou "o" que possa ter ficado
        products = products.map(p => 
          p.replace(/\bpor favor\b/gi, '')
           .replace(/\bpor\b/gi, '')
           .replace(/\bfavor\b/gi, '')
           .replace(/^o\s+/i, '')
           .replace(/^a\s+/i, '')
           .replace(/^os\s+/i, '')
           .replace(/^as\s+/i, '')
           .trim()
        );
        
        if (products.length > 0) {
          // Chama o callback para busca múltipla
          onMultiSearch(products);
          
          toast({
            title: "Busca por voz - Lista de Produtos",
            description: `Buscando: ${products.join(', ')}`,
          });
        } else {
          // Se não conseguiu separar produtos, usa o texto completo
          onResult(transcript);
          
          toast({
            title: "Busca por voz",
            description: `"${transcript}"`,
          });
        }
      } else {
        // Busca simples de um único produto
        onResult(transcript);
        
        toast({
          title: "Busca por voz",
          description: `"${transcript}"`,
        });
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Erro de reconhecimento de voz:', event.error);
      toast({
        title: "Erro",
        description: "Não foi possível reconhecer sua voz. Tente novamente.",
        variant: "destructive",
      });
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-3 top-1/2 -translate-y-1/2"
      onClick={startListening}
      disabled={isListening}
    >
      {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
      <span className="sr-only">{isListening ? 'Ouvindo...' : 'Busca por voz'}</span>
    </Button>
  );
};
