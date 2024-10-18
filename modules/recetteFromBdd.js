import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  selectImage,
  uploadImageToBackend,
} from '../modules/utils.recetteSreen';
import { urlBackend } from '../var';
import { useFocusEffect } from '@react-navigation/native';
import { regle3 } from '../modules/utils.recetteSreen';
import { modifyRecetteReducer } from '../modules/utils.CahierScreen';
import {
  useFonts,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';

const RecetteFromBdd = () => {
  console.log('-------------------RECETTE-----------------------');

  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  const recetteInfo = useSelector((state) => state.recette.value);
  const userToken = useSelector((state) => state.user.value.token);
  const recette = recetteInfo.mindeeInfo;
  const [recetteId, setRecetteId] = useState(recetteInfo.id);
  const [tempsPreparation, setTempsPreparation] = useState(
    recette.preparationtime.value,
  );
  const [tempsCuisson, setTempsCuisson] = useState(recette.cuissontime.value);
  const [titre, setTitre] = useState(recette.titre.value);
  const [ingredients, setIngredients] = useState(recette.ingredients);
  const [preparation, setPreparation] = useState(recette.preparation);
  const [selectedImage, setSelectedImage] = useState(recetteInfo.image);
  const [categoryColor, setCategoryColor] = useState(
    recetteInfo.category.color,
  );
  const [notes, setNotes] = useState(recette.notes);
  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [editingPreparationIndex, setEditingPreparationIndex] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [nbrPerson, setNbrPerson] = useState(recette.nombrepersonnes.value);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const ingredientInputRef = useRef(null);
  const screenHeight = Dimensions.get('window').height;
  const dispatch = useDispatch();
  //*-----------------Updates field on --------------------------------
  useFocusEffect(
    useCallback(() => {
      setCategoryColor(recetteInfo.category.color);
      setRecetteId(recetteInfo.id);
      setSelectedCategory(recetteInfo.category);
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
      resetNbrPerson(recette);
    }, [recetteInfo]),
  );
  //*-------------------resetNbrPerson----------------------------------
  const resetNbrPerson = (recette) => {
    setNbrPerson(Number(recette.nombrepersonnes.value));
    setIngredients(recette.ingredients);
  };
  //*---------------------Increase person----------------------------
  const handleIncrease = (recette) => {
    const newNbrPerson = nbrPerson + 1;
    setNbrPerson(newNbrPerson);
    const updatedIngredients = regle3(recette, newNbrPerson);
    setIngredients(updatedIngredients);
  };
  //*---------------------Decrease person----------------------------
  const handleDecrease = () => {
    if (nbrPerson > 1) {
      const newNbrPerson = nbrPerson - 1;
      setNbrPerson(newNbrPerson);
      const updatedIngredients = regle3(recette, newNbrPerson);
      setIngredients(updatedIngredients);
    }
  };
  //*--------------------enter modification ingredient------------------------
  const handlePressIngredient = useCallback(
    (index) => {
      if (isEditing) {
        setEditingIngredientIndex(index);
      }
    },
    [isEditing],
  );
  //*--------------------modify ingredient/qty/unit---------------------------
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
  //*--------------------------REmove ingredient-----------------------------
  const handleRemoveIngredient = useCallback((index) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index),
    );
  }, []);
  //*----------------------Add ingredient--------------------------------------
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
  //*--------------------enter modification preparation------------------------
  const handlePressPreparation = useCallback(
    (index) => {
      if (isEditing) {
        setEditingPreparationIndex(index);
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
  //*---------------------modify preparation-----------------------------
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
  //*-------------------remoce a preparation-----------------------------
  const handleRemovePreparation = useCallback((index) => {
    setPreparation((prevPreparation) =>
      prevPreparation.filter((_, i) => i !== index),
    );
  }, []);
  //*-------------------add a preparation--------------------------------
  const handleAddPreparation = useCallback(() => {
    setPreparation((prevPreparation) => [
      ...prevPreparation,
      { consigne: 'Appuyer pour éditer' },
    ]);
  }, []);
  //*-------------------render ingredients--------------------------------
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

  //*--------------------------------render preparation----------------------------
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
  //*-----------------get categories-------------------------------
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch(`${urlBackend}/categorie`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categoryInfo));
  }, []);
  //*------------------render categories---------------------------
  const renderCategories = useMemo(() => {
    return categories.map((category) => (
      <TouchableOpacity
        key={category._id}
        onPress={() => {
          setSelectedCategory(category);
        }}
        style={[
          styles.categoryButton,
          selectedCategory && selectedCategory.name === category.name
            ? styles.selectedCategory
            : null,
          { backgroundColor: category.color },
        ]}
      >
        <Text style={styles.categoryText}>{category.name}</Text>
      </TouchableOpacity>
    ));
  }, [categories, selectedCategory]);

  const [message, setMessage] = useState(null);
  //*------------------------validation notes update bdd field--------------------------
  const handleValidationNotes = async (id) => {
    try {
      const updatedNotes = notes
        .replace('Appui long pour éditer les notes!', '')
        .trim();

      const response = await fetch(`${urlBackend}/recette/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: updatedNotes }),
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
  //*-------------------------------update reciepe--------------------------------
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${urlBackend}/recette/recetteInfo/${recetteId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            tempsPreparation,
            tempsCuisson,
            titre,
            ingredients,
            preparation,
            nombrePersonnes: nbrPerson,
            image: selectedImage,
            categorie: selectedCategory._id,
            notes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.result) {
        setMessage('Changes saved successfully');
        setIsEditing(false);
        modifyRecetteReducer(data.recette, dispatch);

        const categoryResponse = await fetch(
          `${urlBackend}/categorie/id/${selectedCategory._id}`,
        );
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category details');
        }

        const categoryData = await categoryResponse.json();

        setSelectedCategory(categoryData.categoryInfo);

        setCategoryColor(categoryData.categoryInfo.color);
      } else {
        setMessage('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };
  //*---------------------Enter note edition mode-----------------------------
  const handleEditNotes = () => {
    setIsEditingNotes(true);
    if (notes === '-Appui long pour éditer les notes!') {
      setNotes('');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1948a" />
      </View>
    );
  }
  //*------------------------------------------RENDER-------------------------------------------
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
        <View style={styles.bunttonContainer}>
          {isEditing && (
            <>
              {/* ------------------------button valider---------------------- */}
              <TouchableOpacity
                onPress={handleSaveChanges}
                style={[
                  styles.button,
                  isUploadingImage && styles.disabledButton,
                ]}
                activeOpacity={0.8}
                disabled={isUploadingImage}
              >
                <Text style={styles.textButton}>Valider</Text>
              </TouchableOpacity>
              {/* ------------------------bouton Annuler---------------------- */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(recetteInfo.category);
                  setTempsPreparation(recette.preparationtime.value);
                  setTempsCuisson(recette.cuissontime.value);
                  setTitre(recette.titre.value);
                  setIngredients(recette.ingredients);
                  setPreparation(recette.preparation);
                  setSelectedImage(recetteInfo.image);
                  setIsImageReplaced(false);
                  setIsEditing(false);
                  setEditingIngredientIndex(null);
                  setEditingPreparationIndex(null);
                  setIsEditingNotes(false);
                  setNotes(recetteInfo.notes);
                  resetNbrPerson(recette);
                  setCategoryColor(recetteInfo.category.color);
                }}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Text style={styles.textButton}>Annuler</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* ------------------------titre---------------------- */}
        <TouchableOpacity
          onLongPress={() => {
            if (!isEditing) {
              setIsEditing(true);
            }
          }}
          activeOpacity={1}
        >
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
        </TouchableOpacity>
        {/* ------------------------person---------------------- */}
        <View style={styles.personContainer}>
          {!isEditing && (
            <>
              <TouchableOpacity
                onPress={() => handleDecrease()}
                style={styles.moins}
              >
                <Image
                  style={styles.plusMoins}
                  source={require('../assets/moins.png')}
                />
              </TouchableOpacity>
              <View></View>
              <Image
                style={styles.person}
                source={require('../assets/person.png')}
              />
              <Text style={styles.nbrPerson}>:{nbrPerson}</Text>

              <TouchableOpacity
                onPress={() => handleIncrease(recette)}
                style={styles.plus}
              >
                <Image
                  style={styles.plusMoins}
                  source={require('../assets/plus.png')}
                />
              </TouchableOpacity>
            </>
          )}
          {isEditing && (
            <>
              <Image
                style={styles.person}
                source={require('../assets/person.png')}
              />
              <Text style={styles.nbrPerson}>:{nbrPerson}</Text>
            </>
          )}
        </View>
        {/* ------------------------prearation suisson time---------------------- */}
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
        {/* ------------------------Categories---------------------- */}
        <View style={styles.categoriesContainer}>
          {isEditing ? renderCategories : null}
        </View>
        {/* ------------------------Image---------------------- */}
        <View
          style={[
            styles.pictureBorder,
            { height: screenHeight * 0.24 },
            {
              backgroundColor: isEditing
                ? selectedCategory.color
                : categoryColor,
            },
          ]}
        >
          {isUploadingImage && isEditing ? (
            <ActivityIndicator size="large" color="#f1948a" />
          ) : (
            <TouchableOpacity
              onPress={() =>
                isEditing &&
                selectImage(
                  setSelectedImage,
                  setIsImageReplaced,
                  uploadImageToBackend,
                  selectedImage,
                  setIsUploadingImage,
                )
              }
              disabled={!isEditing}
            >
              <Image
                style={[
                  styles.foodPicture,
                  {
                    width: Dimensions.get('window').width * 0.72,
                    height: screenHeight * 0.2,
                  },
                ]}
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : require('../assets/foodPicture.png')
                }
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
        {/* ------------------------ingredients---------------------- */}
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
        {/* -----------------------Preparation---------------------- */}
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
        {/* ------------------------notes---------------------- */}
        <View style={styles.notesContainer}>
          <ScrollView>
            <Text style={styles.titreCentre}>Mes notes:</Text>
            <TouchableOpacity
              onLongPress={handleEditNotes}
              onPress={() => {
                if (isEditingNotes) {
                  const updatedNotes = notes
                    .replace('Appui long pour éditer les notes!', '')
                    .trim();
                  setNotes(updatedNotes);
                } else {
                  setIsEditingNotes(false);
                }
              }}
            >
              {isEditingNotes ? (
                <>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    placeholder="Ma note"
                  />
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        handleValidationNotes(recetteId);
                        setIsEditingNotes(false);
                      }}
                    >
                      <Text style={styles.okButton}>OK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingNotes(false);
                        setNotes(
                          recette.notes || '-Appui long pour éditer les notes!',
                        );
                      }}
                    >
                      <Text style={styles.okButton}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.notes}>{notes}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
//*-----------------------------------STYLES---------------------------------------
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
    paddingBottom: 150,
  },
  title: {
    fontFamily: 'DancingScript_400Regular',
    maxWidth: '90%',
    fontSize: 35,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  titleInput: {
    fontFamily: 'DancingScript_400Regular',
    maxWidth: '90%',
    fontSize: 35,
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
    backgroundColor: 'transparent',
    marginTop: '2%',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  foodPicture: {
    width: '100%',
    height: '100%',
    borderColor: 'black',
    backgroundColor: 'transparent',
    borderWidth: 2,
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
  plus: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  moins: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  plusMoins: {
    height: '70%',
    objectFit: 'scale-down',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
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
  cancelButton: {
    fontSize: 20,
    color: 'red',
    marginLeft: 10,
  },
  editingBackground: {
    backgroundColor: 'rgba(150, 149, 149, 0.3)',
  },
  defaultBackground: {
    backgroundColor: 'transparent',
  },
});

export default RecetteFromBdd;
