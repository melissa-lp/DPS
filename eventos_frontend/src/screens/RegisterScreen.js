// src/screens/RegisterScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import client from "../api/client";
import Toast from "react-native-toast-message";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  let containerWidth = "100%";
  if (SCREEN_WIDTH >= 1024) containerWidth = "40%";
  else if (SCREEN_WIDTH >= 768) containerWidth = "60%";
  else if (SCREEN_WIDTH >= 500) containerWidth = "80%";

  let headerFontSize = 24;
  if (SCREEN_WIDTH >= 768) headerFontSize = 28;
  if (SCREEN_WIDTH < 360) headerFontSize = 20;

  const isSmallScreen = SCREEN_WIDTH < 380;
  const buttonWidth = isSmallScreen ? "100%" : "45%";

  const submit = async () => {
    // 1) Validaciones simples antes de llamar al API
    if (username.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El usuario es obligatorio.",
      });
      return;
    }
    if (password.trim().length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    if (firstName.trim() === "" || lastName.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Nombre y apellido son obligatorios.",
      });
      return;
    }
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La edad debe ser un número válido entre 1 y 120.",
      });
      return;
    }

    // 2) Llamada al backend
    try {
      await client.post("/auth/register", {
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        age: ageNum,
      });

      // En lugar de Alert.alert, mostramos un toast de éxito:
      Toast.show({
        type: "success",
        text1: "Éxito",
        text2: "Registro completado. Ya puedes iniciar sesión.",
      });

      // Después de un pequeño delay (para que el usuario vea el toast), vamos al Login
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error al registrar",
        text2: err.response?.data?.error || err.message,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.outerScroll}>
      <View style={[styles.innerContainer, { width: containerWidth }]}>
        <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
          Regístrate
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            placeholder="username"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Apellido</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholder="Tu apellido"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Edad</Text>
          <TextInput
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            style={styles.input}
            placeholder="Ej: 27"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.primaryButton, { width: buttonWidth }]}
            onPress={submit}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { width: buttonWidth }]}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#F7F9FC",
    paddingVertical: 16,
    alignItems: "center",
  },

  innerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 16,
  },

  headerTitle: {
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    color: "#222222",
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E0EFFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
