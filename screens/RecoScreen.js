import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import {
  addRecette,
  addImage,
  addNotes,
  addCategory,
  getId,
} from '../reducers/recette';
import { useDispatch, useSelector } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { urlBackend } from '../var';
import {
  useFonts,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';

export default function RecoScreen() {
  console.log('-----------------RECO-----------------');
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  //*-----------------Camera request-------------------------------------
  useEffect(() => {
    (async () => {
      const result = await Camera.requestCameraPermissionsAsync();
      if (result) {
        setHasPermission(result.status === 'granted');
      }
    })();
  }, []);
  //*---------------Take picture process-----------------------------------
  const takePicture = async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 });
      if (photo) {
        const uri = photo.uri;

        // FormData to send picture
        const formData = new FormData();
        formData.append('file', {
          uri: uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });

        // loading screen
        setLoading(true);

        // send picture to backend
        console.log('---------------Mindee treatment---------------');
        const backendUrl = `${urlBackend}/reco`;
        const submitResponse = await fetch(backendUrl, {
          method: 'POST',
          body: formData,
        });

        if (!submitResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await submitResponse.json();

        console.log('recieve');

        // Dispatch the action to update the Redux state
        dispatch(addCategory({}));
        dispatch(addImage(''));
        dispatch(addNotes(''));
        dispatch(getId(''));
        dispatch(
          addRecette(data.summary.rawHttp.document.inference.prediction),
        );
        console.log('add redux');

        // hide loading screen
        setLoading(false);

        // Redirection RecetteScreen
        navigation.navigate('Recette', { from: 'A' });
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      setLoading(false);

      // Set error message and show modal
      if (error.message === 'Network response was not ok') {
        setErrorMessage(
          'Erreur de connexion. La connexion au serveur a échoué. Veuillez réessayer.',
        );
      } else {
        setErrorMessage(
          'Une erreur inconnue est survenue. Veuillez réessayer.',
        );
      }
      setIsErrorModalVisible(true);
    }
  };

  if (!hasPermission || !isFocused) {
    return <View />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Capture des informations</Text>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Camera
      type={type}
      flashMode={flashMode}
      ref={cameraRef}
      style={styles.camera}
    >
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() =>
            setType(
              type === CameraType.back ? CameraType.front : CameraType.back,
            )
          }
          style={styles.button}
        >
          <FontAwesome name="rotate-right" size={25} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setFlashMode(
              flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off,
            )
          }
          style={styles.button}
        >
          <FontAwesome
            name="flash"
            size={25}
            color={flashMode === FlashMode.off ? '#ffffff' : '#e8be4b'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.snapContainer}>
        <TouchableOpacity onPress={() => cameraRef.current && takePicture()}>
          <FontAwesome name="circle-thin" size={95} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Camera>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  buttonsContainer: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
  },
  snapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 25,
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    maxHeight: 200,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontFamily: 'DancingScript_400Regular',
    fontSize: 35,
    marginBottom: 20,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 294,
    height: 189,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalText: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    margin: 20,
  },
});
