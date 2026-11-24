import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F1E8" />
      <View style={styles.container}>
        <Text style={styles.title}>POS Mie Ayam</Text>
        <Text style={styles.subtitle}>Pak De Surya</Text>
        <Text style={styles.note}>Fondasi React Native + TypeScript siap. Migrasi fitur dari aplikasi 3.2.0 dilakukan bertahap setelah kontrak API dan penyimpanan lokal disiapkan.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F7F1E8'},
  container: {flex: 1, justifyContent: 'center', padding: 24},
  title: {fontSize: 28, fontWeight: '800', color: '#493326'},
  subtitle: {fontSize: 18, color: '#8A684E', marginTop: 4},
  note: {fontSize: 14, lineHeight: 22, color: '#65564C', marginTop: 24},
});
