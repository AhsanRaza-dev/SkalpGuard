import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <View style={styles.tabBarContainer}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#FAD979',
          tabBarInactiveTintColor: '#D0DEE1',
          headerShown: false,
          tabBarButton: route.name === 'results' ? undefined : HapticTab,
          lazy: true,
          tabBarStyle: {
            backgroundColor: '#344225',
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            borderRadius: 16,
            marginHorizontal: 16,
            marginBottom: 10,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        })}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="camera.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle" color={color} />,
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="results"
          options={{
            title: 'Results',
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
    backgroundColor: '#D0DEE1',
  },
});
