import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import RecetteFromBdd from '../modules/recetteFromBdd';
import RecetteFromScan from '../modules/recetteFromScan';

const RecetteScreen = () => {
  const route = useRoute();
  const { from } = route.params || {};

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/paper.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.content}>
        {from === 'A' && <RecetteFromScan />}
        {from === 'C' && <RecetteFromBdd />}
        {!from && (
          <View>
            <Text style={styles.text}>Afficher une recette du Cahier</Text>
            <Text style={styles.text}>ou prendre en photo une recette</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 28,
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
});

export default RecetteScreen;
