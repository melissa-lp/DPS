//eventos_frontend\src\navigation\RootStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";

const Stack = createNativeStackNavigator();

export default function RootStack({ initialRouteName }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthStack} />

      <Stack.Screen name="Main" component={AppDrawer} />
    </Stack.Navigator>
  );
}
