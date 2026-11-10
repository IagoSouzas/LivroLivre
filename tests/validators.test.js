import {
  validarObrigatorio,
  validarEmail,
  validarUsuarioOuEmail,
  validarSenha,
  validarConfirmacaoSenha,
  validarTelefone,
  validarCpf,
  validarCep,
  validarDataNascimento,
  validarNumeroCartao,
  validarValidadeCartao,
  validarCvv,
  validarQuantidade,
  primeiroErro,
} from '../src/validators';

describe('campos nulos ou vazios', () => {
  test.each([[null], [undefined], [''], ['   ']])('rejeita valor vazio: %p', (valor) => {
    expect(validarObrigatorio(valor, 'Nome').valido).toBe(false);
    expect(validarObrigatorio(valor, 'Nome').erro).toBe('Nome é obrigatório');
  });

  test('aceita texto preenchido', () => {
    expect(validarObrigatorio('Iago', 'Nome').valido).toBe(true);
  });
});

describe('e-mail', () => {
  test.each(['iago@exemplo.com', 'a.b@dominio.com.br'])('aceita %s', (email) => {
    expect(validarEmail(email).valido).toBe(true);
  });

  test.each(['iago', 'iago@', '@exemplo.com', 'iago@exemplo', 'iago @exemplo.com'])('rejeita %s', (email) => {
    expect(validarEmail(email).valido).toBe(false);
  });

  test('campo vazio retorna mensagem de obrigatório', () => {
    expect(validarEmail('').erro).toBe('E-mail é obrigatório');
  });
});

describe('usuário ou e-mail (login)', () => {
  test('aceita username simples', () => {
    expect(validarUsuarioOuEmail('emilys').valido).toBe(true);
  });

  test('aceita e-mail válido', () => {
    expect(validarUsuarioOuEmail('emily.johnson@x.dummyjson.com').valido).toBe(true);
  });

  test('rejeita e-mail malformado', () => {
    expect(validarUsuarioOuEmail('emily@').valido).toBe(false);
  });

  test('rejeita username com espaço', () => {
    expect(validarUsuarioOuEmail('emily johnson').valido).toBe(false);
  });

  test('rejeita vazio', () => {
    expect(validarUsuarioOuEmail('  ').valido).toBe(false);
  });
});

describe('senha', () => {
  test('aceita 8 caracteres com letra e número', () => {
    expect(validarSenha('abcdef12').valido).toBe(true);
  });

  test('rejeita menos de 8 caracteres', () => {
    expect(validarSenha('abc12').erro).toBe('Senha deve ter pelo menos 8 caracteres');
  });

  test('rejeita sem número', () => {
    expect(validarSenha('abcdefgh').erro).toBe('Senha deve ter letras e números');
  });

  test('rejeita sem letra', () => {
    expect(validarSenha('12345678').erro).toBe('Senha deve ter letras e números');
  });

  test('confirmação precisa ser igual', () => {
    expect(validarConfirmacaoSenha('abcdef12', 'abcdef12').valido).toBe(true);
    expect(validarConfirmacaoSenha('abcdef12', 'abcdef13').erro).toBe('As senhas não conferem');
  });
});

describe('telefone', () => {
  test.each(['(11) 99999-9999', '1199999999'])('aceita %s', (telefone) => {
    expect(validarTelefone(telefone).valido).toBe(true);
  });

  test.each(['9999-9999', '119999999999999', 'abc'])('rejeita %s', (telefone) => {
    expect(validarTelefone(telefone).valido).toBe(false);
  });
});

describe('CPF', () => {
  test('aceita CPF com dígitos verificadores corretos', () => {
    expect(validarCpf('529.982.247-25').valido).toBe(true);
  });

  test('rejeita dígito verificador errado', () => {
    expect(validarCpf('529.982.247-26').erro).toBe('CPF inválido');
  });

  test('rejeita sequência repetida', () => {
    expect(validarCpf('111.111.111-11').valido).toBe(false);
  });

  test('rejeita tamanho errado', () => {
    expect(validarCpf('1234').erro).toBe('CPF deve ter 11 dígitos');
  });
});

describe('CEP', () => {
  test('aceita 8 dígitos com ou sem hífen', () => {
    expect(validarCep('01234-567').valido).toBe(true);
    expect(validarCep('01234567').valido).toBe(true);
  });

  test('rejeita tamanho errado', () => {
    expect(validarCep('0123').valido).toBe(false);
  });
});

describe('data de nascimento', () => {
  const hoje = new Date(2026, 10, 10);

  test('aceita data passada válida', () => {
    expect(validarDataNascimento('15/03/1990', hoje).valido).toBe(true);
  });

  test('rejeita data futura', () => {
    expect(validarDataNascimento('01/01/2030', hoje).erro).toBe('Data de nascimento não pode estar no futuro');
  });

  test('rejeita data inexistente', () => {
    expect(validarDataNascimento('31/02/1990', hoje).erro).toBe('Data inválida');
  });

  test('rejeita formato errado', () => {
    expect(validarDataNascimento('1990-03-15', hoje).valido).toBe(false);
  });
});

describe('cartão', () => {
  test('aceita número que passa no Luhn', () => {
    expect(validarNumeroCartao('4539 1488 0343 6467').valido).toBe(true);
  });

  test('rejeita número que falha no Luhn', () => {
    expect(validarNumeroCartao('4539 1488 0343 6468').erro).toBe('Número do cartão inválido');
  });

  test('rejeita tamanho fora de 13 a 19 dígitos', () => {
    expect(validarNumeroCartao('4539 1488').erro).toBe('Número do cartão deve ter de 13 a 19 dígitos');
  });

  test('validade no futuro é aceita', () => {
    expect(validarValidadeCartao('12/30', new Date(2026, 10, 10)).valido).toBe(true);
  });

  test('validade vencida é rejeitada', () => {
    expect(validarValidadeCartao('01/25', new Date(2026, 10, 10)).erro).toBe('Cartão vencido');
  });

  test('validade fora do formato é rejeitada', () => {
    expect(validarValidadeCartao('1/30').valido).toBe(false);
  });

  test('CVV com 3 dígitos', () => {
    expect(validarCvv('123').valido).toBe(true);
    expect(validarCvv('12').valido).toBe(false);
    expect(validarCvv('12a').valido).toBe(false);
  });
});

describe('quantidade', () => {
  test('aceita inteiro positivo', () => {
    expect(validarQuantidade(2).valido).toBe(true);
    expect(validarQuantidade('3').valido).toBe(true);
  });

  test('rejeita zero e negativo', () => {
    expect(validarQuantidade(0).valido).toBe(false);
    expect(validarQuantidade(-1).valido).toBe(false);
  });

  test('rejeita decimal e texto', () => {
    expect(validarQuantidade(1.5).erro).toBe('Quantidade deve ser um número inteiro');
    expect(validarQuantidade('abc').valido).toBe(false);
  });
});

describe('primeiroErro', () => {
  test('retorna null quando tudo é válido', () => {
    expect(primeiroErro({ a: { valido: true }, b: { valido: true } })).toBeNull();
  });

  test('retorna o primeiro campo inválido', () => {
    expect(primeiroErro({ a: { valido: true }, b: { valido: false, erro: 'x' } })).toEqual({ campo: 'b', erro: 'x' });
  });
});
