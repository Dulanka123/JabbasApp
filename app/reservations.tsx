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
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Reservation {
    id: string;
    customerName: string;
    phone: string;
    email?: string;
    guestCount: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    tableNumber?: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    specialRequests?: string;
    createdAt: any;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ReservationsScreen() {
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Form states
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [guestCount, setGuestCount] = useState('2');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'reservations'), orderBy('date', 'asc'), orderBy('time', 'asc')),
            (snapshot) => {
                const reservationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Reservation[];
                setReservations(reservationsList);
            }
        );

        return () => unsubscribe();
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getReservationsForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return reservations.filter(r => r.date === dateStr);
    };

    const getReservationsForMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${year}-${month}`;
        return reservations.filter(r => r.date.startsWith(monthPrefix));
    };

    const getTodayReservations = () => {
        const today = formatDate(new Date());
        return reservations.filter(r => r.date === today);
    };

    const openAddModal = (selectedDayDate?: Date) => {
        resetForm();
        if (selectedDayDate) {
            setDate(formatDate(selectedDayDate));
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setCustomerName('');
        setPhone('');
        setEmail('');
        setGuestCount('2');
        setDate('');
        setTime('');
        setTableNumber('');
        setSpecialRequests('');
    };

    const handleSave = async () => {
        if (!customerName || !phone || !date || !time || !guestCount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const reservationData: any = {
                customerName,
                phone,
                email: email || null,
                guestCount: parseInt(guestCount),
                date,
                time,
                tableNumber: tableNumber ? parseInt(tableNumber) : null,
                status: 'confirmed',
                specialRequests: specialRequests || null,
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'reservations'), reservationData);
            setModalVisible(false);
            resetForm();
            Alert.alert('Success', 'Reservation created successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create reservation');
        }
    };

    const updateStatus = async (reservationId: string, newStatus: Reservation['status']) => {
        try {
            await updateDoc(doc(db, 'reservations', reservationId), {
                status: newStatus
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update reservation');
        }
    };

    const handleDelete = (reservationId: string) => {
        Alert.alert(
            'Cancel Reservation',
            'Are you sure you want to cancel this reservation?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateStatus(reservationId, 'cancelled');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel reservation');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: Reservation['status']) => {
        switch (status) {
            case 'confirmed': return Colors.success;
            case 'pending': return Colors.warning;
            case 'cancelled': return Colors.error;
            case 'completed': return Colors.info;
            default: return Colors.gray400;
        }
    };

    const monthDays = getDaysInMonth(currentMonth);
    const todayReservations = getTodayReservations();
    const monthReservations = getReservationsForMonth(currentMonth);
    const confirmedCount = monthReservations.filter(r => r.status === 'confirmed').length;
    const totalGuests = monthReservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.guestCount, 0);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    return (
        <BackgroundImage type="reservation">
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
                    <Text style={styles.headerTitle}>📅 Reservations</Text>
                    <TouchableOpacity onPress={() => openAddModal()} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.primary }]}>
                            {todayReservations.length}
                        </Text>
                        <Text style={styles.statLabel}>Today</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>
                            {confirmedCount}
                        </Text>
                        <Text style={styles.statLabel}>This Month</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.info }]}>
                            {totalGuests}
                        </Text>
                        <Text style={styles.statLabel}>Total Guests</Text>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Calendar */}
                    <View style={styles.calendarCard}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(newMonth.getMonth() - 1);
                                    setCurrentMonth(newMonth);
                                }}
                                style={styles.monthButton}
                            >
                                <Text style={styles.monthButtonText}>←</Text>
                            </TouchableOpacity>

                            <Text style={styles.monthTitle}>
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </Text>

                            <TouchableOpacity
                                onPress={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(newMonth.getMonth() + 1);
                                    setCurrentMonth(newMonth);
                                }}
                                style={styles.monthButton}
                            >
                                <Text style={styles.monthButtonText}>→</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Day labels */}
                        <View style={styles.daysHeader}>
                            {DAYS.map(day => (
                                <Text key={day} style={styles.dayLabel}>{day}</Text>
                            ))}
                        </View>

                        {/* Calendar grid */}
                        <View style={styles.calendarGrid}>
                            {monthDays.map((day, index) => {
                                if (!day) {
                                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                                }

                                const dayReservations = getReservationsForDate(day);
                                const confirmedDay = dayReservations.filter(r => r.status === 'confirmed').length;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayCell,
                                            isToday(day) && styles.todayCell,
                                            confirmedDay > 0 && styles.hasReservations
                                        ]}
                                        onPress={() => openAddModal(day)}
                                    >
                                        <Text style={[
                                            styles.dayNumber,
                                            isToday(day) && styles.todayNumber
                                        ]}>
                                            {day.getDate()}
                                        </Text>
                                        {confirmedDay > 0 && (
                                            <View style={styles.reservationDot}>
                                                <Text style={styles.reservationCount}>{confirmedDay}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Today's Reservations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Reservations ({todayReservations.length})</Text>
                        {todayReservations.length > 0 ? (
                            todayReservations.map((reservation) => (
                                <View key={reservation.id} style={styles.reservationCard}>
                                    <View style={styles.reservationHeader}>
                                        <View style={styles.reservationLeft}>
                                            <Text style={styles.reservationName}>{reservation.customerName}</Text>
                                            <Text style={styles.reservationInfo}>
                                                🕐 {reservation.time} • 👥 {reservation.guestCount} guests
                                            </Text>
                                            {reservation.tableNumber && (
                                                <Text style={styles.reservationInfo}>
                                                    🪑 Table {reservation.tableNumber}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(reservation.status) + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(reservation.status) }
                                            ]}>
                                                {reservation.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactText}>📞 {reservation.phone}</Text>
                                        {reservation.email && (
                                            <Text style={styles.contactText}>✉️ {reservation.email}</Text>
                                        )}
                                    </View>

                                    {reservation.specialRequests && (
                                        <View style={styles.specialRequests}>
                                            <Text style={styles.specialLabel}>Special Requests:</Text>
                                            <Text style={styles.specialText}>{reservation.specialRequests}</Text>
                                        </View>
                                    )}

                                    <View style={styles.actionRow}>
                                        {reservation.status === 'confirmed' && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, { backgroundColor: Colors.success + '20' }]}
                                                    onPress={() => updateStatus(reservation.id, 'completed')}
                                                >
                                                    <Text style={[styles.actionBtnText, { color: Colors.success }]}>
                                                        ✓ Complete
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, { backgroundColor: Colors.error + '20' }]}
                                                    onPress={() => handleDelete(reservation.id)}
                                                >
                                                    <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                                                        ✕ Cancel
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {reservation.status === 'pending' && (
                                            <TouchableOpacity
                                                style={[styles.actionBtn, { backgroundColor: Colors.success + '20', flex: 1 }]}
                                                onPress={() => updateStatus(reservation.id, 'confirmed')}
                                            >
                                                <Text style={[styles.actionBtnText, { color: Colors.success }]}>
                                                    ✓ Confirm
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>📅</Text>
                                <Text style={styles.emptyText}>No reservations for today</Text>
                            </View>
                        )}
                    </View>

                    {/* Upcoming Reservations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Reservations</Text>
                        {reservations
                            .filter(r => {
                                const resDate = new Date(r.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return resDate > today && r.status === 'confirmed';
                            })
                            .slice(0, 5)
                            .map((reservation) => (
                                <View key={reservation.id} style={styles.upcomingCard}>
                                    <View style={styles.upcomingLeft}>
                                        <Text style={styles.upcomingName}>{reservation.customerName}</Text>
                                        <Text style={styles.upcomingDate}>
                                            📅 {reservation.date} at {reservation.time}
                                        </Text>
                                        <Text style={styles.upcomingGuests}>
                                            👥 {reservation.guestCount} guests
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(reservation.id)}
                                        style={styles.cancelBtn}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                    </View>
                </ScrollView>

                {/* Add Reservation Modal */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>New Reservation</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Customer Name *"
                                    value={customerName}
                                    onChangeText={setCustomerName}
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
                                    placeholder="Number of Guests *"
                                    value={guestCount}
                                    onChangeText={setGuestCount}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Date (YYYY-MM-DD) *"
                                    value={date}
                                    onChangeText={setDate}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Time (HH:MM, e.g., 19:30) *"
                                    value={time}
                                    onChangeText={setTime}
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Table Number (Optional)"
                                    value={tableNumber}
                                    onChangeText={setTableNumber}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Special Requests (Optional)"
                                    value={specialRequests}
                                    onChangeText={setSpecialRequests}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <LinearGradient
                                        colors={Colors.gradientSuccess}
                                        style={styles.saveGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.saveButtonText}>Create Reservation</Text>
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
    content: {
        flex: 1,
        padding: 16,
    },
    calendarCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.gray100,
        borderRadius: 20,
    },
    monthButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primary,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    daysHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textLight,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    todayCell: {
        backgroundColor: Colors.primary + '10',
        borderRadius: 8,
    },
    hasReservations: {
        borderWidth: 1,
        borderColor: Colors.success + '40',
        borderRadius: 8,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    todayNumber: {
        color: Colors.primary,
        fontWeight: '800',
    },
    reservationDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.success,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    reservationCount: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
    },
    reservationCard: {
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
    reservationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reservationLeft: {
        flex: 1,
    },
    reservationName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    reservationInfo: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    contactInfo: {
        marginBottom: 8,
    },
    contactText: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 2,
    },
    specialRequests: {
        backgroundColor: Colors.warning + '10',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    specialLabel: {
        fontSize: 11,
        color: Colors.textLight,
        marginBottom: 4,
        fontWeight: '600',
    },
    specialText: {
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
    upcomingCard: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    upcomingLeft: {
        flex: 1,
    },
    upcomingName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    upcomingDate: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 2,
    },
    upcomingGuests: {
        fontSize: 12,
        color: Colors.textLight,
    },
    cancelBtn: {
        backgroundColor: Colors.error + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelBtnText: {
        color: Colors.error,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
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
