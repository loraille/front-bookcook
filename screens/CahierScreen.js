import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { urlBackend } from '../var';
import { regle3 } from '../modules/utils.CahierScreen';
import {
  addRecette,
  addImage,
  addNotes,
  addCategory,
} from '../reducers/recette';

export default function CahierScreen() {
  console.log('-------------------CAHIER-----------------------');

  const navigation = useNavigation();

  const goToScreenB = () => {
    navigation.navigate('Recette', { from: 'C' });
  };

  const userToken = useSelector((state) => state.user.value.token);
  const [recettes, setRecettes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isReciepeFound, setIsReciepeFound] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nombrePersonnes, setNombrePersonnes] = useState({}); //{"recette._id": recette.nbrePerson,...}
  const [isReciepeLongPressed, setIsReciepeLongPressed] = useState(false);
  const [isOkToSuppressReciepe, setIsOkToSuppressReciepe] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const opacityAnimations = useRef([]);
  const dispatch = useDispatch();

  const recetteInfo = useSelector((state) => state.recette.value);

  //* ---------------------Get Category-----------------------------
  useEffect(() => {
    fetch(`${urlBackend}/categorie`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categoryInfo));
  }, []);

  //* --------------------Show reciepes-----------------------------
  const handleShowReciepies = (datas) => {
    if (selectedCategory && selectedCategory._id === datas._id) {
      setSelectedCategory(null);
      setRecettes([]);
      setIsReciepeFound(false);
    } else {
      setSelectedCategory(datas);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      const category = selectedCategory.name;
      setLoading(true);

      fetch(`${urlBackend}/recettes/${userToken}/${category}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.userInfo && data.userInfo.recettes) {
            let sortedRecettes = data.userInfo.recettes.sort((a, b) =>
              a.titre.localeCompare(b.titre),
            );
            setRecettes(sortedRecettes);
            setIsReciepeFound(true);
            startAnimations(sortedRecettes);
            //*---convert []->{}---
            const initialNombrePersonnes = sortedRecettes.reduce(
              (acc, recette) => {
                acc[recette._id] = parseInt(recette.nombrePersonnes, 10);
                return acc;
              },
              {},
            );
            setNombrePersonnes(initialNombrePersonnes);
          } else {
            setIsReciepeFound(false);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching recipes:', error);
          setIsReciepeFound(false);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  //*-------------Animation-------------
  const startAnimations = (recettes) => {
    opacityAnimations.current = recettes.map(() => new Animated.Value(0));
    recettes.forEach((_, index) => {
      Animated.timing(opacityAnimations.current[index], {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  };

  //*----------Modify qty--------------------------------
  const modifyQty = (recette, nbrePerson) => {
    const key = recette._id;
    //---------change quantities if needed---------
    if (key in nbrePerson) {
      const personForReciepe = nbrePerson[key];
      if (personForReciepe !== Number(recette.nombrePersonnes)) {
        console.log('modify');
        recette.ingredients = regle3(recette, personForReciepe);
        recette.nombrePersonnes = personForReciepe;
      }
    } else {
      console.log(` "${key}" is false!!!`);
    }
    const formattedRecette = {
      cuissontime: { value: recette.tempsCuisson },
      ingredients: recette.ingredients.map((ingredient) => ({
        ingredient: ingredient.ingredient,
        quantite: ingredient.quantite,
        unite: ingredient.unite,
      })),
      nombrepersonnes: { value: recette.nombrePersonnes },
      preparation: recette.preparation.map((step) => ({
        consigne: step.consigne,
        index: step.index,
      })),
      preparationtime: { value: recette.tempsPreparation },
      titre: { value: recette.titre },
    };

    dispatch(addImage(recette.image));
    dispatch(addNotes(recette.notes));
    dispatch(addCategory(recette.categorie));
    dispatch(addRecette(formattedRecette));
  };

  //*----------Send Reciepe to ScreenRecette-------------
  const handleShow = (recette, newNombrePersonnes) => {
    modifyQty(recette, newNombrePersonnes);
    goToScreenB();
  };

  const showSuppressReciepe = (recette) => {
    setRecipeToDelete(recette);
  };

  const cancelDeleteRecipe = () => {
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = async () => {
    try {
      const response = await fetch(
        `${urlBackend}/recette/${recipeToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      console.log(data.message);
      // Mettre à jour la liste des recettes après la suppression
      setRecettes(
        recettes.filter((recette) => recette._id !== recipeToDelete._id),
      );
      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  //* ----------------------------render categories ----------------------------
  const categoriesList = categories.map((data) => (
    <View key={data._id}>
      <TouchableOpacity
        style={[styles.categoriesContainer, { backgroundColor: data.color }]}
        onPress={() => handleShowReciepies(data)}
        disabled={
          loading && selectedCategory && selectedCategory._id === data._id
        }
      >
        <Text style={styles.categoriesText}>{data.name}</Text>
      </TouchableOpacity>
      {loading && selectedCategory && selectedCategory._id === data._id && (
        <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />
      )}
      {selectedCategory && selectedCategory._id === data._id && !loading && (
        <View>
          {isReciepeFound ? (
            recettes.map((recette, index) => (
              <View key={recette._id} style={styles.recetteContainer}>
                <Animated.View
                  style={[{ opacity: opacityAnimations.current[index] }]}
                >
                  <TouchableOpacity
                    onPress={() => handleShow(recette, nombrePersonnes)}
                    onLongPress={() => showSuppressReciepe(recette)}
                  >
                    <View style={styles.recette}>
                      <Text style={styles.recetteTexte}>{recette.titre}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {recipeToDelete && recipeToDelete._id === recette._id && (
                  <View style={styles.deleteContainer}>
                    <TouchableOpacity
                      onPress={cancelDeleteRecipe}
                      // style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteRecipe}
                      // style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noRecipeText}>Pas encore de recette!</Text>
          )}
        </View>
      )}
    </View>
  ));

  //*-------------------------------RENDER--------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titreCentre}>Mes recettes:</Text>
      <View style={styles.test}>
        <ScrollView>{categoriesList}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

//* -------------------------------STYLES---------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  test: {
    width: '90%',
  },
  titreCentre: {
    fontFamily: 'Dancing',
    fontSize: 45,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  categoryWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  categoriesContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  categoriesText: {
    fontFamily: 'Dancing',
    fontSize: 25,
    textAlign: 'center',
  },
  loader: {
    marginTop: 10,
  },
  recetteContainer: {
    flexDirection: 'column',
  },
  recette: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  recetteTexte: {
    fontFamily: 'Dancing',
    fontSize: 22,
    paddingHorizontal: 2,

    justifyContent: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  noRecipeText: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Dancing',
    color: 'red',
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  person: {
    textAlign: 'right',
    fontFamily: 'Dancing',
    fontSize: 22,
    width: 55,
  },
  image: {
    height: 35,
    width: 35,
    marginHorizontal: 5,
  },
  deleteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'red',
    fontSize: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 20,
  },
});
