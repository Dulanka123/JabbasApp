import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Table {
    id: string;
    number: number;
    seats: number;
    status: 'available' | 'occupied' | 'reserved';
    customerName?: string;
    orderId?: string;
    reservationTime?: string;
}

export default function TablesScreen() {
    const router = useRouter();
    const [tables, setTables] = useState<Table[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [reservationTime, setReservationTime] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
            const tablesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Table[];
            setTables(tablesList.sort((a, b) => a.number - b.number));
        });

        return () => unsubscribe();
    }, []);

    const addTable = async () => {
        try {
            const newTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
            await addDoc(collection(db, 'tables'), {
                number: newTableNumber,
                seats: 4,
                status: 'available',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to add table');
        }
    };

    const updateTableStatus = async (table: Table, newStatus: 'available' | 'occupied' | 'reserved') => {
        try {
            const tableRef = doc(db, 'tables', table.id);
            const updateData: any = { status: newStatus };

            if (newStatus === 'available') {
                updateData.customerName = null;
                updateData.orderId = null;
                updateData.reservationTime = null;
            } else if (newStatus === 'reserved' && customerName && reservationTime) {
                updateData.customerName = customerName;
                updateData.reservationTime = reservationTime;
            } else if (newStatus === 'occupied' && customerName) {
                updateData.customerName = customerName;
            }

            await updateDoc(tableRef, updateData);
            setModalVisible(false);
            setCustomerName('');
            setReservationTime('');
            setSelectedTable(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update table status');
        }
    };

    const deleteTable = async (tableId: string) => {
        Alert.alert(
            'Delete Table',
            'Are you sure you want to delete this table?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'tables', tableId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete table');
                        }
                    },
                },
            ]
        );
    };

    const openTableModal = (table: Table) => {
        setSelectedTable(table);
        setCustomerName(table.customerName || '');
        setReservationTime(table.reservationTime || '');
        setModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return Colors.success;
            case 'occupied':
                return Colors.error;
            case 'reserved':
                return Colors.warning;
            default:
                return Colors.gray400;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return '✅';
            case 'occupied':
                return '🔴';
            case 'reserved':
                return '📅';
            default:
                return '❓';
        }
    };

    const availableCount = tables.filter(t => t.status === 'available').length;
    const occupiedCount = tables.filter(t => t.status === 'occupied').length;
    const reservedCount = tables.filter(t => t.status === 'reserved').length;

    return (
        <BackgroundImage type="table">
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
                    <Text style={styles.headerTitle}>🪑 Table Management</Text>
                    <TouchableOpacity onPress={addTable} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{availableCount}</Text>
                        <Text style={styles.statLabel}>Available</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.error }]}>{occupiedCount}</Text>
                        <Text style={styles.statLabel}>Occupied</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>{reservedCount}</Text>
                        <Text style={styles.statLabel}>Reserved</Text>
                    </View>
                </View>

                {/* Tables Grid */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.tablesGrid}>
                        {tables.map((table) => (
                            <TouchableOpacity
                                key={table.id}
                                style={[
                                    styles.tableCard,
                                    { borderColor: getStatusColor(table.status) }
                                ]}
                                onPress={() => openTableModal(table)}
                                onLongPress={() => deleteTable(table.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.tableHeader,
                                    { backgroundColor: getStatusColor(table.status) + '20' }
                                ]}>
                                    <Text style={styles.tableNumber}>Table {table.number}</Text>
                                    <Text style={styles.statusIcon}>{getStatusIcon(table.status)}</Text>
                                </View>
                                <View style={styles.tableBody}>
                                    <Text style={styles.seatsText}>👥 {table.seats} seats</Text>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(table.status) }
                                    ]}>
                                        {table.status.toUpperCase()}
                                    </Text>
                                    {table.customerName && (
                                        <Text style={styles.customerText}>👤 {table.customerName}</Text>
                                    )}
                                    {table.reservationTime && (
                                        <Text style={styles.timeText}>🕐 {table.reservationTime}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {tables.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🪑</Text>
                            <Text style={styles.emptyText}>No tables added yet</Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={addTable}>
                                <Text style={styles.emptyButtonText}>Add First Table</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Modal for Table Actions */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Table {selectedTable?.number} - Actions
                            </Text>

                            {selectedTable?.status !== 'available' && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Current Status:</Text>
                                    <Text style={[
                                        styles.currentStatus,
                                        { color: getStatusColor(selectedTable?.status || '') }
                                    ]}>
                                        {selectedTable?.status.toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Customer Name"
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholderTextColor={Colors.gray400}
                            />

                            {selectedTable?.status !== 'occupied' && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Reservation Time (e.g., 7:00 PM)"
                                    value={reservationTime}
                                    onChangeText={setReservationTime}
                                    placeholderTextColor={Colors.gray400}
                                />
                            )}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: Colors.success }]}
                                    onPress={() => updateTableStatus(selectedTable!, 'available')}
                                >
                                    <Text style={styles.actionButtonText}>✅ Available</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: Colors.error }]}
                                    onPress={() => {
                                        if (!customerName) {
                                            Alert.alert('Error', 'Please enter customer name');
                                            return;
                                        }
                                        updateTableStatus(selectedTable!, 'occupied');
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>🔴 Occupied</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: Colors.warning, width: '100%' }]}
                                onPress={() => {
                                    if (!customerName || !reservationTime) {
                                        Alert.alert('Error', 'Please enter customer name and time');
                                        return;
                                    }
                                    updateTableStatus(selectedTable!, 'reserved');
                                }}
                            >
                                <Text style={styles.actionButtonText}>📅 Reserve</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setCustomerName('');
                                    setReservationTime('');
                                    setSelectedTable(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
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
        paddingVertical: 20,
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
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    tablesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    tableCard: {
        width: (width - 44) / 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    tableNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    statusIcon: {
        fontSize: 20,
    },
    tableBody: {
        padding: 12,
        paddingTop: 8,
    },
    seatsText: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    customerText: {
        fontSize: 12,
        color: Colors.text,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 12,
        color: Colors.textLight,
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
        color: Colors.textLight,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
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
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
    },
    currentStatus: {
        fontSize: 18,
        fontWeight: '700',
    },
    input: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
    cancelButton: {
        marginTop: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
});
