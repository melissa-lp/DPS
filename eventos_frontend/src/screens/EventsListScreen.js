// eventos_frontend/src/screens/EventsListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const { width } = Dimensions.get("window");
const PROFILE_WIDTH = width * 0.25; // 25% para la columna de perfil en pantallas anchas
const AVATAR_SIZE = 80;
const CARD_MARGIN = 16;

/**
 * Función para formatear una fecha en español: "DD-mes-AAAA"
 * Ejemplo: 1-mayo-2025
 */
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

/**
 * EventCard: tarjeta individual de evento
 * - Muestra título, fecha (formateada), ubicación, descripción
 * - Si está en el pasado, muestra etiqueta “📌 Pasado”
 * - Botón “Ver evento” que llama a onPress
 * - Ancho al 100% del espacio interior de su contenedor
 * - Para web, habilita hover que cambia fondo y sombra
 */
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
      // Solo en web: onMouseEnter y onMouseLeave para hover
      {...(Platform.OS === "web"
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          }
        : {})}
    >
      <View style={cardStyle}>
        {/** TÍTULO (más grande) **/}
        <Text style={styles.cardTitle}>{event.title}</Text>

        {/** FECHA formateada sin hora **/}
        <Text style={styles.cardDate}>
          {formatSpanishDate(event.event_date)}
        </Text>

        {/** UBICACIÓN (si existe) **/}
        {event.location ? (
          <Text style={styles.cardLocation}>📍 {event.location}</Text>
        ) : null}

        {/** DESCRIPCIÓN (hasta 2 líneas) **/}
        <Text style={styles.cardDesc} numberOfLines={2}>
          {event.description || "Sin descripción."}
        </Text>

        {/** Etiqueta “Pasado” si corresponde **/}
        {isPast && <Text style={styles.pastLabel}>📌 Pasado</Text>}

        {/** BOTÓN “Ver evento” **/}
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

  const [activeTab, setActiveTab] = useState("Proximos"); // "Proximos" | "Pasados" | "Borradores"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        // 1) Obtener perfil
        const profileRes = await client.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);

        // 2) Obtener eventos
        const res = await client.get("/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const processedEvents = res.data.map((event) => ({
          ...event,
          event_date: new Date(event.event_date),
          is_past: new Date(event.event_date) < new Date(),
          is_draft: event.status === "draft", // asume que el backend usa status="draft"
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Hubo un problema al cargar tu perfil.{"\n"}Por favor, vuelve a iniciar
          sesión.
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
      </View>
    );
  }

  // Filtrar eventos según su estado
  const proximos = events.filter((e) => !e.is_past && !e.is_draft);
  const pasados = events.filter((e) => e.is_past && !e.is_draft);
  const borradores = events.filter((e) => e.is_draft);

  return (
    <View style={styles.screenContainer}>
      {/** ─────── Columna Izquierda: Perfil + Menú ─────── **/}
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

        {/** Botones de menú (sin funcionalidad) **/}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="home-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="search-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Explorar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="add-circle-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="mail-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Bandeja de entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <Text style={[styles.menuText, styles.menuTextActive]}>
              Mis eventos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/** ─────── Columna Derecha: Pestañas de Eventos ─────── **/}
      <View style={styles.eventsColumn}>
        {/** Contenedor de pestañas (Próximos / Pasados / Borradores) **/}
        <View style={styles.tabsContainer}>
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
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "Borradores" && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab("Borradores")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Borradores" && styles.tabTextActive,
              ]}
            >
              Borradores
            </Text>
          </TouchableOpacity>
        </View>

        {/** Contenido de la pestaña activa **/}
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* ────────────────────────── PESTAÑA “Pasados” ────────────────────────── */}
          {activeTab === "Pasados" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Eventos pasados</Text>
              {pasados.length > 0 ? (
                pasados.map((e) => (
                  <EventCard
                    key={e.id.toString()}
                    event={e}
                    onPress={() =>
                      navigation.navigate("EventDetail", { event: e })
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

          {/* ────────────────────────── PESTAÑA “Próximos” ────────────────────────── */}
          {activeTab === "Proximos" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Próximos eventos</Text>
              {proximos.length > 0 ? (
                proximos.map((e) => (
                  <EventCard
                    key={e.id.toString()}
                    event={e}
                    onPress={() =>
                      navigation.navigate("EventDetail", { event: e })
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

          {/* ────────────────────────── PESTAÑA “Borradores” ────────────────────────── */}
          {activeTab === "Borradores" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Borradores</Text>
              {borradores.length > 0 ? (
                borradores.map((e) => (
                  <EventCard
                    key={e.id.toString()}
                    event={e}
                    onPress={() =>
                      navigation.navigate("EventDetail", { event: e })
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

        {/** Botón flotante para crear evento **/}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateEvent")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─────────── Pantalla principal ───────────
  screenContainer: {
    flex: 1,
    flexDirection: width > 700 ? "row" : "column",
    backgroundColor: "#F7F9FC",
    // Si usas React Native Web y aún no ocupa todo:
    // minHeight: "100vh",
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

  // ───────── Columna Izquierda: Perfil + Menú ─────────
  profileColumn: {
    width: width > 700 ? PROFILE_WIDTH : "100%",
    paddingTop: CARD_MARGIN / 2,
    paddingBottom: CARD_MARGIN / 2,
    paddingHorizontal: CARD_MARGIN / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#EEE",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  profileUsername: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },

  menuContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
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

  // ───────── Columna Derecha: Pestañas de Eventos ─────────
  eventsColumn: {
    flex: 1,
    paddingHorizontal: CARD_MARGIN / 2,
    backgroundColor: "#F7F9FC",
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: CARD_MARGIN / 2,
    marginBottom: CARD_MARGIN / 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
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

  // ───────── Sección de eventos (bloque único por pestaña) ─────────
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: CARD_MARGIN / 2, // padding horizontal igual al de eventsColumn
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 8,
  },

  // ───────── Tarjetas de evento ─────────
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    // Ahora la card ocupa el 100% del espacio interior de sectionContainer
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPast: {
    opacity: 0.6,
  },
  cardHover: {
    backgroundColor: "#F0F9FF", // ligero fondo al pasar el mouse
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20, // título más grande
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 15, // un poco más grande que antes
    color: "rgba(0,0,0,0.6)",
    marginBottom: 8,
  },
  pastLabel: {
    fontSize: 12,
    color: "#A00",
    fontWeight: "600",
    marginBottom: 8,
  },
  viewButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ───────── Botón flotante (“+”) ─────────
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
