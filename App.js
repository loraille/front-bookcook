import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen';
import RecetteScreen from './screens/RecetteScreen';
import RecoScreen from './screens/RecoScreen';
import CahierScreen from './screens/CahierScreen';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import user from './reducers/user';
import recette from './reducers/recette';

const store = configureStore({
  reducer: { user, recette },
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Photo') {
            iconName = 'camera';
          } else if (route.name === 'Recette') {
            iconName = 'file';
          } else if (route.name === 'Cahier') {
            iconName = 'book';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec6e5b',
        tabBarInactiveTintColor: '#335561',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Photo" component={RecoScreen} />
      <Tab.Screen name="Recette" component={RecetteScreen} />
      <Tab.Screen name="Cahier" component={CahierScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Dancing: require('./assets/fonts/DancingScript-VariableFont_wght.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
