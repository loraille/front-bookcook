import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';
import { urlBackend } from '../var';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const [username, setusername] = useState('a');
  const [password, setPassword] = useState('z');

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
          console.log(data.userInfo);
          dispatch(
            login({
              username: data.userInfo.username,
              email: data.userInfo.email,
              token: data.userInfo.token,
            }),
          );
          navigation.navigate('TabNavigator');
        } else {
          console.warn('something went wrong', data.error);
          setErrorMessage(data.error);
        }
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Mon cahier de "Recettes"</Text>
      <Image
        style={styles.image}
        source={require('../assets/home-image.jpg')}
      />

      <TextInput
        placeholder="username"
        onChangeText={(value) => setusername(value)}
        value={username}
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        onChangeText={(value) => setPassword(value)}
        value={password}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => handleConnection()}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.textButton}>Capture!</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '50%',
  },
  title: {
    width: '70%',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Dancing',
    fontSize: 50,
    fontWeight: '600',
  },
  input: {
    width: '80%',
    marginTop: 25,
    borderBottomColor: '#ec6e5b',
    borderBottomWidth: 1,
    fontSize: 18,
  },
  button: {
    alignItems: 'center',
    paddingTop: 8,
    width: '80%',
    marginTop: 30,
    backgroundColor: '#ec6e5b',
    borderRadius: 10,
    marginBottom: 80,
  },
  textButton: {
    color: '#ffffff',
    height: 30,
    fontWeight: '600',
    fontSize: 16,
  },
});
