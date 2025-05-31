//eventos_frontend\src\navigation\AppDrawer.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import EventsListScreen from "../screens/EventsListScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import LogoutScreen from "../screens/LogoutScreen";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="EventsList"
      screenOptions={{
        headerShown: true,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="EventsList"
        component={EventsListScreen}
        options={{ title: "Lista de Eventos" }}
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
