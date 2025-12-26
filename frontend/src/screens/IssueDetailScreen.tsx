import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const IssueDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Issue Detail</Text>
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

export default IssueDetailScreen;
