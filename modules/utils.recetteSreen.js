import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { urlBackend } from '../var';

export const handleValidation = async (data, setShowConfetti, userToken) => {
  try {
    const response = await fetch(`${urlBackend}/recette`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      if (responseData) {
        const newRecipeId = await responseData.data._id;
        console.log('saved on BDD!', responseData.data.titre);

        const responseUser = await fetch(
          `${urlBackend}/recette/${userToken}/${newRecipeId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newRecipeId }),
          },
        );

        if (responseUser.ok) {
          const responseUserData = await responseUser.json();
          console.log(
            "Recette ajoutée à l'utilisateur:",
            responseUserData.message,
          );
        } else {
          const errorData = await responseUser.json();
          console.error(
            "Erreur lors de l'ajout de la recette à l'utilisateur:",
            errorData,
          );
          Alert.alert(
            'Erreur',
            "Il y a eu une erreur lors de l'ajout de la recette à l'utilisateur.",
          );
        }
      } else {
        console.error(
          'Erreur: La réponse ne contient pas les données attendues.',
          responseData,
        );
        Alert.alert(
          'Erreur',
          'La réponse ne contient pas les données attendues.',
        );
      }
    } else {
      Alert.alert(
        'Erreur',
        "Il y a eu une erreur lors de l'envoi des données.",
      );
    }
  } catch (error) {
    console.error('Erreur:', error);
    Alert.alert('Erreur', "Il y a eu une erreur lors de l'envoi des données.");
  }
};

export const selectImage = async (
  setSelectedImage,
  setIsImageReplaced,
  uploadImageToBackend,
) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission refusée',
      "Vous devez autoriser l'accès à la galerie.",
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (result.canceled) {
    return;
  }

  if (result.assets && result.assets.length > 0) {
    const selectedAsset = result.assets[0];
    if (selectedAsset.uri) {
      setSelectedImage(selectedAsset.uri);
      setIsImageReplaced(true);
      const imageUrl = await uploadImageToBackend(selectedAsset.uri);
      setSelectedImage(imageUrl);
    }
  }
};

export const uploadImageToBackend = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('photoFromFront', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    const response = await fetch(`${urlBackend}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.result) {
        return result.url; // Retourner l'URL de l'image
      } else {
        console.error('Error uploading image:', result.error);
      }
    } else {
      console.error('Error uploading image:', response.statusText);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};
