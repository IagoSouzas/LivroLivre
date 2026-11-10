import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Botao, Cabecalho, Tela } from '../components/ui';
import { Card } from '../components/extras';
import { useSessao } from '../context';
import { sair } from '../services/auth';
import { carregarPerfil } from '../services/perfil';
import { COR_BORDA, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_FUNDO, COR_PRINCIPAL_SUAVE } from '../theme';

const MENU = [
  { id: 'Pedidos', titulo: 'Meus pedidos', tab: true },
  { id: 'Favoritos', titulo: 'Favoritos' },
  { id: 'Recompensas', titulo: 'Recompensas' },
  { id: 'Enderecos', titulo: 'Endereços' },
  { id: 'FormasPagamento', titulo: 'Formas de pagamento' },
  { id: 'Configuracoes', titulo: 'Configurações' },
  { id: 'Tester', titulo: 'Tester (testes do app)' },
];

export default function PerfilScreen({ navigation }) {
  const { sessao, encerrarSessao } = useSessao();
  const [perfil, setPerfil] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil(sessao).then(setPerfil);
    }, [sessao]),
  );

  async function encerrar() {
    await sair();
    encerrarSessao();
  }

  return (
    <Tela>
      <Cabecalho subtitulo="Perfil" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO }}>Perfil</Text>
        <Pressable onPress={() => navigation.navigate('EditarPerfil')} accessibilityRole="button" accessibilityLabel="Editar perfil" testID="botao-editar-perfil">
          <Text style={{ color: COR_PRINCIPAL, fontWeight: '600' }}>Editar</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: COR_PRINCIPAL, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: COR_FUNDO, fontWeight: '700', fontSize: 18 }} testID="perfil-nome">{perfil?.nome || sessao?.usuario?.username}</Text>
        <Text style={{ color: COR_FUNDO }} testID="perfil-email">{perfil?.email}</Text>
      </View>

      <Card>
        <Text style={{ color: COR_TEXTO_SUAVE }}>Usuário: <Text testID="perfil-usuario" style={{ color: COR_TEXTO }}>{sessao?.usuario?.username}</Text></Text>
        <Text style={{ color: COR_TEXTO_SUAVE }}>Conta: {sessao?.origem === 'local' ? 'criada no app' : 'conta de teste'}</Text>
      </Card>

      {MENU.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => (item.tab ? navigation.navigate('Pedidos') : navigation.navigate(item.id))}
          accessibilityRole="button"
          accessibilityLabel={item.titulo}
          testID={`menu-${item.id}`}
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COR_BORDA }}
        >
          <Text style={{ fontSize: 16, color: COR_TEXTO }}>{item.titulo}</Text>
          <Text style={{ color: COR_TEXTO_SUAVE }}>→</Text>
        </Pressable>
      ))}

      <View style={{ marginTop: 16, backgroundColor: COR_PRINCIPAL_SUAVE, borderRadius: 12 }}>
        <Botao titulo="Sair" variante="secundario" onPress={encerrar} testID="botao-sair" />
      </View>
    </Tela>
  );
}
