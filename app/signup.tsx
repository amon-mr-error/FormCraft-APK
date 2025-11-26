import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { registerRequest, loginRequest } from '../lib/api';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) return Alert.alert('Validation', 'Please fill all fields.');
    setLoading(true);
    try {
      await registerRequest(name, email, password);
      const login = await loginRequest(email, password);
      const token = login.token || login.accessToken || login.jwt;
      if (!token) throw new Error('Token not returned by server after register');
      await AsyncStorage.setItem('token', token);
      router.replace('/');
    } catch (err: any) {
      const message = err?.message || err?.msg || JSON.stringify(err);
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Title style={styles.title}>Create account</Title>
        <TextInput label="Full name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <Button mode="contained" onPress={handleSignUp} loading={loading} style={styles.button}>
          Create account
        </Button>
        <Button onPress={() => router.push('/signin')} style={styles.link}>
          Already have an account? Sign in
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