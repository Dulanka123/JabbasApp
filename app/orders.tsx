import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

interface Order {
    id: string;
    customerName: string;
    items: string;
    total: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    createdAt: string;
}

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            // Sort by creation date
            orderList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(orderList);
        });
        return unsubscribe;
    }, []);

    const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
        try {
            await updateDoc(doc(db, 'orders', id), { status: newStatus });
        } catch (error) {
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const deleteOrder = (id: string) => {
        Alert.alert(
            'Delete Order',
            'Are you sure you want to delete this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'orders', id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete order');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return Colors.warning;
            case 'preparing': return Colors.info;
            case 'ready': return Colors.success;
            case 'delivered': return Colors.gray500;
            default: return Colors.gray500;
        }
    };

    const getStatusEmoji = (status: Order['status']) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'preparing': return '👨‍🍳';
            case 'ready': return '✅';
            case 'delivered': return '📦';
            default: return '📋';
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    const renderOrder = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderInfoContainer}>
                    <Text style={styles.orderCustomer}>{item.customerName || 'Walk-in Customer'}</Text>
                    <Text style={styles.orderTime}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>
                        {getStatusEmoji(item.status)} {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.orderContent}>
                <Text style={styles.orderItems}>{item.items || 'No items specified'}</Text>
                <Text style={styles.orderTotal}>Total: Rs.{item.total || '0'}</Text>
            </View>

            <View style={styles.orderActions}>
                {item.status !== 'delivered' && (
                    <>
                        {item.status === 'pending' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: Colors.info }]}
                                onPress={() => updateOrderStatus(item.id, 'preparing')}
                            >
                                <Text style={styles.actionButtonText}>👨‍🍳 Start Preparing</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'preparing' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: Colors.success }]}
                                onPress={() => updateOrderStatus(item.id, 'ready')}
                            >
                                <Text style={styles.actionButtonText}>✅ Mark Ready</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'ready' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                                onPress={() => updateOrderStatus(item.id, 'delivered')}
                            >
                                <Text style={styles.actionButtonText}>📦 Delivered</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => deleteOrder(item.id)}
                >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <BackgroundImage type="dashboard">
            <View style={styles.container}>
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
                    <Text style={styles.headerTitle}>Orders</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredOrders.length} {filter === 'all' ? 'total' : filter} orders
                    </Text>
                </LinearGradient>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    {['all', 'pending', 'preparing', 'ready'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f as any)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                filter === f && styles.filterTabTextActive
                            ]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Orders List */}
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>📋</Text>
                            <Text style={styles.emptyText}>No orders yet</Text>
                            <Text style={styles.emptySubtext}>
                                Orders will appear here when customers place them
                            </Text>
                        </View>
                    }
                />

                {/* Floating Add Button (for testing/demo) */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/add-order')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
        paddingBottom: 24,
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
    filterContainer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: 12,
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.white,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray300,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    filterTabTextActive: {
        color: Colors.white,
    },
    listContent: {
        padding: 24,
        paddingTop: 12,
    },
    orderCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderInfoContainer: {
        flex: 1,
    },
    orderCustomer: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    orderTime: {
        fontSize: 12,
        color: Colors.textLight,
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    orderContent: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    orderItems: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
    },
    orderTotal: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
    },
    orderActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteActionButton: {
        flex: 0,
        paddingHorizontal: 12,
        backgroundColor: Colors.error,
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabText: {
        fontSize: 32,
        color: Colors.white,
        fontWeight: '300',
    },
});
