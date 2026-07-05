// navigation/AppNavigator.js
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MainTabs from './MainTabs';
import OnboardingQuizScreen from '../screens/OnboardingQuizScreen';
import WeeklyReviewScreen from '../screens/WeeklyReviewScreen';
import CongratsScreen from '../screens/CongratsScreen';

// Style section screens
import StyleOverviewScreen from '../screens/StyleOverviewScreen';
import WorkZoomLooksScreen from '../screens/WorkZoomLooksScreen';
import AfterWorkStyleScreen from '../screens/AfterWorkStyleScreen';
import MinimalMakeupScreen from '../screens/MinimalMakeupScreen';
import SeasonalCapsuleScreen from '../screens/SeasonalCapsuleScreen';

// Single source of truth for roadmap/theme/plan screens
import RoadmapStack from './RoadmapStack';

import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [quizCompleted, setQuizCompleted] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadQuizState = async () => {
      try {
        const value = await AsyncStorage.getItem('quizCompleted');
        if (!isMounted) return;
        setQuizCompleted(value === 'true');
      } catch (e) {
        console.warn('Failed to load quizCompleted:', e?.message || e);
        if (!isMounted) return;
        setQuizCompleted(false);
      }
    };

    loadQuizState();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show branded splash while AsyncStorage resolves
  if (quizCompleted === null) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!quizCompleted ? (
        <>
          <Stack.Screen name="OnboardingQuiz" component={OnboardingQuizScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="OnboardingQuiz" component={OnboardingQuizScreen} />
        </>
      )}

      {/* All roadmap/theme/plan screens live inside this nested stack */}
      <Stack.Screen name="RoadmapStack" component={RoadmapStack} />

      {/* Congrats */}
      <Stack.Screen
        name="Congrats"
        component={CongratsScreen}
        options={{ title: 'Congratulations', headerShown: true }}
      />

      {/* Style screens */}
      <Stack.Screen name="StyleOverview" component={StyleOverviewScreen} />
      <Stack.Screen name="WorkZoomLooks" component={WorkZoomLooksScreen} />
      <Stack.Screen name="AfterWorkStyle" component={AfterWorkStyleScreen} />
      <Stack.Screen name="MinimalMakeup" component={MinimalMakeupScreen} />
      <Stack.Screen name="SeasonalCapsule" component={SeasonalCapsuleScreen} />

      {/* Hidden / utilities */}
      <Stack.Screen
        name="WeeklyReview"
        component={WeeklyReviewScreen}
        options={{ title: 'Weekly Review', headerShown: true }}
      />

      {/* Legal */}
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}