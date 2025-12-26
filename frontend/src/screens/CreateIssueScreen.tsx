import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateIssueScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Issue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});

export default CreateIssueScreen;
