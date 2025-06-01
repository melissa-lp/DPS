// eventos_frontend/src/screens/RegisterScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import client from "../api/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");

  const submit = async () => {
    try {
      await client.post("/auth/register", {
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        age: Number(age),
      });
      Alert.alert("Éxito", "Usuario registrado");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.outerScroll}>
      <View style={styles.innerContainer}>
        {/** ───────── TÍTULO PRINCIPAL ───────── */}
        <Text style={styles.headerTitle}>Registro a Eventos</Text>

        {/** ───────── CAMPO: USUARIO ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        {/** ───────── CAMPO: CONTRASEÑA ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {/** ───────── CAMPO: NOMBRE ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
        </View>

        {/** ───────── CAMPO: APELLIDO ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Apellido</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
        </View>

        {/** ───────── CAMPO: EDAD ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Edad</Text>
          <TextInput
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            style={styles.input}
          />
        </View>

        {/** ───────── BOTONES ───────── */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={submit}>
            <Text style={styles.smallButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.smallButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /**
   * outerScroll: garantiza que el ScrollView crezca para ocupar toda
   * la pantalla en caso de muchos inputs. Fondo neutro.
   */
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
  },

  /**
   * innerContainer: ocupa 70% del ancho en pantallas amplias (>700px)
   * y 100% en pantallas pequeñas. Se centra horizontalmente.
   */
  innerContainer: {
    width: SCREEN_WIDTH > 700 ? "50%" : "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },

  /**
   * headerTitle: título principal centrado con margen inferior
   */
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
  },

  /**
   * Cada inputGroup contiene etiqueta + TextInput
   */
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#BBBBBB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#222222",
  },

  /**
   * buttonsRow: fila que agrupa 2 botones,
   * cada uno ocupa 40% del ancho del contenedor padre,
   * con espacio entre ellos
   */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  smallButton: {
    width: "40%",
    backgroundColor: "#007AFF",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
