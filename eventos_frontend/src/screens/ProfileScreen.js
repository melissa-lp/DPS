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

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  let cardWidth = SCREEN_WIDTH * 0.85;
  if (SCREEN_WIDTH >= 768) {
    cardWidth = SCREEN_WIDTH * 0.6;
  } else if (SCREEN_WIDTH >= 1024) {
    cardWidth = SCREEN_WIDTH * 0.45;
  }

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
      {/* Título de sección */}
      <Text style={styles.sectionHeader}>Mi Perfil</Text>

      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.avatarBackground}>
          <Image
            source={{
              uri:
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile.first_name + " " + profile.last_name
                )}&background=ddd&color=333&size=128`,
            }}
            style={styles.avatar}
          />
        </View>

        {/* Nombre completo */}
        <Text style={styles.name}>
          {profile.first_name} {profile.last_name}
        </Text>

        {/* Username */}
        <Text style={styles.username}>@{profile.username}</Text>

        {/* Edad */}
        {profile.age != null && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{profile.age}</Text>
          </View>
        )}

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  avatarBackground: {
    backgroundColor: "#E3F2FD",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  // Avatar
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#EEE",
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  username: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },

  // Info de perfil
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
    marginRight: 6,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },

  // Cerrar Sesión
  logoutButton: {
    width: "60%",
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
