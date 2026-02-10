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
    Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Payment {
    id: string;
    orderId: string;
    customerName?: string;
    totalAmount: number;
    tipAmount: number;
    discountAmount: number;
    finalAmount: number;
    paymentMethod: 'cash' | 'card' | 'upi' | 'split';
    splitPayments?: {
        method: string;
        amount: number;
    }[];
    createdAt: any;
    notes?: string;
}

interface Order {
    id: string;
    items: string;
    total: string;
    customerName?: string;
}

export default function PaymentsScreen() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Payment form states
    const [tipAmount, setTipAmount] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('cash');
    const [splitAmount1, setSplitAmount1] = useState('');
    const [splitAmount2, setSplitAmount2] = useState('');
    const [splitMethod1, setSplitMethod1] = useState<'cash' | 'card' | 'upi'>('cash');
    const [splitMethod2, setSplitMethod2] = useState<'cash' | 'card' | 'upi'>('card');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const paymentsQuery = query(
            collection(db, 'payments'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
            const paymentsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];
            setPayments(paymentsList);
        });

        const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersList);
        });

        return () => {
            unsubscribePayments();
            unsubscribeOrders();
        };
    }, []);

    const openPaymentModal = (order: Order) => {
        setSelectedOrder(order);
        setTipAmount('');
        setDiscountAmount('');
        setPaymentMethod('cash');
        setSplitAmount1('');
        setSplitAmount2('');
        setNotes('');
        setModalVisible(true);
    };

    const calculateFinalAmount = () => {
        if (!selectedOrder) return 0;
        const baseAmount = parseFloat(selectedOrder.total) || 0;
        const tip = parseFloat(tipAmount) || 0;
        const discount = parseFloat(discountAmount) || 0;
        return baseAmount + tip - discount;
    };

    const handleProcessPayment = async () => {
        if (!selectedOrder) return;

        const baseAmount = parseFloat(selectedOrder.total) || 0;
        const tip = parseFloat(tipAmount) || 0;
        const discount = parseFloat(discountAmount) || 0;
        const finalAmount = calculateFinalAmount();

        try {
            let paymentData: any = {
                orderId: selectedOrder.id,
                customerName: selectedOrder.customerName || 'Guest',
                totalAmount: baseAmount,
                tipAmount: tip,
                discountAmount: discount,
                finalAmount: finalAmount,
                paymentMethod: paymentMethod,
                createdAt: new Date(),
                notes: notes || null,
            };

            if (paymentMethod === 'split') {
                const amount1 = parseFloat(splitAmount1) || 0;
                const amount2 = parseFloat(splitAmount2) || 0;

                if (amount1 + amount2 !== finalAmount) {
                    Alert.alert('Error', `Split amounts must equal Rs. ${finalAmount.toFixed(2)}`);
                    return;
                }

                paymentData.splitPayments = [
                    { method: splitMethod1, amount: amount1 },
                    { method: splitMethod2, amount: amount2 },
                ];
            }

            await addDoc(collection(db, 'payments'), paymentData);

            setModalVisible(false);
            Alert.alert('Success', 'Payment processed successfully!');

            // Optionally generate receipt
            generateReceipt(paymentData);
        } catch (error) {
            Alert.alert('Error', 'Failed to process payment');
        }
    };

    const generateReceipt = async (payment: any) => {
        const receipt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━
     JABBA'S KITCHEN
━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer: ${payment.customerName}
Date: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Items: ${selectedOrder?.items}

Subtotal:     Rs. ${payment.totalAmount.toFixed(2)}
Tip:          Rs. ${payment.tipAmount.toFixed(2)}
Discount:     Rs. ${payment.discountAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:        Rs. ${payment.finalAmount.toFixed(2)}

Payment: ${payment.paymentMethod.toUpperCase()}
${payment.splitPayments ? `
Split:
  ${payment.splitPayments[0].method}: Rs. ${payment.splitPayments[0].amount}
  ${payment.splitPayments[1].method}: Rs. ${payment.splitPayments[1].amount}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━
   Thank you for dining!
   Visit us again! 🍽️
━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        try {
            await Share.share({
                message: receipt,
                title: 'Receipt - Jabba\'s Kitchen',
            });
        } catch (error) {
            console.error('Failed to share receipt');
        }
    };

    const PAYMENT_METHODS = ['cash', 'card', 'upi', 'split'] as const;

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'cash': return '💵';
            case 'card': return '💳';
            case 'upi': return '📱';
            case 'split': return '🔀';
            default: return '💰';
        }
    };

    const totalRevenue = payments.reduce((sum, p) => sum + p.finalAmount, 0);
    const totalTips = payments.reduce((sum, p) => sum + p.tipAmount, 0);
    const totalDiscounts = payments.reduce((sum, p) => sum + p.discountAmount, 0);
    const averageTransaction = payments.length > 0 ? totalRevenue / payments.length : 0;

    return (
        <BackgroundImage type="payment">
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
                    <Text style={styles.headerTitle}>💳 Payments</Text>
                    <View style={{ width: 60 }} />
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.primary }]}>
                            Rs. {totalRevenue.toFixed(0)}
                        </Text>
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>
                            Rs. {totalTips.toFixed(0)}
                        </Text>
                        <Text style={styles.statLabel}>Tips</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.info }]}>
                            {payments.length}
                        </Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Pending Orders */}
                    {orders.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📋 Pending Orders</Text>
                            {orders.slice(0, 3).map((order) => (
                                <View key={order.id} style={styles.orderCard}>
                                    <View style={styles.orderInfo}>
                                        <Text style={styles.orderName}>
                                            {order.customerName || 'Guest'}
                                        </Text>
                                        <Text style={styles.orderItems}>{order.items}</Text>
                                    </View>
                                    <View style={styles.orderRight}>
                                        <Text style={styles.orderAmount}>
                                            Rs. {order.total}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.payButton}
                                            onPress={() => openPaymentModal(order)}
                                        >
                                            <Text style={styles.payButtonText}>Pay Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Payment History */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📜 Recent Payments</Text>
                        {payments.map((payment) => (
                            <View key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <View>
                                        <Text style={styles.paymentCustomer}>
                                            {payment.customerName}
                                        </Text>
                                        <Text style={styles.paymentDate}>
                                            {payment.createdAt?.toDate().toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.paymentMethodBadge}>
                                        <Text style={styles.paymentMethodEmoji}>
                                            {getPaymentIcon(payment.paymentMethod)}
                                        </Text>
                                        <Text style={styles.paymentMethodText}>
                                            {payment.paymentMethod.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.paymentBreakdown}>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>Subtotal:</Text>
                                        <Text style={styles.breakdownValue}>
                                            Rs. {payment.totalAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                    {payment.tipAmount > 0 && (
                                        <View style={styles.breakdownRow}>
                                            <Text style={styles.breakdownLabel}>Tip:</Text>
                                            <Text style={[styles.breakdownValue, { color: Colors.success }]}>
                                                +Rs. {payment.tipAmount.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    {payment.discountAmount > 0 && (
                                        <View style={styles.breakdownRow}>
                                            <Text style={styles.breakdownLabel}>Discount:</Text>
                                            <Text style={[styles.breakdownValue, { color: Colors.error }]}>
                                                -Rs. {payment.discountAmount.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={[styles.breakdownRow, styles.totalRow]}>
                                        <Text style={styles.totalLabel}>Total:</Text>
                                        <Text style={styles.totalValue}>
                                            Rs. {payment.finalAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                {payment.splitPayments && (
                                    <View style={styles.splitInfo}>
                                        <Text style={styles.splitTitle}>Split Payment:</Text>
                                        {payment.splitPayments.map((split, idx) => (
                                            <Text key={idx} style={styles.splitText}>
                                                {getPaymentIcon(split.method)} {split.method}: Rs. {split.amount.toFixed(2)}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}

                        {payments.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>💳</Text>
                                <Text style={styles.emptyText}>No payments yet</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Payment Modal */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Process Payment</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedOrder && (
                                    <View style={styles.orderSummary}>
                                        <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                                        <Text style={styles.orderSummaryText}>
                                            Customer: {selectedOrder.customerName || 'Guest'}
                                        </Text>
                                        <Text style={styles.orderSummaryText}>
                                            Items: {selectedOrder.items}
                                        </Text>
                                        <Text style={styles.orderSummaryAmount}>
                                            Subtotal: Rs. {selectedOrder.total}
                                        </Text>
                                    </View>
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Tip Amount (Optional)"
                                    value={tipAmount}
                                    onChangeText={setTipAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Discount Amount (Optional)"
                                    value={discountAmount}
                                    onChangeText={setDiscountAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <View style={styles.finalAmountCard}>
                                    <Text style={styles.finalAmountLabel}>Final Amount:</Text>
                                    <Text style={styles.finalAmountValue}>
                                        Rs. {calculateFinalAmount().toFixed(2)}
                                    </Text>
                                </View>

                                <Text style={styles.label}>Payment Method</Text>
                                <View style={styles.methodGrid}>
                                    {PAYMENT_METHODS.map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.methodChip,
                                                paymentMethod === method && styles.methodChipActive
                                            ]}
                                            onPress={() => setPaymentMethod(method)}
                                        >
                                            <Text style={styles.methodEmoji}>
                                                {getPaymentIcon(method)}
                                            </Text>
                                            <Text style={[
                                                styles.methodText,
                                                paymentMethod === method && styles.methodTextActive
                                            ]}>
                                                {method.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {paymentMethod === 'split' && (
                                    <View style={styles.splitContainer}>
                                        <Text style={styles.splitLabel}>Split Amounts:</Text>
                                        <View style={styles.splitRow}>
                                            <TextInput
                                                style={[styles.input, styles.splitInput]}
                                                placeholder="Amount 1"
                                                value={splitAmount1}
                                                onChangeText={setSplitAmount1}
                                                keyboardType="numeric"
                                                placeholderTextColor={Colors.gray400}
                                            />
                                            <View style={styles.splitMethodPicker}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod1 === 'cash' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod1('cash')}
                                                >
                                                    <Text>💵</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod1 === 'card' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod1('card')}
                                                >
                                                    <Text>💳</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod1 === 'upi' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod1('upi')}
                                                >
                                                    <Text>📱</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={styles.splitRow}>
                                            <TextInput
                                                style={[styles.input, styles.splitInput]}
                                                placeholder="Amount 2"
                                                value={splitAmount2}
                                                onChangeText={setSplitAmount2}
                                                keyboardType="numeric"
                                                placeholderTextColor={Colors.gray400}
                                            />
                                            <View style={styles.splitMethodPicker}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod2 === 'cash' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod2('cash')}
                                                >
                                                    <Text>💵</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod2 === 'card' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod2('card')}
                                                >
                                                    <Text>💳</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.splitMethodBtn,
                                                        splitMethod2 === 'upi' && styles.splitMethodBtnActive
                                                    ]}
                                                    onPress={() => setSplitMethod2('upi')}
                                                >
                                                    <Text>📱</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Notes (Optional)"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TouchableOpacity style={styles.processButton} onPress={handleProcessPayment}>
                                    <LinearGradient
                                        colors={Colors.gradientSuccess}
                                        style={styles.processGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.processButtonText}>
                                            💳 Process Payment
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
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
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textLight,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderInfo: {
        flex: 1,
    },
    orderName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    orderItems: {
        fontSize: 13,
        color: Colors.textLight,
    },
    orderRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 8,
    },
    payButton: {
        backgroundColor: Colors.success,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    payButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    paymentCard: {
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
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    paymentCustomer: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    paymentDate: {
        fontSize: 12,
        color: Colors.textLight,
    },
    paymentMethodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    paymentMethodEmoji: {
        fontSize: 14,
    },
    paymentMethodText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    paymentBreakdown: {
        backgroundColor: Colors.gray100,
        padding: 12,
        borderRadius: 8,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    breakdownLabel: {
        fontSize: 14,
        color: Colors.textLight,
    },
    breakdownValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    totalRow: {
        marginTop: 6,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.gray300,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },
    splitInfo: {
        marginTop: 12,
        backgroundColor: Colors.info + '10',
        padding: 12,
        borderRadius: 8,
    },
    splitTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 6,
    },
    splitText: {
        fontSize: 12,
        color: Colors.text,
        marginBottom: 4,
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
    orderSummary: {
        backgroundColor: Colors.primary + '10',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    orderSummaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    orderSummaryText: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    orderSummaryAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 8,
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
        height: 60,
        paddingTop: 16,
    },
    finalAmountCard: {
        backgroundColor: Colors.success + '10',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    finalAmountLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    finalAmountValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.success,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    methodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    methodChip: {
        flex: 1,
        minWidth: (width - 64) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: Colors.gray100,
    },
    methodChipActive: {
        backgroundColor: Colors.primary,
    },
    methodEmoji: {
        fontSize: 20,
    },
    methodText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    methodTextActive: {
        color: Colors.white,
    },
    splitContainer: {
        backgroundColor: Colors.gray100,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    splitLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    splitRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    splitInput: {
        flex: 1,
        marginBottom: 0,
    },
    splitMethodPicker: {
        flexDirection: 'row',
        gap: 4,
    },
    splitMethodBtn: {
        width: 40,
        height: 52,
        backgroundColor: Colors.white,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splitMethodBtnActive: {
        backgroundColor: Colors.primary + '30',
    },
    processButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    processGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    processButtonText: {
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
