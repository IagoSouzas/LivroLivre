import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Botao, Tela } from '../components/ui';
import { Estrelas, Secao, Aviso, Linha } from '../components/extras';
import { adicionarAoCarrinho } from '../services/carrinho';
import { alternarFavorito, isFavorito } from '../services/cadastros';
import { avaliacoesDoProduto, resumoAvaliacoes } from '../services/avaliacoes';
import { formatarMoeda } from '../services/cart';
import { validarQuantidade } from '../validators';
import { COR_BORDA, COR_CAMPO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

// Detalhe do produto (PRD FR-CAT-04).
export default function ProdutoScreen({ route, navigation }) {
  const produto = route.params.produto;
  const [quantidade, setQuantidade] = useState(1);
  const [favorito, setFavorito] = useState(false);
  const [resumo, setResumo] = useState({ total: 0, media: 0, distribuicao: {} });
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    isFavorito(produto.id).then(setFavorito);
    avaliacoesDoProduto(produto.id).then((lista) => setResumo(resumoAvaliacoes(lista)));
  }, [produto.id]);

  async function alternar() {
    const agora = await alternarFavorito(produto);
    setFavorito(agora);
  }

  async function adicionar() {
    const valida = validarQuantidade(quantidade);
    if (!valida.valido) {
      setMensagem(valida.erro);
      return;
    }
    await adicionarAoCarrinho(produto, quantidade);
    setMensagem('Adicionado ao carrinho.');
  }

  async function comprar() {
    await adicionarAoCarrinho(produto, quantidade);
    navigation.navigate('Checkout');
  }

  const parcela = produto.preco ? produto.preco / 12 : 0;

  return (
    <Tela>
      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
            <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
          </Pressable>
          <Pressable onPress={alternar} accessibilityRole="button" accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Favoritar'} testID="botao-favorito">
            <Text style={{ color: COR_PRINCIPAL, fontSize: 22 }}>{favorito ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        {produto.imagem ? (
          <Image source={{ uri: produto.imagem }} style={{ width: '100%', height: 260, borderRadius: RAIO }} resizeMode="contain" accessibilityLabel={`Capa de ${produto.nome}`} />
        ) : (
          <View style={{ width: '100%', height: 260, borderRadius: RAIO, backgroundColor: COR_CAMPO }} />
        )}

        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 12 }} testID="produto-nome">{produto.nome}</Text>
        <Text style={{ color: COR_TEXTO_SUAVE }}>{produto.categoria}</Text>

        <Pressable onPress={() => navigation.navigate('Avaliacoes', { produto })} accessibilityRole="button" accessibilityLabel="Ver avaliações" testID="ver-avaliacoes" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Estrelas nota={resumo.media} />
          <Text style={{ color: COR_TEXTO_SUAVE }}>{resumo.total} avaliações</Text>
        </Pressable>

        <Text style={{ fontSize: 24, color: COR_PRINCIPAL, fontWeight: '700', marginTop: 10 }} testID="produto-preco">{formatarMoeda(produto.preco)}</Text>
        <Text style={{ color: COR_TEXTO_SUAVE }}>ou 12x de {formatarMoeda(parcela)}</Text>

        <Secao titulo="Descrição">
          <Text style={{ color: COR_TEXTO }}>{produto.descricao || 'Sem descrição disponível.'}</Text>
        </Secao>

        <Secao titulo="Quantidade">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable onPress={() => setQuantidade((q) => Math.max(1, q - 1))} accessibilityRole="button" accessibilityLabel="Diminuir quantidade" testID="qtd-menos" style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: COR_CAMPO, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: COR_PRINCIPAL }}>-</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '700' }} testID="qtd-valor">{quantidade}</Text>
            <Pressable onPress={() => setQuantidade((q) => q + 1)} accessibilityRole="button" accessibilityLabel="Aumentar quantidade" testID="qtd-mais" style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: COR_CAMPO, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: COR_PRINCIPAL }}>+</Text>
            </Pressable>
          </View>
        </Secao>

        {mensagem ? <Aviso texto={mensagem} /> : null}

        <Linha rotulo="Subtotal" valor={formatarMoeda(produto.preco * quantidade)} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Botao titulo="Adicionar" variante="secundario" onPress={adicionar} testID="botao-adicionar" />
          </View>
          <View style={{ flex: 1 }}>
            <Botao titulo="Comprar" onPress={comprar} testID="botao-comprar" />
          </View>
        </View>
        <View style={{ height: 24, borderBottomWidth: 1, borderColor: COR_BORDA }} />
      </ScrollView>
    </Tela>
  );
}
