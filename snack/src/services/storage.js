// Camada única de acesso ao AsyncStorage. Todas as leituras e escritas passam por aqui,
// com try/catch, para o app não quebrar se o armazenamento falhar.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHAVES = {
  produtos: '@livrolivre/produtos',
  usuarios: '@livrolivre/usuarios',
  sessao: '@livrolivre/sessao',
  carrinho: '@livrolivre/carrinho',
  pedidos: '@livrolivre/pedidos',
  favoritos: '@livrolivre/favoritos',
  enderecos: '@livrolivre/enderecos',
  gamificacao: '@livrolivre/gamificacao',
  devolucoes: '@livrolivre/devolucoes',
  config: '@livrolivre/config',
  avaliacoes: '@livrolivre/avaliacoes',
  perfil: '@livrolivre/perfil',
  cupom: '@livrolivre/cupom',
  formasPagamento: '@livrolivre/formas-pagamento',
};

export async function lerJson(chave, padrao = null) {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (bruto === null) return padrao;
    return JSON.parse(bruto);
  } catch (erro) {
    return padrao;
  }
}

export async function salvarJson(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}

export async function removerChave(chave) {
  try {
    await AsyncStorage.removeItem(chave);
    return true;
  } catch (erro) {
    return false;
  }
}
