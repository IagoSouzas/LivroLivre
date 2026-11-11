import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Tela } from '../components/ui';
import { listarPedidos } from '../services/pedidos';
import { listarAvaliacoes } from '../services/avaliacoes';
import { carregarGamificacao, resumoGamificacao, conquistas } from '../services/gamificacao';
import { COR_BORDA, COR_CAMPO, COR_FUNDO, COR_PRINCIPAL, COR_PRINCIPAL_SUAVE, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

// Conquistas (PRD FR-GAM-05): desbloqueadas ou bloqueadas.
export default function ConquistasScreen({ navigation }) {
  const [lista, setLista] = useState([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([carregarGamificacao(), listarPedidos(), listarAvaliacoes()]).then(([estado, pedidos, avaliacoes]) => {
        setLista(conquistas(resumoGamificacao({ estado, pedidos, avaliacoes })));
      });
    }, []),
  );

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Conquistas</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {lista.map((c) => (
          <View
            key={c.id}
            testID={`conquista-${c.id}`}
            accessibilityLabel={`${c.titulo}: ${c.desbloqueada ? 'desbloqueada' : 'bloqueada'}`}
            style={{
              width: '47%',
              borderWidth: 1,
              borderColor: c.desbloqueada ? COR_PRINCIPAL : COR_BORDA,
              borderRadius: RAIO,
              padding: 14,
              alignItems: 'center',
              backgroundColor: c.desbloqueada ? COR_PRINCIPAL_SUAVE : COR_CAMPO,
            }}
          >
            <Text style={{ fontSize: 28, opacity: c.desbloqueada ? 1 : 0.4 }}>{c.desbloqueada ? '🏆' : '🔒'}</Text>
            <Text style={{ fontWeight: '700', color: COR_TEXTO, textAlign: 'center', marginTop: 6 }}>{c.titulo}</Text>
            <Text style={{ color: c.desbloqueada ? COR_PRINCIPAL : COR_TEXTO_SUAVE, fontSize: 12, marginTop: 2 }}>
              {c.desbloqueada ? 'Desbloqueada' : 'Bloqueada'}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: COR_FUNDO }} />
    </Tela>
  );
}
