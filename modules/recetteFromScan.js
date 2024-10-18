import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  handleValidation,
  selectImage,
  uploadImageToBackend,
} from '../modules/utils.recetteSreen';
import { urlBackend } from '../var';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import {
  useFonts,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';

const RecetteFromScan = () => {
  console.log('-------------------RECETTE-----------------------');
  const ingredientInputRef = useRef(null);
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });
  const recetteInfo = useSelector((state) => state.recette.value);
  const userToken = useSelector((state) => state.user.value.token);
  const recette = recetteInfo.mindeeInfo;
  const [nombrePersonnes, setNombrePersonnes] = useState(
    recette.nombrepersonnes.value,
  );
  const [tempsPreparation, setTempsPreparation] = useState(
    recette.preparationtime.value,
  );
  const [tempsCuisson, setTempsCuisson] = useState(recette.cuissontime.value);
  const [titre, setTitre] = useState(recette.titre.value);
  const [ingredients, setIngredients] = useState(recette.ingredients);
  const [preparation, setPreparation] = useState(recette.preparation);
  const [selectedImage, setSelectedImage] = useState(recetteInfo.image);
  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [editingPreparationIndex, setEditingPreparationIndex] = useState(null);
  const [notes, setNotes] = useState(recette.notes);
  const [isCategoryChosen, setIsCategoryChosen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPersonnesModalVisible, setPersonnesModalVisible] = useState(false);
  const navigation = useNavigation();
  const goToCahierScreen = () => {
    navigation.navigate('Cahier');
  };
  //*-------------------Update values on---------------------------------
  useFocusEffect(
    useCallback(() => {
      setNombrePersonnes(recette.nombrepersonnes.value);
      setTempsPreparation(recette.preparationtime.value);
      setTempsCuisson(recette.cuissontime.value);
      setTitre(recette.titre.value);
      setIngredients(recette.ingredients);
      setPreparation(recette.preparation);
      setSelectedImage(recetteInfo.image);
      if (recetteInfo.notes === undefined) {
        setNotes('-Appui long pour éditer les notes!');
      } else {
        setNotes(recetteInfo.notes);
      }

      // Check if nombrePersonnes is null
      if (recette.nombrepersonnes.value === null) {
        setPersonnesModalVisible(true);
      }
    }, [recetteInfo]),
  );

  //*--------------------HANDLEEDITION--------------------------
  const handleEdition = useCallback(() => {
    setIsEditing((prev) => !prev);
    if (!isEditing && !isCategoryChosen) {
      setModalVisible(true);
      return;
    }
    if (!isEditing) {
      setEditingIngredientIndex(null);
      setEditingPreparationIndex(null);
    }
  }, [isEditing]);

  //*--------------------HANDLE INGREDIENT----------------
  const handlePressIngredient = useCallback(
    (index) => {
      if (isEditing) {
        setEditingIngredientIndex(index);
      }
    },
    [isEditing],
  );
  //*--------------------change ingredient/qty/unit---------------
  const handleIngredientChange = useCallback((index, field, value) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value,
      };
      return updatedIngredients;
    });
  }, []);
  //*-------------------remove ingredient------------------------
  const handleRemoveIngredient = useCallback((index) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index),
    );
  }, []);
  //*------------------add ingredient----------------------------
  const handleAddIngredient = useCallback(() => {
    setIngredients((prevIngredients) => {
      const newIngredients = [
        ...prevIngredients,
        { ingredient: '', quantite: '', unite: '' },
      ];
      setEditingIngredientIndex(newIngredients.length - 1);
      return newIngredients;
    });
  }, []);
  //*--------------------HANDLE PREPARATION----------------
  const handlePressPreparation = useCallback(
    (index) => {
      if (isEditing) {
        setEditingPreparationIndex(index);
        // Check if the text is "Appuyer pour éditer" and replace it with an empty string
        setPreparation((prevPreparation) => {
          const updatedPreparation = [...prevPreparation];
          if (updatedPreparation[index].consigne === 'Appuyer pour éditer') {
            updatedPreparation[index].consigne = '';
          }
          return updatedPreparation;
        });
      }
    },
    [isEditing],
  );
  //*---------------------enter modification preparation-------------------
  const handlePreparationChange = useCallback((index, value) => {
    setPreparation((prevPreparation) => {
      const updatedPreparation = [...prevPreparation];
      updatedPreparation[index] = {
        ...updatedPreparation[index],
        consigne: value,
      };
      return updatedPreparation;
    });
  }, []);
  //*----------------------------remove a preapration-----------------------
  const handleRemovePreparation = useCallback((index) => {
    setPreparation((prevPreparation) =>
      prevPreparation.filter((_, i) => i !== index),
    );
  }, []);
  //*----------------------------add a preaparation-------------------------
  const handleAddPreparation = useCallback(() => {
    setPreparation((prevPreparation) => [
      ...prevPreparation,
      { consigne: 'Appuyer pour éditer' },
    ]);
  }, []);
  //*----------------------RENDER INGREDIENt----------------------
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderIngredients = useMemo(() => {
    return ingredients.map((data, i) => (
      <View key={i} style={styles.ingredientItem}>
        {isEditing ? (
          <TouchableOpacity
            onPress={() => handlePressIngredient(i)}
            style={styles.ingredientTouchable}
          >
            {editingIngredientIndex === i && isEditing ? (
              <View style={styles.updateContainer}>
                <TextInput
                  style={styles.ingredientInput}
                  value={data.ingredient}
                  onChangeText={(text) =>
                    handleIngredientChange(i, 'ingredient', text)
                  }
                  placeholder="Ingrédient"
                  ref={editingIngredientIndex === i ? ingredientInputRef : null}
                  autoFocus={editingIngredientIndex === i}
                />
                <TextInput
                  style={styles.ingredientInput}
                  value={data.quantite}
                  onChangeText={(text) =>
                    handleIngredientChange(i, 'quantite', text)
                  }
                  placeholder="Quantité"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.ingredientInput}
                  value={data.unite}
                  onChangeText={(text) =>
                    handleIngredientChange(i, 'unite', text)
                  }
                  placeholder="Unité"
                />
                <View style={[styles.buttonContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    onPress={() => setEditingIngredientIndex(null)}
                  >
                    <Text style={styles.okButton}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveIngredient(i)}>
                    <Text style={styles.removeButton}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.ingredient}>
                - {capitalizeFirstLetter(data.ingredient)} {data.quantite}{' '}
                {data.unite}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.ingredient}>
            - {capitalizeFirstLetter(data.ingredient)} {data.quantite}{' '}
            {data.unite}
          </Text>
        )}
      </View>
    ));
  }, [
    ingredients,
    editingIngredientIndex,
    isEditing,
    handleIngredientChange,
    handleRemoveIngredient,
  ]);

  //*----------------------RENDER PREPARATION----------------------
  const renderPreparations = useMemo(() => {
    return preparation.map((data, j) => (
      <View key={j} style={styles.preparationItem}>
        {isEditing ? (
          <TouchableOpacity
            onPress={() => handlePressPreparation(j)}
            style={styles.preparationTouchable}
          >
            {editingPreparationIndex === j && isEditing ? (
              <View style={styles.updateContainer}>
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
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => setEditingPreparationIndex(null)}
                  >
                    <Text style={styles.okButton}>OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemovePreparation(j)}>
                    <Text style={styles.removeButton}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.consigne}>
                {j + 1}. {data.consigne}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.consigne}>
            {j + 1}. {data.consigne}
          </Text>
        )}
      </View>
    ));
  }, [
    preparation,
    editingPreparationIndex,
    isEditing,
    handlePreparationChange,
    handleRemovePreparation,
  ]);

  //*---------------------GET CATEGORIES-------------------------------------
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch(`${urlBackend}/categorie`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categoryInfo));
  }, []);

  //*---------------------CATEGORIES RENDER----------------------------------
  const [selectedCategory, setSelectedCategory] = useState(null);
  const renderCategories = useMemo(() => {
    return categories.map((category) => (
      <TouchableOpacity
        key={category._id}
        onPress={() => {
          setSelectedCategory(category), setIsCategoryChosen(true);
        }}
        style={[
          styles.categoryButton,
          selectedCategory === category ? styles.selectedCategory : null,
          { backgroundColor: category.color },
        ]}
      >
        <Text style={styles.categoryText}>{category.name}</Text>
      </TouchableOpacity>
    ));
  }, [categories, selectedCategory]);
  //*------------------NOTES VALIDATION--------------------------------------
  const [message, setMessage] = useState(null);
  const handleValidationNotes = async (id) => {
    try {
      const response = await fetch(`${urlBackend}/recette/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.result) {
        setMessage('Notes updated successfully');
      } else {
        setMessage('Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      setMessage('Failed to update notes');
    }
  };
  //*------------------TO CLOSE MODAL-------------------------------------------
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const togglePersonnesModal = () => {
    setPersonnesModalVisible(!isPersonnesModalVisible);
  };
  //*-------------------------RENDER--------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1948a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        isEditing ? styles.editingBackground : styles.defaultBackground,
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* ---------------------------BOUTONS--------------------------- */}
        <View style={styles.bunttonContainer}>
          <TouchableOpacity
            onPress={handleEdition}
            style={[styles.button, isUploadingImage && styles.disabledButton]} // Désactiver le bouton si l'image est en cours de téléchargement
            activeOpacity={0.8}
            disabled={isUploadingImage} // Désactiver le bouton si l'image est en cours de téléchargement
          >
            <Text style={styles.textButton}>
              {isEditing ? "Terminer l'édition" : 'Editer'}
            </Text>
          </TouchableOpacity>
          {isCategoryChosen & !isEditing ? (
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                handleValidation(
                  {
                    tempsPreparation,
                    tempsCuisson,
                    titre,
                    ingredients,
                    preparation,
                    nombrePersonnes,
                    image: selectedImage,
                    categorie: selectedCategory._id,
                  },
                  userToken,
                ).finally(() => {
                  setLoading(false);
                  goToCahierScreen();
                });
              }}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.textButton}>Ajouter au cahier!</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ---------------------------TITRE--------------------------- */}
        {isEditing ? (
          <TextInput
            multiline
            numberOfLines={1}
            style={styles.titleInput}
            value={titre}
            onChangeText={setTitre}
          />
        ) : (
          <Text style={styles.title}>{titre}</Text>
        )}
        <View style={styles.personContainer}>
          <Image
            style={styles.person}
            source={require('../assets/person.png')}
          />
          <Text style={styles.infosText}> :</Text>
          {isEditing ? (
            <TextInput
              style={styles.nbrPerson}
              value={nombrePersonnes}
              onChangeText={setNombrePersonnes}
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.nbrPerson}>
              {nombrePersonnes === null || nombrePersonnes === 0
                ? 1
                : nombrePersonnes}
            </Text>
          )}
        </View>

        {/* ---------------------------INFOS--------------------------- */}
        <View style={styles.dispo1}>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cooking.png')}
            />
            <Text style={styles.infosText}> :</Text>
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={tempsPreparation}
                onChangeText={setTempsPreparation}
              />
            ) : (
              <Text style={styles.infosText}>{tempsPreparation}</Text>
            )}
          </View>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cuisson.png')}
            />
            <Text style={styles.infosText}> :</Text>
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={tempsCuisson}
                onChangeText={setTempsCuisson}
              />
            ) : (
              <Text style={styles.infosText}>{tempsCuisson}</Text>
            )}
          </View>
        </View>
        {/* ------------------------CATEGORIES--------------------------- */}
        <View style={styles.categoriesContainer}>
          {isEditing ? renderCategories : null}
        </View>
        {/* ---------------------------IMAGE--------------------------- */}
        <View
          style={[
            styles.pictureBorder,
            { height: screenHeight * 0.24 },
            [
              selectedCategory
                ? { backgroundColor: selectedCategory.color }
                : { backgroundColor: '#f1948a' },
            ],
          ]}
        >
          {isUploadingImage ? (
            <ActivityIndicator size="large" color="#f1948a" />
          ) : (
            <TouchableOpacity
              onPress={() =>
                selectImage(
                  setSelectedImage,
                  setIsImageReplaced,
                  uploadImageToBackend,
                  selectedImage,
                  setIsUploadingImage,
                )
              }
              disabled={!isEditing} // Désactiver le bouton si l'édition n'est pas activée
            >
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
        </View>
        {/* ---------------------------INGREDIENTS--------------------------- */}
        <View style={styles.ingredientsContainer}>
          <Text style={styles.titreCentre}>Ingrédients:</Text>
          <View style={styles.ingredientsGrid}>{renderIngredients}</View>
          {isEditing && (
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={[styles.button, { marginTop: 10 }]}
            >
              <Text style={styles.textButton}>+ Ajouter un ingrédient</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
        {/* ---------------------------PREPARATION--------------------------- */}
        <Text style={styles.preparationTitre}>Préparation:</Text>
        <View style={styles.preparationContainer}>{renderPreparations}</View>
        {isEditing && (
          <TouchableOpacity
            onPress={handleAddPreparation}
            style={[styles.button, { marginTop: 10 }]}
          >
            <Text style={styles.textButton}>+ Ajouter une consigne</Text>
          </TouchableOpacity>
        )}
        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onBackButtonPress={toggleModal}
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Image
            source={require('../assets/ardoise.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.modalOverlay}>
            <Text style={styles.modalText}>
              Choisir une catégorie au dessus de l'image de la recette pour
              ajouter au cahier!
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={isPersonnesModalVisible}
        onBackdropPress={togglePersonnesModal}
        onBackButtonPress={togglePersonnesModal}
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Image
            source={require('../assets/ardoise.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.modalOverlay}>
            <Text style={styles.modalText}>
              Attention le nombre de personnes reste à définir!
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

//*-------------------------STYLE----------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 60,
  },
  title: {
    fontFamily: 'DancingScript_400Regular',
    maxWidth: '90%',
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  titleInput: {
    fontFamily: 'DancingScript_400Regular',
    maxWidth: '90%',
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  dispo1: {
    marginTop: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderColor: 'black',
    marginVertical: 10,
  },
  person: {
    height: 35,
    objectFit: 'scale-down',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  infos2: {
    height: 40,
    width: '40%',
    alignItems: 'center',
  },
  infosText: {
    marginLeft: 2,
    fontSize: 20,
    fontFamily: 'DancingScript_400Regular',
  },
  infosTextInput: {
    marginLeft: 2,
    fontSize: 20,
    fontFamily: 'DancingScript_400Regular',
  },
  pictureBorder: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1948a',
    marginTop: '2%',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 8,
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
  pictureContainer: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  foodPicture: {
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    aspectRatio: 1.75,
  },
  defaultImage: {
    resizeMode: 'contain',
  },
  replacedImage: {
    resizeMode: 'cover',
  },
  ingredientsContainer: {
    width: '90%',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: '5%',
  },
  titreCentre: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 25,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  nbrPerson: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 35,
    alignSelf: 'center',
  },
  titreLeft: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 25,
    textDecorationLine: 'underline',
    marginLeft: '5%',
    alignSelf: 'flex-start',
  },
  ingredientsGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  ingredient: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 23,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ingredientInput: {
    fontFamily: 'DancingScript_400Regular',
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
    color: 'white',
    // borderColor: 'red',
    // borderWidth: 1,
    marginRight: 10,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#f1948a',
    borderRadius: 10,
    padding: 5,
  },
  okButton: {
    fontSize: 20,
    color: 'white',
    marginRight: 10,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#f1948a',
    borderRadius: 10,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  },
  preparationTitre: {
    fontSize: 25,
    fontFamily: 'DancingScript_400Regular',
    textDecorationLine: 'underline',
    margin: 5,
  },
  consigne: {
    fontSize: 23,
    fontFamily: 'DancingScript_400Regular',
  },
  updateContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  consigneInput: {
    fontSize: 23,
    fontFamily: 'DancingScript_400Regular',
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
  notesContainer: {
    width: '90%',
  },
  notes: {
    fontSize: 23,
    fontFamily: 'DancingScript_400Regular',
    paddingHorizontal: 5,
  },
  notesInput: {
    fontSize: 23,
    fontFamily: 'DancingScript_400Regular',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '90%',
    marginVertical: 5,
  },
  bunttonContainer: {
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    marginTop: Platform.select({ ios: 40, android: 30 }),
  },
  button: {
    alignItems: 'center',
    paddingTop: 8,
    width: '100%',
    backgroundColor: '#f1948a',
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: 'gray',
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
  message: {
    fontSize: 18,
    color: 'red',
    marginTop: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '90%',
    marginTop: '2%',
  },
  categoryButton: {
    borderColor: '#000000',
    borderWidth: 1,
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  selectedCategory: {
    borderColor: '#f1948a',
    borderWidth: 2,
  },
  categoryText: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
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
    //resizeMode: 'contain',
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
  closeButton: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 20,
    color: 'white',
    marginTop: 15,
  },
  editingBackground: {
    backgroundColor: 'rgba(150, 149, 149, 0.3)',
  },
  defaultBackground: {
    backgroundColor: 'transparent',
  },
});

export default RecetteFromScan;
