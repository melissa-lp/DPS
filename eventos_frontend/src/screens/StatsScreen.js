//eventos_frontend\src\screens\StatsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function StatsScreen() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await client.get("/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.log("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (stats.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noStatsText}>No hay estadísticas disponibles</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.eventTitle}>{item.event_title}</Text>
        <Text style={styles.statItem}>Total RSVPs: {item.total_rsvps}</Text>
        <Text style={styles.statItem}>
          Asistencias confirmadas: {item.accepted_count}
        </Text>
        <Text style={styles.statItem}>
          Calificación promedio: {item.average_rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.event_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noStatsText: { fontSize: 16, color: "#555" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  statItem: { fontSize: 14, color: "#555", marginBottom: 4 },
});
