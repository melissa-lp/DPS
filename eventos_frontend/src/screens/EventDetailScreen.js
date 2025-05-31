//eventos_frontend\src\screens\EventDetailScreen.js
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

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
    }

    if (eventDate >= now) {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>
          Fecha: {new Date(event.event_date).toLocaleString()}
        </Text>
        <Text style={styles.location}>📍 {event.location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.descText}>
          {event.description || "Sin descripción proporcionada."}
        </Text>
      </View>

      {!isPast && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmar Asistencia</Text>
          {loadingRsvp ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button
                  title={rsvpStatus === "accepted" ? "Asistiendo ✓" : "Asistir"}
                  onPress={() => handleRsvp("accepted")}
                  disabled={rsvpStatus === "accepted"}
                />
              </View>
              <View style={styles.buttonWrapper}>
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

      {isPast && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            {loadingComments ? (
              <ActivityIndicator />
            ) : comments.length > 0 ? (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noCommentsText}>No hay comentarios aún</Text>
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
                numberOfLines={3}
              />
              <TextInput
                placeholder="Calificación (1–5)"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
                style={[styles.input, { width: 100 }]}
              />
              {loadingComment ? (
                <ActivityIndicator />
              ) : (
                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Enviar Comentario"
                    onPress={handleSubmitComment}
                  />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  header: {
    marginBottom: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: "#555",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  descText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fafafa",
    marginBottom: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  commentContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentUser: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentRating: {
    color: "#ffa500",
    marginBottom: 4,
  },
  commentText: {
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  noCommentsText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 12,
  },
});
