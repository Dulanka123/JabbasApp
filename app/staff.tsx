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

type StaffRole = 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: StaffRole;
    permissions: {
        manageMenu: boolean;
        manageOrders: boolean;
        manageTables: boolean;
        manageInventory: boolean;
        manageStaff: boolean;
        viewAnalytics: boolean;
        processPayments: boolean;
        manageCustomers: boolean;
    };
    salary?: number;
    shift: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
    status: 'active' | 'inactive' | 'on-leave';
    joinDate: any;
    notes?: string;
}

const ROLE_TEMPLATES: Record<StaffRole, StaffMember['permissions']> = {
    owner: {
        manageMenu: true,
        manageOrders: true,
        manageTables: true,
        manageInventory: true,
        manageStaff: true,
        viewAnalytics: true,
        processPayments: true,
        manageCustomers: true,
    },
    manager: {
        manageMenu: true,
        manageOrders: true,
        manageTables: true,
        manageInventory: true,
        manageStaff: false,
        viewAnalytics: true,
        processPayments: true,
        manageCustomers: true,
    },
    chef: {
        manageMenu: false,
        manageOrders: true,
        manageTables: false,
        manageInventory: true,
        manageStaff: false,
        viewAnalytics: false,
        processPayments: false,
        manageCustomers: false,
    },
    waiter: {
        manageMenu: false,
        manageOrders: true,
        manageTables: true,
        manageInventory: false,
        manageStaff: false,
        viewAnalytics: false,
        processPayments: false,
        manageCustomers: true,
    },
    cashier: {
        manageMenu: false,
        manageOrders: true,
        manageTables: false,
        manageInventory: false,
        manageStaff: false,
        viewAnalytics: false,
        processPayments: true,
        manageCustomers: true,
    },
};

