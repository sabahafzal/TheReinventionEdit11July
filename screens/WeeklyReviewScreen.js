import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfWeek, addDays } from 'date-fns';

export default function WeeklyReviewScreen() {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekSummary();
  }, []);

  const loadWeekSummary = async () => {
    setLoading(true);
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const summaries = [];

    for (const day of days) {
      const key = `planner_tasks_${format(day, 'yyyy-MM-dd')}`;
      const stored = await AsyncStorage.getItem(key);
      const tasks = stored ? JSON.parse(stored) : [];

      const completed = tasks.filter((t) => t.completed).length;
      const remaining = tasks.length - completed;

      summaries.push({
        date: format(day, 'EEE dd MMM'),
        total: tasks.length,
        completed,
        remaining,
      });
    }

    setWeekData(summaries);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 Weekly Review</Text>

      {loading ? (
        <ActivityIndicator color="#D6A5D2" size="large" />
      ) : (
        weekData.map((day, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.dateText}>{day.date}</Text>
            <Text style={styles.detail}>
              Total Tasks: <Text style={styles.bold}>{day.total}</Text>
            </Text>
            <Text style={styles.detail}>
              ✅ Completed: <Text style={styles.bold}>{day.completed}</Text>
            </Text>
            <Text style={styles.detail}>
              🔁 Remaining: <Text style={styles.bold}>{day.remaining}</Text>
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D6A5D2',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
});
