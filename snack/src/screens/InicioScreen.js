import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Cabecalho, Tela } from '../components/ui';
import { Secao, Vazio, Aviso } from '../components/extras';
import { Botao } from '../components/ui';
import { carregarCatalogo } from '../services/busca';
import { formatarMoeda } from '../services/cart';
import { COR_BORDA, COR_CAMPO, COR_FUNDO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

// Início: destaques e categorias (PRD FR-CAT-02). Toque no produto abre o detalhe.
export default function InicioScreen({ navigation }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    carregarCatalogo('').then(({ itens: novos, falhou }) => {
      if (!ativo) return;
      setItens(novos.slice(0, 10));
      setAviso(falhou ? 'Alguns catálogos não responderam. Tente novamente.' : '');
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const cabecalhoLista = (
    <View>
      <Pressable
        onPress={() => navigation.navigate('Busca')}
        accessibilityRole="button"
        accessibilityLabel="Ir para a busca"
        testID="ir-busca"
        style={{ backgroundColor: COR_CAMPO, borderColor: COR_BORDA, borderWidth: 1, borderRadius: RAIO, padding: 12 }}
      >
        <Text style={{ color: COR_TEXTO_SUAVE }}>Buscar livros...</Text>
      </Pressable>

      {aviso ? (
        <View>
          <Aviso texto={aviso} tipo="erro" />
          <Botao titulo="Tentar novamente" variante="secundario" onPress={() => setTentativa((n) => n + 1)} testID="tentar-novamente" />
        </View>
      ) : null}

      <Text style={{ fontSize: 16, fontWeight: '700', color: COR_TEXTO, marginTop: 16, marginBottom: 8 }}>Em destaque</Text>
    </View>
  );

  return (
    <Tela>
      {carregando ? (
        <View>
          {cabecalhoLista}
          <ActivityIndicator color={COR_PRINCIPAL} />
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={cabecalhoLista}
          ListEmptyComponent={<Vazio texto="Nenhum produto encontrado." />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Produto', { produto: item })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.nome}`}
              testID={`destaque-${item.id}`}
              style={{ flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 10, marginBottom: 10, backgroundColor: COR_FUNDO }}
            >
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={{ width: 56, height: 80, borderRadius: 8 }} accessibilityLabel={`Capa de ${item.nome}`} />
              ) : (
                <View style={{ width: 56, height: 80, borderRadius: 8, backgroundColor: COR_CAMPO }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: COR_TEXTO }} numberOfLines={2}>{item.nome}</Text>
                <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }}>{item.descricao}</Text>
                <Text style={{ color: COR_PRINCIPAL, fontWeight: '700', marginTop: 4 }}>{formatarMoeda(item.preco)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}    </Tela>
  );
}
