// eventos_frontend\src\screens\RegisterScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import client from "../api/client";

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
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Edad"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />

      <Button title="Registrarse" onPress={submit} />
      <View style={{ height: 8 }} />
      <Button
        title="Volver al Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}
