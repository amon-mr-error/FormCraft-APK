import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { getForms } from '../../lib/api';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResponsesScreen() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchForms = async () => {
    try {
      const data = await getForms();
      setForms(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch forms', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const navigateToFormResponses = (formId: string) => {
    router.push({ pathname: '/form-responses', params: { formId } });
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
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Responses</Title>
          <Text style={styles.headerSubtitle}>View responses from your forms</Text>
        </View>

        {forms.length > 0 ? (
          forms.map((form) => (
            <TouchableOpacity key={form._id} onPress={() => navigateToFormResponses(form._id)}>
              <Card style={styles.formCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                      <Title style={styles.formTitle} numberOfLines={1}>{form.title}</Title>
                      {form.aiGenerated && (
                        <MaterialCommunityIcons name="robot" size={16} color="#6200ee" style={styles.aiIcon} />
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                  </View>
                  <Text style={styles.formDesc} numberOfLines={2}>
                    {form.description || 'No description'}
                  </Text>
                  <View style={styles.statsRow}>
                    <Chip icon="file-document-outline" style={styles.chip}>
                      {form.elements?.length || 0} Questions
                    </Chip>
                    <Chip icon="chart-bar" style={styles.chip}>
                      View Responses
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No forms available.</Text>
            <Text style={styles.emptySubText}>Create a form first to collect responses.</Text>
          </View>
        )}
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
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
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
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  aiIcon: {
    marginLeft: 8,
  },
  formDesc: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    height: 28,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
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
});
