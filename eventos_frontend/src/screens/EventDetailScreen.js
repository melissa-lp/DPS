// eventos_frontend/src/screens/EventDetailScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Check if device is a tablet
const isTablet = SCREEN_WIDTH >= 768;
const isSmallPhone = SCREEN_WIDTH < 375;

function formatSpanishDateLong(date) {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${day} de ${monthNames[monthIndex]} de ${year}`;
}

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [isPast, setIsPast] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loadingRsvp, setLoadingRsvp] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [attended, setAttended] = useState(false);

  useEffect(() => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    setIsPast(eventDate < now);

    if (eventDate < now) {
      checkAttendance();
      loadComments();
    } else {
      checkRsvpStatus();
    }
  }, [event]);

  const checkAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get("/my-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendedEvents = res.data.map((e) => e.id);
      setAttended(attendedEvents.includes(event.id));
    } catch (err) {
      console.log("Error checking attendance:", err);
    }
  };

  const checkRsvpStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get(`/rsvps/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRsvpStatus(res.data.status);
    } catch (err) {
      setRsvpStatus(null);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get(`/comments/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.log("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleRsvp = async (newStatus) => {
    setLoadingRsvp(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (newStatus === "accepted") {
        await client.post(
          `/rsvps/${event.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Éxito", "Asistencia confirmada");
      } else {
        await client.delete(`/rsvps/${event.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert("Éxito", "Asistencia cancelada");
      }
      setRsvpStatus(newStatus);
    } catch (err) {
      console.log("Error al RSVP:", err.response || err.message);
      const msg = err.response?.data?.error || "Error actualizando RSVP";
      Alert.alert("Error", msg);
    } finally {
      setLoadingRsvp(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !rating.trim()) {
      Alert.alert("Error", "Comentario y calificación son obligatorios");
      return;
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert("Error", "La calificación debe ser un número entre 1 y 5");
      return;
    }

    setLoadingComment(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      await client.post(
        `/comments/${event.id}`,
        {
          content: comment.trim(),
          rating: ratingNum,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Éxito", "Comentario enviado");
      setComment("");
      setRating("");
      loadComments();
    } catch (err) {
      console.log("Error al comentar:", err.response || err.message);
      const msg =
        err.response?.data?.error || "No se pudo enviar el comentario";
      Alert.alert("Error", msg);
    } finally {
      setLoadingComment(false);
    }
  };

  // Custom button component for better mobile experience
  const CustomButton = ({ title, onPress, disabled, variant = "primary" }) => (
    <TouchableOpacity
      style={[
        styles.customButton,
        variant === "secondary" && styles.customButtonSecondary,
        disabled && styles.customButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.customButtonText,
          variant === "secondary" && styles.customButtonTextSecondary,
          disabled && styles.customButtonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.username}</Text>
        <Text style={styles.commentRating}>⭐ {item.rating}/5</Text>
      </View>
      <Text style={styles.commentText}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.outerScroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.innerContainer}>
        {/** ───────── Encabezado con Título, Fecha y Ubicación ───────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>
            {formatSpanishDateLong(new Date(event.event_date))}
          </Text>
          <Text style={styles.location}>📍 {event.location}</Text>
        </View>

        {/** ───────── Sección Descripción ───────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descText}>
            {event.description || "Sin descripción proporcionada."}
          </Text>
        </View>

        {/** ───────── Sección Confirmar Asistencia (para futuros) ───────── */}
        {!isPast && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmar Asistencia</Text>
            {loadingRsvp ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <View style={styles.rsvpRow}>
                <View style={styles.rsvpButtonWrapper}>
                  <CustomButton
                    title={
                      rsvpStatus === "accepted" ? "Asistiendo ✓" : "Asistir"
                    }
                    onPress={() => handleRsvp("accepted")}
                    disabled={rsvpStatus === "accepted"}
                  />
                </View>
                <View style={styles.rsvpButtonWrapper}>
                  <CustomButton
                    title="Cancelar"
                    variant="secondary"
                    onPress={() => handleRsvp("declined")}
                    disabled={rsvpStatus !== "accepted"}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/** ───────── Sección Comentarios (para pasados) ───────── */}
        {isPast && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comentarios</Text>
              {loadingComments ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : comments.length > 0 ? (
                <FlatList
                  data={comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.noCommentsText}>
                  No hay comentarios aún
                </Text>
              )}
            </View>

            {attended && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dejar Comentario</Text>
                <TextInput
                  placeholder="Escribe tu comentario..."
                  value={comment}
                  onChangeText={setComment}
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.ratingContainer}>
                  <TextInput
                    placeholder="Calificación (1–5)"
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="numeric"
                    style={[styles.input, styles.ratingInput]}
                    maxLength={1}
                  />
                </View>
                {loadingComment ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <View style={styles.submitCommentWrapper}>
                    <CustomButton
                      title="Enviar Comentario"
                      onPress={handleSubmitComment}
                    />
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingVertical: isTablet ? 24 : 16,
  },

  innerContainer: {
    width: isTablet ? "80%" : "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: isSmallPhone ? 12 : 16,
  },

  header: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: isSmallPhone ? 12 : 16,
    marginBottom: isTablet ? 32 : 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  title: {
    fontSize: isSmallPhone ? 20 : isTablet ? 28 : 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1a1a1a",
    lineHeight: isSmallPhone ? 24 : isTablet ? 34 : 30,
  },

  date: {
    fontSize: isSmallPhone ? 14 : 16,
    color: "#4a5568",
    marginBottom: 6,
    fontWeight: "500",
  },

  location: {
    fontSize: isSmallPhone ? 14 : 16,
    color: "#4a5568",
    fontWeight: "500",
  },

  section: {
    marginBottom: isTablet ? 32 : 24,
  },

  sectionTitle: {
    fontSize: isSmallPhone ? 16 : isTablet ? 20 : 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2d3748",
  },

  descText: {
    fontSize: isSmallPhone ? 14 : 15,
    color: "#4a5568",
    lineHeight: isSmallPhone ? 20 : 22,
  },

  rsvpRow: {
    flexDirection: isSmallPhone ? "column" : "row",
    justifyContent: "flex-start",
    alignItems: isSmallPhone ? "stretch" : "center",
    gap: 12,
  },

  rsvpButtonWrapper: {
    width: isSmallPhone ? "100%" : isTablet ? "30%" : "40%",
    maxWidth: 200,
  },

  // Custom button styles for better mobile experience
  customButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Better touch target
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  customButtonSecondary: {
    backgroundColor: "#ff3b30",
  },

  customButtonDisabled: {
    backgroundColor: "#c7c7cc",
    elevation: 0,
    shadowOpacity: 0,
  },

  customButtonText: {
    color: "#ffffff",
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: "600",
  },

  customButtonTextSecondary: {
    color: "#ffffff",
  },

  customButtonTextDisabled: {
    color: "#8e8e93",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: isSmallPhone ? 10 : 12,
    backgroundColor: "#f9fafb",
    fontSize: isSmallPhone ? 14 : 15,
    color: "#1f2937",
    marginBottom: 12,
    minHeight: 44, // Better touch target
  },

  multilineInput: {
    height: isSmallPhone ? 80 : 100,
    textAlignVertical: "top",
  },

  ratingContainer: {
    alignItems: "flex-start",
  },

  ratingInput: {
    width: isSmallPhone ? 80 : 100,
    textAlign: "center",
  },

  submitCommentWrapper: {
    marginTop: 8,
    alignSelf: "stretch",
    maxWidth: isTablet ? 200 : "100%",
  },

  commentContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: isSmallPhone ? 10 : 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  commentUser: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },

  commentRating: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#f59e0b",
    fontWeight: "600",
  },

  commentText: {
    fontSize: isSmallPhone ? 13 : 14,
    color: "#4b5563",
    marginBottom: 6,
    lineHeight: isSmallPhone ? 18 : 20,
  },

  commentDate: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
  },

  noCommentsText: {
    textAlign: "center",
    color: "#9ca3af",
    marginVertical: 16,
    fontSize: isSmallPhone ? 14 : 15,
    fontStyle: "italic",
  },
});