export default function StaffScreen() {
    const router = useRouter();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all');

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<StaffRole>('waiter');
    const [salary, setSalary] = useState('');
    const [shift, setShift] = useState<StaffMember['shift']>('flexible');
    const [status, setStatus] = useState<StaffMember['status']>('active');
    const [notes, setNotes] = useState('');
    const [permissions, setPermissions] = useState(ROLE_TEMPLATES.waiter);

    useEffect(() => {
        const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const staffList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as StaffMember[];
            setStaff(staffList);
        });

        return () => unsubscribe();
    }, []);

    const getRoleIcon = (role: StaffRole) => {
        switch (role) {
            case 'owner': return '👑';
            case 'manager': return '📊';
            case 'chef': return '👨‍🍳';
            case 'waiter': return '🍽️';
            case 'cashier': return '💰';
            default: return '👤';
        }
    };

    const getRoleColor = (role: StaffRole) => {
        switch (role) {
            case 'owner': return '#FFD700';
            case 'manager': return '#FF6B35';
            case 'chef': return '#27AE60';
            case 'waiter': return '#3498DB';
            case 'cashier': return '#9B59B6';
            default: return Colors.gray400;
        }
    };

    const getStatusColor = (status: StaffMember['status']) => {
        switch (status) {
            case 'active': return Colors.success;
            case 'inactive': return Colors.error;
            case 'on-leave': return Colors.warning;
            default: return Colors.gray400;
        }
    };

    const openAddModal = () => {
        setEditingStaff(null);
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (member: StaffMember) => {
        setEditingStaff(member);
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone);
        setRole(member.role);
        setSalary(member.salary?.toString() || '');
        setShift(member.shift);
        setStatus(member.status);
        setNotes(member.notes || '');
        setPermissions(member.permissions);
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setRole('waiter');
        setSalary('');
        setShift('flexible');
        setStatus('active');
        setNotes('');
        setPermissions(ROLE_TEMPLATES.waiter);
    };

    const handleRoleChange = (newRole: StaffRole) => {
        setRole(newRole);
        setPermissions(ROLE_TEMPLATES[newRole]);
    };

    const handleSave = async () => {
        if (!name || !email || !phone) {
            Alert.alert('Error', 'Name, email, and phone are required');
            return;
        }

        try {
            const staffData: any = {
                name,
                email,
                phone,
                role,
                permissions,
                salary: salary ? parseFloat(salary) : null,
                shift,
                status,
                notes: notes || null,
            };

            if (editingStaff) {
                await updateDoc(doc(db, 'staff', editingStaff.id), staffData);
            } else {
                staffData.joinDate = new Date();
                await addDoc(collection(db, 'staff'), staffData);
            }

            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save staff member');
        }
    };

    const handleDelete = (staffId: string) => {
        Alert.alert(
            'Delete Staff Member',
            'Are you sure? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'staff', staffId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete staff member');
                        }
                    },
                },
            ]
        );
    };

    const togglePermission = (key: keyof StaffMember['permissions']) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const filteredStaff = staff.filter(member =>
        filter === 'all' || member.status === filter
    );

    const activeStaff = staff.filter(s => s.status === 'active').length;
    const totalSalary = staff
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.salary || 0), 0);

    return (
        <BackgroundImage type="staff">
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
                    <Text style={styles.headerTitle}>👥 Staff</Text>
                    <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.primary }]}>{staff.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{activeStaff}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>
                            Rs. {totalSalary.toLocaleString()}
                        </Text>
                        <Text style={styles.statLabel}>Salaries</Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <View style={styles.filterContainer}>
                        {['all', 'active', 'inactive', 'on-leave'].map((statusFilter) => (
                            <TouchableOpacity
                                key={statusFilter}
                                style={[styles.filterChip, filter === statusFilter && styles.filterChipActive]}
                                onPress={() => setFilter(statusFilter as typeof filter)}
                            >
                                <Text style={[styles.filterText, filter === statusFilter && styles.filterTextActive]}>
                                    {statusFilter === 'all'
                                        ? `All (${staff.length})`
                                        : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')
                                    }
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Staff List */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredStaff.map((member) => (
                        <View key={member.id} style={styles.staffCard}>
                            <View style={styles.staffHeader}>
                                <View style={styles.staffHeaderLeft}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.staffName}>{member.name}</Text>
                                        <View style={[
                                            styles.roleBadge,
                                            { backgroundColor: getRoleColor(member.role) + '30' }
                                        ]}>
                                            <Text style={styles.roleEmoji}>{getRoleIcon(member.role)}</Text>
                                            <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                                                {member.role.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.staffContact}>📧 {member.email}</Text>
                                    <Text style={styles.staffContact}>📞 {member.phone}</Text>
                                </View>
                            </View>

                            <View style={styles.staffInfo}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Shift:</Text>
                                    <Text style={styles.infoValue}>{member.shift}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Salary:</Text>
                                    <Text style={styles.infoValue}>
                                        {member.salary ? `Rs. ${member.salary.toLocaleString()}` : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Status:</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(member.status) + '20' }
                                    ]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
                                            {member.status.toUpperCase().replace('-', ' ')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Permissions */}
                            <View style={styles.permissionsContainer}>
                                <Text style={styles.permissionsTitle}>Permissions:</Text>
                                <View style={styles.permissionsList}>
                                    {Object.entries(member.permissions).map(([key, value]) => (
                                        value && (
                                            <View key={key} style={styles.permissionChip}>
                                                <Text style={styles.permissionText}>
                                                    ✓ {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </Text>
                                            </View>
                                        )
                                    ))}
                                </View>
                            </View>

                            {member.notes && (
                                <View style={styles.notesRow}>
                                    <Text style={styles.notesLabel}>Notes:</Text>
                                    <Text style={styles.notesText}>{member.notes}</Text>
                                </View>
                            )}

                            {/* Actions */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.info + '20' }]}
                                    onPress={() => openEditModal(member)}
                                >
                                    <Text style={[styles.actionBtnText, { color: Colors.info }]}>
                                        ✏️ Edit
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.error + '20' }]}
                                    onPress={() => handleDelete(member.id)}
                                >
                                    <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                                        🗑️ Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {filteredStaff.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>👥</Text>
                            <Text style={styles.emptyText}>No staff members found</Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                                <Text style={styles.emptyButtonText}>Add Staff Member</Text>
                            </TouchableOpacity>
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
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                                    placeholder="Email *"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
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

                                <Text style={styles.label}>Role *</Text>
                                <View style={styles.roleGrid}>
                                    {(['owner', 'manager', 'chef', 'waiter', 'cashier'] as StaffRole[]).map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[
                                                styles.roleChip,
                                                role === r && { backgroundColor: getRoleColor(r) }
                                            ]}
                                            onPress={() => handleRoleChange(r)}
                                        >
                                            <Text style={styles.roleChipEmoji}>{getRoleIcon(r)}</Text>
                                            <Text style={[
                                                styles.roleChipText,
                                                role === r && { color: Colors.white }
                                            ]}>
                                                {r.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Monthly Salary (Optional)"
                                    value={salary}
                                    onChangeText={setSalary}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray400}
                                />

                                <Text style={styles.label}>Shift</Text>
                                <View style={styles.shiftGrid}>
                                    {(['morning', 'afternoon', 'evening', 'night', 'flexible'] as StaffMember['shift'][]).map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[
                                                styles.shiftChip,
                                                shift === s && styles.shiftChipActive
                                            ]}
                                            onPress={() => setShift(s)}
                                        >
                                            <Text style={[
                                                styles.shiftText,
                                                shift === s && styles.shiftTextActive
                                            ]}>
                                                {s.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Status</Text>
                                <View style={styles.statusGrid}>
                                    {(['active', 'inactive', 'on-leave'] as StaffMember['status'][]).map((st) => (
                                        <TouchableOpacity
                                            key={st}
                                            style={[
                                                styles.statusChip,
                                                status === st && { backgroundColor: getStatusColor(st) }
                                            ]}
                                            onPress={() => setStatus(st)}
                                        >
                                            <Text style={[
                                                styles.statusChipText,
                                                status === st && { color: Colors.white }
                                            ]}>
                                                {st.toUpperCase().replace('-', ' ')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Permissions</Text>
                                <View style={styles.permissionsEdit}>
                                    {Object.entries(permissions).map(([key, value]) => (
                                        <TouchableOpacity
                                            key={key}
                                            style={styles.permissionRow}
                                            onPress={() => togglePermission(key as keyof StaffMember['permissions'])}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                value && styles.checkboxActive
                                            ]}>
                                                {value && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <Text style={styles.permissionLabel}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

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
                                            {editingStaff ? 'Update Staff' : 'Add Staff'}
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
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textLight,
        fontWeight: '600',
    },
    filterScroll: {
        backgroundColor: Colors.white,
        paddingVertical: 12,
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
    staffCard: {
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
    staffHeader: {
        marginBottom: 12,
    },
    staffHeaderLeft: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
        flexWrap: 'wrap',
    },
    staffName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    roleEmoji: {
        fontSize: 12,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
    },
    staffContact: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 4,
    },
    staffInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textLight,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    permissionsContainer: {
        backgroundColor: Colors.gray100,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    permissionsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    permissionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    permissionChip: {
        backgroundColor: Colors.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    permissionText: {
        fontSize: 11,
        color: Colors.success,
        fontWeight: '600',
    },
    notesRow: {
        backgroundColor: Colors.info + '10',
        padding: 10,
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
    textArea: {
        height: 80,
        paddingTop: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        marginTop: 4,
    },
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.gray100,
    },
    roleChipEmoji: {
        fontSize: 16,
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
    },
    shiftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    shiftChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
    },
    shiftChipActive: {
        backgroundColor: Colors.primary,
    },
    shiftText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    shiftTextActive: {
        color: Colors.white,
    },
    statusGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    statusChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
    },
    permissionsEdit: {
        backgroundColor: Colors.gray100,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.gray400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    checkmark: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    permissionLabel: {
        fontSize: 14,
        color: Colors.text,
        flex: 1,
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
