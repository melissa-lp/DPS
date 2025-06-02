//eventos_frontend\src\navigation\AppTabs.js

import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EventsStack from "./EventsStack";
import MyEventsScreen from "../screens/MyEventsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="EventsStack"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",

        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case "EventsStack":
              iconName = "calendar-outline";
              break;
            case "MyEvents":
              iconName = "checkmark-circle-outline";
              break;
            case "Notifications":
              iconName = "mail-outline";
              break;
            case "Stats":
              iconName = "stats-chart-outline";
              break;
            case "Profile":
              iconName = "person-circle-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="EventsStack"
        component={EventsStack}
        options={{ title: "Eventos" }}
      />

      <Tab.Screen
        name="MyEvents"
        component={MyEventsScreen}
        options={{ title: "Eventos asistidos" }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Bandeja de entrada" }}
      />

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: "Estadísticas" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
