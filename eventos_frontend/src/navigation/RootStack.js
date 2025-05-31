//eventos_frontend\src\navigation\RootStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();

export default function RootStack({ initialRouteName }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={AppTabs} />
    </Stack.Navigator>
  );
}
