//eventos_frontend\src\screens\StatsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  SectionList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
        <Text style={styles.historyTitle}>{item.event_title}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.event_date).toLocaleDateString()}
        </Text>
        <Text style={styles.historyLabel}>Asistentes:</Text>
        {item.attendees.length > 0 ? (
          item.attendees.map((user) => (
            <Text key={user.user_id} style={styles.attendeeText}>
              • {user.full_name} (@{user.username})
            </Text>
          ))
        ) : (
          <Text style={styles.attendeeText}>— Ninguno</Text>
        )}
      </View>
    );
  };

  const renderStatItem = ({ item }) => {
    return (
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>{item.event_title}</Text>
        <Text style={styles.statLine}>Total RSVPs: {item.total_rsvps}</Text>
        <Text style={styles.statLine}>
          Asistencias confirmadas: {item.accepted_count}
        </Text>
        <Text style={styles.statLine}>
          Calificación promedio: {item.average_rating.toFixed(1)}
        </Text>
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
    paddingVertical: 14,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#555",
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
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  historyLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  attendeeText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 12,
    marginBottom: 2,
  },

  statCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
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
    marginBottom: 6,
    color: "#333",
  },
  statLine: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
});
