//eventos_frontend\src\navigation\AppDrawer.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import EventsStack from "./EventsStack";
import CreateEventScreen from "../screens/CreateEventScreen";
import LogoutScreen from "../screens/LogoutScreen";

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
