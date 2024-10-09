import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { urlBackend } from '../var';
let pictureUrl = [];

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
          `${urlBackend}/newRecette/${userToken}/${newRecipeId}`,
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
  imageUrlReducer,
) => {
  pictureUrl.push(imageUrlReducer);
  if (pictureUrl[0] === null || pictureUrl[0] === 'undefined') pictureUrl.pop();
  console.log('pictureUrl', pictureUrl);
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

      // suppress previous picture from cloudinary
      if (pictureUrl.length > 0) {
        //console.log('suppression', pictureUrl[0]);
        await deleteImageFromCloudinary(pictureUrl[0]);
        pictureUrl.shift();
      }

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
        return result.url;
      } else {
        console.error('Error uploading image 139:', result.error);
      }
    } else {
      console.error('Error uploading image 142:', response.statusText);
    }
  } catch (error) {
    Alert.alert("Problème lors de l'envoi de l'image");
    console.log('Error uploading image 145:', error);
  }
};

const deleteImageFromCloudinary = async (url) => {
  try {
    const encodedUrl = encodeURIComponent(url);
    console.log('Encoded URL:', encodedUrl);

    const response = await fetch(
      `${urlBackend}/recette/cloudinary/delete/${encodedUrl}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // Afficher la réponse brute pour le diagnostic
    const textResponse = await response.text();
    //console.log('Raw response:', textResponse);

    if (response.ok) {
      const result = JSON.parse(textResponse);
      console.log('Image deleted:', result.message);
    } else {
      console.error('Error deleting image:', textResponse);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
