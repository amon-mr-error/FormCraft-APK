import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Share, Alert, Platform } from 'react-native';
import { Title, Text, Card, Paragraph, Chip, Divider, Button, Menu } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFormDetail } from '../lib/api';
import * as Clipboard from 'expo-clipboard';

export default function FormDetailScreen() {
    const { id } = useLocalSearchParams();
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
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
        } catch (error) {
            console.error('Failed to fetch form detail', error);
        } finally {
            setLoading(false);
        }
    };

    const getShareUrl = () => {
        // Point to the frontend form viewing page, not the backend API
        // If you have a separate frontend URL, replace this with your frontend domain
        const frontendUrl = 'https://dynamic-form-builder.netlify.app'; // Update this with your actual frontend URL
        return `${frontendUrl}/form/${id}`;
    };

    const handleCopyLink = async () => {
        const url = getShareUrl();
        await Clipboard.setStringAsync(url);
        Alert.alert('Success', 'Link copied to clipboard!');
        setMenuVisible(false);
    };

    const handleShare = async () => {
        try {
            const url = getShareUrl();
            const result = await Share.share({
                message: `Check out this form: ${form?.title}\n${url}`,
                url: url,
                title: form?.title || 'Form',
            });
            setMenuVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to share');
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
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Button icon="arrow-left" mode="text" onPress={() => router.back()} style={styles.backButton}>
                    Back
                </Button>
                <Chip icon="information" style={styles.statusChip}>{form.status || 'Draft'}</Chip>
            </View>

            <Title style={styles.title}>{form.title}</Title>
            <Paragraph style={styles.description}>{form.description || 'No description provided.'}</Paragraph>

            <View style={styles.shareSection}>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button 
                            mode="contained" 
                            icon="share-variant" 
                            onPress={() => setMenuVisible(true)}
                            style={styles.shareButton}
                        >
                            Share Form
                        </Button>
                    }
                >
                    <Menu.Item onPress={handleShare} leadingIcon="share" title="Share via..." />
                    <Menu.Item onPress={handleCopyLink} leadingIcon="content-copy" title="Copy Link" />
                </Menu>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>Form Elements ({form.elements?.length || 0})</Title>
                <Button
                    mode="contained"
                    icon="pencil"
                    onPress={() => router.push({ pathname: '/form-builder', params: { id: form._id } })}
                    style={styles.editButton}
                >
                    Edit Form
                </Button>
            </View>

            {form.elements?.map((element: any, index: number) => (
                <Card key={index} style={styles.elementCard}>
                    <Card.Content>
                        <View style={styles.elementHeader}>
                            <Text style={styles.elementLabel}>{element.label}</Text>
                            <Chip textStyle={{ fontSize: 10 }} style={styles.typeChip}>{element.type}</Chip>
                        </View>
                        {element.placeholder && (
                            <Text style={styles.placeholder}>Placeholder: {element.placeholder}</Text>
                        )}
                        {element.options && element.options.length > 0 && (
                            <View style={styles.optionsContainer}>
                                <Text style={styles.optionsTitle}>Options:</Text>
                                {element.options.map((opt: any, i: number) => (
                                    <Text key={i} style={styles.option}>• {opt.label}</Text>
                                ))}
                            </View>
                        )}
                        {element.validation?.required && (
                            <Text style={styles.requiredText}>* Required</Text>
                        )}
                    </Card.Content>
                </Card>
            ))}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Created: {new Date(form.createdAt).toLocaleDateString()}</Text>
                {form.aiGenerated && <Chip icon="robot" style={styles.aiChip}>AI Generated</Chip>}
            </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        marginLeft: -10,
    },
    statusChip: {
        backgroundColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: 24,
    },
    shareSection: {
        marginBottom: 20,
    },
    shareButton: {
        backgroundColor: '#6200ee',
    },
    divider: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
    elementCard: {
        marginBottom: 12,
        backgroundColor: 'white',
        elevation: 2,
    },
    elementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    elementLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    typeChip: {
        height: 24,
    },
    placeholder: {
        color: '#888',
        fontStyle: 'italic',
        marginTop: 4,
    },
    optionsContainer: {
        marginTop: 8,
        paddingLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#eee',
    },
    optionsTitle: {
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 4,
    },
    option: {
        fontSize: 12,
        color: '#555',
    },
    requiredText: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: 8,
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: 12,
    },
    aiChip: {
        backgroundColor: '#e3f2fd',
    },
});
