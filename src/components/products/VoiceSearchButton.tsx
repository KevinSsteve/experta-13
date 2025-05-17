
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { applyVoiceCorrections, findPossibleCorrections, saveVoiceCorrection } from '@/utils/speechCorrectionUtils';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  onMultiSearch?: (products: string[]) => void;
}

export const VoiceSearchButton = ({ onResult, onMultiSearch }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`Transcrição de voz recebida: "${transcript}"`);
      
      // Aplica correções de voz registradas pelo usuário
      const correctedTranscript = await applyVoiceCorrections(transcript, user?.id);
      console.log(`Transcrição corrigida: "${correctedTranscript}"`);
      
      // Busca possíveis correções alternativas
      const alternativeCorrections = await findPossibleCorrections(transcript, user?.id);
      console.log("Correções alternativas encontradas:", alternativeCorrections);
      
      // Verifica se é uma busca de múltiplos produtos
      const productListKeywords = ['buscar', 'busque', 'procurar', 'procure', 'encontrar', 'encontre', 'lista', 'liste'];
      const separators = ['e', ',', 'mais', 'também', 'com'];
      
      // Verifica se é uma busca de múltiplos produtos
      const lowerTranscript = correctedTranscript.toLowerCase();
      const containsListKeyword = productListKeywords.some(keyword => lowerTranscript.includes(keyword));
      
      // Inicialmente, considere o texto completo como um produto
      let products: string[] = [correctedTranscript];
      
      // Se contiver palavras-chave de lista ou espaços (que indicam potencialmente múltiplos produtos)
      if (containsListKeyword || correctedTranscript.includes(' ')) {
        // Extrai produtos da frase
        let productsText = lowerTranscript;
        
        // Remove palavras-chave de busca se presentes
        for (const keyword of productListKeywords) {
          productsText = productsText.replace(keyword, '');
        }
        
        // Separa os produtos baseados nos separadores
        products = [productsText];
        
        for (const separator of separators) {
          const tempProducts: string[] = [];
          for (const prod of products) {
            tempProducts.push(...prod.split(` ${separator} `));
          }
          products = tempProducts;
        }
        
        // Se tiver apenas espaços, considere como potencialmente múltiplos produtos
        if (!containsListKeyword && productsText.includes(' ')) {
          // Dividir por espaços para detectar potenciais produtos separados
          const spaceProducts = productsText.split(' ').filter(p => p.length > 2);
          
          // Se tivermos mais de um produto após a divisão por espaço
          if (spaceProducts.length > 1) {
            products = spaceProducts;
          }
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
      }
      
      // Se o texto original continha uma variação conhecida como "filme" ou "tibana",
      // vamos registrar automaticamente a correção para facilitar buscas futuras
      if (correctedTranscript !== transcript && user?.id) {
        const lowerOriginal = transcript.toLowerCase();
        
        // Verifica se a correção foi significativa e automática
        if ((lowerOriginal.includes('filme') && correctedTranscript.includes('yummy')) || 
            (lowerOriginal.includes('tibana') && correctedTranscript.includes('tibone')) ||
            (lowerOriginal.includes('que bom') && correctedTranscript.includes('tibone'))) {
          
          // Salva a correção na base de dados para uso futuro
          saveVoiceCorrection(user.id, transcript, correctedTranscript)
            .then(success => {
              if (success) {
                console.log('Correção de voz salva automaticamente:', transcript, '->', correctedTranscript);
              }
            });
        }
      }
      
      // Adiciona as correções alternativas à lista de produtos para busca múltipla
      if (alternativeCorrections.length > 0 && onMultiSearch) {
        // Adiciona o texto corrigido e as alternativas
        const searchTerms = [correctedTranscript, ...alternativeCorrections]
          .filter((term, index, self) => self.indexOf(term) === index) // Remove duplicados
          .filter(term => term.trim() !== '');
        
        console.log(`Buscando com termos alternativos: ${searchTerms.join(', ')}`);
        
        // Chama o callback para busca múltipla com os termos de busca ampliados
        onMultiSearch(searchTerms);
        
        toast({
          title: "Busca por voz com alternativas",
          description: `Principais termos: "${correctedTranscript}" e ${alternativeCorrections.length} alternativas`,
        });
      } else if (products.length > 1 && onMultiSearch) {
        // Chama o callback para busca múltipla
        onMultiSearch(products);
        
        toast({
          title: "Busca por voz - Múltiplos Produtos",
          description: `Buscando: ${products.join(', ')}`,
        });
      } else {
        // Busca simples de um único produto
        onResult(correctedTranscript);
        
        toast({
          title: "Busca por voz",
          description: `"${correctedTranscript}"`,
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
