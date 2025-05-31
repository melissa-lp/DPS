//eventos_frontend\src\navigation\EventStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EventsListScreen from "../screens/EventsListScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import CreateEventScreen from "../screens/CreateEventScreen";

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator
      initialRouteName="EventsList"
      screenOptions={{
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: "#f2f2f2" },
      }}
    >
      <Stack.Screen
        name="EventsList"
        component={EventsListScreen}
        options={{ title: "Eventos" }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "Detalle del Evento" }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: "Crear Evento" }}
      />
    </Stack.Navigator>
  );
}
