// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, TextInput, View, Button, LogBox } from "react-native";

import * as firebase from "firebase";
import "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB69-rgViuFWGIYTno9FXe4D-UEirSDmJs",
  authDomain: "reactnativefirebase-88ae3.firebaseapp.com",
  projectId: "reactnativefirebase-88ae3",
  storageBucket: "reactnativefirebase-88ae3.appspot.com",
  messagingSenderId: "265228489033",
  appId: "1:265228489033:web:226f55ba06942f88184a98",
  measurementId: "G-X62PXX0SR3",
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics();
}

LogBox.ignoreAllLogs(["Setting a timer for a long period of time"]);

const db = firebase.firestore();
const chatRef = db.collection("chats");

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  async function readuser() {
    const user = await await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }
  useEffect(() => {
    readuser();
    const unsubscribe = chatRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMsg(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMsg = useCallback(
    (message) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, message)
      );
    },
    [messages]
  );

  async function handelePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }
  async function handleSend(messages) {
    const writes = messages.map((m) => chatRef.add(m));
    await Promise.all(writes);
  }
  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <Button title="Enter to chat" onPress={handelePress} />
      </View>
    );
  }
  return <GiftedChat messages={messages} user={user} onSend={handleSend} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: "gray",
  },
});
