import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;
    joinDate: any;
    birthday?: string;
    notes?: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export default function CustomersScreen() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');

    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'customers'), orderBy('totalSpent', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
            setCustomers(customersList);
        });

        return () => unsubscribe();
    }, []);

    const getTier = (totalSpent: number): Customer['tier'] => {
        if (totalSpent >= 50000) return 'platinum';
        if (totalSpent >= 25000) return 'gold';
        if (totalSpent >= 10000) return 'silver';
        return 'bronze';
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'platinum': return '#E5E4E2';
            case 'gold': return '#FFD700';
            case 'silver': return '#C0C0C0';
            case 'bronze': return '#CD7F32';
            default: return Colors.gray400;
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'platinum': return '💎';
            case 'gold': return '🏆';
            case 'silver': return '🥈';
            case 'bronze': return '🥉';
            default: return '👤';
        }
    };

    const openAddModal = () => {
        setEditingCustomer(null);
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setName(customer.name);
        setPhone(customer.phone);
        setEmail(customer.email || '');
        setBirthday(customer.birthday || '');
        setNotes(customer.notes || '');
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setBirthday('');
        setNotes('');
    };

    const handleSave = async () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Name and phone are required');
            return;
        }

        try {
            const customerData: any = {
                name,
                phone,
                email: email || null,
                birthday: birthday || null,
                notes: notes || null,
            };

            if (editingCustomer) {
                await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
            } else {
                customerData.loyaltyPoints = 0;
                customerData.totalOrders = 0;
                customerData.totalSpent = 0;
                customerData.joinDate = new Date();
                customerData.tier = 'bronze';
                await addDoc(collection(db, 'customers'), customerData);
            }

            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save customer');
        }
    };

    const handleDelete = (customerId: string) => {
        Alert.alert(
            'Delete Customer',
            'Are you sure? This will remove all customer data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'customers', customerId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete customer');
                        }
                    },
                },
            ]
        );
    };

    const addLoyaltyPoints = async (customer: Customer, points: number) => {
        try {
            const newPoints = customer.loyaltyPoints + points;
            const newTotalSpent = customer.totalSpent + (points * 10); // Example: 1 point per Rs. 10
            const newTier = getTier(newTotalSpent);

            await updateDoc(doc(db, 'customers', customer.id), {
                loyaltyPoints: newPoints,
                totalSpent: newTotalSpent,
                tier: newTier,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update points');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);
        const matchesFilter = filter === 'all' || customer.tier === filter;
        return matchesSearch && matchesFilter;
    });

    const totalCustomers = customers.length;
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const averageSpent = customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
        : 0;
    const vipCustomers = customers.filter(c => c.tier === 'gold' || c.tier === 'platinum').length;

    return (
        <BackgroundImage type="customer">
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>👥 Customers</Text>
                    <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.primary }]}>{totalCustomers}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>{totalLoyaltyPoints}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{vipCustomers}</Text>
                        <Text style={styles.statLabel}>VIP</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={Colors.gray400}
                    />
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <View style={styles.filterContainer}>
                        {['all', 'platinum', 'gold', 'silver', 'bronze'].map((tierFilter) => (
                            <TouchableOpacity
                                key={tierFilter}
                                style={[styles.filterChip, filter === tierFilter && styles.filterChipActive]}
                                onPress={() => setFilter(tierFilter as typeof filter)}
                            >
                                <Text style={[styles.filterText, filter === tierFilter && styles.filterTextActive]}>
                                    {tierFilter === 'all'
                                        ? `All (${customers.length})`
                                        : `${getTierIcon(tierFilter)} ${tierFilter.charAt(0).toUpperCase() + tierFilter.slice(1)}`
                                    }
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Customers List */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredCustomers.map((customer) => (
                        <View key={customer.id} style={styles.customerCard}>
                            <View style={styles.customerHeader}>
                                <View style={styles.customerHeaderLeft}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.customerName}>{customer.name}</Text>
                                        <View style={[
                                            styles.tierBadge,
                                            { backgroundColor: getTierColor(customer.tier) + '30' }
                                        ]}>
                                            <Text style={styles.tierEmoji}>{getTierIcon(customer.tier)}</Text>
                                            <Text style={[styles.tierText, { color: getTierColor(customer.tier) }]}>
                                                {customer.tier.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.customerPhone}>📞 {customer.phone}</Text>
                                    {customer.email && (
                                        <Text style={styles.customerEmail}>✉️ {customer.email}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.customerStats}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxValue}>{customer.loyaltyPoints}</Text>
                                    <Text style={styles.statBoxLabel}>Points</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxValue}>{customer.totalOrders}</Text>
                                    <Text style={styles.statBoxLabel}>Orders</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxValue}>Rs. {customer.totalSpent}</Text>
                                    <Text style={styles.statBoxLabel}>Spent</Text>
                                </View>
                            </View>

                            {customer.birthday && (
                                <View style={styles.birthdayRow}>
                                    <Text style={styles.birthdayText}>🎂 Birthday: {customer.birthday}</Text>
                                </View>
                            )}

                            {customer.notes && (
                                <View style={styles.notesRow}>
                                    <Text style={styles.notesLabel}>Notes:</Text>
                                    <Text style={styles.notesText}>{customer.notes}</Text>
                                </View>
                            )}

                            {/* Quick Actions */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.success + '20' }]}
                                    onPress={() => addLoyaltyPoints(customer, 10)}
                                >
                                    <Text style={[styles.actionBtnText, { color: Colors.success }]}>
                                        +10 Points
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.info + '20' }]}
                                    onPress={() => openEditModal(customer)}
                                >
                                    <Text style={[styles.actionBtnText, { color: Colors.info }]}>
                                        ✏️ Edit
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.error + '20' }]}
                                    onPress={() => handleDelete(customer.id)}
                                >
                                    <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                                        🗑️ Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>👥</Text>
                            <Text style={styles.emptyText}>No customers found</Text>
                            {searchQuery ? (
                                <Text style={styles.emptySubtext}>Try a different search</Text>
                            ) : (
                                <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                                    <Text style={styles.emptyButtonText}>Add First Customer</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Add/Edit Modal */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name *"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number *"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Email (Optional)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Birthday (e.g., Jan 15)"
                                    value={birthday}
                                    onChangeText={setBirthday}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Notes (Optional)"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <LinearGradient
                                        colors={Colors.gradientPrimary}
                                        style={styles.saveGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.saveButtonText}>
                                            {editingCustomer ? 'Update Customer' : 'Add Customer'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </BackgroundImage>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingVertical: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textLight,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    searchInput: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: Colors.text,
    },
    filterScroll: {
        backgroundColor: Colors.white,
        paddingBottom: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.gray100,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    filterTextActive: {
        color: Colors.white,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    customerCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    customerHeader: {
        marginBottom: 12,
    },
    customerHeaderLeft: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tierEmoji: {
        fontSize: 12,
    },
    tierText: {
        fontSize: 10,
        fontWeight: '700',
    },
    customerPhone: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
    },
    customerEmail: {
        fontSize: 13,
        color: Colors.textLight,
    },
    customerStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.gray100,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statBoxValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    statBoxLabel: {
        fontSize: 11,
        color: Colors.textLight,
    },
    birthdayRow: {
        backgroundColor: Colors.warning + '10',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    birthdayText: {
        fontSize: 13,
        color: Colors.text,
    },
    notesRow: {
        backgroundColor: Colors.info + '10',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    notesLabel: {
        fontSize: 11,
        color: Colors.textLight,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        color: Colors.text,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    emptyButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        marginBottom: 12,
    },
    textArea: {
        height: 80,
        paddingTop: 16,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
});
