import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  Image,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { urlBackend } from '../var';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function RecetteScreen() {
  console.log('-------------------RECETTE-----------------------');

  const recette = useSelector((state) => state.recette.value.mindeeInfo);
  //* ------------data from Mindee------------
  const [nombrePersonnes, setNombrePersonnes] = useState(
    recette.nombrepersonnes.value,
  );
  const [tempsPreparation, setTempsPreparation] = useState(
    recette.preparationtime.value,
  );
  const [tempsCuisson, setTempsCuisson] = useState(recette.cuissontime.value);
  const [titre, setTitre] = useState(recette.titre.value);
  const [ingredients, setIgredients] = useState(recette.ingredients);
  const [preparation, setPreparation] = useState(recette.preparation);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const ingredientsList = ingredients.map((data, i) => {
    return (
      <View key={i} style={styles.ingredientItem}>
        <TouchableOpacity
          onLongPress={() => handleLongPressIngredient(i)}
          onPress={() => handlePressIngredient(i)}
          style={styles.ingredientTouchable}
        >
          {editingIndex === i && isEditing ? (
            <>
              <TextInput
                style={styles.ingredientInput}
                value={data.ingredient}
                onChangeText={(text) =>
                  handleIngredientChange(i, 'ingredient', text)
                }
                placeholder="Ingrédient"
              />
              <TextInput
                style={styles.ingredientInput}
                value={data.quantite}
                onChangeText={(text) =>
                  handleIngredientChange(i, 'quantite', text)
                }
                placeholder="Quantité"
              />
              <TextInput
                style={styles.ingredientInput}
                value={data.unite}
                onChangeText={(text) =>
                  handleIngredientChange(i, 'unite', text)
                }
                placeholder="Unité"
              />
              <TouchableOpacity onPress={() => handleRemoveIngredient(i)}>
                <Text style={styles.removeButton}>Supprimer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.ingredient}>
              -{data.ingredient} {data.quantite}
              {data.unite}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  });

  const preparationsList = preparation.map((data, j) => {
    return (
      <View key={j} style={styles.preparationItem}>
        <TouchableOpacity
          onLongPress={() => handleLongPressPreparation(j)}
          onPress={() => handlePressPreparation(j)}
          style={styles.preparationTouchable}
        >
          {editingIndex === j && isEditing ? (
            <>
              <ScrollView>
                <TextInput
                  style={styles.consigneInput}
                  value={data.consigne}
                  onChangeText={(text) => handlePreparationChange(j, text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Consigne"
                />
              </ScrollView>
              <TouchableOpacity onPress={() => handleRemovePreparation(j)}>
                <Text style={styles.removeButton}>Supprimer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.consigne}>
              {j + 1}. {data.consigne}
            </Text>
          )}
        </TouchableOpacity>
        {j < preparation.length - 1 && (
          <Image
            style={styles.loupe}
            source={require('../assets/fleche.png')}
          />
        )}
      </View>
    );
  });

  const screenHeight = Dimensions.get('window').height;

  const handleEdition = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditingIndex(null);
    }
  };

  const handleLongPressIngredient = (index) => {
    if (isEditing) {
      setEditingIndex(index);
    }
  };

  const handlePressIngredient = (index) => {
    if (isEditing && editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleLongPressPreparation = (index) => {
    if (isEditing) {
      setEditingIndex(index);
    }
  };

  const handlePressPreparation = (index) => {
    if (isEditing && editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIgredients(newIngredients);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIgredients(newIngredients);
  };

  const handleAddIngredient = () => {
    const newIngredients = [
      ...ingredients,
      { ingredient: '', quantite: '', unite: '' },
    ];
    setIgredients(newIngredients);
  };

  const handlePreparationChange = (index, value) => {
    const newPreparation = [...preparation];
    newPreparation[index].consigne = value;
    setPreparation(newPreparation);
  };

  const handleRemovePreparation = (index) => {
    const newPreparation = [...preparation];
    newPreparation.splice(index, 1);
    setPreparation(newPreparation);
  };

  const handleAddPreparation = () => {
    const newPreparation = [
      ...preparation,
      { consigne: 'Consigne à modifier par un appui long' },
    ];
    setPreparation(newPreparation);
  };

  //* ---------------------add the reciepe------------------------
  const handleValidation = async () => {
    const data = {
      tempsPreparation,
      tempsCuisson,
      titre,
      ingredients,
      preparation,
      nombrePersonnes,
    };

    try {
      const response = await fetch(`${urlBackend}/recette`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        //Alert.alert('Succès', 'Les données ont été envoyées avec succès.');
        // Trigger confetti
        setShowConfetti(true);
      } else {
        Alert.alert(
          'Erreur',
          "Il y a eu une erreur lors de l'envoi des données.",
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        "Il y a eu une erreur lors de l'envoi des données.",
      );
    }
  };

  const confettiRef = useRef(null);

  const selectImage = async () => {
    console.log('selectImage called');
    // Demander la permission d'accéder à la galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Vous devez autoriser l'accès à la galerie.",
      );
      return;
    }

    // Ouvrir la galerie pour sélectionner une image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      console.log('Image selection cancelled');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.uri) {
        console.log('Image selected:', selectedAsset.uri);
        setSelectedImage(selectedAsset.uri);
        setIsImageReplaced(true);
        await uploadImageToBackend(selectedAsset.uri);
      } else {
        console.log('No URI found in selected asset:', selectedAsset);
      }
    } else {
      console.log('No assets found in result:', result);
    }
  };

  const uploadImageToBackend = async (imageUri) => {
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
          console.log('Image uploaded successfully:', result.url);
          setSelectedImage(result.url);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            value={titre}
            onChangeText={setTitre}
          />
        ) : (
          <Text style={styles.title}>{titre}</Text>
        )}
        <View style={styles.dispo1}>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/person.png')}
            />
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={nombrePersonnes.toString()}
                onChangeText={(text) => setNombrePersonnes(parseInt(text, 10))}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infosText}>: {nombrePersonnes}</Text>
            )}
          </View>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cooking.png')}
            />
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={tempsPreparation}
                onChangeText={setTempsPreparation}
              />
            ) : (
              <Text style={styles.infosText}>: {tempsPreparation}</Text>
            )}
          </View>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cuisson.png')}
            />
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={tempsCuisson}
                onChangeText={setTempsCuisson}
              />
            ) : (
              <Text style={styles.infosText}>: {tempsCuisson}</Text>
            )}
          </View>
        </View>

        <View style={styles.pictureContainer}>
          {isEditing && (
            <TouchableOpacity onPress={selectImage}>
              <Image
                style={[
                  styles.foodPicture,
                  { height: screenHeight * 0.2 },
                  isImageReplaced ? styles.replacedImage : styles.defaultImage,
                ]}
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : require('../assets/foodPicture.png')
                }
                resizeMode={isImageReplaced ? 'cover' : 'contain'}
              />
            </TouchableOpacity>
          )}
          {!isEditing && (
            <Image
              style={[
                styles.foodPicture,
                { height: screenHeight * 0.2 },
                isImageReplaced ? styles.replacedImage : styles.defaultImage,
              ]}
              source={
                selectedImage
                  ? { uri: selectedImage }
                  : require('../assets/foodPicture.png')
              }
              resizeMode={isImageReplaced ? 'cover' : 'contain'}
            />
          )}
          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredients}>Ingrédients:</Text>
            <View style={styles.ingredientsGrid}>{ingredientsList}</View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleAddIngredient}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>
                  + Ajouter un ingrédient
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
        <Text style={styles.preparationTitre}>Préparation</Text>
        <View style={styles.preparationContainer}>{preparationsList}</View>
        {isEditing && (
          <TouchableOpacity
            onPress={handleAddPreparation}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Ajouter une consigne</Text>
          </TouchableOpacity>
        )}

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />

        <TouchableOpacity
          onPress={handleEdition}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>
            {isEditing ? "Terminer l'édition" : 'Editer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleValidation}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>Valider</Text>
        </TouchableOpacity>
      </ScrollView>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 120,
  },
  title: {
    fontFamily: 'Dancing',
    width: '90%',
    marginTop: Platform.select({ ios: 40, android: 20 }),
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  titleInput: {
    fontFamily: 'Dancing',
    width: '90%',
    marginTop: Platform.select({ ios: 40, android: 20 }),
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
    textDecorationLine: 'underline',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  dispo1: {
    marginTop: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  dispo2: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  infos: {
    height: 35,
    objectFit: 'scale-down',
    width: '33%',
  },
  infosText: {
    marginLeft: 2,
    fontSize: 20,
    fontFamily: 'Dancing',
  },
  infosTextInput: {
    marginLeft: 2,
    fontSize: 20,
    fontFamily: 'Dancing',
    width: '60%',
  },
  pictureContainer: {
    width: '90%',
    marginTop: '2%',
    alignItems: 'center',
  },
  foodPicture: {
    width: '100%',
    borderColor: 'black',
    borderWidth: 3,
    marginTop: '5%',
    aspectRatio: 2,
  },
  defaultImage: {
    resizeMode: 'contain',
  },
  replacedImage: {
    resizeMode: 'cover',
  },
  ingredientsContainer: {
    width: '100%',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  ingredients: {
    fontFamily: 'Dancing',
    fontSize: 25,
    textDecorationLine: 'underline',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  ingredientsGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  ingredient: {
    fontFamily: 'Dancing',
    fontSize: 23,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  ingredientInput: {
    fontFamily: 'Dancing',
    fontSize: 23,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginHorizontal: 5,
    flex: 1,
    minWidth: '30%',
    maxWidth: '100%',
  },
  removeButton: {
    fontSize: 20,
    color: 'red',
    marginLeft: 10,
  },
  addButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: 'blue',
  },
  separateur: {
    width: '90%',
    height: 15,
    objectFit: 'scale-down',
    marginTop: 15,
  },
  preparationContainer: {
    width: '90%',
  },
  preparationItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    // marginVertical: 5,
  },
  preparationTitre: {
    fontSize: 25,
    fontFamily: 'Dancing',
    textDecorationLine: 'underline',
    margin: 5,
  },
  consigne: {
    fontSize: 23,
    fontFamily: 'Dancing',
  },
  consigneInput: {
    fontSize: 23,
    fontFamily: 'Dancing',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '90%',
    marginVertical: 5,
  },
  loupe: {
    height: 20,
    objectFit: 'scale-down',
    width: '15%',
    alignSelf: 'center',
  },
  bonapp: {
    marginTop: 10,
    fontSize: 30,
    fontFamily: 'Dancing',
    borderColor: 'black',
    textDecorationLine: 'underline',
  },
  button: {
    alignItems: 'center',
    paddingTop: 8,
    width: '80%',
    marginTop: 30,
    backgroundColor: '#ec6e5b',
    borderRadius: 10,
  },
  textButton: {
    color: '#ffffff',
    height: 30,
    fontWeight: '600',
    fontSize: 16,
  },
  ingredientTouchable: {
    flex: 1,
  },
  preparationTouchable: {
    flex: 1,
  },
});
