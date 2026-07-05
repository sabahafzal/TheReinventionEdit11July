import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FinancialGlowUpRoadmapScreen({ navigation }) {
  const handleSelectPlan = () => {
    navigation.navigate('FinancialGlowUpThemes', { planLength: 60 }); // Always 60-day
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Financial Glow-Up</Text>
      <Text style={styles.subtitle}>
        Levelling up financially
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleSelectPlan}>
        <Text style={styles.buttonText}>💅 Start the 60-Day Financial Glow-Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: {
    fontSize: 26,
    color: '#D6A5D2',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D6A5D2',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
