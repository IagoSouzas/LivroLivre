import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Botao, Tela } from '../components/ui';
import { Card, Estrelas, Vazio } from '../components/extras';
import { avaliacoesDoProduto, resumoAvaliacoes } from '../services/avaliacoes';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Avaliações de um produto (PRD FR-CAT-05): média, distribuição 5★ a 1★ e comentários.
export default function AvaliacoesScreen({ route, navigation }) {
  const { produto } = route.params;
  const [lista, setLista] = useState([]);

  useFocusEffect(
    useCallback(() => {
      avaliacoesDoProduto(produto.id).then(setLista);
    }, [produto.id]),
  );

  const resumo = resumoAvaliacoes(lista);

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Avaliações ({resumo.total})</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 12 }}>
        <Text style={{ fontSize: 40, fontWeight: '700', color: COR_TEXTO }} testID="media">{resumo.media.toFixed(1)}</Text>
        <View style={{ gap: 4 }}>
          <Estrelas nota={resumo.media} />
          {[5, 4, 3, 2, 1].map((n) => (
            <Text key={n} style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }} testID={`dist-${n}`}>
              {n}★ · {resumo.distribuicao[n]}
            </Text>
          ))}
        </View>
      </View>

      <Botao titulo="Escrever avaliação" onPress={() => navigation.navigate('AvaliarProduto', { produto })} testID="botao-escrever-avaliacao" />

      <Text style={{ fontWeight: '700', color: COR_TEXTO, marginTop: 16, marginBottom: 8 }}>Mais recentes</Text>
      {lista.length === 0 ? (
        <Vazio texto="Este produto ainda não tem avaliações." testID="sem-avaliacoes" />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <Card testID={`avaliacao-${item.id}`}>
              <Estrelas nota={item.nota} tamanho={14} />
              <Text style={{ fontWeight: '700', color: COR_TEXTO, marginTop: 4 }}>{item.titulo}</Text>
              <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 2 }}>{item.comentario}</Text>
            </Card>
          )}
        />
      )}
    </Tela>
  );
}
