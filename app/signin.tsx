import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { loginRequest } from '../lib/api';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return Alert.alert('Validation', 'Please enter email and password.');
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      const token = data.token || data.accessToken || data.jwt;
      if (!token) throw new Error('Token not returned by server');
      await AsyncStorage.setItem('token', token);
      router.replace('/'); // go to app root
    } catch (err: any) {
      const message = err?.message || err?.msg || JSON.stringify(err);
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Title style={styles.title}>Sign in</Title>
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <Button mode="contained" onPress={handleSignIn} loading={loading} style={styles.button}>
          Sign in
        </Button>
        <Button onPress={() => router.push('/signup')} style={styles.link}>
          Create an account
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, elevation: 2 },
  title: { marginBottom: 8, textAlign: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  link: { marginTop: 6 },
});