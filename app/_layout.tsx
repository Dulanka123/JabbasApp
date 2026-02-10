import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="add-menu-item" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="add-order" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="home" />
      <Stack.Screen name="add" />
    </Stack>
  );
}