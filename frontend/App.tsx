import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
