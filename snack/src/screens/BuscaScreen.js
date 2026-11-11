import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Tela } from '../components/ui';
import { Chip, Card, Vazio, Aviso, estiloCampo } from '../components/extras';
import { carregarCatalogo, filtrarProdutos, ORDENACOES } from '../services/busca';
import { listarAvaliacoes, resumoAvaliacoes } from '../services/avaliacoes';
import { formatarMoeda } from '../services/cart';
import { COR_CAMPO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Busca e lista com filtros (PRD FR-CAT-03): preço, autor/marca, avaliação e ordenação.
export default function BuscaScreen({ navigation }) {
  const [termo, setTermo] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [autor, setAutor] = useState('');
  const [avaliacaoMin, setAvaliacaoMin] = useState(0);
  const [ordem, setOrdem] = useState('relevancia');

  const [itens, setItens] = useState([]);
  const [medias, setMedias] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');
  const [buscaRealizada, setBuscaRealizada] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    Promise.all([carregarCatalogo(termo), listarAvaliacoes()]).then(([{ itens: novos, falhou }, avaliacoes]) => {
      if (!ativo) return;
      const mapa = {};
      const porProduto = {};
      avaliacoes.forEach((a) => {
        porProduto[a.produtoId] = [...(porProduto[a.produtoId] || []), a];
      });
      Object.entries(porProduto).forEach(([id, lista]) => {
        mapa[id] = resumoAvaliacoes(lista).media;
      });
      setMedias(mapa);
      setItens(novos);
      setAviso(falhou ? 'Alguns catálogos não responderam.' : '');
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [buscaRealizada]);

  const exibidos = useMemo(
    () => filtrarProdutos(itens, { precoMin, precoMax, autor, avaliacaoMin, ordem }, medias),
    [itens, precoMin, precoMax, autor, avaliacaoMin, ordem, medias],
  );

  return (
    <Tela>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor={COR_TEXTO_SUAVE}
          value={termo}
          onChangeText={setTermo}
          onSubmitEditing={() => setBuscaRealizada((n) => n + 1)}
          returnKeyType="search"
          accessibilityLabel="Termo da busca"
          testID="campo-busca"
          style={[estiloCampo, { flex: 1 }]}
        />
        <Pressable
          onPress={() => setBuscaRealizada((n) => n + 1)}
          accessibilityRole="button"
          accessibilityLabel="Buscar"
          testID="botao-buscar"
          style={{ backgroundColor: COR_PRINCIPAL, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Buscar</Text>
        </Pressable>
      </View>


      <Card>
        <Text style={{ fontWeight: '700', color: COR_TEXTO, marginBottom: 6 }}>Filtros</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput placeholder="Preço mín." keyboardType="numeric" value={precoMin} onChangeText={setPrecoMin} accessibilityLabel="Preço mínimo" testID="preco-min" style={[estiloCampo, { flex: 1 }]} />
          <TextInput placeholder="Preço máx." keyboardType="numeric" value={precoMax} onChangeText={setPrecoMax} accessibilityLabel="Preço máximo" testID="preco-max" style={[estiloCampo, { flex: 1 }]} />
        </View>
        <TextInput placeholder="Autor ou marca" value={autor} onChangeText={setAutor} accessibilityLabel="Autor ou marca" testID="filtro-autor" style={[estiloCampo, { marginTop: 8 }]} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 8 }}>
          {[0, 3, 4, 5].map((n) => (
            <Chip key={n} titulo={n === 0 ? 'Qualquer avaliação' : `${n}★ ou mais`} ativo={avaliacaoMin === n} onPress={() => setAvaliacaoMin(n)} testID={`avaliacao-${n}`} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {ORDENACOES.map((o) => (
            <Chip key={o.id} titulo={o.titulo} ativo={ordem === o.id} onPress={() => setOrdem(o.id)} testID={`ordem-${o.id}`} />
          ))}
        </ScrollView>
      </Card>

      {aviso ? (
        <View>
          <Aviso texto={aviso} tipo="erro" />
          <Pressable onPress={() => setBuscaRealizada((n) => n + 1)} accessibilityRole="button" accessibilityLabel="Tentar novamente" testID="busca-tentar-novamente" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
            <Text style={{ color: COR_PRINCIPAL, fontWeight: '600' }}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={{ color: COR_TEXTO_SUAVE, marginBottom: 6 }} testID="contagem-resultados">{exibidos.length} resultados</Text>

      {carregando ? (
        <ActivityIndicator color={COR_PRINCIPAL} />
      ) : exibidos.length === 0 ? (
        <Vazio texto="Nenhum produto com esses filtros." testID="busca-vazia" />
      ) : (
        <FlatList
          data={exibidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Produto', { produto: item })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.nome}`}
              testID={`resultado-${item.id}`}
              style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}
            >
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={{ width: 56, height: 80, borderRadius: 8 }} accessibilityLabel={`Capa de ${item.nome}`} />
              ) : (
                <View style={{ width: 56, height: 80, borderRadius: 8, backgroundColor: COR_CAMPO }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: COR_TEXTO }} numberOfLines={2}>{item.nome}</Text>
                <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }}>{item.categoria}</Text>
                <Text style={{ color: COR_PRINCIPAL, fontWeight: '700', marginTop: 4 }}>{formatarMoeda(item.preco)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Tela>
  );
}
