// Consulta de CEP pelo ViaCEP (https://viacep.com.br). Retorna os dados do endereço ou lança erro.
import { apenasDigitos } from './mascaras';

export async function buscarCep(cep, { fetchImpl = fetch } = {}) {
  const digitos = apenasDigitos(cep);
  if (digitos.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }
  const resposta = await fetchImpl(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o CEP agora. Tente novamente.');
  }
  const dados = await resposta.json();
  if (dados.erro) {
    throw new Error('CEP não encontrado');
  }
  return {
    rua: dados.logradouro || '',
    bairro: dados.bairro || '',
    cidade: dados.localidade || '',
    uf: dados.uf || '',
  };
}
