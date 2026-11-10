import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Tela } from '../components/ui';
import { Vazio, Card } from '../components/extras';
import { listarFavoritos, alternarFavorito } from '../services/cadastros';
import { formatarMoeda } from '../services/cart';
import { COR_CAMPO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Favoritos (PRD FR-ACC-02).
export default function FavoritosScreen({ navigation }) {
  const [lista, setLista] = useState([]);

  useFocusEffect(
    useCallback(() => {
      listarFavoritos().then(setLista);
    }, []),
  );

  async function remover(produto) {
    await alternarFavorito(produto);
    setLista(await listarFavoritos());
  }

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }} testID="favoritos-titulo">Favoritos ({lista.length})</Text>

      {lista.length === 0 ? (
        <Vazio texto="Você ainda não favoritou nenhum produto." testID="favoritos-vazio" />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <Card testID={`favorito-${item.id}`}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {item.imagem ? (
                  <Image source={{ uri: item.imagem }} style={{ width: 56, height: 80, borderRadius: 8 }} accessibilityLabel={`Capa de ${item.nome}`} />
                ) : (
                  <View style={{ width: 56, height: 80, borderRadius: 8, backgroundColor: COR_CAMPO }} />
                )}
                <View style={{ flex: 1 }}>
                  <Pressable onPress={() => navigation.navigate('Produto', { produto: item })} accessibilityRole="button" accessibilityLabel={`Abrir ${item.nome}`}>
                    <Text style={{ fontWeight: '700', color: COR_TEXTO }} numberOfLines={2}>{item.nome}</Text>
                  </Pressable>
                  <Text style={{ color: COR_PRINCIPAL, fontWeight: '700' }}>{formatarMoeda(item.preco)}</Text>
                  <Pressable onPress={() => remover(item)} accessibilityRole="button" accessibilityLabel={`Remover ${item.nome} dos favoritos`} testID={`remover-fav-${item.id}`}>
                    <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 6 }}>♥ Remover dos favoritos</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Tela>
  );
}
