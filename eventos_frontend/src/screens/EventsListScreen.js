// eventos_frontend/src/screens/EventsListScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";
import { useWindowDimensions } from "react-native";

function formatSpanishDate(date) {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${day}-${monthNames[monthIndex]}-${year}`;
}

function EventCard({ event, onPress }) {
  const [isHovered, setIsHovered] = useState(false);
  const isPast = event.is_past;

  const cardStyle = [
    styles.card,
    isPast && styles.cardPast,
    isHovered && styles.cardHover,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
      {...(Platform.OS === "web"
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          }
        : {})}
    >
      <View style={cardStyle}>
        <Text style={styles.cardTitle}>{event.title}</Text>

        <Text style={styles.cardDate}>
          {formatSpanishDate(event.event_date)}
        </Text>

        {event.location ? (
          <Text style={styles.cardLocation}>📍 {event.location}</Text>
        ) : null}

        <Text style={styles.cardDesc} numberOfLines={2}>
          {event.description || "Sin descripción."}
        </Text>

        {isPast && <Text style={styles.pastLabel}>📌 Pasado</Text>}

        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>Ver evento</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsListScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [activeTab, setActiveTab] = useState("Proximos");

  const { width } = useWindowDimensions();
  const isDesktop = width > 700;
  const [isMenuOpen, setIsMenuOpen] = useState(isDesktop);

  useEffect(() => {
    setIsMenuOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const profileRes = await client.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);

        const res = await client.get("/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const processedEvents = res.data.map((event) => ({
          ...event,
          event_date: new Date(event.event_date),
          is_past: new Date(event.event_date) < new Date(),
        }));
        setEvents(processedEvents);
      } catch (err) {
        console.log("Error fetching data:", err);
        if (err.response?.status === 401) {
          setProfileError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (profileError || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>
          Hubo un problema al cargar tu perfil.{"\n"}
          Por favor, vuelve a iniciar sesión.
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem("userToken");
            navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
          }}
        >
          <Text style={styles.logoutText}>Ir a Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const proximos = events.filter((e) => !e.is_past);
  const pasados = events.filter((e) => e.is_past);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.screenContainer}>
        {!isDesktop && (
          <View style={styles.mobileHeader}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Ionicons name="menu-outline" size={32} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mobileHeaderTitle}>Eventos</Text>
            <View style={{ width: 32 }} />
          </View>
        )}

        {/** ── SIDEBAR ── **/}
        {isDesktop ? (
          <View style={styles.profileColumn}>
            <View style={styles.profileCard}>
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
              <Text style={styles.profileName}>
                {profile.first_name} {profile.last_name}
              </Text>
              <Text style={styles.profileUsername}>@{profile.username}</Text>
            </View>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate("Home")}
              >
                <Ionicons name="home-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Inicio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="search-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Explorar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate("CreateEvent")}
              >
                <Ionicons name="add-circle-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Crear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="mail-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Bandeja de entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemActive]}
                onPress={() => navigation.navigate("MyEvents")}
              >
                <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                <Text style={[styles.menuText, styles.menuTextActive]}>
                  Mis eventos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Modal
            visible={isMenuOpen}
            transparent={true}
            animationType="none"
            onRequestClose={() => setIsMenuOpen(false)}
          >
            <TouchableOpacity
              style={styles.overlayBackground}
              activeOpacity={1}
              onPress={() => setIsMenuOpen(false)}
            />
            <View
              style={[
                styles.modalMenu,
                isMenuOpen ? styles.modalMenuOpen : styles.modalMenuClosed,
              ]}
            >
              <SafeAreaView style={styles.modalMenuContent}>
                <View style={styles.profileCard}>
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
                  <Text style={styles.profileName}>
                    {profile.first_name} {profile.last_name}
                  </Text>
                  <Text style={styles.profileUsername}>
                    @{profile.username}
                  </Text>
                </View>
                <View style={styles.menuContainer}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      navigation.navigate("Home");
                    }}
                  >
                    <Ionicons name="home-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>Inicio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="search-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>Explorar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      navigation.navigate("CreateEvent");
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#333"
                    />
                    <Text style={styles.menuText}>Crear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="mail-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>Bandeja de entrada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemActive]}
                    onPress={() => {
                      setIsMenuOpen(false);
                      navigation.navigate("MyEvents");
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#007AFF"
                    />
                    <Text style={[styles.menuText, styles.menuTextActive]}>
                      Eventos asistidos
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        )}

        {/** ── CONTENIDO PRINCIPAL ── **/}
        <View style={styles.eventsColumn}>
          <View
            style={[
              styles.tabsContainer,
              !isDesktop && styles.tabsContainerMobile,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === "Proximos" && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab("Proximos")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Proximos" && styles.tabTextActive,
                ]}
              >
                Próximos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === "Pasados" && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab("Pasados")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Pasados" && styles.tabTextActive,
                ]}
              >
                Pasados
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "Pasados" && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Eventos pasados</Text>
                {pasados.length > 0 ? (
                  pasados.map((e) => (
                    <EventCard
                      key={e.id.toString()}
                      event={e}
                      onPress={() =>
                        navigation.navigate("EventDetail", {
                          event: e,
                        })
                      }
                    />
                  ))
                ) : (
                  <Text style={styles.noEventsText}>
                    No hay eventos en esta sección
                  </Text>
                )}
              </View>
            )}

            {activeTab === "Proximos" && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Próximos eventos</Text>
                {proximos.length > 0 ? (
                  proximos.map((e) => (
                    <EventCard
                      key={e.id.toString()}
                      event={e}
                      onPress={() =>
                        navigation.navigate("EventDetail", {
                          event: e,
                        })
                      }
                    />
                  ))
                ) : (
                  <Text style={styles.noEventsText}>
                    No hay eventos en esta sección
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {!isDesktop && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate("CreateEvent")}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  screenContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F7F9FC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
  errorText: {
    fontSize: 16,
    color: "#A00",
    textAlign: "center",
    marginBottom: 16,
  },

  mobileHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  profileColumn: {
    width: 240,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#EEE",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  menuContainer: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: "#E5F1FF",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  menuTextActive: {
    color: "#007AFF",
    fontWeight: "700",
  },

  overlayBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  modalMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    zIndex: 101,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalMenuContent: {
    flex: 1,
  },

  eventsColumn: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 5,
  },
  tabsContainerMobile: {
    marginTop: 56,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    minHeight: 50,
  },
  tabItemActive: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  noEventsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 32,
    fontStyle: "italic",
  },

  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardPast: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  cardHover: {
    backgroundColor: "#F0F9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 28,
  },
  cardDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  cardLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    fontWeight: "500",
  },
  cardDesc: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 22,
  },
  pastLabel: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  viewButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  logoutButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
