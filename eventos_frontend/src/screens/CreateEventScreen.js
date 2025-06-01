// eventos_frontend/src/screens/CreateEventScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";
import Toast from "react-native-toast-message";

// Solo importamos DateTimePicker en iOS/Android
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [location, setLocation] = useState("");
  const [licenseCode, setLicenseCode] = useState("CC-BY");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLicensePicker, setShowLicensePicker] = useState(false);
  const [licenseOptions, setLicenseOptions] = useState([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [webDate, setWebDate] = useState("");
  const [webTime, setWebTime] = useState("");

  const isSmallScreen = SCREEN_WIDTH < 768;
  const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

  useEffect(() => {
    fetchLicenseTypes();
  }, []);

  const fetchLicenseTypes = async () => {
    try {
      setLoadingLicenses(true);
      const response = await client.get("/license-types");
      setLicenseOptions(response.data);

      if (response.data.length > 0 && !licenseCode) {
        setLicenseCode(response.data[0].code);
      }
    } catch (error) {
      console.log("Error al cargar tipos de licencia:", error);
      Toast.show({
        type: "error",
        text1: "Advertencia",
        text2:
          "No se pudieron cargar licencias. Se usarán valores predeterminados.",
      });
      setLicenseOptions([
        { code: "CC-BY", description: "Creative Commons Attribution" },
      ]);
    } finally {
      setLoadingLicenses(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

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

  const combineWebDateTime = () => {
    if (!webDate || !webTime) return "";
    return `${webDate}T${webTime}:00`;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const submit = async () => {
    let dateValue;

    if (Platform.OS === "web") {
      dateValue = combineWebDateTime();
    } else {
      dateValue = formatInputDate(eventDate);
    }

    // Validaciones
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El título es obligatorio.",
      });
      return;
    }
    if (!dateValue) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes seleccionar fecha y hora.",
      });
      return;
    }
    if (!licenseCode.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Selecciona un tipo de licencia.",
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se encontró token de autenticación.",
        });
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
        headers: { Authorization: `Bearer ${token}` },
      });

      Toast.show({
        type: "success",
        text1: "¡Éxito!",
        text2: "Evento creado correctamente.",
      });

      // Limpiar formulario
      setTitle("");
      setDescription("");
      setEventDate(null);
      setWebDate("");
      setWebTime("");
      setLocation("");
      setLicenseCode("CC-BY");

      navigation.navigate("EventsList");
    } catch (err) {
      console.log("Error al crear evento:", err.response || err.message);
      Toast.show({
        type: "error",
        text1: "Error al crear evento",
        text2: err.response?.data?.error || "No se pudo crear el evento.",
      });
    }
  };

  const renderLicensePicker = () => {
    const selectedLicense = licenseOptions.find((l) => l.code === licenseCode);

    if (loadingLicenses) {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Licencia Creative Commons</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666666" />
            <Text style={styles.loadingText}>Cargando licencias...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Licencia Creative Commons</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowLicensePicker(true)}
        >
          <Text style={styles.pickerButtonText}>
            {selectedLicense
              ? selectedLicense.description
              : "Seleccionar licencia"}
          </Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={showLicensePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLicensePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                isSmallScreen && styles.modalContentMobile,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Licencia</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowLicensePicker(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {licenseOptions.map((license) => (
                  <TouchableOpacity
                    key={license.code}
                    style={[
                      styles.licenseOption,
                      licenseCode === license.code &&
                        styles.selectedLicenseOption,
                    ]}
                    onPress={() => {
                      setLicenseCode(license.code);
                      setShowLicensePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.licenseOptionText,
                        licenseCode === license.code &&
                          styles.selectedLicenseText,
                      ]}
                    >
                      {license.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderDatePicker = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha y Hora del Evento</Text>

          <View
            style={[styles.dateTimeRow, isSmallScreen && styles.dateTimeColumn]}
          >
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateTimeLabel}>📅 Fecha</Text>
              <input
                type="date"
                value={webDate}
                onChange={(e) => setWebDate(e.target.value)}
                min={getTodayDate()}
                style={styles.webDateInput}
              />
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.dateTimeLabel}>🕐 Hora</Text>
              <input
                type="time"
                value={webTime}
                onChange={(e) => setWebTime(e.target.value)}
                style={styles.webTimeInput}
              />
            </View>
          </View>

          {/* Vista previa */}
          {(webDate || webTime) && (
            <View style={styles.datePreview}>
              <View style={styles.datePreviewHeader}>
                <Text style={styles.datePreviewIcon}>📅</Text>
                <Text style={styles.datePreviewLabel}>Fecha del evento</Text>
              </View>
              <Text style={styles.datePreviewText}>
                {webDate
                  ? new Date(webDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Sin fecha seleccionada"}
                {webTime && ` a las ${webTime}`}
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha y Hora del Evento</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {eventDate
                ? formatInputDate(eventDate).replace("T", " a las ") + " hrs"
                : "Seleccionar fecha y hora"}
            </Text>
            <Text style={styles.pickerArrow}>📅</Text>
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
        </View>
      );
    }
  };

  const getContainerWidth = () => {
    if (isSmallScreen) return "100%";
    if (isTablet) return "80%";
    return "60%";
  };

  const getButtonLayout = () => {
    return isSmallScreen ? styles.buttonColumn : styles.buttonsRow;
  };

  return (
    <ScrollView contentContainerStyle={styles.outerScroll}>
      <View style={[styles.innerContainer, { width: getContainerWidth() }]}>
        <Text
          style={[
            styles.headerTitle,
            isSmallScreen && styles.headerTitleMobile,
          ]}
        >
          Nuevo Evento
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoCapitalize="sentences"
            placeholder="Ingresa el título del evento"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={isSmallScreen ? 3 : 4}
            placeholder="Describe tu evento..."
            placeholderTextColor="#888"
          />
        </View>

        {renderDatePicker()}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ubicación (opcional)</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            style={styles.input}
            placeholder="¿Dónde será el evento?"
            placeholderTextColor="#888"
          />
        </View>

        {renderLicensePicker()}

        <View style={getButtonLayout()}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={submit}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Crear Evento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/** Montamos el Toast para que funcione */}
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    minHeight: SCREEN_HEIGHT,
  },
  innerContainer: {
    alignSelf: "center",
    paddingHorizontal: 16,
    maxWidth: 800,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 32,
  },
  headerTitleMobile: {
    fontSize: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  dateTimeLabel: {
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#222222",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#444444",
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: "#666666",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeColumn: {
    flexDirection: "column",
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
    marginBottom: 10,
  },
  timeInputContainer: {
    flex: 1,
    marginBottom: 10,
  },
  webDateInput: {
    width: "100%",
    height: "48px",
    border: "1px solid #DDDDDD",
    margin: 2,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#222222",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  webTimeInput: {
    width: "100%",
    height: "48px",
    padding: "2px",
    border: "1px solid #DDDDDD",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#222222",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 32,
  },
  buttonColumn: {
    flexDirection: "column",
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 500,
    maxHeight: "70%",
  },
  modalContentMobile: {
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: "#666666",
  },
  modalScrollView: {
    maxHeight: 300,
  },
  licenseOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedLicenseOption: {
    backgroundColor: "#E3F2FD",
  },
  licenseOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  selectedLicenseText: {
    color: "#1976D2",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666666",
  },
  datePreview: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  datePreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  datePreviewIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  datePreviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  datePreviewText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
    lineHeight: 22,
  },
});
