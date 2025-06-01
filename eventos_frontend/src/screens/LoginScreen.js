// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const { width } = Dimensions.get("window");
const FORM_WIDTH = width * 0.55; // 65% del ancho de la pantalla

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const res = await client.post("/auth/login", {
        username,
        password,
      });
      const token = res.data.access_token;
      await AsyncStorage.setItem("userToken", token);
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || err.message);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* ─── Formulario centrado ─── */}
      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Bienvenido a Eventos Express</Text>

        <TextInput
          placeholder="Correo electrónico"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>O continuar con</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtonsRow}>
          <TouchableOpacity style={styles.socialButtonGoogle}>
            <Text style={styles.socialButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButtonFacebook}>
            <Text style={styles.socialButtonText}>
              Continuar con Facebook
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros{" "}
          <Text style={styles.linkText}>Términos de Servicio</Text> y{" "}
          <Text style={styles.linkText}>Política de Privacidad</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─────────── Pantalla ───────────
  screenContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center", // centra verticalmente
    alignItems: "center",     // centra horizontalmente
  },

  // ─────────── Formulario ───────────
  formContainer: {
    width: FORM_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: "600",
    color: "#333",
    marginBottom: 44,
    textAlign: "center",
  },
  input: {
    width: "70%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
    justifyContent: "center",
    alignSelf: "center"
  },
  primaryButton: {
    width: "50%",                
    alignSelf: "center",           
    backgroundColor: "#E0EFFF",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    justifyContent: "center",
    width: "50%",                  
    alignSelf: "center",        
    backgroundColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
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
