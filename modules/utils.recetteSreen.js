import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { urlBackend } from '../var';
let pictureUrl = [];

export const handleValidation = async (data, userToken) => {
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
  setIsUploadingImage,
) => {
  console.log('imageUrlReducer', imageUrlReducer);
  if (imageUrlReducer !== null && imageUrlReducer !== '') {
    pictureUrl.push(imageUrlReducer);
  }

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
      setIsUploadingImage(true);

      // Suppress previous pictures from cloudinary if they are not the default image
      if (pictureUrl.length > 0) {
        const defaultImageUrl = require('../assets/foodPicture.png');
        const imagesToDelete = pictureUrl.filter(
          (url) => url !== defaultImageUrl,
        );

        for (const url of imagesToDelete) {
          await deleteImageFromCloudinary(url);
        }

        // Clear the pictureUrl array and add the new image
        pictureUrl = [selectedAsset.uri];
      }

      const imageUrl = await uploadImageToBackend(selectedAsset.uri);
      setSelectedImage(imageUrl); // URL from Cloudinary
      setIsUploadingImage(false);
      console.log('imageUrl', imageUrl);
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

    const textResponse = await response.text();

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

export const updateRedduxRecetteFromBdd = (id) => {
  const reponse = async(fetch(`${urlBackend}/recette/${id}`));
};

//*-----------------------------Modify qty--------------------------------
export const regle3 = (recette, nbrePerson) => {
  const ingredients = recette.ingredients.map((qt) => {
    if (qt.quantite !== null) {
      const modifier = nbrePerson / Number(recette.nombrepersonnes.value);
      const qty = Number(qt.quantite) * modifier;
      return { ...qt, quantite: String(qty) };
    }
    return qt;
  });
  return ingredients;
};
