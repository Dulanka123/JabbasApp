import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function AddItem() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // 'menu' කියන collection එකට data දානවා
      await addDoc(collection(db, "menu"), {
        name: name,
        price: price
      });
      Alert.alert("Success", "Item Added!");
      router.back(); // ආපහු Home එකට යන්න
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Food 🍕</Text>

      <TextInput placeholder="Food Name (e.g. Kottu)" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Price (e.g. 1500)" style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Button title="Save Item" onPress={handleSave} color="green" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});