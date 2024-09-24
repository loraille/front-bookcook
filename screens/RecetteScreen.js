import React, { useState } from 'react';
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
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function RecetteScreen() {
  console.log('-------------------RECETTE-----------------------');

  const recette = useSelector((state) => state.recette.value.mindeeInfo);
  //* ------------data from Mindee------------
  const [nbrePersonne, setNbrePersonne] = useState(
    recette.nombrepersonnes.value,
  );
  const [prepTime, setPrepTime] = useState(recette.preparationtime.value);
  const [cookingTime, setCookingTime] = useState(recette.cuissontime.value);
  const [titre, setTitre] = useState(recette.titre.value);
  const [ingredients, setIgredients] = useState(recette.ingredients);
  const [preparation, setPreparation] = useState(recette.preparation);
  // console.log('---------------->', preparation[0]);

  const ingredientsList = ingredients.map((data, i) => {
    return (
      <Text key={i} style={styles.ingredient}>
        -{data.ingredient} {data.quantite}
        {data.unite}
      </Text>
    );
  });

  const preparationsList = preparation.map((data, j) => {
    return (
      <View key={j} style={styles.preparationItem}>
        <Text style={styles.consigne}>
          {j + 1}. {data.consigne}
        </Text>
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
    console.log('edition');
  };

  const handleValidation = () => {
    console.log('validation');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{titre}</Text>
        <View style={styles.dispo1}>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/person.png')}
            />
            <Text style={styles.infosText}>: {nbrePersonne}</Text>
          </View>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cooking.png')}
            />
            <Text style={styles.infosText}>: {prepTime}</Text>
          </View>
          <View style={styles.dispo2}>
            <Image
              style={styles.infos}
              source={require('../assets/cuisson.png')}
            />
            <Text style={styles.infosText}>: {cookingTime}</Text>
          </View>
        </View>

        <View style={styles.pictureContainer}>
          <Image
            style={[styles.foodPicture, { height: screenHeight * 0.2 }]}
            source={require('../assets/foodPicture.png')}
          />
          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredients}>Ingrédients:</Text>
            <View style={styles.ingredientsGrid}>{ingredientsList}</View>
          </View>
        </View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
        <Text style={styles.preparationTitre}>Préparation</Text>
        <View style={styles.preparationContainer}>{preparationsList}</View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />

        <TouchableOpacity
          onPress={() => handleEdition()}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>Editer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleValidation()}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>Valider</Text>
        </TouchableOpacity>
      </ScrollView>
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
  pictureContainer: {
    width: '90%',
    marginTop: '2%',
    alignItems: 'center',
  },
  foodPicture: {
    width: '100%',
    borderColor: 'black',
    borderWidth: 3,
    objectFit: 'scale-down',
    marginTop: '5%',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ingredient: {
    fontFamily: 'Dancing',
    fontSize: 23,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
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
});
