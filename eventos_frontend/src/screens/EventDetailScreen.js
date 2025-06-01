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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Formatea una fecha en español: "DD de MES de AAAA"
 * Ejemplo: "1 de mayo de 2025"
 */
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

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentUser}>{item.username}</Text>
      <Text style={styles.commentRating}>⭐ {item.rating}/5</Text>
      <Text style={styles.commentText}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.outerScroll}>
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
                  <Button
                    title={rsvpStatus === "accepted" ? "Asistiendo ✓" : "Asistir"}
                    onPress={() => handleRsvp("accepted")}
                    disabled={rsvpStatus === "accepted"}
                  />
                </View>
                <View style={styles.rsvpButtonWrapper}>
                  <Button
                    title="Cancelar"
                    color="red"
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
                />
                <TextInput
                  placeholder="Calificación (1–5)"
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                  style={[styles.input, styles.ratingInput]}
                />
                {loadingComment ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <View style={styles.submitCommentWrapper}>
                    <Button
                      title="Enviar Comentario"
                      onPress={handleSubmitComment}
                      color="#007AFF"
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
  /**
   * outerScroll: garantiza que el ScrollView ocupe toda la pantalla
   */
  outerScroll: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
  },

  /**
   * innerContainer: ocupa 70% del ancho en pantallas amplias y centra
   * en pantallas pequeñas (por debajo de 700 px, usa 100%).
   */
  innerContainer: {
    width: SCREEN_WIDTH > 700 ? "70%" : "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },

  /**
   * header: fondo claro y bordes redondeados para el bloque de título
   */
  header: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },
  date: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#555",
  },

  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  descText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },

  /**
   * rsvpRow: fila horizontal que contiene ambos botones de RSVP
   * Cada botón ocupa un 20% del ancho de innerContainer, con espacio entre ellos.
   */
  rsvpRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  rsvpButtonWrapper: {
    width: "20%",
    marginRight: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
    fontSize: 15,
    color: "#222",
    marginBottom: 12,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  ratingInput: {
    width: 120,
  },
  submitCommentWrapper: {
    marginTop: 12,
    alignSelf: "flex-start",
    width: 160,
  },

  commentContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentUser: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    color: "#222",
  },
  commentRating: {
    fontSize: 14,
    color: "#ffa500",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 13,
    color: "#666",
    textAlign: "right",
  },
  noCommentsText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 8,
    fontSize: 15,
  },
});
