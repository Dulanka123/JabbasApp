import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const CATEGORIES = [
    { name: 'Appetizers', emoji: '🥗', gradient: ['#FF6B6B', '#FFE66D'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
    { name: 'Main Course', emoji: '🍔', gradient: ['#FF6B35', '#F7B731'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { name: 'Desserts', emoji: '🍰', gradient: ['#FF8ED4', '#FFC3E1'], image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    { name: 'Beverages', emoji: '🥤', gradient: ['#4FACFE', '#00F2FE'], image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400' },
];

export default function AddMenuItem() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Main Course');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !price) {
            Alert.alert('Error', 'Please fill in name and price');
            return;
        }

        if (isNaN(Number(price))) {
            Alert.alert('Error', 'Price must be a number');
            return;
        }

        setLoading(true);
        try {
            // Use category default image
            const selectedCategory = CATEGORIES.find(c => c.name === category);
            const imageUri = selectedCategory?.image || CATEGORIES[1].image;

            await addDoc(collection(db, 'menu'), {
                name,
                price,
                category,
                description,
                imageUri,
                createdAt: new Date().toISOString(),
            });
            Alert.alert('Success', 'Menu item added successfully! 🎉', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add item');
        }
        setLoading(false);
    };

    const selectedCategoryData = CATEGORIES.find(c => c.name === category) || CATEGORIES[1];

    return (
        <BackgroundImage type="menu">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Vibrant Header */}
                    <LinearGradient
                        colors={['#FF6B35', '#F7B731', '#FF8ED4']}
                        style={styles.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerEmoji}>🍽️</Text>
                        <Text style={styles.headerTitle}>Add New Dish</Text>
                        <Text style={styles.headerSubtitle}>Create a delicious menu item</Text>
                    </LinearGradient>

                    <View style={styles.formContainer}>
                        {/* Image Preview - Shows category default */}
                        <View style={styles.imageSection}>
                            <Text style={styles.label}>📷 Preview</Text>
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: selectedCategoryData.image }}
                                    style={styles.imagePreview}
                                />
                                <View style={styles.categoryOverlay}>
                                    <LinearGradient
                                        colors={selectedCategoryData.gradient}
                                        style={styles.categoryOverlayGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.categoryOverlayText}>
                                            {selectedCategoryData.emoji} {category}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>
                            <Text style={styles.imageNote}>✨ Auto-selected beautiful image for this category</Text>
                        </View>

                        {/* Item Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>🍴 Item Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Chicken Kottu Supreme"
                                placeholderTextColor={Colors.gray500}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Price */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>💰 Price (Rs.) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 1500"
                                placeholderTextColor={Colors.gray500}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Category - Colorful */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>🏷️ Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.name}
                                        style={styles.categoryCard}
                                        onPress={() => setCategory(cat.name)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={category === cat.name ? cat.gradient : [Colors.gray200, Colors.gray300]}
                                            style={styles.categoryGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                            <Text style={[
                                                styles.categoryText,
                                                category === cat.name && styles.categoryTextActive
                                            ]}>
                                                {cat.name}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>📝 Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="A delicious blend of flavors..."
                                placeholderTextColor={Colors.gray500}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Save Button - Vibrant */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading
                                    ? [Colors.gray400, Colors.gray500]
                                    : ['#11998E', '#38EF7D']
                                }
                                style={styles.saveButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.saveButtonText}>
                                    {loading ? '⏳ Saving...' : '✓ Save Delicious Item'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BackgroundImage>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    headerEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.95,
    },
    formContainer: {
        padding: 24,
    },
    imageSection: {
        marginBottom: 24,
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    imagePreview: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        backgroundColor: Colors.gray200,
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoryOverlayGradient: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    categoryOverlayText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
    imageNote: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 2,
        borderColor: Colors.gray300,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryGradient: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.gray700,
        textAlign: 'center',
    },
    categoryTextActive: {
        color: Colors.white,
        fontWeight: '700',
    },
    saveButton: {
        marginTop: 16,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#11998E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
});
