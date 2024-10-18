import { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';
import { urlBackend } from '../var';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  useFonts,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  //*-------------------------------Signin---------------------------
  const handleConnection = () => {
    fetch(`${urlBackend}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            login({
              username: data.userInfo.username,
              email: data.userInfo.email,
              token: data.userInfo.token,
            }),
          );
          navigation.navigate('TabNavigator');
        } else {
          setErrorMessage(data.error);
        }
      });
  };
  //*--------------------------Signup----------------------------
  const handleSignUp = () => {
    fetch(`${urlBackend}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            login({
              username: data.userInfo.username,
              email: data.userInfo.email,
              token: data.userInfo.token,
            }),
          );
          navigation.navigate('TabNavigator');
        } else {
          setErrorMessage(data.error);
        }
      });
  };
  //*-------------sign in/sign up entries-----------------------
  const toggleForm = (type) => {
    setIsSignUp(type);
    setUsername('');
    setPassword('');
    setEmail('');
    setErrorMessage('');
  };
  //*------------reset fields--------------------------------------
  const resetForm = () => {
    setIsSignUp(null);
    setUsername('');
    setPassword('');
    setEmail('');
    setErrorMessage('');
  };
  //*------------------RENDER----------------------------------------
  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/paper.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        extraScrollHeight={50}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
      >
        <Text style={styles.title}>Mon cahier de "Recettes"</Text>

        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('../assets/home-image.jpg')}
            resizeMode="cover"
          />
        </View>

        {isSignUp === null ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => toggleForm(false)}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.textButton}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleForm(true)}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.textButton}>Enregistrement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Enregistrement' : 'Connexion'}
            </Text>
            {isSignUp ? (
              <>
                <TextInput
                  placeholder="Username"
                  onChangeText={(value) => setUsername(value)}
                  value={username}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Password"
                  onChangeText={(value) => setPassword(value)}
                  value={password}
                  style={styles.input}
                  secureTextEntry
                />
                <TextInput
                  placeholder="Email"
                  onChangeText={(value) => setEmail(value)}
                  value={email}
                  style={styles.input}
                  keyboardType="email-address"
                />
              </>
            ) : (
              <>
                <TextInput
                  placeholder="Username"
                  onChangeText={(value) => setUsername(value)}
                  value={username}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Password"
                  onChangeText={(value) => setPassword(value)}
                  value={password}
                  style={styles.input}
                  secureTextEntry
                />
              </>
            )}

            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={isSignUp ? handleSignUp : handleConnection}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Text style={styles.textButton}>
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetForm}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Text style={styles.textButton}>Retour</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: screenWidth,
    height: 300,
    ...Platform.select({
      ios: {
        shadowColor: '#333333',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    maxWidth: '100%',
    padding: '5%',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'DancingScript_400Regular',
    fontSize: 50,
    fontWeight: '600',
  },
  input: {
    width: '80%',
    marginTop: 8,
    borderBottomColor: '#f1948a',
    borderBottomWidth: 1,
    fontSize: 18,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    paddingTop: 8,
    width: '100%',
    backgroundColor: '#f1948a',
    borderRadius: 10,
    marginBottom: 15,
  },
  textButton: {
    color: '#ffffff',
    height: 30,
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  formTitle: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 50,
    flexGrow: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
    height: '100%',
    width: '100%',
  },
});
