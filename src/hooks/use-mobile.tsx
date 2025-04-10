
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Inicialize com um valor baseado na largura atual da janela, se disponível
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Verificação se window está disponível (para SSR)
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // Valor padrão (desktop) quando window não está disponível
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Função para atualizar o estado
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Adiciona o listener
    mql.addEventListener("change", onChange)
    
    // Garantir que o valor está correto após o primeiro render
    onChange()
    
    // Limpeza
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
