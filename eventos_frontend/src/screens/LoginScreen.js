// eventos_frontend/src/screens/LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { width: SCREEN_WIDTH } = useWindowDimensions();

  let formWidth = SCREEN_WIDTH * 0.85;
  if (SCREEN_WIDTH >= 768) {
    formWidth = SCREEN_WIDTH * 0.6;
  }
  if (SCREEN_WIDTH >= 1024) {
    formWidth = SCREEN_WIDTH * 0.4;
  }

  let welcomeFontSize = 28;
  if (SCREEN_WIDTH >= 768) {
    welcomeFontSize = 32;
  }
  if (SCREEN_WIDTH < 360) {
    welcomeFontSize = 24;
  }

  const inputWidth = "100%";
  let buttonWidth = "100%";
  if (SCREEN_WIDTH >= 768) {
    buttonWidth = "60%";
  }

  const submit = async () => {
    try {
      const res = await client.post("/auth/login", {
        username,
        password,
      });
      const token = res.data.access_token;
      await AsyncStorage.setItem("userToken", token);

      Toast.show({
        type: "success",
        text1: "¡Inicio de sesión correcto!",
        text2: `Bienvenido, ${username}`,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error al iniciar sesión",
        text2: err.response?.data?.error || err.message,
      });
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.formContainer, { width: formWidth }]}>
        <Text style={[styles.welcomeText, { fontSize: welcomeFontSize }]}>
          Bienvenido a Eventos Express
        </Text>

        <TextInput
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={[styles.input, { width: inputWidth }]}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, { width: inputWidth }]}
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={[styles.primaryButton, { width: buttonWidth }]}
          onPress={submit}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { width: buttonWidth }]}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>O continuar con</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={styles.socialButtonGoogle}
            activeOpacity={0.7}
          >
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButtonFacebook}
            activeOpacity={0.7}
          >
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros{" "}
          <Text style={styles.linkText}>Términos de Servicio</Text> y{" "}
          <Text style={styles.linkText}>Política de Privacidad</Text>
        </Text>
      </View>

      {/** Invocamos Toast aquí para que esté disponible */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#edf2f4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  welcomeText: {
    fontWeight: "600",
    color: "#333333",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333333",
    alignSelf: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  orText: {
    marginHorizontal: 12,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  socialButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  socialButtonGoogle: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  socialButtonFacebook: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  socialButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  termsText: {
    marginTop: 24,
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
});
