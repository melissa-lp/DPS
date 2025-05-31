//eventos_frontend\src\navigation\AppTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import EventsStack from "./EventsStack";
import MyEventsScreen from "../screens/MyEventsScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="EventsStack"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#eee" },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "EventsStack":
              iconName = "calendar-outline";
              break;
            case "MyEvents":
              iconName = "checkmark-circle-outline";
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

          return <Ionicons name={iconName} size={size} color={color} />;
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
        options={{ title: "Mis Eventos" }}
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
