import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Title, Text, TextInput, Button, Card, Paragraph, ActivityIndicator } from 'react-native-paper';
import { generateFormWithAI } from '../../lib/api';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GenerateScreen() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a description of the form you want to create.');
      return;
    }

    setLoading(true);
    try {
      const generatedForm = await generateFormWithAI(prompt);
      
      // Show success message
      Alert.alert(
        'Form Generated!',
        `Your form "${generatedForm.title}" has been created successfully.`,
        [
          {
            text: 'View Form',
            onPress: () => {
              // Navigate to the form detail page
              router.push({ pathname: '/form-detail', params: { id: generatedForm._id } });
              // Clear the prompt
              setPrompt('');
            },
          },
          {
            text: 'Generate Another',
            onPress: () => {
              setPrompt('');
            },
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Generation Failed', error.message || 'Failed to generate form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="robot" size={48} color="#6200ee" />
          <Title style={styles.title}>Generate Form with AI</Title>
          <Paragraph style={styles.subtitle}>
            Describe the form you want to create, and AI will generate it for you.
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Describe your form</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g., Create a customer feedback form with name, email, rating, and comments"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={6}
              style={styles.input}
              disabled={loading}
            />
            
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Examples:</Text>
              <Text style={styles.exampleText}>
                • "Event registration form with attendee information"
              </Text>
              <Text style={styles.exampleText}>
                • "Product survey with multiple choice and rating scales"
              </Text>
              <Text style={styles.exampleText}>
                • "Job application form with file upload"
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleGenerate}
          loading={loading}
          disabled={loading || !prompt.trim()}
          style={styles.generateButton}
          icon="sparkles"
        >
          {loading ? 'Generating...' : 'Generate Form'}
        </Button>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>AI is creating your form...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  exampleContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  exampleTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  generateButton: {
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
