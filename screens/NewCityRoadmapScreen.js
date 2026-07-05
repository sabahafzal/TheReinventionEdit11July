// screens/NewCityRoadmapScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NewCityRoadmapScreen({ navigation }) {
  const handleNavigate = () => {
    navigation.navigate('NewCityThemes', { duration: 60 }); // 👈 Always send 60 days
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starting Over in a New City</Text>
      <Text style={styles.subtitle}>
        Begin your 60-day reinvention journey
      </Text>

      <TouchableOpacity style={styles.card} onPress={handleNavigate}>
        <Text style={styles.cardText}>🚀 Start the Roadmap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D6A5D2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  card: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6A5D2',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    color: '#333',
  },
});
