import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
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
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  handleValidation,
  selectImage,
  uploadImageToBackend,
} from '../modules/utils.recetteSreen';
import { urlBackend } from '../var';

export default function RecetteScreen() {
  console.log('-------------------RECETTE-----------------------');

  const recetteInfo = useSelector((state) => state.recette.value);
  const userToken = useSelector((state) => state.user.value.token);
  console.log(recetteInfo);
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

  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedImage, setSelectedImage] = useState(recetteInfo.image);
  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [editingPreparationIndex, setEditingPreparationIndex] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('-Appui long pour éditer les notes!');
  const [isCategoryChosen, setIsCategoryChosen] = useState(false);
  const [loading, setLoading] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const confettiRef = useRef(null);

  //*------------------showConfetti----------------------------
  useEffect(() => {
    if (showConfetti) {
      confettiRef.current.start();
    }
  }, [showConfetti]);

  //*--------------------HANDLEEDITION--------------------------
  const handleEdition = useCallback(() => {
    setIsEditing((prev) => !prev);
    if (!isEditing && !isCategoryChosen) {
      // const alertCategory=
      return Alert.alert(
        `Penser à choisir une catégorie
        pour ajouter au cahier!`,
      );
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
  const handleRemoveIngredient = useCallback((index) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index),
    );
  }, []);
  const handleAddIngredient = useCallback(() => {
    setIngredients((prevIngredients) => [
      ...prevIngredients,
      { ingredient: '', quantite: '', unite: '' },
    ]);
  }, []);

  //*--------------------HANDLE PREPARATION----------------
  const handlePressPreparation = useCallback(
    (index) => {
      if (isEditing) {
        setEditingPreparationIndex(index);
      }
    },
    [isEditing],
  );
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
  const handleRemovePreparation = useCallback((index) => {
    setPreparation((prevPreparation) =>
      prevPreparation.filter((_, i) => i !== index),
    );
  }, []);
  const handleAddPreparation = useCallback(() => {
    setPreparation((prevPreparation) => [
      ...prevPreparation,
      { consigne: 'Consigne à modifier par un appui long' },
    ]);
  }, []);

  //*----------------------RENDER INGREDIENT /PREPARATION----------------------
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
                <View style={styles.buttonContainer}>
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
                - {data.ingredient} {data.quantite} {data.unite}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.ingredient}>
            - {data.ingredient} {data.quantite} {data.unite}
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
  const handleValidationNotes = async () => {
    try {
      const response = await fetch(
        `${urlBackend}/recette/notes/66f563e01d39a4bd4e068af9`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes }),
        },
      );

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

  //*-------------------------RENDER--------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec6e5b" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        [
          isEditing
            ? {
                // borderColor: '#ec6e5b',
                // borderWidth: 5,
                backgroundColor: '#e0dedf',
              }
            : { backgroundColor: 'white' },
        ],
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* ---------------------------BOUTONS--------------------------- */}
        <View style={styles.bunttonContainer}>
          <TouchableOpacity
            onPress={handleEdition}
            style={styles.button}
            activeOpacity={0.8}
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
                  setShowConfetti,
                  userToken,
                ).finally(() => setLoading(false));
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
        {/* ---------------------------INFOS--------------------------- */}
        <View style={styles.dispo1}>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/person.png')}
            />
            <Text style={styles.infosText}> :</Text>
            {isEditing ? (
              <TextInput
                style={styles.infosTextInput}
                value={nombrePersonnes}
                onChangeText={setNombrePersonnes}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infosText}>{nombrePersonnes}</Text>
            )}
          </View>
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
                : { backgroundColor: '#ec6e5b' },
            ],
          ]}
        >
          <View style={styles.pictureContainer}>
            {isEditing && (
              <TouchableOpacity
                onPress={() =>
                  selectImage(
                    setSelectedImage,
                    setIsImageReplaced,
                    uploadImageToBackend,
                    selectedImage,
                  )
                }
              >
                <Image
                  style={[
                    styles.foodPicture,
                    { height: screenHeight * 0.2 },
                    isImageReplaced
                      ? styles.replacedImage
                      : styles.defaultImage,
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
          </View>
        </View>
        {/* ---------------------------INGREDIENTS--------------------------- */}
        <View style={styles.ingredientsContainer}>
          <Text style={styles.titreCentre}>Ingrédients:</Text>
          <View style={styles.ingredientsGrid}>{renderIngredients}</View>
          {isEditing && (
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Ajouter un ingrédient</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
        {/* ---------------------------PREPARATION--------------------------- */}
        <Text style={styles.preparationTitre}>Préparation</Text>
        <View style={styles.preparationContainer}>{renderPreparations}</View>
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
        {/* ---------------------------ANNOTATIONS--------------------------- */}
        <View style={styles.notesContainer}>
          <ScrollView>
            <Text style={styles.titreCentre}>Mes notes:</Text>
            <TouchableOpacity
              onLongPress={() => setIsEditingNotes(true)}
              onPress={() => setIsEditingNotes(false)}
            >
              {isEditingNotes ? (
                <>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      handleValidationNotes();
                      setIsEditingNotes(false);
                    }}
                  >
                    <Text style={styles.okButton}>OK</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.notes}>{notes}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* {message && <Text style={styles.message}>{message}</Text>} */}
        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
      </ScrollView>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={300}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
        />
      )}
    </KeyboardAvoidingView>
  );
}

//*-------------------------STYLE----------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 60,
  },
  title: {
    fontFamily: 'Dancing',
    width: '90%',
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  titleInput: {
    fontFamily: 'Dancing',
    width: '90%',
    fontSize: 35,
    paddingHorizontal: 5,
    textAlign: 'center',
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
    // width: '60%',
  },
  pictureBorder: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ec6e5b',
    marginTop: '2%',
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
    fontFamily: 'Dancing',
    fontSize: 25,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  titreLeft: {
    fontFamily: 'Dancing',
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
    fontFamily: 'Dancing',
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
  okButton: {
    fontSize: 20,
    color: 'red',
    marginRight: 10,
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
  updateContainer: {
    marginTop: 20,
    marginBottom: 40,
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
  notesContainer: {
    width: '90%',
  },
  notes: {
    fontSize: 23,
    fontFamily: 'Dancing',
    paddingHorizontal: 5,
  },
  notesInput: {
    fontSize: 23,
    fontFamily: 'Dancing',
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
    borderColor: '#ec6e5b',
    borderWidth: 2,
  },
  categoryText: {
    fontFamily: 'Dancing',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
