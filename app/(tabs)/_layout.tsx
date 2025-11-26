import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Forms',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="file-document-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={32} name="plus-circle" color={color} />,
          tabBarLabelStyle: { display: 'none' }, // Hide label for the center button
        }}
      />
      <Tabs.Screen
        name="responses"
        options={{
          title: 'Responses',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="chart-bar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore if we don't delete the file yet
        }}
      />
    </Tabs>
  );
}
