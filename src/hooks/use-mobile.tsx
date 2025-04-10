
import * as React from "react"

// Define o breakpoint para dispositivos móveis em 768px
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Inicializa com um valor baseado na largura atual da janela, se disponível
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Verificação se window está disponível (para SSR)
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // Valor padrão (desktop) quando window não está disponível
    return false
  })

  React.useEffect(() => {
    // Cria o media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Função para atualizar o estado baseado na media query
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }
    
    // Adiciona o listener para mudanças na media query
    mql.addEventListener("change", handleChange)
    
    // Garante que o valor está correto após o primeiro render
    handleChange(mql)
    
    // Limpeza ao desmontar o componente
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  return isMobile
}
