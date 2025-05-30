// eventos_frontend\src\screens\EventsListScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export default function EventsListScreen() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const res = await client.get("/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    };
    fetchEvents();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay eventos</Text>}
      />
    </View>
  );
}
