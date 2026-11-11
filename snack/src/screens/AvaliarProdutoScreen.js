import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Botao, Campo, Tela } from '../components/ui';
import { Aviso, Estrelas } from '../components/extras';
import { salvarAvaliacao } from '../services/avaliacoes';
import { pontuarAvaliacao } from '../services/gamificacao';
import { listarPedidos, pedidosEntreguesComProduto } from '../services/pedidos';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Avaliar produto (PRD FR-ORD-03): só para pedidos entregues. Envio dá +50 pontos.
export default function AvaliarProdutoScreen({ route, navigation }) {
  const { produto } = route.params;
  const [podeAvaliar, setPodeAvaliar] = useState(null);
  const [nota, setNota] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    listarPedidos().then((pedidos) => setPodeAvaliar(pedidosEntreguesComProduto(pedidos, produto.id).length > 0));
  }, [produto.id]);

  async function enviar() {
    setMensagem('');
    const resultado = await salvarAvaliacao({ produtoId: produto.id, nota, titulo, comentario });
    if (!resultado.ok) {
      setErros({ geral: resultado.erro });
      return;
    }
    await pontuarAvaliacao(titulo.trim());
    setErros({});
    setSucesso(true);
    setMensagem('Avaliação enviada! +50 pontos.');
    setTimeout(() => navigation.goBack(), 800);
  }

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Avaliar produto</Text>
        <Text style={{ color: COR_TEXTO_SUAVE, marginBottom: 12 }}>{produto.nome}</Text>

        {podeAvaliar === false ? (
          <Aviso texto="Só é possível avaliar produtos de pedidos já entregues." tipo="erro" />
        ) : null}

        <Text style={{ color: COR_TEXTO_SUAVE, marginBottom: 4 }}>Sua nota</Text>
        <Estrelas nota={nota} tamanho={32} onChange={setNota} />
        {erros.nota ? <Text style={{ color: '#B91C1C' }}>{erros.nota}</Text> : null}

        <Campo rotulo="Título da avaliação" placeholder="Resumo da sua opinião" value={titulo} onChangeText={setTitulo} testID="campo-titulo" />
        <Campo rotulo="Comentário" placeholder="Conte sua experiência com o produto..." multiline numberOfLines={4} value={comentario} onChangeText={setComentario} testID="campo-comentario" />

        {erros.geral ? <Aviso texto={erros.geral} tipo="erro" /> : null}
        {mensagem ? <Aviso texto={mensagem} /> : null}

        <Botao
          titulo="Enviar avaliação (+50 pts)"
          onPress={enviar}
          desabilitado={podeAvaliar !== true || sucesso}
          testID="botao-enviar-avaliacao"
        />
      </ScrollView>
    </Tela>
  );
}
