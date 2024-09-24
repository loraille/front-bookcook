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
  console.log('---------------->', preparation[0]);

  const ingredientsList = ingredients.map((data, i) => {
    return (
      <Text key={i} style={styles.ingredient}>
        -{data.ingredient} {data.quantite}
        {data.unite}
      </Text>
    );
  });

  const screenHeight = Dimensions.get('window').height;

  const [editingIndex, setEditingIndex] = useState(null);
  const [consigneText, setConsigneText] = useState([
    "Faire revenir l'oignon émincé et l'ail à la poêle avec un filet d'huile d'olive.",
    "Mixer les pois chiches égouttés avec la cuisine soja jusqu'à obtenir une texture granuleuse.",
    'Mettre les pois chiches dans un saladier et ajouter le mélange oignon/ail, le curcuma, le piment, le persil haché ainsi que le sel et le poivre. Et pour finir, ajouter la farine',
    'Former des palets puis faire dorer sur une poêle huilée pendant quelques minutes de chaque côté.',
    "Servir immédiatement accompagnées d'une salade.",
  ]);

  const handleLongPress = (index) => {
    setEditingIndex(index);
  };

  const handleChangeText = (index, text) => {
    const newConsigneText = [...consigneText];
    newConsigneText[index] = text;
    setConsigneText(newConsigneText);
  };

  const handleBlur = () => {
    setEditingIndex(null);
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

        <View style={styles.preparationContainer}>
          <Text style={styles.preparationTitre}>Préparation:</Text>
          {consigneText.map((text, index) => (
            <TouchableOpacity
              key={index}
              onLongPress={() => handleLongPress(index)}
            >
              {editingIndex === index ? (
                <TextInput
                  style={styles.consigneInput}
                  value={text}
                  onChangeText={(newText) => handleChangeText(index, newText)}
                  onBlur={handleBlur}
                  multiline
                />
              ) : (
                <Text style={styles.consigne}>{text}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Image
          style={styles.separateur}
          source={require('../assets/separateur.png')}
        />
        <Text style={styles.bonapp}>Bon appétit ! </Text>
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
    width: '100%', // Prend toute la largeur disponible
  },
  separateur: {
    width: '90%',
    height: 15,
    objectFit: 'scale-down',
  },
  preparationContainer: {
    width: '90%',
  },
  preparationTitre: {
    fontSize: 25,
    fontFamily: 'Dancing',
    textDecorationLine: 'underline',
  },
  consigne: {
    fontSize: 23,
    fontFamily: 'Dancing',
  },
  consigneInput: {
    fontSize: 23,
    fontFamily: 'Dancing',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 5,
    marginVertical: 5,
  },
  bonapp: {
    marginTop: 10,
    fontSize: 30,
    fontFamily: 'Dancing',
    borderColor: 'black',
    textDecorationLine: 'underline',
  },
});
