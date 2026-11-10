// Sessão do usuário compartilhada entre as telas (evita passar props por toda a navegação).
import { createContext, useContext } from 'react';

export const SessaoContext = createContext({ sessao: null, encerrarSessao: () => {} });

export function useSessao() {
  return useContext(SessaoContext);
}
