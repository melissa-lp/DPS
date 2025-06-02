//eventos_frontend\src\screens\CreatedByMeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import client from "../api/client";

export default function CreatedByMeScreen({ navigation }) {
  const [myCreated, setMyCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchMyCreated();
    }
  }, [isFocused]);

  const fetchMyCreated = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get("/my-created-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCreated(res.data || []);
    } catch (err) {
      console.log("Error fetching my-created:", err);
      Alert.alert("Error", "No se pudo cargar tus eventos creados.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Título */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Fecha */}
        <Text style={styles.date}>
          {new Date(item.event_date).toLocaleDateString()}{" "}
          {new Date(item.event_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {/* Ubicación */}
        {item.location ? (
          <Text style={styles.location}>📍 {item.location}</Text>
        ) : null}

        {/* Descripción */}
        <Text style={styles.desc} numberOfLines={2}>
          {item.description || "Sin descripción."}
        </Text>

        <View style={styles.buttonsRow}>
          {/* Ver detalles */}
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() =>
              navigation.navigate("EventsStack", {
                screen: "EventDetail",
                params: { event: { ...item } },
              })
            }
          >
            <Text style={styles.buttonText}>Ver</Text>
          </TouchableOpacity>

          {/* Editar */}
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.navigate("EditEvent", { event: item })}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={[styles.buttonText, { marginLeft: 6 }]}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      {myCreated.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No has creado ningún evento aún.</Text>
        </View>
      ) : (
        <FlatList
          data={myCreated}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          showsVerticalScrollIndicator={false}
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
  },
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  desc: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  buttonSecondary: {
    backgroundColor: "#adb5bd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
