//eventos_frontend\src\screens\MyEventsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function MyEventsScreen({ navigation }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await client.get("/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyEvents(res.data);
      } catch (err) {
        console.log("Error fetching my events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (myEvents.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noEventsText}>
          No tienes eventos pasados a los que asististe
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("EventsStack", {
            screen: "EventDetail",
            params: { event: item },
          })
        }
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.event_date).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={myEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noEventsText: { fontSize: 16, color: "#555" },
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
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardDate: { fontSize: 14, color: "#666", marginTop: 4 },
});
