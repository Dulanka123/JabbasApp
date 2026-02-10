import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';


const { width } = Dimensions.get('window');

interface MenuItem {
    id: string;
    name: string;
    price: string;
    category?: string;
}

interface Order {
    id: string;
    status?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Listen to menu items
        const unsubscribeMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
            setMenuItems(items);
        });

        // Listen to orders
        const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
            setOrders(orderList);
        });

        return () => {
            unsubscribeMenu();
            unsubscribeOrders();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const totalRevenue = menuItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0),
        0
    );
    const activeOrders = orders.filter(o => o.status === 'active').length;

    return (
        <BackgroundImage type="dashboard">
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome Back! 👋</Text>
                        <Text style={styles.headerTitle}>Jabba's Kitchen</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statEmoji}>🍔</Text>
                            <Text style={styles.statValue}>{menuItems.length}</Text>
                            <Text style={styles.statLabel}>Menu Items</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
                        <LinearGradient
                            colors={Colors.gradientSuccess}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statEmoji}>📋</Text>
                            <Text style={styles.statValue}>{orders.length}</Text>
                            <Text style={styles.statLabel}>Total Orders</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#F7B731', '#FF6B35']}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statEmoji}>⏳</Text>
                            <Text style={styles.statValue}>{activeOrders}</Text>
                            <Text style={styles.statLabel}>Active Orders</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#3498DB', '#2ECC71']}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statEmoji}>💰</Text>
                            <Text style={styles.statValue}>Rs.{totalRevenue}</Text>
                            <Text style={styles.statLabel}>Revenue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/menu')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFE5DB' }]}>
                                <Text style={styles.actionEmoji}>🍽️</Text>
                            </View>
                            <Text style={styles.actionTitle}>Menu</Text>
                            <Text style={styles.actionSubtitle}>Manage items</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/orders')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF4D6' }]}>
                                <Text style={styles.actionEmoji}>📦</Text>
                            </View>
                            <Text style={styles.actionTitle}>Orders</Text>
                            <Text style={styles.actionSubtitle}>Track orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/tables')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={styles.actionEmoji}>🪑</Text>
                            </View>
                            <Text style={styles.actionTitle}>Tables</Text>
                            <Text style={styles.actionSubtitle}>Manage tables</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/kitchen')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Text style={styles.actionEmoji}>👨‍🍳</Text>
                            </View>
                            <Text style={styles.actionTitle}>Kitchen</Text>
                            <Text style={styles.actionSubtitle}>Live orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/inventory')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Text style={styles.actionEmoji}>📦</Text>
                            </View>
                            <Text style={styles.actionTitle}>Inventory</Text>
                            <Text style={styles.actionSubtitle}>Stock control</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/analytics')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Text style={styles.actionEmoji}>📈</Text>
                            </View>
                            <Text style={styles.actionTitle}>Analytics</Text>
                            <Text style={styles.actionSubtitle}>Reports</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/qr-menu')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E8EAF6' }]}>
                                <Text style={styles.actionEmoji}>📱</Text>
                            </View>
                            <Text style={styles.actionTitle}>QR Menu</Text>
                            <Text style={styles.actionSubtitle}>Digital menu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/customers')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF9C4' }]}>
                                <Text style={styles.actionEmoji}>👥</Text>
                            </View>
                            <Text style={styles.actionTitle}>Customers</Text>
                            <Text style={styles.actionSubtitle}>CRM & loyalty</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/payments')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#C8E6C9' }]}>
                                <Text style={styles.actionEmoji}>💳</Text>
                            </View>
                            <Text style={styles.actionTitle}>Payments</Text>
                            <Text style={styles.actionSubtitle}>Billing & receipts</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/staff')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFE5F0' }]}>
                                <Text style={styles.actionEmoji}>👥</Text>
                            </View>
                            <Text style={styles.actionTitle}>Staff</Text>
                            <Text style={styles.actionSubtitle}>Team management</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/reservations')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FF' }]}>
                                <Text style={styles.actionEmoji}>📅</Text>
                            </View>
                            <Text style={styles.actionTitle}>Reservations</Text>
                            <Text style={styles.actionSubtitle}>Booking system</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/add-menu-item')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#D4F4DD' }]}>
                                <Text style={styles.actionEmoji}>➕</Text>
                            </View>
                            <Text style={styles.actionTitle}>Add Item</Text>
                            <Text style={styles.actionSubtitle}>New menu item</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/profile')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E5DEFF' }]}>
                                <Text style={styles.actionEmoji}>⚙️</Text>
                            </View>
                            <Text style={styles.actionTitle}>Settings</Text>
                            <Text style={styles.actionSubtitle}>Configure app</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Menu Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Menu Items</Text>
                        <TouchableOpacity onPress={() => router.push('/menu')}>
                            <Text style={styles.seeAllText}>See All →</Text>
                        </TouchableOpacity>
                    </View>
                    {menuItems.slice(0, 3).map((item) => (
                        <View key={item.id} style={styles.menuItem}>
                            <View style={styles.menuItemIcon}>
                                <Text style={styles.menuItemEmoji}>🍔</Text>
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemName}>{item.name}</Text>
                                <Text style={styles.menuItemCategory}>
                                    {item.category || 'Main Course'}
                                </Text>
                            </View>
                            <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
                        </View>
                    ))}
                    {menuItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🍽️</Text>
                            <Text style={styles.emptyText}>No menu items yet</Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/add-menu-item')}
                            >
                                <Text style={styles.emptyButtonText}>Add First Item</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </BackgroundImage>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        paddingTop: 60,
        backgroundColor: Colors.white,
    },
    greeting: {
        fontSize: 16,
        color: Colors.textLight,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
    },
    logoutButton: {
        backgroundColor: Colors.error,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    logoutText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    statCard: {
        width: (width - 48) / 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    statGradient: {
        padding: 20,
        alignItems: 'center',
    },
    statEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.white,
        opacity: 0.9,
        fontWeight: '600',
    },
    section: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (width - 60) / 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    actionIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionEmoji: {
        fontSize: 32,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItemIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemEmoji: {
        fontSize: 24,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    menuItemCategory: {
        fontSize: 12,
        color: Colors.textLight,
    },
    menuItemPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
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
});
