import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Avatar, ActivityIndicator, Button, Text, Chip } from 'react-native-paper';
import { getUserProfile, getForms } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [userData, formsData] = await Promise.all([
        getUserProfile(),
        getForms()
      ]);
      setUser(userData);
      // Ensure formsData is an array (handle API response structure)
      setForms(Array.isArray(formsData) ? formsData : formsData.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/signin');
  };

  const navigateToForm = (id: string) => {
    router.push({ pathname: '/form-detail', params: { id } });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Title style={styles.userName}>{user?.name || 'User'}</Title>
          </View>
          <Avatar.Text 
            size={45} 
            label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'} 
            style={styles.avatar}
          />
        </View>

        {/* My Forms Section */}
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>My Forms</Title>
          <Chip icon="file-document-outline">{forms.length} Forms</Chip>
        </View>

        {/* Forms List */}
        {forms.length > 0 ? (
          forms.map((form) => (
            <TouchableOpacity key={form._id} onPress={() => navigateToForm(form._id)}>
              <Card style={styles.formCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.formTitle} numberOfLines={1}>{form.title}</Title>
                    {form.aiGenerated && (
                      <MaterialCommunityIcons name="robot" size={16} color="#6200ee" />
                    )}
                  </View>
                  <Paragraph style={styles.formDesc} numberOfLines={2}>
                    {form.description || 'No description'}
                  </Paragraph>
                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      {new Date(form.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{form.status || 'Draft'}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No forms created yet.</Text>
            <Text style={styles.emptySubText}>Tap the + button to generate your first AI form.</Text>
          </View>
        )}

        {/* Temporary Logout for testing */}
        <Button onPress={handleLogout} style={styles.logoutButton} mode="text" textColor="#d32f2f">
          Logout
        </Button>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
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
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formCard: {
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  formDesc: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 40,
    marginBottom: 20,
  },
});
