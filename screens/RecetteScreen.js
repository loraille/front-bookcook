import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ComponentFromA from '../modules/recetteFromScan';
import ComponentFromC from '../modules/recetteFromBdd';

const RecetteScreen = () => {
  const route = useRoute();
  const { from } = route.params || {};
  console.log('rrrrrrrrrrrrrrrrr', from);

  return (
    <View style={styles.container}>
      {from === 'A' && <ComponentFromA />}
      {from === 'C' && <ComponentFromC />}
      {!from && (
        <View>
          <Text style={styles.text}>Afficher une recette du Cahier</Text>
          <Text style={styles.text}>ou prendre en photo une recette</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  text: {
    fontFamily: 'Dancing',
    fontSize: 25,
  },
});

export default RecetteScreen;
