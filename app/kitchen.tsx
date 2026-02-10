import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Order {
    id: string;
    customerName?: string;
    items: string;
    total: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
    createdAt: any;
    tableNumber?: number;
    priority?: 'low' | 'normal' | 'high';
    preparationTime?: number; // in minutes
}

export default function KitchenScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');

    useEffect(() => {
        // Real-time clock
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Listen to active orders (not delivered)
        const q = query(
            collection(db, 'orders'),
            where('status', 'in', ['PENDING', 'PREPARING', 'READY'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    priority: data.priority || 'normal',
                    preparationTime: data.preparationTime || 15,
                } as Order;
            });

            // Sort by priority and time
            const sorted = ordersList.sort((a, b) => {
                const priorityOrder = { high: 0, normal: 1, low: 2 };
                const priorityDiff = priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
                if (priorityDiff !== 0) return priorityDiff;

                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeA - timeB;
            });

            setOrders(sorted);
        });

        return () => {
            clearInterval(clockInterval);
            unsubscribe();
        };
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
        } catch (error) {
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const updatePriority = async (orderId: string, priority: 'low' | 'normal' | 'high') => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { priority });
        } catch (error) {
            Alert.alert('Error', 'Failed to update priority');
        }
    };

    const getElapsedTime = (createdAt: any) => {
        if (!createdAt) return '0m';
        const elapsed = Math.floor((currentTime.getTime() - createdAt.toMillis()) / 1000 / 60);
        if (elapsed < 60) return `${elapsed}m`;
        const hours = Math.floor(elapsed / 60);
        const minutes = elapsed % 60;
        return `${hours}h ${minutes}m`;
    };

    const getTimeColor = (createdAt: any, preparationTime: number) => {
        if (!createdAt) return Colors.success;
        const elapsed = Math.floor((currentTime.getTime() - createdAt.toMillis()) / 1000 / 60);
        if (elapsed > preparationTime + 10) return Colors.error;
        if (elapsed > preparationTime) return Colors.warning;
        return Colors.success;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return Colors.error;
            case 'normal':
                return Colors.info;
            case 'low':
                return Colors.gray400;
            default:
                return Colors.gray400;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return Colors.warning;
            case 'PREPARING':
                return Colors.info;
            case 'READY':
                return Colors.success;
            default:
                return Colors.gray400;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return order.status === 'PENDING';
        if (filter === 'preparing') return order.status === 'PREPARING';
        return true;
    });

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
    const readyCount = orders.filter(o => o.status === 'READY').length;

    return (
        <BackgroundImage type="kitchen">
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
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>👨‍🍳 Kitchen Display</Text>
                        <Text style={styles.headerTime}>
                            {currentTime.toLocaleTimeString()}
                        </Text>
                    </View>
                    <View style={{ width: 60 }} />
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>{pendingCount}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.info }]}>{preparingCount}</Text>
                        <Text style={styles.statLabel}>Preparing</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{readyCount}</Text>
                        <Text style={styles.statLabel}>Ready</Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                            All ({orders.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                        onPress={() => setFilter('pending')}
                    >
                        <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                            Pending ({pendingCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'preparing' && styles.filterTabActive]}
                        onPress={() => setFilter('preparing')}
                    >
                        <Text style={[styles.filterText, filter === 'preparing' && styles.filterTextActive]}>
                            Preparing ({preparingCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Orders Grid */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.ordersGrid}>
                        {filteredOrders.map((order) => (
                            <View key={order.id} style={styles.orderCard}>
                                {/* Card Header */}
                                <View style={[
                                    styles.orderHeader,
                                    { backgroundColor: getStatusColor(order.status) + '20' }
                                ]}>
                                    <View style={styles.orderHeaderLeft}>
                                        <Text style={styles.orderNumber}>
                                            Order #{order.id.slice(-6).toUpperCase()}
                                        </Text>
                                        {order.tableNumber && (
                                            <Text style={styles.tableTag}>
                                                🪑 Table {order.tableNumber}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={[
                                        styles.priorityBadge,
                                        { backgroundColor: getPriorityColor(order.priority || 'normal') }
                                    ]}>
                                        <Text style={styles.priorityText}>
                                            {order.priority?.toUpperCase() || 'NORMAL'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Customer & Time */}
                                <View style={styles.orderInfo}>
                                    {order.customerName && (
                                        <Text style={styles.customerName}>
                                            👤 {order.customerName}
                                        </Text>
                                    )}
                                    <View style={styles.timerRow}>
                                        <Text style={[
                                            styles.timerText,
                                            { color: getTimeColor(order.createdAt, order.preparationTime || 15) }
                                        ]}>
                                            ⏱️ {getElapsedTime(order.createdAt)}
                                        </Text>
                                        <Text style={styles.estimatedTime}>
                                            Est: {order.preparationTime || 15}m
                                        </Text>
                                    </View>
                                </View>

                                {/* Items */}
                                <View style={styles.itemsContainer}>
                                    <Text style={styles.itemsLabel}>Items:</Text>
                                    <Text style={styles.itemsText}>{order.items}</Text>
                                </View>

                                {/* Status Badge */}
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(order.status) }
                                ]}>
                                    <Text style={styles.statusBadgeText}>{order.status}</Text>
                                </View>

                                {/* Priority Controls */}
                                <View style={styles.priorityControls}>
                                    <Text style={styles.controlLabel}>Priority:</Text>
                                    <View style={styles.priorityButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.priorityBtn,
                                                order.priority === 'high' && styles.priorityBtnActive
                                            ]}
                                            onPress={() => updatePriority(order.id, 'high')}
                                        >
                                            <Text style={styles.priorityBtnText}>🔴</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.priorityBtn,
                                                order.priority === 'normal' && styles.priorityBtnActive
                                            ]}
                                            onPress={() => updatePriority(order.id, 'normal')}
                                        >
                                            <Text style={styles.priorityBtnText}>🟡</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.priorityBtn,
                                                order.priority === 'low' && styles.priorityBtnActive
                                            ]}
                                            onPress={() => updatePriority(order.id, 'low')}
                                        >
                                            <Text style={styles.priorityBtnText}>🟢</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    {order.status === 'PENDING' && (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: Colors.info }]}
                                            onPress={() => updateOrderStatus(order.id, 'PREPARING')}
                                        >
                                            <Text style={styles.actionBtnText}>Start Preparing</Text>
                                        </TouchableOpacity>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                                            onPress={() => updateOrderStatus(order.id, 'READY')}
                                        >
                                            <Text style={styles.actionBtnText}>Mark Ready</Text>
                                        </TouchableOpacity>
                                    )}
                                    {order.status === 'READY' && (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: Colors.gray600 }]}
                                            onPress={() => updateOrderStatus(order.id, 'DELIVERED')}
                                        >
                                            <Text style={styles.actionBtnText}>Delivered</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {filteredOrders.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🎉</Text>
                            <Text style={styles.emptyText}>
                                {filter === 'all' ? 'No active orders' : `No ${filter} orders`}
                            </Text>
                            <Text style={styles.emptySubtext}>All caught up!</Text>
                        </View>
                    )}
                </ScrollView>
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
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
    },
    headerTime: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.9,
        marginTop: 4,
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
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: 12,
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
    ordersGrid: {
        gap: 16,
    },
    orderCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    orderHeaderLeft: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    tableTag: {
        fontSize: 12,
        color: Colors.textLight,
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.white,
    },
    orderInfo: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    customerName: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 8,
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 16,
        fontWeight: '700',
    },
    estimatedTime: {
        fontSize: 12,
        color: Colors.textLight,
    },
    itemsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.gray100,
    },
    itemsLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemsText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    statusBadge: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.white,
    },
    priorityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    controlLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gray200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priorityBtnActive: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    priorityBtnText: {
        fontSize: 16,
    },
    actionButtons: {
        padding: 16,
        gap: 8,
    },
    actionBtn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyEmoji: {
        fontSize: 64,
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
    },
});
