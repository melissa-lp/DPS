// eventos_frontend/src/screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45; // 65% del ancho de la pantalla
const AVATAR_URI = "https://ui-avatars.com/api/?name=User&background=ddd&color=333&size=128";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await client.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.card}>
        {/* Avatar circular */}
        <Image source={{ uri: AVATAR_URI }} style={styles.avatar} />

        {/* Nombre completo */}
        <Text style={styles.name}>
          {profile.first_name} {profile.last_name}
        </Text>

        {/* Username */}
        <Text style={styles.username}>@{profile.username}</Text>

        {/* Edad */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{profile.age}</Text>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─────────── Pantalla ───────────
  screenContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ─────────── Tarjeta principal ───────────
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ─────────── Avatar ───────────
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#EEE",
    marginBottom: 16,
  },

  // ─────────── Texto principal ───────────
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
    textAlign: "center",
  },
  username: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },

  // ─────────── Fila de información ───────────
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
    marginRight: 6,
  },
  value: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },

  // ─────────── Botón Cerrar Sesión ───────────
  logoutButton: {
    width: "50%",
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#00000",
    fontSize: 16,
    fontWeight: "600",
  },
});
