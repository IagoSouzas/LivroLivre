// Componentes extras usados por várias telas.
import { Pressable, Text, View } from 'react-native';
import { COR_BORDA, COR_CAMPO, COR_FUNDO, COR_PRINCIPAL, COR_PRINCIPAL_SUAVE, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

export function Estrelas({ nota, tamanho = 16, onChange }) {
  const estrelas = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {estrelas.map((n) => {
        const cheia = n <= Math.round(nota);
        const conteudo = (
          <Text style={{ fontSize: tamanho, color: cheia ? '#F39C12' : COR_BORDA }}>★</Text>
        );
        if (!onChange) return <View key={n}>{conteudo}</View>;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityLabel={`${n} estrela${n > 1 ? 's' : ''}`}
            testID={`estrela-${n}`}
          >
            {conteudo}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ titulo, ativo, onPress, testID }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!ativo }}
      accessibilityLabel={titulo}
      testID={testID}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: ativo ? COR_PRINCIPAL : COR_PRINCIPAL_SUAVE,
      }}
    >
      <Text style={{ color: ativo ? COR_FUNDO : COR_PRINCIPAL, fontWeight: '600' }}>{titulo}</Text>
    </Pressable>
  );
}

export function Secao({ titulo, children }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: COR_TEXTO, marginBottom: 8 }}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Card({ children, testID }) {
  return (
    <View
      testID={testID}
      style={{ borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 12, marginBottom: 10, backgroundColor: COR_FUNDO }}
    >
      {children}
    </View>
  );
}

export function Vazio({ texto, testID }) {
  return (
    <Text testID={testID} style={{ color: COR_TEXTO_SUAVE, textAlign: 'center', marginTop: 24 }}>
      {texto}
    </Text>
  );
}

export function Aviso({ texto, tipo = 'info' }) {
  const cor = tipo === 'erro' ? '#B91C1C' : COR_PRINCIPAL;
  return (
    <View
      accessibilityRole="alert"
      style={{ borderWidth: 1, borderColor: cor, backgroundColor: tipo === 'erro' ? '#FEE2E2' : COR_PRINCIPAL_SUAVE, borderRadius: RAIO, padding: 10, marginVertical: 8 }}
    >
      <Text style={{ color: tipo === 'erro' ? '#B91C1C' : COR_TEXTO }}>{texto}</Text>
    </View>
  );
}

export function Linha({ rotulo, valor, destaque, testID }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: destaque ? COR_TEXTO : COR_TEXTO_SUAVE, fontWeight: destaque ? '700' : '400' }}>{rotulo}</Text>
      <Text testID={testID} style={{ color: destaque ? COR_PRINCIPAL : COR_TEXTO, fontWeight: destaque ? '700' : '400' }}>{valor}</Text>
    </View>
  );
}

export function BarraSuperior({ children }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{children}</View>;
}

export const estiloCampo = { backgroundColor: COR_CAMPO, borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 12, fontSize: 16, color: COR_TEXTO };
