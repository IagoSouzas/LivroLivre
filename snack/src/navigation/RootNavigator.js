// Navegação raiz (PRD seção 7): sem sessão → pilha de autenticação; com sessão → abas + telas de detalhe.
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SessaoContext, useSessao } from '../context';
import LoginScreen from '../screens/LoginScreen';
import CriarContaScreen from '../screens/CriarContaScreen';
import RecuperarSenhaScreen from '../screens/RecuperarSenhaScreen';
import InicioScreen from '../screens/InicioScreen';
import BuscaScreen from '../screens/BuscaScreen';
import CarrinhoScreen from '../screens/CarrinhoScreen';
import PedidosScreen from '../screens/PedidosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { AvatarPerfil, } from '../components/extras';
import { Cabecalho } from '../components/ui';
import ProdutoScreen from '../screens/ProdutoScreen';
import AvaliacoesScreen from '../screens/AvaliacoesScreen';
import AvaliarProdutoScreen from '../screens/AvaliarProdutoScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PedidoConfirmadoScreen from '../screens/PedidoConfirmadoScreen';
import RastreamentoScreen from '../screens/RastreamentoScreen';
import DevolucaoScreen from '../screens/DevolucaoScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import RecompensasScreen from '../screens/RecompensasScreen';
import ConquistasScreen from '../screens/ConquistasScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import AlterarSenhaScreen from '../screens/AlterarSenhaScreen';
import EnderecosScreen from '../screens/EnderecosScreen';
import FormasPagamentoScreen from '../screens/FormasPagamentoScreen';
import TesterScreen from '../screens/TesterScreen';
import { sessaoAtual } from '../services/auth';
import { COR_FUNDO, COR_PRINCIPAL, COR_TEXTO_SUAVE } from '../theme';

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

function PilhaAutenticacao({ onLogin }) {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Login">{(props) => <LoginScreen {...props} onLogin={onLogin} />}</Pilha.Screen>
      <Pilha.Screen name="CriarConta" component={CriarContaScreen} />
      <Pilha.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
    </Pilha.Navigator>
  );
}

function Tabs() {
  const { sessao } = useSessao();
  const nome = sessao?.usuario?.nome || sessao?.usuario?.username;
  return (
    <Abas.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitle: () => <Cabecalho />,
        headerTitleAlign: 'left',
        headerRight: () => <AvatarPerfil nome={nome} onPress={() => navigation.navigate('Perfil')} />,
        tabBarActiveTintColor: COR_PRINCIPAL,
        tabBarInactiveTintColor: COR_TEXTO_SUAVE,
      })}
    >
      <Abas.Screen name="Início" component={InicioScreen} />
      <Abas.Screen name="Busca" component={BuscaScreen} />
      <Abas.Screen name="Carrinho" component={CarrinhoScreen} />
      <Abas.Screen name="Pedidos" component={PedidosScreen} />
    </Abas.Navigator>
  );
}

// Telas de detalhe e fluxos empilhados por cima das abas.
const TELAS_DETALHE = [
  { nome: 'Produto', componente: ProdutoScreen },
  { nome: 'Avaliacoes', componente: AvaliacoesScreen },
  { nome: 'AvaliarProduto', componente: AvaliarProdutoScreen },
  { nome: 'Checkout', componente: CheckoutScreen },
  { nome: 'PedidoConfirmado', componente: PedidoConfirmadoScreen },
  { nome: 'Rastreamento', componente: RastreamentoScreen },
  { nome: 'Devolucao', componente: DevolucaoScreen },
  { nome: 'Favoritos', componente: FavoritosScreen },
  { nome: 'Recompensas', componente: RecompensasScreen },
  { nome: 'Conquistas', componente: ConquistasScreen },
  { nome: 'Configuracoes', componente: ConfiguracoesScreen },
  { nome: 'EditarPerfil', componente: EditarPerfilScreen },
  { nome: 'AlterarSenha', componente: AlterarSenhaScreen },
  { nome: 'Enderecos', componente: EnderecosScreen },
  { nome: 'FormasPagamento', componente: FormasPagamentoScreen },
  { nome: 'Perfil', componente: PerfilScreen },
  { nome: 'Tester', componente: TesterScreen },
];

function PilhaPrincipal() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Abas" component={Tabs} />
      {TELAS_DETALHE.map((t) => (
        <Pilha.Screen key={t.nome} name={t.nome} component={t.componente} />
      ))}
    </Pilha.Navigator>
  );
}

export default function RootNavigator() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    sessaoAtual()
      .then((salva) => setSessao(salva))
      .finally(() => setCarregando(false));
  }, []);

  const contexto = useMemo(
    () => ({ sessao, encerrarSessao: () => setSessao(null) }),
    [sessao],
  );

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COR_FUNDO }}>
        <ActivityIndicator color={COR_PRINCIPAL} />
      </View>
    );
  }

  return (
    <SessaoContext.Provider value={contexto}>
      <NavigationContainer>
        {sessao ? <PilhaPrincipal /> : <PilhaAutenticacao onLogin={setSessao} />}
      </NavigationContainer>
    </SessaoContext.Provider>
  );
}
