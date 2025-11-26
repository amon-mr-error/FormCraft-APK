import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Text, Chip, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFormResponses, getFormDetail } from '../lib/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FormResponsesScreen() {
  const { formId } = useLocalSearchParams();
  const [responses, setResponses] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [formData, responsesData] = await Promise.all([
        getFormDetail(formId as string),
        getFormResponses(formId as string)
      ]);
      setForm(formData);
      setResponses(responsesData.responses || []);
    } catch (error) {
      console.error('Failed to fetch responses', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchData();
    }
  }, [formId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const navigateToResponseDetail = (id: string) => {
    router.push({ pathname: '/response-detail', params: { id } });
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
          <Paragraph style={styles.headerSubtitle}>For: {form?.title}</Paragraph>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{responses.length}</Text>
              <Text style={styles.statLabel}>Total Responses</Text>
            </Card.Content>
          </Card>
        </View>

        {responses.length > 0 ? (
          responses.map((response) => (
            <TouchableOpacity key={response._id} onPress={() => navigateToResponseDetail(response._id)}>
              <Card style={styles.responseCard}>
                <Card.Content>
                  <View style={styles.responseHeader}>
                    <View style={styles.respondentInfo}>
                      <Avatar.Text 
                        size={32} 
                        label={response.respondent?.name ? response.respondent.name.substring(0, 1).toUpperCase() : 'A'} 
                        style={styles.avatar}
                      />
                      <View style={styles.respondentText}>
                        <Text style={styles.respondentName}>
                          {response.respondent?.name || 'Anonymous'}
                        </Text>
                        <Text style={styles.respondentEmail}>
                          {response.respondent?.email || 'No email'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(response.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {response.aiAnalysis && (
                    <View style={styles.aiBadge}>
                      <MaterialCommunityIcons name="robot" size={14} color="#6200ee" />
                      <Text style={styles.aiText}>AI Analyzed</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No responses yet.</Text>
            <Text style={styles.emptySubText}>Share your form to start collecting responses.</Text>
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
    paddingTop: 40,
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
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    color: '#666',
  },
  responseCard: {
    marginBottom: 12,
    backgroundColor: 'white',
    elevation: 1,
    borderRadius: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  respondentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  respondentText: {
    justifyContent: 'center',
  },
  respondentName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  respondentEmail: {
    fontSize: 12,
    color: '#888',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
  },
  aiText: {
    fontSize: 10,
    color: '#6200ee',
    marginLeft: 4,
    fontWeight: 'bold',
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
});
