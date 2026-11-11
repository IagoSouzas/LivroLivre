import { useState } from 'react';
import { Text, View } from 'react-native';
import { Botao, Campo, Link, Tela } from '../components/ui';
import { validarEmail } from '../validators';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_PRINCIPAL_SUAVE } from '../theme';

// PRD FR-AUTH-03: tela apenas visual. Não envia e-mail de verdade.
export default function RecuperarSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  function enviar() {
    const resultado = validarEmail(email);
    setErro(resultado.erro ?? '');
    setEnviado(resultado.valido);
  }

  return (
    <Tela>
      <Link titulo="← Voltar" onPress={() => navigation.goBack()} testID="link-voltar" />
      <Text style={{ fontSize: 24, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Recuperar senha</Text>
      <Text style={{ color: COR_TEXTO_SUAVE, marginVertical: 8 }}>Digite seu e-mail para receber o link de redefinição.</Text>

      <Campo
        rotulo="E-mail cadastrado"
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(texto) => {
          setEmail(texto);
          setEnviado(false);
        }}
        erro={erro}
        testID="campo-email-recuperar"
      />

      <Botao titulo="Enviar link de redefinição" onPress={enviar} testID="botao-enviar-link" />

      {enviado ? (
        <View
          accessibilityRole="alert"
          style={{ backgroundColor: COR_PRINCIPAL_SUAVE, borderColor: COR_PRINCIPAL, borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16 }}
        >
          <Text style={{ fontWeight: '700', color: COR_TEXTO }}>✓ E-mail enviado!</Text>
          <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 4 }}>Verifique sua caixa de entrada e siga as instruções.</Text>
          <Text style={{ color: COR_PRINCIPAL, marginTop: 6, fontSize: 12 }}>(Simulação: nenhum e-mail foi enviado.)</Text>
        </View>
      ) : null}

      <Link titulo="← Voltar ao login" onPress={() => navigation.navigate('Login')} testID="link-voltar-login" />
    </Tela>
  );
}
