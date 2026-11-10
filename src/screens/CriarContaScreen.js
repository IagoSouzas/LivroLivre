import { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { Botao, Campo, Link, Tela } from '../components/ui';
import { criarUsuario, validarCadastro } from '../services/usuarios';
import { COR_ERRO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_FUNDO } from '../theme';

const CAMPOS_INICIAIS = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  senha: '',
  confirmacaoSenha: '',
  termos: false,
};

export default function CriarContaScreen({ navigation }) {
  const [dados, setDados] = useState(CAMPOS_INICIAIS);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const atualizar = (campo) => (valor) => setDados((anterior) => ({ ...anterior, [campo]: valor }));

  async function enviar() {
    setMensagem('');
    setSucesso(false);
    const { resultados } = validarCadastro(dados);
    const errosNovos = Object.fromEntries(
      Object.entries(resultados)
        .filter(([, r]) => !r.valido)
        .map(([campo, r]) => [campo, r.erro]),
    );
    setErros(errosNovos);
    if (Object.keys(errosNovos).length > 0) return;

    const resultado = await criarUsuario(dados);
    if (!resultado.ok) {
      setErros({ [resultado.campo]: resultado.erro });
      return;
    }
    setSucesso(true);
    setDados(CAMPOS_INICIAIS);
    setMensagem('Conta criada com sucesso. Use Entrar para acessar.');
  }

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Link titulo="← Voltar ao login" onPress={() => navigation.goBack()} testID="link-voltar" />
        <Text style={{ fontSize: 24, fontWeight: '700', color: COR_TEXTO, marginBottom: 12 }}>Criar conta</Text>

        <Campo rotulo="Nome completo" value={dados.nome} onChangeText={atualizar('nome')} erro={erros.nome} testID="campo-nome" />
        <Campo rotulo="CPF" tipo="cpf" placeholder="000.000.000-00" value={dados.cpf} onChangeText={atualizar('cpf')} erro={erros.cpf} testID="campo-cpf" />
        <Campo rotulo="E-mail" placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" value={dados.email} onChangeText={atualizar('email')} erro={erros.email} testID="campo-email" />
        <Campo rotulo="Telefone" tipo="telefone" placeholder="(11) 99999-9999" value={dados.telefone} onChangeText={atualizar('telefone')} erro={erros.telefone} testID="campo-telefone" />
        <Campo rotulo="Data de nascimento" tipo="data" placeholder="DD/MM/AAAA" value={dados.dataNascimento} onChangeText={atualizar('dataNascimento')} erro={erros.dataNascimento} testID="campo-nascimento" />
        <Campo rotulo="Senha" placeholder="Mínimo 8, com letras e números" secureTextEntry value={dados.senha} onChangeText={atualizar('senha')} erro={erros.senha} testID="campo-senha" />
        <Campo rotulo="Confirmar senha" secureTextEntry value={dados.confirmacaoSenha} onChangeText={atualizar('confirmacaoSenha')} erro={erros.confirmacaoSenha} testID="campo-confirmacao" />

        <Pressable
          onPress={() => setDados((anterior) => ({ ...anterior, termos: !anterior.termos }))}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: dados.termos }}
          accessibilityLabel="Aceito os termos de uso e a política de privacidade"
          testID="checkbox-termos"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 }}
        >
          <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COR_PRINCIPAL, backgroundColor: dados.termos ? COR_PRINCIPAL : COR_FUNDO }} />
          <Text style={{ color: COR_TEXTO_SUAVE, flexShrink: 1 }}>Aceito os termos de uso e a política de privacidade</Text>
        </Pressable>
        {erros.termos ? <Text accessibilityRole="alert" style={{ color: COR_ERRO }}>{erros.termos}</Text> : null}

        {mensagem ? (
          <Text accessibilityRole="alert" style={{ color: sucesso ? COR_PRINCIPAL : COR_ERRO, marginTop: 8 }}>
            {mensagem}
          </Text>
        ) : null}

        <Botao titulo="Criar conta" onPress={enviar} testID="botao-criar-conta" />
      </ScrollView>
    </Tela>
  );
}
