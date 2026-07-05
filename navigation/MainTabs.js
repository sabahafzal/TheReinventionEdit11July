// navigation/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen               from '../screens/HomeScreen';
import RoadmapStack             from './RoadmapStack';
import ReinventionCircleScreen  from '../screens/ReinventionCircleScreen';
import StyleOverviewScreen      from '../screens/StyleOverviewScreen';
import InsightsScreen           from '../screens/InsightsScreen';
import ProfileScreen            from '../screens/ProfileScreen';

import { colors } from '../screens/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.dustyRose,
        tabBarInactiveTintColor: colors.champagne,
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 12 },
        tabBarIcon: ({ color, size, focused }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            case 'Roadmap':
              return <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />;
            case 'ReinventionCircle':
              return <Ionicons name={focused ? 'ellipse' : 'aperture-outline'} size={size} color={color} />;
            case 'Style':
              return <MaterialCommunityIcons name={focused ? 'tshirt-crew' : 'tshirt-crew-outline'} size={size} color={color} />;
            case 'Insights':
              return <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home"              component={HomeScreen} />
      <Tab.Screen name="Roadmap"           component={RoadmapStack} />
      <Tab.Screen name="ReinventionCircle" component={ReinventionCircleScreen} />
      <Tab.Screen name="Style"             component={StyleOverviewScreen} />
      <Tab.Screen name="Insights"          component={InsightsScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none', width: 0 } }}
      />
    </Tab.Navigator>
  );
}