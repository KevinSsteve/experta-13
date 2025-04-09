
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adicionar uma função de tratamento de erro global
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

// Inicializar a aplicação com tratamento de erro
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Elemento root não encontrado");
  
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Erro ao renderizar a aplicação:", error);
  // Renderizar uma mensagem de erro básica
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <h1>Ocorreu um erro ao carregar a aplicação</h1>
      <p>Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Recarregar</button>
    </div>
  `;
}
