// eventos_frontend\src\screens\EventsListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await client.get("/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Procesar las fechas correctamente
        const processedEvents = res.data.map((event) => ({
          ...event,
          // Asegurarse de que event_date es un objeto Date
          event_date: new Date(event.event_date),
          // Calcular is_past correctamente
          is_past: new Date(event.event_date) < new Date(),
        }));

        setEvents(processedEvents);
      } catch (err) {
        console.log("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.event_date) >= now);
  const past = events.filter((e) => new Date(e.event_date) < now);

  const sections = [
    { title: "Próximos", data: upcoming },
    { title: "Pasados", data: past },
  ];

  const renderEventCard = ({ item }) => {
    const eventDate = new Date(item.event_date);
    const isPast = item.is_past;

    return (
      <TouchableOpacity
        style={[styles.cardContainer, isPast && styles.cardPast]}
        onPress={() => navigation.navigate("EventDetail", { event: item })}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{eventDate.toLocaleString()}</Text>
          <Text style={styles.cardLocation}>📍 {item.location}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description || "Sin descripción"}
          </Text>
          {isPast && <Text style={styles.pastLabel}>📌 Pasado</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventCard}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={
          <Text style={styles.noEventsText}>No hay eventos</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateEvent")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#eee",
    padding: 8,
    marginTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  cardContainer: {
    marginVertical: 6,
  },
  cardPast: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  cardDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "#444",
  },
  pastLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#a00",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
