// Validadores puros: não dependem de React nem de rede, por isso são testados direto.
// Cada função retorna { valido: boolean, erro?: string }.

const ok = () => ({ valido: true });
const falha = (erro) => ({ valido: false, erro });

const vazio = (valor) => valor === null || valor === undefined || String(valor).trim() === '';

export function validarObrigatorio(valor, nomeCampo = 'Campo') {
  if (vazio(valor)) return falha(`${nomeCampo} é obrigatório`);
  return ok();
}

export function validarEmail(valor) {
  const req = validarObrigatorio(valor, 'E-mail');
  if (!req.valido) return req;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!regex.test(String(valor).trim())) return falha('E-mail inválido');
  return ok();
}

// Campo de login: aceita username ou e-mail.
export function validarUsuarioOuEmail(valor) {
  const req = validarObrigatorio(valor, 'Usuário ou e-mail');
  if (!req.valido) return req;
  const texto = String(valor).trim();
  if (texto.includes('@')) return validarEmail(texto);
  if (/\s/.test(texto)) return falha('Usuário não pode conter espaços');
  return ok();
}

export function validarSenha(valor) {
  const req = validarObrigatorio(valor, 'Senha');
  if (!req.valido) return req;
  const texto = String(valor);
  if (texto.length < 8) return falha('Senha deve ter pelo menos 8 caracteres');
  if (!/[A-Za-z]/.test(texto) || !/[0-9]/.test(texto)) {
    return falha('Senha deve ter letras e números');
  }
  return ok();
}

export function validarConfirmacaoSenha(senha, confirmacao) {
  const req = validarObrigatorio(confirmacao, 'Confirmação de senha');
  if (!req.valido) return req;
  if (senha !== confirmacao) return falha('As senhas não conferem');
  return ok();
}

export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

export function validarTelefone(valor) {
  const req = validarObrigatorio(valor, 'Telefone');
  if (!req.valido) return req;
  const digitos = somenteDigitos(valor);
  if (digitos.length !== 10 && digitos.length !== 11) {
    return falha('Telefone deve ter 10 ou 11 dígitos com DDD');
  }
  return ok();
}

export function validarCpf(valor) {
  const req = validarObrigatorio(valor, 'CPF');
  if (!req.valido) return req;
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11) return falha('CPF deve ter 11 dígitos');
  if (/^(\d)\1{10}$/.test(cpf)) return falha('CPF inválido');

  const calcularDigito = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i += 1) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(cpf.slice(0, 9), 10);
  const d2 = calcularDigito(cpf.slice(0, 10), 11);
  if (d1 !== Number(cpf[9]) || d2 !== Number(cpf[10])) return falha('CPF inválido');
  return ok();
}

export function validarCep(valor) {
  const req = validarObrigatorio(valor, 'CEP');
  if (!req.valido) return req;
  if (somenteDigitos(valor).length !== 8) return falha('CEP deve ter 8 dígitos');
  return ok();
}

export function validarDataNascimento(valor, hoje = new Date()) {
  const req = validarObrigatorio(valor, 'Data de nascimento');
  if (!req.valido) return req;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(valor).trim());
  if (!match) return falha('Data deve estar no formato DD/MM/AAAA');
  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);
  const data = new Date(ano, mes - 1, dia);
  const valida = data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
  if (!valida) return falha('Data inválida');
  if (data > hoje) return falha('Data de nascimento não pode estar no futuro');
  return ok();
}

// Algoritmo de Luhn para número de cartão.
export function validarNumeroCartao(valor) {
  const req = validarObrigatorio(valor, 'Número do cartão');
  if (!req.valido) return req;
  const numero = somenteDigitos(valor);
  if (numero.length < 13 || numero.length > 19) return falha('Número do cartão deve ter de 13 a 19 dígitos');
  let soma = 0;
  let dobrar = false;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    let d = Number(numero[i]);
    if (dobrar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
    dobrar = !dobrar;
  }
  if (soma % 10 !== 0) return falha('Número do cartão inválido');
  return ok();
}

// Validade no formato MM/AA, não vencida.
export function validarValidadeCartao(valor, hoje = new Date()) {
  const req = validarObrigatorio(valor, 'Validade');
  if (!req.valido) return req;
  const match = /^(\d{2})\/(\d{2})$/.exec(String(valor).trim());
  if (!match) return falha('Validade deve estar no formato MM/AA');
  const mes = Number(match[1]);
  const ano = 2000 + Number(match[2]);
  if (mes < 1 || mes > 12) return falha('Mês de validade inválido');
  const fimDoMes = new Date(ano, mes, 0, 23, 59, 59);
  if (fimDoMes < hoje) return falha('Cartão vencido');
  return ok();
}

export function validarCvv(valor) {
  const req = validarObrigatorio(valor, 'CVV');
  if (!req.valido) return req;
  if (!/^\d{3}$/.test(String(valor).trim())) return falha('CVV deve ter 3 dígitos');
  return ok();
}

// Quantidade é inteiro maior que zero.
export function validarQuantidade(valor) {
  const req = validarObrigatorio(valor, 'Quantidade');
  if (!req.valido) return req;
  const numero = Number(valor);
  if (!Number.isInteger(numero)) return falha('Quantidade deve ser um número inteiro');
  if (numero <= 0) return falha('Quantidade deve ser maior que zero');
  return ok();
}

// Retorna o primeiro erro de um mapa { campo: resultado }, ou null se tudo válido.
export function primeiroErro(resultados) {
  const entrada = Object.entries(resultados).find(([, r]) => !r.valido);
  return entrada ? { campo: entrada[0], erro: entrada[1].erro } : null;
}
