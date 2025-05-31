//eventos_frontend\src\screens\LogoutScreen.js
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    const doLogout = async () => {
      await AsyncStorage.removeItem("userToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
    };
    doLogout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
