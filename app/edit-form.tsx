import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Title, Text, TextInput, Button, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFormDetail, updateForm } from '../lib/api';

export default function EditFormScreen() {
  const { id } = useLocalSearchParams();
  const [form, setForm] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchFormDetail();
    }
  }, [id]);

  const fetchFormDetail = async () => {
    try {
      const data = await getFormDetail(id as string);
      setForm(data);
      setTitle(data.title);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Failed to fetch form detail', error);
      Alert.alert('Error', 'Failed to load form details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Form title is required');
      return;
    }

    setSaving(true);
    try {
      await updateForm(id as string, {
        title,
        description,
        elements: form.elements,
        settings: form.settings,
        status: form.status,
      });
      
      Alert.alert('Success', 'Form updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.container}>
        <Text>Form not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button icon="arrow-left" mode="text" onPress={() => router.back()} style={styles.backButton}>
            Back
          </Button>
          <Chip style={styles.statusChip}>{form.status || 'Draft'}</Chip>
        </View>

        <Title style={styles.pageTitle}>Edit Form</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Form Title *</Text>
            <TextInput
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter form title"
              style={styles.input}
              disabled={saving}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter form description (optional)"
              multiline
              numberOfLines={4}
              style={styles.input}
              disabled={saving}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Form Elements</Title>
            <Text style={styles.elementsInfo}>
              This form has {form.elements?.length || 0} elements. 
              Advanced element editing coming soon.
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Changes
        </Button>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginLeft: -10,
  },
  statusChip: {
    backgroundColor: '#e0e0e0',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    elevation: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  elementsInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  saveButton: {
    paddingVertical: 8,
    backgroundColor: '#6200ee',
    marginTop: 10,
  },
});
