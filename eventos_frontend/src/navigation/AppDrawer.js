// eventos_frontend/src/navigation/AppDrawer.js

import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import EventsStack from "./EventsStack";
import CreateEventScreen from "../screens/CreateEventScreen";
import LogoutScreen from "../screens/LogoutScreen";
import CreatedByMeScreen from "../screens/CreatedByMeScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="EventsStack"
      screenOptions={{
        headerShown: false,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="EventsStack"
        component={EventsStack}
        options={{ title: "Lista de Eventos" }}
      />

      <Drawer.Screen
        name="CreatedByMe"
        component={CreatedByMeScreen}
        options={{ title: "Mis Eventos Creados" }}
      />

      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Bandeja de entrada" }}
      />

      <Drawer.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: "Crear Evento" }}
      />

      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ title: "Cerrar Sesión" }}
      />
    </Drawer.Navigator>
  );
}
