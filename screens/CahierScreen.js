import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import { useDispatch, useSelector } from 'react-redux';
import { addPhoto, UserState } from '../reducers/user';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';
import { urlBackend } from '../var';

export default function CahierScreen() {
  console.log('-------------------CAHIER-----------------------');
  const recette = useSelector((state) => state.recette.value.mindeeInfo);
  const handleConnection = () => {
    console.log('--------->', recette);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity
        onPress={() => handleConnection()}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.textButton}>Recette!</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
