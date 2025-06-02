// eventos_frontend\src\screens\NotificationsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      const resNotifs = await client.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resEvents = await client.get("/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifs(resNotifs.data || []);
      const processedEvents = (resEvents.data || []).map((e) => ({
        ...e,
        event_date: new Date(e.event_date),
        is_past: new Date(e.event_date) < new Date(),
      }));
      setAllEvents(processedEvents);
    } catch (err) {
      console.log("Error al cargar notificaciones o eventos:", err);
      Alert.alert("Error", "No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const eventObj = allEvents.find((e) => e.id === item.event_id);

    const newDate = new Date(item.new_date);
    const oldDate = new Date(item.old_date);

    const formattedNew =
      `${newDate.toLocaleDateString()} ` +
      `${newDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    const formattedOld =
      `${oldDate.toLocaleDateString()} ` +
      `${oldDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => {
          if (eventObj) {
            // Navegación dentro del stack de eventos
            navigation.navigate("EventsStack", {
              screen: "EventDetail",
              params: { event: eventObj },
            });
          } else {
            Alert.alert(
              "Aviso",
              "No se encontró información completa del evento."
            );
          }
        }}
      >
        <View style={styles.leftStripe} />

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Ionicons name="notifications-outline" size={20} color="#007AFF" />
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <View style={styles.datesRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.line}>Modificado: {formattedNew}</Text>
          </View>

          <View style={styles.datesRow}>
            <Ionicons name="time-outline" size={16} color="#4B5563" />
            <Text style={styles.sub}>Original: {formattedOld}</Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {notifs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#aaa" />
          <Text style={styles.emptyText}>No hay notificaciones.</Text>
        </View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item.event_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  leftStripe: {
    width: 4,
    backgroundColor: "#007AFF",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 6,
    flex: 1,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  line: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  sub: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 6,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
