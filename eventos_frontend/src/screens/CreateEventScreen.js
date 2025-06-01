// eventos_frontend/src/screens/CreateEventScreen.js

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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

// Solo importamos DateTimePicker en iOS/Android
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [manualDate, setManualDate] = useState(""); // Fallback para web
  const [location, setLocation] = useState("");
  const [licenseCode, setLicenseCode] = useState("CC-BY");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cuando el usuario elige fecha/hora en iOS/Android:
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  // Convierte un Date a "YYYY-MM-DDThh:mm:ss"
  const formatInputDate = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  };

  const submit = async () => {
    // En web uso manualDate; en móvil uso eventDate
    const dateValue =
      Platform.OS === "web" ? manualDate.trim() : formatInputDate(eventDate);

    if (!title.trim() || !dateValue || !licenseCode.trim()) {
      Alert.alert("Error", "Título, fecha y licencia son obligatorios");
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
        event_date: dateValue,
        location: location.trim() || null,
        license_code: licenseCode.trim(),
      };

      await client.post("/events", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Éxito", "Evento creado correctamente");
      // Limpiar campos
      setTitle("");
      setDescription("");
      setEventDate(null);
      setManualDate("");
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
    <ScrollView contentContainerStyle={styles.outerScroll}>
      <View style={styles.innerContainer}>
        {/** ───────── TÍTULO PRINCIPAL ───────── */}
        <Text style={styles.headerTitle}>Crear Evento</Text>

        {/** ───────── CAMPO: TÍTULO ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoCapitalize="sentences"
          />
        </View>

        {/** ───────── CAMPO: DESCRIPCIÓN ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
          />
        </View>

        {/** ───────── CAMPO: FECHA ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha del Evento</Text>

          {Platform.OS === "web" ? (
            // En web: el usuario escribe manualmente "YYYY-MM-DDThh:mm:ss"
            <TextInput
              value={manualDate}
              onChangeText={setManualDate}
              placeholder="2025-06-15T18:30:00"
              style={styles.input}
            />
          ) : (
            // En Android/iOS: abrimos el DateTimePicker nativo
            <>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {eventDate
                    ? formatInputDate(eventDate).replace("T", " ")
                    : "Seleccionar fecha y hora"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={eventDate || new Date()}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/** ───────── CAMPO: UBICACIÓN ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ubicación (opcional)</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        </View>

        {/** ───────── CAMPO: LICENCIA ───────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Código de Licencia</Text>
          <TextInput
            value={licenseCode}
            onChangeText={setLicenseCode}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        {/** ───────── BOTONES ───────── */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={submit}>
            <Text style={styles.smallButtonText}>Crear Evento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: "#E53935" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.smallButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
  },
  innerContainer: {
    width: SCREEN_WIDTH > 700 ? "70%" : "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
  },
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
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#BBBBBB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  datePickerText: {
    fontSize: 16,
    color: "#444444",
  },
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
