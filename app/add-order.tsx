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
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

export default function AddOrder() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState('');
    const [total, setTotal] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!items || !total) {
            Alert.alert('Error', 'Please fill in items and total');
            return;
        }

        if (isNaN(Number(total))) {
            Alert.alert('Error', 'Total must be a number');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'orders'), {
                customerName: customerName || 'Walk-in Customer',
                items,
                total,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
            Alert.alert('Success', 'Order created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create order');
        }
        setLoading(false);
    };

    return (
        <BackgroundImage type="dashboard">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <LinearGradient
                        colors={Colors.gradientPrimary}
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
                        <Text style={styles.headerTitle}>New Order</Text>
                        <Text style={styles.headerSubtitle}>Create a new order</Text>
                    </LinearGradient>

                    <View style={styles.formContainer}>
                        {/* Customer Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Customer Name (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Walk-in Customer"
                                placeholderTextColor={Colors.gray500}
                                value={customerName}
                                onChangeText={setCustomerName}
                            />
                        </View>

                        {/* Items */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Items *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g., 2x Kottu, 1x Fried Rice, 2x Coca Cola"
                                placeholderTextColor={Colors.gray500}
                                value={items}
                                onChangeText={setItems}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Total */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Total (Rs.) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 3500"
                                placeholderTextColor={Colors.gray500}
                                value={total}
                                onChangeText={setTotal}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? [Colors.gray400, Colors.gray500] : Colors.gradientPrimary}
                                style={styles.submitButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.submitButtonText}>
                                    {loading ? 'Creating...' : '✓ Create Order'}
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
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.9,
    },
    formContainer: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.gray300,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    submitButton: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
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
