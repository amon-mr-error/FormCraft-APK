import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Title, Text, Card, Paragraph, Chip, Divider, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getResponseDetail } from '../lib/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResponseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchResponseDetail();
    }
  }, [id]);

  const fetchResponseDetail = async () => {
    try {
      const data = await getResponseDetail(id as string);
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch response detail', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!response) {
    return (
      <View style={styles.container}>
        <Text>Response not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => router.back()} style={styles.backButton}>
          Back
        </Button>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.title}>Response Details</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Respondent:</Text>
            <Text style={styles.value}>{response.respondent?.name || 'Anonymous'}</Text>
          </View>
          
          {response.respondent?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{response.respondent.email}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Submitted:</Text>
            <Text style={styles.value}>{new Date(response.createdAt).toLocaleString()}</Text>
          </View>

          {response.ipAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>IP Address:</Text>
              <Text style={styles.value}>{response.ipAddress}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Responses</Title>
      
      {response.responses?.map((resp: any, index: number) => (
        <Card key={index} style={styles.responseCard}>
          <Card.Content>
            <Text style={styles.questionLabel}>{resp.elementId}</Text>
            <Divider style={styles.miniDivider} />
            <View style={styles.answerContainer}>
              {Array.isArray(resp.value) ? (
                resp.value.map((val: any, i: number) => (
                  <Chip key={i} style={styles.chip}>{val}</Chip>
                ))
              ) : (
                <Text style={styles.answerText}>{resp.value || 'No answer'}</Text>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}

      {response.aiAnalysis && (
        <Card style={styles.aiCard}>
          <Card.Content>
            <View style={styles.aiHeader}>
              <MaterialCommunityIcons name="robot" size={24} color="#6200ee" />
              <Title style={styles.aiTitle}>AI Analysis</Title>
            </View>
            <Paragraph>{response.aiAnalysis}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {response.metadata && (
        <Card style={styles.metadataCard}>
          <Card.Content>
            <Title style={styles.metadataTitle}>Additional Info</Title>
            {response.metadata.device && (
              <Text style={styles.metadataText}>Device: {response.metadata.device}</Text>
            )}
            {response.metadata.browser && (
              <Text style={styles.metadataText}>Browser: {response.metadata.browser}</Text>
            )}
            {response.metadata.timeSpent && (
              <Text style={styles.metadataText}>Time Spent: {response.metadata.timeSpent}s</Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
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
  backButton: {
    marginLeft: -10,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  miniDivider: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  responseCard: {
    marginBottom: 12,
    backgroundColor: 'white',
    elevation: 1,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  answerContainer: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  aiCard: {
    marginTop: 20,
    backgroundColor: '#f3e5f5',
    elevation: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    marginLeft: 8,
    fontSize: 18,
    color: '#6200ee',
  },
  metadataCard: {
    marginTop: 20,
    backgroundColor: '#fff8e1',
    elevation: 1,
  },
  metadataTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
