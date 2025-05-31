//eventos_frontend\src\screens\CreateEventScreen.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(""); // ISO yyyy-mm-ddTHH:MM:SS
  const [location, setLocation] = useState("");
  const [licenseCode, setLicenseCode] = useState("CC-BY"); // valor por defecto

  const submit = async () => {
    if (!title.trim() || !eventDate.trim() || !licenseCode.trim()) {
      Alert.alert("Error", "Títulos, fecha y licencia son obligatorios");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No se encontró token de autenticación");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate.trim(),
        location: location.trim() || null,
        license_code: licenseCode.trim(),
      };

      const res = await client.post("/events", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Éxito", "Evento creado correctamente");

      setTitle("");
      setDescription("");
      setEventDate("");
      setLocation("");
      setLicenseCode("CC-BY");

      navigation.navigate("EventsList");
    } catch (err) {
      console.log("Error al crear evento:", err.response || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.error || "No se pudo crear el evento"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multilineInput]}
        multiline
        numberOfLines={4}
      />

      <TextInput
        placeholder="Fecha (YYYY-MM-DDThh:mm:ss)"
        value={eventDate}
        onChangeText={setEventDate}
        style={styles.input}
      />

      <TextInput
        placeholder="Ubicación (opcional)"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <TextInput
        placeholder="Código de Licencia (e.g., CC-BY)"
        value={licenseCode}
        onChangeText={setLicenseCode}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Crear Evento" onPress={submit} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancelar"
          color={Platform.OS === "ios" ? "red" : undefined}
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginBottom: 12,
  },
});
