import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Title, Text, Button, Card, ActivityIndicator, FAB, Portal, Modal, TextInput, Chip, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFormDetail, updateForm } from '../lib/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ELEMENT_TYPES = [
    { value: 'text', label: 'Text Input', icon: 'form-textbox' },
    { value: 'textarea', label: 'Text Area', icon: 'text-box-outline' },
    { value: 'number', label: 'Number', icon: 'numeric' },
    { value: 'email', label: 'Email', icon: 'email-outline' },
    { value: 'select', label: 'Dropdown', icon: 'form-dropdown' },
    { value: 'radio', label: 'Radio', icon: 'radiobox-marked' },
    { value: 'checkbox', label: 'Checkbox', icon: 'checkbox-marked-outline' },
    { value: 'date', label: 'Date', icon: 'calendar' },
    { value: 'rating', label: 'Rating', icon: 'star-outline' },
];

export default function FormBuilderScreen() {
    const { id } = useLocalSearchParams();
    const [form, setForm] = useState<any>(null);
    const [elements, setElements] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingElement, setEditingElement] = useState<any>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const router = useRouter();

    // Element form state
    const [elementType, setElementType] = useState('text');
    const [elementLabel, setElementLabel] = useState('');
    const [elementPlaceholder, setElementPlaceholder] = useState('');
    const [elementRequired, setElementRequired] = useState(false);
    const [elementOptions, setElementOptions] = useState<string[]>([]);
    const [optionInput, setOptionInput] = useState('');

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
            setElements(data.elements || []);
        } catch (error) {
            console.error('Failed to fetch form detail', error);
            Alert.alert('Error', 'Failed to load form details');
        } finally {
            setLoading(false);
        }
    };

    const openAddElementModal = () => {
        resetElementForm();
        setEditingElement(null);
        setEditingIndex(-1);
        setModalVisible(true);
    };

    const openEditElementModal = (element: any, index: number) => {
        setEditingElement(element);
        setEditingIndex(index);
        setElementType(element.type);
        setElementLabel(element.label);
        setElementPlaceholder(element.placeholder || '');
        setElementRequired(element.validation?.required || false);
        setElementOptions(element.options?.map((opt: any) => opt.label) || []);
        setModalVisible(true);
    };

    const resetElementForm = () => {
        setElementType('text');
        setElementLabel('');
        setElementPlaceholder('');
        setElementRequired(false);
        setElementOptions([]);
        setOptionInput('');
    };

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setElementOptions([...elementOptions, optionInput.trim()]);
            setOptionInput('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setElementOptions(elementOptions.filter((_, i) => i !== index));
    };

    const handleSaveElement = () => {
        if (!elementLabel.trim()) {
            Alert.alert('Validation', 'Element label is required');
            return;
        }

        const needsOptions = ['select', 'radio', 'checkbox'].includes(elementType);
        if (needsOptions && elementOptions.length === 0) {
            Alert.alert('Validation', 'Please add at least one option');
            return;
        }

        const newElement: any = {
            id: editingElement?.id || `element_${Date.now()}`,
            type: elementType,
            label: elementLabel,
            placeholder: elementPlaceholder,
            validation: {
                required: elementRequired,
            },
        };

        if (needsOptions) {
            newElement.options = elementOptions.map((label) => ({ label, value: label.toLowerCase() }));
        }

        if (editingIndex >= 0) {
            // Update existing element
            const updatedElements = [...elements];
            updatedElements[editingIndex] = newElement;
            setElements(updatedElements);
        } else {
            // Add new element
            setElements([...elements, newElement]);
        }

        setModalVisible(false);
        resetElementForm();
    };

    const handleDeleteElement = (index: number) => {
        Alert.alert(
            'Delete Element',
            'Are you sure you want to delete this element?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setElements(elements.filter((_, i) => i !== index));
                    },
                },
            ]
        );
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newElements = [...elements];
        [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
        setElements(newElements);
    };

    const handleMoveDown = (index: number) => {
        if (index === elements.length - 1) return;
        const newElements = [...elements];
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        setElements(newElements);
    };

    const handleSaveForm = async () => {
        if (!title.trim()) {
            Alert.alert('Validation', 'Form title is required');
            return;
        }

        if (elements.length === 0) {
            Alert.alert('Validation', 'Form must have at least one element');
            return;
        }

        setSaving(true);
        try {
            await updateForm(id as string, {
                title,
                description,
                elements,
                settings: form.settings,
                status: form.status,
            });

            Alert.alert('Success', 'Form updated successfully', [
                { text: 'OK', onPress: () => router.back() },
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Button icon="arrow-left" mode="text" onPress={() => router.back()} style={styles.backButton}>
                    Back
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSaveForm}
                    loading={saving}
                    disabled={saving}
                    icon="content-save"
                    style={styles.saveButton}
                >
                    Save
                </Button>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Title style={styles.pageTitle}>Edit Form</Title>

                <Card style={styles.formInfoCard}>
                    <Card.Content>
                        <Text style={styles.label}>Form Title *</Text>
                        <TextInput
                            mode="outlined"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter form title"
                            style={styles.input}
                        />

                        <Text style={styles.label}>Description (optional)</Text>
                        <TextInput
                            mode="outlined"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter form description"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    </Card.Content>
                </Card>

                <Title style={styles.sectionTitle}>Form Elements ({elements.length})</Title>

                {elements.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <MaterialCommunityIcons name="form-select" size={48} color="#ccc" style={styles.emptyIcon} />
                            <Text style={styles.emptyText}>No form elements yet</Text>
                            <Text style={styles.emptySubText}>Tap the + button to add your first element</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    elements.map((element, index) => (
                        <Card key={element.id} style={styles.elementCard}>
                            <Card.Content>
                                <View style={styles.elementHeader}>
                                    <View style={styles.elementTitleRow}>
                                        <MaterialCommunityIcons
                                            name={ELEMENT_TYPES.find((t) => t.value === element.type)?.icon || 'form-textbox'}
                                            size={20}
                                            color="#6200ee"
                                        />
                                        <Text style={styles.elementLabel}>{element.label}</Text>
                                        {element.validation?.required && <Chip style={styles.requiredChip}>Required</Chip>}
                                    </View>
                                    <View style={styles.elementActions}>
                                        <IconButton icon="arrow-up" size={20} onPress={() => handleMoveUp(index)} disabled={index === 0} />
                                        <IconButton
                                            icon="arrow-down"
                                            size={20}
                                            onPress={() => handleMoveDown(index)}
                                            disabled={index === elements.length - 1}
                                        />
                                        <IconButton icon="pencil" size={20} onPress={() => openEditElementModal(element, index)} />
                                        <IconButton icon="delete" size={20} onPress={() => handleDeleteElement(index)} />
                                    </View>
                                </View>
                                <Text style={styles.elementType}>{ELEMENT_TYPES.find((t) => t.value === element.type)?.label}</Text>
                                {element.options && (
                                    <View style={styles.optionsContainer}>
                                        {element.options.slice(0, 3).map((opt: any, i: number) => (
                                            <Chip key={i} style={styles.optionChip}>
                                                {opt.label}
                                            </Chip>
                                        ))}
                                        {element.options.length > 3 && <Text style={styles.moreOptions}>+{element.options.length - 3} more</Text>}
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB style={styles.fab} icon="plus" onPress={openAddElementModal} label="Add Element" />

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                    <ScrollView>
                        <Title style={styles.modalTitle}>{editingElement ? 'Edit Element' : 'Add Element'}</Title>

                        <Text style={styles.label}>Element Type</Text>
                        <View style={styles.typeGrid}>
                            {ELEMENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[styles.typeButton, elementType === type.value && styles.typeButtonSelected]}
                                    onPress={() => setElementType(type.value)}
                                >
                                    <MaterialCommunityIcons name={type.icon as any} size={24} color={elementType === type.value ? '#6200ee' : '#666'} />
                                    <Text style={[styles.typeButtonText, elementType === type.value && styles.typeButtonTextSelected]}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Label *</Text>
                        <TextInput mode="outlined" value={elementLabel} onChangeText={setElementLabel} placeholder="Enter label" style={styles.input} />

                        <Text style={styles.label}>Placeholder (optional)</Text>
                        <TextInput
                            mode="outlined"
                            value={elementPlaceholder}
                            onChangeText={setElementPlaceholder}
                            placeholder="Enter placeholder"
                            style={styles.input}
                        />

                        <View style={styles.checkboxRow}>
                            <Text style={styles.checkboxLabel}>Required field</Text>
                            <IconButton
                                icon={elementRequired ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={24}
                                onPress={() => setElementRequired(!elementRequired)}
                            />
                        </View>

                        {['select', 'radio', 'checkbox'].includes(elementType) && (
                            <>
                                <Text style={styles.label}>Options</Text>
                                {elementOptions.map((option, index) => (
                                    <View key={index} style={styles.optionRow}>
                                        <Chip style={styles.optionChipEdit}>{option}</Chip>
                                        <IconButton icon="close" size={20} onPress={() => handleRemoveOption(index)} />
                                    </View>
                                ))}
                                <View style={styles.addOptionRow}>
                                    <TextInput
                                        mode="outlined"
                                        value={optionInput}
                                        onChangeText={setOptionInput}
                                        placeholder="Add option"
                                        style={styles.optionInput}
                                        onSubmitEditing={handleAddOption}
                                    />
                                    <Button mode="outlined" onPress={handleAddOption} style={styles.addOptionButton}>
                                        Add
                                    </Button>
                                </View>
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSaveElement} style={styles.modalButton}>
                                {editingElement ? 'Update' : 'Add'}
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 8,
        backgroundColor: 'white',
        elevation: 2,
    },
    backButton: {
        marginLeft: -10,
    },
    saveButton: {
        backgroundColor: '#6200ee',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    formInfoCard: {
        marginBottom: 20,
        backgroundColor: 'white',
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    emptyCard: {
        marginTop: 20,
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
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
    elementTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    elementLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
    },
    requiredChip: {
        height: 24,
        backgroundColor: '#ffebee',
    },
    elementActions: {
        flexDirection: 'row',
        marginRight: -12,
    },
    elementType: {
        fontSize: 12,
        color: '#666',
        marginLeft: 28,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginLeft: 28,
    },
    optionChip: {
        marginRight: 8,
        marginBottom: 4,
        height: 28,
    },
    moreOptions: {
        fontSize: 12,
        color: '#666',
        alignSelf: 'center',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#6200ee',
    },
    modal: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 12,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    typeButton: {
        width: '30%',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    typeButtonSelected: {
        borderColor: '#6200ee',
        backgroundColor: '#f3e5f5',
    },
    typeButtonText: {
        fontSize: 10,
        marginTop: 4,
        color: '#666',
    },
    typeButtonTextSelected: {
        color: '#6200ee',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkboxLabel: {
        fontSize: 14,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionChipEdit: {
        flex: 1,
    },
    addOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    optionInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: 'white',
    },
    addOptionButton: {
        marginTop: -8,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 8,
    },
    modalButton: {
        minWidth: 100,
    },
});
