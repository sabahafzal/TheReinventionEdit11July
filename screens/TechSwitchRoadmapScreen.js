import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TechSwitchRoadmapScreen({ navigation }) {
  const handleNavigate = () => {
    navigation.navigate('TechSwitchThemes', { duration: 60 }); // Always pass 60 days
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Switching into Tech</Text>
      <Text style={styles.subtitle}>
        Your 60-day guide to changing paths without losing your mind (or your style).
      </Text>

      <TouchableOpacity style={styles.option} onPress={handleNavigate}>
        <Text style={styles.optionText}>🚀 Start the 60-Day Roadmap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 26,
    color: '#D6A5D2',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  option: {
    backgroundColor: '#D6A5D2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
  },
});
