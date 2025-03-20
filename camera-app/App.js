import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

import CameraPage from './screens/cameraPage';
import GalleryPage from './screens/galleryPage';
import PhotoPage from './screens/photoPage';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen name="Camera" component={CameraPage} options={{ headerShown: false }} />
        <Stack.Screen name="Gallery" component={GalleryPage} options={{ headerShown: true }} />
        <Stack.Screen name="Photo" component={PhotoPage} options={{ headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
