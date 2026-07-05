// navigation/RoadmapStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoadmapScreen from '../screens/RoadmapScreen';
import WeeksOverviewScreen from '../screens/WeeksOverviewScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CongratsScreen from '../screens/CongratsScreen';

import RoadmapPlanScreen from '../screens/RoadmapPlanScreen';

// Themes screens (keep for now)
import NewCityThemesScreen from '../screens/NewCityThemesScreen';
import TechSwitchThemesScreen from '../screens/TechSwitchThemesScreen';
import FinancialGlowUpThemesScreen from '../screens/FinancialGlowUpThemesScreen';
import PhysicalGlowUpThemesScreen from '../screens/PhysicalGlowUpThemesScreen';
import MentalGlowUpThemesScreen from '../screens/MentalGlowUpThemesScreen';

import NewCityTrackScreen from '../screens/NewCityTrackScreen';
import TechSwitchRoleScreen from '../screens/TechSwitchRoleScreen';
import PhysicalGlowUpTrackScreen from '../screens/PhysicalGlowUpTrackScreen';

const Stack = createNativeStackNavigator();

export default function RoadmapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoadmapMain"
        component={RoadmapScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WeeksOverview"
        component={WeeksOverviewScreen}
        options={{ title: 'Weekly Plan' }}
      />

      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ headerTitle: 'Task Details', headerBackTitle: 'Back' }}
      />

      {/* Generic Plan Screen */}
      <Stack.Screen
        name="RoadmapPlan"
        component={RoadmapPlanScreen}
        options={{ headerShown: false }}
      />

<Stack.Screen
  name="Congrats"
  component={CongratsScreen}
  options={{ headerShown: false }}
/>
      {/* Themes (optional for now) */}
      <Stack.Screen name="NewCityThemes" component={NewCityThemesScreen} />
      <Stack.Screen name="TechSwitchThemes" component={TechSwitchThemesScreen} />
      <Stack.Screen name="FinancialGlowUpThemes" component={FinancialGlowUpThemesScreen} />
      <Stack.Screen name="PhysicalGlowUpThemes" component={PhysicalGlowUpThemesScreen} />
      <Stack.Screen name="MentalGlowUpThemes" component={MentalGlowUpThemesScreen} />

      {/* Track / role modals */}
      <Stack.Screen name="NewCityTrackModal" component={NewCityTrackScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="TechSwitchRole" component={TechSwitchRoleScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="PhysicalGlowUpTrack" component={PhysicalGlowUpTrackScreen} />
    </Stack.Navigator>
  );
}