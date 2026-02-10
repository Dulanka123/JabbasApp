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
import { db } from '../firebaseConfig';
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
    total: string;
    items: string;
    status: string;
    createdAt: any;
}

export default function AnalyticsScreen() {
    const router = useRouter();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

    useEffect(() => {
        const unsubscribeMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MenuItem[];
            setMenuItems(items);
        });

        const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersList);
        });

        return () => {
            unsubscribeMenu();
            unsubscribeOrders();
        };
    }, []);

    // Calculate date range
    const getDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (period === 'today') {
            return { start: today, end: new Date() };
        } else if (period === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return { start: weekAgo, end: new Date() };
        } else {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return { start: monthAgo, end: new Date() };
        }
    };

    const { start, end } = getDateRange();

    // Filter orders by period
    const periodOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate();
        return orderDate >= start && orderDate <= end;
    });

    // Calculate metrics
    const totalRevenue = periodOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
    }, 0);

    const completedOrders = periodOrders.filter(o => o.status === 'DELIVERED').length;
    const averageOrderValue = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;

    // Best selling items (based on menu items in orders)
    const itemFrequency: { [key: string]: number } = {};
    periodOrders.forEach(order => {
        const items = order.items.toLowerCase();
        menuItems.forEach(menuItem => {
            if (items.includes(menuItem.name.toLowerCase())) {
                itemFrequency[menuItem.name] = (itemFrequency[menuItem.name] || 0) + 1;
            }
        });
    });

    const bestSellers = Object.entries(itemFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Category breakdown
    const categoryRevenue: { [key: string]: number } = {};
    menuItems.forEach(item => {
        const category = item.category || 'Other';
        const price = parseFloat(item.price) || 0;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + price;
    });

    const topCategories = Object.entries(categoryRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    // Daily revenue chart (last 7 days)
    const getDailyRevenue = () => {
        const daily: { [key: string]: number } = {};
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            last7Days.push(dateStr);
            daily[dateStr] = 0;
        }

        orders.forEach(order => {
            if (!order.createdAt) return;
            const orderDate = order.createdAt.toDate();
            const dateStr = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
            if (daily.hasOwnProperty(dateStr)) {
                daily[dateStr] += parseFloat(order.total) || 0;
            }
        });

        return last7Days.map(day => ({ day, revenue: daily[day] }));
    };

    const dailyData = getDailyRevenue();
    const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1);

    // Peak hours analysis
    const hourlyOrders: { [key: number]: number } = {};
    periodOrders.forEach(order => {
        if (!order.createdAt) return;
        const hour = order.createdAt.toDate().getHours();
        hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyOrders)
        .sort((a, b) => b[1] - a[1])[0];

    const formatHour = (hour: string) => {
        const h = parseInt(hour);
        return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    };

    return (
        <BackgroundImage type="analytics">
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
                    <Text style={styles.headerTitle}>📈 Analytics</Text>
                    <View style={{ width: 60 }} />
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Period Selector */}
                    <View style={styles.periodSelector}>
                        <TouchableOpacity
                            style={[styles.periodTab, period === 'today' && styles.periodTabActive]}
                            onPress={() => setPeriod('today')}
                        >
                            <Text style={[styles.periodText, period === 'today' && styles.periodTextActive]}>
                                Today
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodTab, period === 'week' && styles.periodTabActive]}
                            onPress={() => setPeriod('week')}
                        >
                            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
                                This Week
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodTab, period === 'month' && styles.periodTabActive]}
                            onPress={() => setPeriod('month')}
                        >
                            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                                This Month
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Key Metrics */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricCard}>
                            <LinearGradient
                                colors={['#FF6B35', '#F7B731']}
                                style={styles.metricGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.metricEmoji}>💰</Text>
                                <Text style={styles.metricValue}>Rs. {totalRevenue.toFixed(0)}</Text>
                                <Text style={styles.metricLabel}>Total Revenue</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.metricCard}>
                            <LinearGradient
                                colors={['#3498DB', '#2ECC71']}
                                style={styles.metricGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.metricEmoji}>📦</Text>
                                <Text style={styles.metricValue}>{periodOrders.length}</Text>
                                <Text style={styles.metricLabel}>Total Orders</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.metricCard}>
                            <LinearGradient
                                colors={['#9B59B6', '#E74C3C']}
                                style={styles.metricGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.metricEmoji}>✅</Text>
                                <Text style={styles.metricValue}>{completedOrders}</Text>
                                <Text style={styles.metricLabel}>Completed</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.metricCard}>
                            <LinearGradient
                                colors={['#F39C12', '#E67E22']}
                                style={styles.metricGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.metricEmoji}>💵</Text>
                                <Text style={styles.metricValue}>Rs. {averageOrderValue.toFixed(0)}</Text>
                                <Text style={styles.metricLabel}>Avg Order</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Revenue Chart (Last 7 Days) */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>📊 Revenue Trend (Last 7 Days)</Text>
                        <View style={styles.chart}>
                            {dailyData.map((data, index) => (
                                <View key={index} style={styles.chartBar}>
                                    <Text style={styles.chartValue}>
                                        {data.revenue > 0 ? `Rs.${data.revenue.toFixed(0)}` : ''}
                                    </Text>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: `${(data.revenue / maxRevenue) * 100}%`,
                                                    backgroundColor: Colors.primary,
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.chartLabel}>{data.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Best Sellers */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🏆 Best Selling Items</Text>
                        {bestSellers.length > 0 ? (
                            bestSellers.map((item, index) => (
                                <View key={index} style={styles.bestSellerItem}>
                                    <View style={styles.rankBadge}>
                                        <Text style={styles.rankText}>#{index + 1}</Text>
                                    </View>
                                    <Text style={styles.bestSellerName}>{item.name}</Text>
                                    <Text style={styles.bestSellerCount}>{item.count} orders</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No data available</Text>
                        )}
                    </View>

                    {/* Category Breakdown */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📂 Category Performance</Text>
                        {topCategories.map(([category, revenue], index) => {
                            const totalCategoryRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0);
                            const percentage = totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0;
                            return (
                                <View key={index} style={styles.categoryItem}>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryName}>{category}</Text>
                                        <Text style={styles.categoryRevenue}>Rs. {revenue.toFixed(0)}</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${percentage}%`, backgroundColor: Colors.primary }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Peak Hours */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>⏰ Peak Hour Analysis</Text>
                        {peakHour ? (
                            <View style={styles.peakHourCard}>
                                <Text style={styles.peakHourEmoji}>🔥</Text>
                                <Text style={styles.peakHourText}>
                                    Most orders at {formatHour(peakHour[0])}
                                </Text>
                                <Text style={styles.peakHourCount}>
                                    {peakHour[1]} orders
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No data available</Text>
                        )}
                    </View>

                    {/* Summary Stats */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>📋 Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Menu Items:</Text>
                            <Text style={styles.summaryValue}>{menuItems.length}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>All-Time Orders:</Text>
                            <Text style={styles.summaryValue}>{orders.length}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Completion Rate:</Text>
                            <Text style={styles.summaryValue}>
                                {orders.length > 0 ? ((completedOrders / periodOrders.length) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                    </View>
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
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
    },
    content: {
        flex: 1,
    },
    periodSelector: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
        backgroundColor: Colors.white,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    periodTabActive: {
        backgroundColor: Colors.primary,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    periodTextActive: {
        color: Colors.white,
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: 16,
    },
    metricCard: {
        width: (width - 44) / 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    metricGradient: {
        padding: 20,
        alignItems: 'center',
    },
    metricEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: Colors.white,
        opacity: 0.9,
        fontWeight: '600',
    },
    chartCard: {
        backgroundColor: Colors.white,
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    chartValue: {
        fontSize: 9,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 4,
        height: 12,
    },
    barContainer: {
        flex: 1,
        width: '70%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 4,
    },
    chartLabel: {
        fontSize: 10,
        color: Colors.textLight,
        marginTop: 8,
        fontWeight: '600',
    },
    card: {
        backgroundColor: Colors.white,
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    bestSellerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    bestSellerName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    bestSellerCount: {
        fontSize: 14,
        color: Colors.textLight,
    },
    categoryItem: {
        marginBottom: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    categoryRevenue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.gray200,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    percentage: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'right',
    },
    peakHourCard: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    peakHourEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    peakHourText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    peakHourCount: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.primary,
    },
    summaryCard: {
        backgroundColor: Colors.white,
        margin: 16,
        marginTop: 0,
        marginBottom: 32,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.textLight,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        paddingVertical: 20,
    },
});
