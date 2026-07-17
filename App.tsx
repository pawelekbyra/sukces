import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import HabitScreen from './screens/HabitScreen';
import RunningScreen from './screens/RunningScreen';
import FinanceScreen from './screens/FinanceScreen';
import { colors } from './lib/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Życie' }} />
          <Stack.Screen name="Habit" component={HabitScreen} options={({ route }: any) => ({ title: route.params?.label ?? '' })} />
          <Stack.Screen name="Running" component={RunningScreen} options={{ title: 'Kilometry' }} />
          <Stack.Screen name="Finance" component={FinanceScreen} options={{ title: 'Hajs' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
