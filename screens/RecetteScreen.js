import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ComponentFromA from '../modules/recetteFromScan';
import ComponentFromC from '../modules/recetteFromBdd';

const RecetteScreen = () => {
  const route = useRoute();
  const { from } = route.params || {};

  return (
    <View style={styles.container}>
      {from === 'A' && <ComponentFromA />}
      {from === 'C' && <ComponentFromC />}
      {!from && <Text>No component to display</Text>}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    backgroundColor: 'red',
  },
});

export default RecetteScreen;
