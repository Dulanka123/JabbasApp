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
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    category: string;
    supplier?: string;
    lastRestocked?: any;
    costPerUnit?: number;
}

export default function InventoryScreen() {
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

    // Form states
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [lowStockThreshold, setLowStockThreshold] = useState('');
    const [category, setCategory] = useState('Ingredients');
    const [supplier, setSupplier] = useState('');
    const [costPerUnit, setCostPerUnit] = useState('');

    const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'dozen'];
    const CATEGORIES = ['Ingredients', 'Vegetables', 'Meat', 'Dairy', 'Spices', 'Beverages', 'Others'];

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
            const itemsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryItem[];
            setItems(itemsList.sort((a, b) => a.name.localeCompare(b.name)));
        });

        return () => unsubscribe();
    }, []);

    const openAddModal = () => {
        setEditingItem(null);
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setName(item.name);
        setQuantity(item.quantity.toString());
        setUnit(item.unit);
        setLowStockThreshold(item.lowStockThreshold.toString());
        setCategory(item.category);
        setSupplier(item.supplier || '');
        setCostPerUnit(item.costPerUnit?.toString() || '');
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setQuantity('');
        setUnit('kg');
        setLowStockThreshold('');
        setCategory('Ingredients');
        setSupplier('');
        setCostPerUnit('');
    };

    const handleSave = async () => {
        if (!name || !quantity || !lowStockThreshold) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            const itemData = {
                name,
                quantity: parseFloat(quantity),
                unit,
                lowStockThreshold: parseFloat(lowStockThreshold),
                category,
                supplier: supplier || null,
                costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
                lastRestocked: new Date(),
            };

            if (editingItem) {
                await updateDoc(doc(db, 'inventory', editingItem.id), itemData);
            } else {
                await addDoc(collection(db, 'inventory'), itemData);
            }

            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save item');
        }
    };

    const handleDelete = (itemId: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'inventory', itemId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    const adjustQuantity = async (item: InventoryItem, delta: number) => {
        const newQuantity = Math.max(0, item.quantity + delta);
        try {
            await updateDoc(doc(db, 'inventory', item.id), {
                quantity: newQuantity,
                lastRestocked: delta > 0 ? new Date() : item.lastRestocked,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update quantity');
        }
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.quantity === 0) return 'out';
        if (item.quantity <= item.lowStockThreshold) return 'low';
        return 'good';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'out':
                return Colors.error;
            case 'low':
                return Colors.warning;
            case 'good':
                return Colors.success;
            default:
                return Colors.gray400;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'out':
                return '🔴';
            case 'low':
                return '⚠️';
            case 'good':
                return '✅';
            default:
                return '❓';
        }
    };

    const filteredItems = items.filter(item => {
        const status = getStockStatus(item);
        if (filter === 'all') return true;
        if (filter === 'low') return status === 'low';
        if (filter === 'out') return status === 'out';
        return true;
    });

    const lowStockCount = items.filter(i => getStockStatus(i) === 'low').length;
    const outOfStockCount = items.filter(i => getStockStatus(i) === 'out').length;
    const totalValue = items.reduce((sum, item) => {
        return sum + (item.quantity * (item.costPerUnit || 0));
    }, 0);

    return (
        <BackgroundImage type="inventory">
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
                    <Text style={styles.headerTitle}>📦 Inventory</Text>
                    <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.primary }]}>{items.length}</Text>
                        <Text style={styles.statLabel}>Total Items</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>{lowStockCount}</Text>
                        <Text style={styles.statLabel}>Low Stock</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.error }]}>{outOfStockCount}</Text>
                        <Text style={styles.statLabel}>Out of Stock</Text>
                    </View>
                </View>

                {/* Value Card */}
                <View style={styles.valueCard}>
                    <Text style={styles.valueLabel}>Total Inventory Value</Text>
                    <Text style={styles.valueAmount}>Rs. {totalValue.toFixed(2)}</Text>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                            All ({items.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'low' && styles.filterTabActive]}
                        onPress={() => setFilter('low')}
                    >
                        <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>
                            Low ({lowStockCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'out' && styles.filterTabActive]}
                        onPress={() => setFilter('out')}
                    >
                        <Text style={[styles.filterText, filter === 'out' && styles.filterTextActive]}>
                            Out ({outOfStockCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Inventory List */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredItems.map((item) => {
                        const status = getStockStatus(item);
                        return (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemHeaderLeft}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemCategory}>{item.category}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(status) + '20' }
                                    ]}>
                                        <Text>{getStatusIcon(status)}</Text>
                                    </View>
                                </View>

                                <View style={styles.itemBody}>
                                    <View style={styles.quantityRow}>
                                        <Text style={styles.quantityLabel}>Stock:</Text>
                                        <Text style={[
                                            styles.quantityValue,
                                            { color: getStatusColor(status) }
                                        ]}>
                                            {item.quantity} {item.unit}
                                        </Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoText}>
                                            Min: {item.lowStockThreshold} {item.unit}
                                        </Text>
                                        {item.supplier && (
                                            <Text style={styles.infoText}>📍 {item.supplier}</Text>
                                        )}
                                    </View>

                                    {item.costPerUnit && (
                                        <Text style={styles.costText}>
                                            Rs. {item.costPerUnit}/{item.unit} • Total: Rs. {(item.quantity * item.costPerUnit).toFixed(2)}
                                        </Text>
                                    )}

                                    {/* Quantity Controls */}
                                    <View style={styles.controls}>
                                        <TouchableOpacity
                                            style={styles.controlBtn}
                                            onPress={() => adjustQuantity(item, -1)}
                                        >
                                            <Text style={styles.controlBtnText}>-</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlBtn, styles.controlBtnPrimary]}
                                            onPress={() => adjustQuantity(item, 1)}
                                        >
                                            <Text style={styles.controlBtnTextWhite}>+1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlBtn, styles.controlBtnPrimary]}
                                            onPress={() => adjustQuantity(item, 10)}
                                        >
                                            <Text style={styles.controlBtnTextWhite}>+10</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => openEditModal(item)}
                                        >
                                            <Text style={styles.editBtnText}>✏️ Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDelete(item.id)}
                                        >
                                            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>📦</Text>
                            <Text style={styles.emptyText}>No items found</Text>
                            {filter === 'all' && (
                                <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                                    <Text style={styles.emptyButtonText}>Add First Item</Text>
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
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Name *"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.inputHalf]}
                                        placeholder="Quantity *"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.gray400}
                                    />
                                    <View style={[styles.input, styles.inputHalf]}>
                                        <Text style={styles.selectLabel}>Unit: {unit}</Text>
                                    </View>
                                </View>

                                <View style={styles.chipContainer}>
                                    {UNITS.map(u => (
                                        <TouchableOpacity
                                            key={u}
                                            style={[styles.chip, unit === u && styles.chipActive]}
                                            onPress={() => setUnit(u)}
                                        >
                                            <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>
                                                {u}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Low Stock Threshold *"
                                    value={lowStockThreshold}
                                    onChangeText={setLowStockThreshold}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <Text style={styles.label}>Category</Text>
                                <View style={styles.chipContainer}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.chip, category === cat && styles.chipActive]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Supplier (Optional)"
                                    value={supplier}
                                    onChangeText={setSupplier}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Cost per Unit (Optional)"
                                    value={costPerUnit}
                                    onChangeText={setCostPerUnit}
                                    keyboardType="numeric"
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
                                            {editingItem ? 'Update Item' : 'Add Item'}
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
    valueCard: {
        backgroundColor: Colors.white,
        margin: 16,
        marginBottom: 8,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    valueLabel: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 8,
    },
    valueAmount: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.primary,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    filterTabActive: {
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
    itemCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 8,
    },
    itemHeaderLeft: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 12,
        color: Colors.textLight,
    },
    statusBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemBody: {
        padding: 16,
        paddingTop: 0,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    quantityLabel: {
        fontSize: 14,
        color: Colors.textLight,
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: Colors.textLight,
    },
    costText: {
        fontSize: 12,
        color: Colors.text,
        marginBottom: 12,
    },
    controls: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    controlBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    controlBtnPrimary: {
        backgroundColor: Colors.primary,
    },
    controlBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    controlBtnTextWhite: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    editBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.info + '20',
        alignItems: 'center',
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.info,
    },
    deleteBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.error + '20',
        alignItems: 'center',
    },
    deleteBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.error,
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    selectLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.gray100,
    },
    chipActive: {
        backgroundColor: Colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
    },
    chipTextActive: {
        color: Colors.white,
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
