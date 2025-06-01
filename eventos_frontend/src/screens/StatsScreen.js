// eventos_frontend/src/screens/StatsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import client from "../api/client";

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState("historial");
  const [historyData, setHistoryData] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get("/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistoryData(res.data || []);
    } catch (err) {
      console.log("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get("/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatsData(res.data || []);
    } catch (err) {
      console.log("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const renderHistoryItem = ({ item }) => {
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.historyTitle}>{item.event_title}</Text>
        </View>
        <View style={styles.cardSubHeader}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.historyDate}>
            {new Date(item.event_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.historyBody}>
          <Ionicons name="people-outline" size={16} color="#555" />
          <Text style={styles.historyLabel}>Asistentes:</Text>
        </View>
        {item.attendees.length > 0 ? (
          item.attendees.map((user) => (
            <View key={user.user_id} style={styles.attendeeRow}>
              <Ionicons name="person-outline" size={14} color="#444" />
              <Text style={styles.attendeeText}>
                {user.full_name} (@{user.username})
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.attendeeRow}>
            <Ionicons name="person-outline" size={14} color="#aaa" />
            <Text style={[styles.attendeeText, { color: "#aaa" }]}>
              — Ninguno
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStatItem = ({ item }) => {
    return (
      <View style={styles.statCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={24} color="#007AFF" />
          <Text style={styles.statTitle}>{item.event_title}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#555" />
          <Text style={styles.statLine}>Total RSVPs: {item.total_rsvps}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="checkmark-done-outline" size={16} color="#555" />
          <Text style={styles.statLine}>
            Asistencias: {item.accepted_count}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="star-outline" size={16} color="#555" />
          <Text style={styles.statLine}>
            Rating: {item.average_rating.toFixed(1)} / 5
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "historial" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("historial")}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={activeTab === "historial" ? "#007AFF" : "#555"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "historial" && styles.tabTextActive,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "estadisticas" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("estadisticas")}
        >
          <Ionicons
            name="bar-chart-outline"
            size={18}
            color={activeTab === "estadisticas" ? "#007AFF" : "#555"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "estadisticas" && styles.tabTextActive,
            ]}
          >
            Estadísticas
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "historial" ? (
        loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : historyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="warning-outline" size={40} color="#aaa" />
            <Text style={styles.emptyText}>No hay eventos pasados.</Text>
          </View>
        ) : (
          <FlatList
            data={historyData}
            keyExtractor={(item) => item.event_id.toString()}
            renderItem={renderHistoryItem}
            contentContainerStyle={{ padding: 12 }}
          />
        )
      ) : loadingStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : statsData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="warning-outline" size={40} color="#aaa" />
          <Text style={styles.emptyText}>No hay estadísticas disponibles.</Text>
        </View>
      ) : (
        <FlatList
          data={statsData}
          keyExtractor={(item) => item.event_id.toString()}
          renderItem={renderStatItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 6,
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  historyDate: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  historyBody: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginLeft: 6,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: 2,
  },
  attendeeText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 4,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statLine: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
});
