import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider, Title, Button } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { checkHealth } from '../lib/api';

export default function RootLayout(): JSX.Element {
  const [checking, setChecking] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;
    const initApp = async () => {
      try {
        // 1. Check Backend Health
        const online = await checkHealth();
        if (!mounted) return;

        if (!online) {
          setIsBackendOnline(false);
          setChecking(false);
          return;
        }
        setIsBackendOnline(true);

        // 2. Check Auth
        const token = await AsyncStorage.getItem('token');
        const onAuthPage = segments[0] === 'signin' || segments[0] === 'signup';

        if (!token) {
          if (!onAuthPage) router.replace('/signin');
        } else {
          if (onAuthPage) router.replace('/');
        }
      } catch (e) {
        console.error(e);
        // Fallback to signin on error
        if (segments[0] !== 'signin' && segments[0] !== 'signup') router.replace('/signin');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    initApp();

    return () => {
      mounted = false;
    };
  }, [router, segments]);

  if (checking) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  if (!isBackendOnline) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <View style={styles.maintenanceContainer}>
            <Title style={styles.maintenanceTitle}>Backend Offline</Title>
            <Text style={styles.maintenanceText}>Maintenance Ongoing. Please try again later.</Text>
            <Button mode="contained" onPress={() => { setChecking(true); setIsBackendOnline(true); }} style={styles.retryButton}>
              Retry Connection
            </Button>
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  maintenanceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  maintenanceTitle: { fontSize: 24, fontWeight: 'bold', color: '#d32f2f', marginBottom: 10 },
  maintenanceText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryButton: { marginTop: 10 },
});