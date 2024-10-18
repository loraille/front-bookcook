import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { urlBackend } from '../var';
import { modifyRecetteReducer } from '../modules/utils.CahierScreen';
import {
  useFonts,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';

export default function CahierScreen() {
  const [fontsLoaded] = useFonts({ DancingScript_400Regular });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userToken = useSelector((state) => state.user.value.token);
  const [recette, setRecette] = useState();
  const [foundedReciepes, setFoundedReciepes] = useState([]);
  const [recettes, setRecettes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReciepeFound, setIsReciepeFound] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [searchError, setSearchError] = useState(false); // New state for search error
  const opacityAnimations = useRef([]);

  //*------------------Get Categories--------------------
  useEffect(() => {
    fetch(`${urlBackend}/categorie`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categoryInfo));
  }, []);

  //*-------------------Show Reciepes------------------
  const handleShowReciepies = (category) => {
    if (selectedCategory?._id === category._id) {
      setSelectedCategory(null);
      setRecettes([]);
      setIsReciepeFound(false);
    } else {
      setSelectedCategory(category);
    }
  };

  //*-------------------Render categories--------------
  const listCategories = categories.map((category) => (
    <View key={category._id}>
      <TouchableOpacity
        style={[
          styles.categoriesContainer,
          { backgroundColor: category.color },
        ]}
        onPress={() => handleShowReciepies(category)}
        disabled={loading && selectedCategory?._id === category._id}
      >
        <Text style={styles.categoriesText}>{category.name}</Text>
      </TouchableOpacity>
      {loading && selectedCategory?._id === category._id && (
        <ActivityIndicator size="small" color="#0000ff" />
      )}
      {selectedCategory?._id === category._id && !loading && (
        <View>
          {isReciepeFound ? (
            recettes.map((recette, index) => (
              <View key={recette._id} style={styles.recetteContainer}>
                <Animated.View
                  style={{ opacity: opacityAnimations.current[index] }}
                >
                  <TouchableOpacity
                    onPress={() => handleShow(recette)}
                    onLongPress={() => setRecipeToDelete(recette)}
                  >
                    <View style={styles.recette}>
                      <Text style={styles.recetteTexte}>{recette.titre}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
                {recipeToDelete?._id === recette._id && (
                  <View style={styles.deleteContainer}>
                    <TouchableOpacity onPress={() => setRecipeToDelete(null)}>
                      <Text style={styles.okButton}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteRecipe(recette._id)}
                    >
                      <Text style={styles.okButton}>Supprimer</Text>
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

  //*-------------------Reciepes  founded render---------------------
  const listReciepsFounded = foundedReciepes.map((recette, index) => (
    <View key={recette._id} style={styles.recetteContainer}>
      <Animated.View style={{ opacity: opacityAnimations.current[index] }}>
        <TouchableOpacity
          onPress={() => {
            handleShow(recette);
            setIsSearched(false);
          }}
          onLongPress={() => {
            setRecipeToDelete(recette);
          }}
        >
          <View
            style={[
              styles.recette,
              { backgroundColor: recette.categorie.color },
            ]}
          >
            <Text style={styles.recetteTexte}>{recette.titre}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      {recipeToDelete?._id === recette._id && (
        <View style={styles.deleteContainer}>
          <TouchableOpacity onPress={() => setRecipeToDelete(null)}>
            <Text style={styles.okButton}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteRecipe(recette._id)}>
            <Text style={styles.okButton}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ));

  //*-------------------Reciepes animation-------------
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

  //*-------------------Search--------------------------------
  const handleSearch = (search, userToken) => {
    if (search.trim() === '') {
      setSearchError(true);
      return;
    }
    handleSearchInBdd(search, userToken);
    setRecette('');
  };

  //*-------------------Search in Bdd--------------------------
  const handleSearchInBdd = async (search, userToken) => {
    try {
      const response = await fetch(
        `${urlBackend}/getRecettes/${userToken}/${search}`,
      );
      const data = await response.json();
      if (data.result) {
        // sort by category
        const sortedRecettes = data.userInfo.recettes.sort((a, b) =>
          a.categorie.name.localeCompare(b.categorie.name),
        );
        setFoundedReciepes(sortedRecettes);
        setIsSearched(true);
        setSearchError(false); // Reset search error
      } else {
        setSearchError(true); // Set search error
      }
    } catch (error) {
      console.error('Error with search:', error);
      setSearchError(true); // Set search error
    }
  };

  //*--------------------Send reciepe to recetteScreeen-----------------
  const handleShow = (recette) => {
    modifyRecetteReducer(recette, dispatch);
    navigation.navigate('Recette', { from: 'C' });
  };

  //*------------------Supress reciepe----------------------------------
  const handleDeleteRecipe = async (id) => {
    try {
      await fetch(`${urlBackend}/recette/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      //update reciepes founded result
      if (isSearched) {
        setFoundedReciepes(
          foundedReciepes.filter((recette) => recette._id !== id),
        );
      } else {
        setRecettes(recettes.filter((recette) => recette._id !== id));
      }

      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  //*-----------------------Rerender reciepes ------------------------
  useFocusEffect(
    React.useCallback(() => {
      if (selectedCategory) {
        setLoading(true);
        fetch(`${urlBackend}/recettes/${userToken}/${selectedCategory.name}`)
          .then((response) => response.json())
          .then((data) => {
            const recettesData = data.userInfo?.recettes || [];
            setRecettes(
              recettesData.sort((a, b) => a.titre.localeCompare(b.titre)),
            );
            setIsReciepeFound(!!recettesData.length);
            startAnimations(recettesData);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching recipes:', error);
            setIsReciepeFound(false);
            setLoading(false);
          });
      }
    }, [selectedCategory, userToken]),
  );

  //*------------------------------RENDER----------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image
        source={require('../assets/paper.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <Text style={styles.titreCentre}>Recherche:</Text>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Recette cherchée"
              onChangeText={(value) => setRecette(value)}
              value={recette}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => {
                handleSearch(recette, userToken);
              }}
            >
              <Image
                style={styles.loupe}
                source={require('../assets/loupe.png')}
              />
            </TouchableOpacity>
          </View>
          {searchError && (
            <Text style={styles.searchErrorText}>Pas de recette trouvée</Text>
          )}

          <Text style={styles.titreCentre}>Mes recettes:</Text>
          {!isSearched || searchError ? (
            listCategories
          ) : (
            <>
              {listReciepsFounded}
              <TouchableOpacity
                style={styles.retour}
                onPress={() => {
                  setIsSearched(false);
                }}
              >
                <Text style={styles.recetteTexte}>Annuler la recherche</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

//----------------------------STYLE-------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#f5f1d7',
  },
  retour: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#f5f1d7',
  },
  okButton: {
    fontSize: 15,
    color: 'white',
    marginRight: 10,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#f1948a',
    borderRadius: 7,
    padding: 5,
  },
  loupe: {
    width: 30,
    height: 30,
  },
  input: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 20,
    width: '80%',
  },
  titreCentre: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 45,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  categoriesContainer: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  categoriesText: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 25,
    textAlign: 'center',
  },
  recetteContainer: {
    marginVertical: 5,
  },
  recette: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },

  recetteTexte: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 22,
    textAlign: 'center',
  },
  noRecipeText: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 22,
    textAlign: 'center',
    color: 'red',
  },
  deleteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'gray',
    fontSize: 20,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 20,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
    height: '100%',
    width: '100%',
  },
  searchErrorText: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 22,
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
});
