import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Огляд',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Сканер',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'scan' : 'scan-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Сомельє',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.chatIconContainer, focused && styles.chatIconActive]}>
              <Ionicons
                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={20}
                color={focused ? Colors.black : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Історія',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профіль',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#090909',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabItem: {
    paddingTop: 4,
  },
  chatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  chatIconActive: {
    backgroundColor: Colors.gold,
  },
});
