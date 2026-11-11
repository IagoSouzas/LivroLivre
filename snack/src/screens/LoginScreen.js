import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Botao, Campo, Link, Logo, Tela } from '../components/ui';
import { validarUsuarioOuEmail, validarObrigatorio } from '../validators';
import { login, CONTA_TESTE } from '../services/auth';
import { COR_ERRO, COR_TEXTO_SUAVE, ASSINATURA } from '../theme';

export default function LoginScreen({ navigation, onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(usuarioEntrada = usuario, senhaEntrada = senha) {
    const errosNovos = {
      usuario: validarUsuarioOuEmail(usuarioEntrada).erro,
      // No login só checa se foi preenchida: as regras de senha valem no cadastro,
      // senão contas existentes com outra senha ficariam bloqueadas.
      senha: validarObrigatorio(senhaEntrada, 'Senha').erro,
    };
    setErros(errosNovos);
    setMensagem('');
    if (errosNovos.usuario || errosNovos.senha) return;

    setCarregando(true);
    try {
      const sessao = await login(usuarioEntrada, senhaEntrada);
      onLogin(sessao);
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  function entrarComContaTeste() {
    setUsuario(CONTA_TESTE.usuario);
    setSenha(CONTA_TESTE.senha);
    entrar(CONTA_TESTE.usuario, CONTA_TESTE.senha);
  }

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
          <Logo tamanho={80} />
          <Text style={{ fontSize: 24, fontWeight: '700', marginTop: 12 }}>LivroLivre</Text>
          <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 4 }}>{ASSINATURA}</Text>
        </View>

        <Campo
          rotulo="Usuário ou e-mail"
          placeholder="emilys ou seu@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          testID="campo-usuario"
          value={usuario}
          onChangeText={setUsuario}
          erro={erros.usuario}
        />
        <Campo
          rotulo="Senha"
          placeholder="Sua senha"
          secureTextEntry
          testID="campo-senha"
          value={senha}
          onChangeText={setSenha}
          erro={erros.senha}
        />

        <Link titulo="Esqueci minha senha" onPress={() => navigation.navigate('RecuperarSenha')} testID="link-esqueci" />

        {mensagem ? (
          <Text accessibilityRole="alert" style={{ color: COR_ERRO, marginTop: 12, textAlign: 'center' }}>
            {mensagem}
          </Text>
        ) : null}

        <Botao
          titulo={carregando ? 'Entrando...' : 'Entrar'}
          onPress={() => entrar()}
          desabilitado={carregando}
          testID="botao-entrar"
        />
        <Botao
          titulo="Login teste"
          variante="secundario"
          onPress={entrarComContaTeste}
          desabilitado={carregando}
          testID="botao-login-teste"
        />

        <Link titulo="Não tem conta? Criar conta" onPress={() => navigation.navigate('CriarConta')} testID="link-criar-conta" />

      </ScrollView>
    </Tela>
  );
}
