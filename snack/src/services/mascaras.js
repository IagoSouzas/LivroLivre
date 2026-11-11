// Máscaras de entrada. Campos numéricos aceitam só dígitos e já mostram a formatação enquanto o usuário digita.

export function apenasDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

// Aplica um padrão em que cada "0" é um dígito; os demais caracteres são fixos.
function aplicarPadrao(digitos, padrao) {
  let saida = '';
  let i = 0;
  for (const char of padrao) {
    if (i >= digitos.length) break;
    if (char === '0') {
      saida += digitos[i];
      i += 1;
    } else {
      saida += char;
    }
  }
  return saida;
}

export function mascararCpf(valor) {
  return aplicarPadrao(apenasDigitos(valor).slice(0, 11), '000.000.000-00');
}

export function mascararCep(valor) {
  return aplicarPadrao(apenasDigitos(valor).slice(0, 8), '00000-000');
}

// 10 dígitos: (11) 1234-5678. 11 dígitos: (11) 91234-5678.
export function mascararTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  const padrao = digitos.length > 10 ? '(00) 00000-0000' : '(00) 0000-0000';
  return aplicarPadrao(digitos, padrao);
}

export function mascararData(valor) {
  return aplicarPadrao(apenasDigitos(valor).slice(0, 8), '00/00/0000');
}

// Grupos de 4 dígitos, até 19 dígitos.
export function mascararCartao(valor) {
  return aplicarPadrao(apenasDigitos(valor).slice(0, 19), '0000 0000 0000 0000 000');
}

export function mascararValidade(valor) {
  return aplicarPadrao(apenasDigitos(valor).slice(0, 4), '00/00');
}

export function mascararCvv(valor) {
  return apenasDigitos(valor).slice(0, 3);
}

export function apenasNumeros(valor) {
  return apenasDigitos(valor);
}

const MASCARAS = {
  cpf: mascararCpf,
  cep: mascararCep,
  telefone: mascararTelefone,
  data: mascararData,
  cartao: mascararCartao,
  validade: mascararValidade,
  cvv: mascararCvv,
  numero: apenasNumeros,
};

// Ponto de entrada usado pelos campos: tipo sem máscara devolve o texto como veio.
export function formatarEntrada(valor, tipo) {
  const mascara = MASCARAS[tipo];
  return mascara ? mascara(valor) : valor;
}
