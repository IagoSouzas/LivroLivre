// Componentes visuais compartilhados. Mantêm o mesmo padrão em todas as telas (PRD seção 11).
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  ASSINATURA,
  COR_BORDA,
  COR_CAMPO,
  COR_ERRO,
  COR_FUNDO,
  COR_PRINCIPAL,
  COR_TEXTO,
  COR_TEXTO_SUAVE,
  ESPACO,
  NOME_APP,
  RAIO,
} from '../theme';

export function Logo({ tamanho = 72 }) {
  return (
    <View
      style={[styles.logo, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}
      accessibilityLabel="Logotipo LivroLivre"
    >
      <Text style={[styles.logoTexto, { fontSize: tamanho * 0.45 }]}>L</Text>
    </View>
  );
}

// Cabeçalho com logotipo, nome do app e nome da dupla (exigido em todas as telas).
export function Cabecalho({ subtitulo }) {
  return (
    <View style={styles.cabecalho}>
      <Logo tamanho={48} />
      <View style={styles.cabecalhoTextos}>
        <Text style={styles.cabecalhoNome}>{NOME_APP}</Text>
        <Text style={styles.cabecalhoAssinatura}>{subtitulo ? `${subtitulo} · ${ASSINATURA}` : ASSINATURA}</Text>
      </View>
    </View>
  );
}

export function Campo({ rotulo, erro, ...props }) {
  return (
    <View style={styles.campoWrapper}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.input, erro ? styles.inputErro : null]}
        placeholderTextColor={COR_TEXTO_SUAVE}
        accessibilityLabel={rotulo}
        {...props}
      />
      {erro ? <Text style={styles.textoErro} accessibilityRole="alert">{erro}</Text> : null}
    </View>
  );
}

export function Botao({ titulo, onPress, variante = 'primario', desabilitado = false, testID }) {
  const primario = variante === 'primario';
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        styles.botao,
        primario ? styles.botaoPrimario : styles.botaoSecundario,
        desabilitado && styles.botaoDesabilitado,
        pressed && !desabilitado && styles.botaoPressionado,
      ]}
    >
      <Text style={primario ? styles.botaoTextoPrimario : styles.botaoTextoSecundario}>{titulo}</Text>
    </Pressable>
  );
}

export function Link({ titulo, onPress, testID }) {
  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="link" accessibilityLabel={titulo}>
      <Text style={styles.link}>{titulo}</Text>
    </Pressable>
  );
}

export function Tela({ children }) {
  return <View style={styles.tela}>{children}</View>;
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: COR_PRINCIPAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: COR_FUNDO,
    fontWeight: '700',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: ESPACO,
  },
  cabecalhoTextos: {
    flexShrink: 1,
  },
  cabecalhoNome: {
    fontSize: 20,
    fontWeight: '700',
    color: COR_TEXTO,
  },
  cabecalhoAssinatura: {
    fontSize: 12,
    color: COR_TEXTO_SUAVE,
    letterSpacing: 0.5,
  },
  tela: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    padding: ESPACO,
  },
  campoWrapper: {
    marginBottom: 12,
  },
  rotulo: {
    fontSize: 14,
    color: COR_TEXTO_SUAVE,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COR_CAMPO,
    borderWidth: 1,
    borderColor: COR_BORDA,
    borderRadius: RAIO,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COR_TEXTO,
  },
  inputErro: {
    borderColor: COR_ERRO,
  },
  textoErro: {
    color: COR_ERRO,
    fontSize: 13,
    marginTop: 4,
  },
  botao: {
    borderRadius: RAIO,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 8,
  },
  botaoPrimario: {
    backgroundColor: COR_PRINCIPAL,
    borderColor: COR_PRINCIPAL,
  },
  botaoSecundario: {
    backgroundColor: COR_FUNDO,
    borderColor: COR_PRINCIPAL,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTextoPrimario: {
    color: COR_FUNDO,
    fontWeight: '700',
    fontSize: 16,
  },
  botaoTextoSecundario: {
    color: COR_PRINCIPAL,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: COR_PRINCIPAL,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 15,
  },
});
