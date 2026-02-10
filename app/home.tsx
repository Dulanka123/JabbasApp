import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  // Data ගන්න කොටස (Real-time updates)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const menuList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(menuList);
    });
    return unsubscribe;
  }, []);

  // Data මකන කොටස
  const handleDelete = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "menu", id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jabba's Menu 🍔</Text>

      <Button title="+ Add New Item" onPress={() => router.push('/add')} />

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.price}>Rs. {item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: 'white' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 8, elevation: 2, alignItems: 'center' },
  foodName: { fontSize: 18, fontWeight: 'bold' },
  price: { color: 'gray' },
  deleteBtn: { backgroundColor: 'red', padding: 8, borderRadius: 5 }
});