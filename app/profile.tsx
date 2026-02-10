import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

export default function ProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            router.replace('/');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    },
                },
            ]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = Colors.primary }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
                <Text style={styles.menuEmoji}>{icon}</Text>
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
    );

    return (
        <BackgroundImage type="auth">
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header with Profile */}
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

                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.email?.charAt(0).toUpperCase() || '👤'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.profileName}>
                            {user?.email?.split('@')[0] || 'Restaurant Owner'}
                        </Text>
                        <Text style={styles.profileEmail}>{user?.email || 'Not logged in'}</Text>
                    </View>
                </LinearGradient>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Restaurant Settings</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="🏪"
                            title="Restaurant Info"
                            subtitle="Edit name, address, hours"
                            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
                            color={Colors.primary}
                        />
                        <MenuItem
                            icon="🍽️"
                            title="Menu Categories"
                            subtitle="Manage food categories"
                            onPress={() => router.push('/menu')}
                            color={Colors.accent}
                        />
                        <MenuItem
                            icon="💳"
                            title="Payment Settings"
                            subtitle="Configure payment methods"
                            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
                            color={Colors.info}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="🔔"
                            title="Notifications"
                            subtitle="Order alerts and updates"
                            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
                            color={Colors.warning}
                        />
                        <MenuItem
                            icon="🌙"
                            title="Dark Mode"
                            subtitle="Toggle dark theme"
                            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
                            color={Colors.secondary}
                        />
                        <MenuItem
                            icon="🌍"
                            title="Language"
                            subtitle="English"
                            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
                            color={Colors.success}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="📖"
                            title="Help & FAQ"
                            subtitle="Get help and support"
                            onPress={() => Alert.alert('Help', 'Contact support at support@jabbaskitchen.com')}
                            color={Colors.info}
                        />
                        <MenuItem
                            icon="⭐"
                            title="Rate App"
                            subtitle="Share your feedback"
                            onPress={() => Alert.alert('Thank You!', 'This would open the app store')}
                            color={Colors.warning}
                        />
                        <MenuItem
                            icon="ℹ️"
                            title="About"
                            subtitle="Version 1.0.0"
                            onPress={() => Alert.alert('Jabba\'s Kitchen', 'Version 1.0.0\nRestaurant Management App')}
                            color={Colors.gray600}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
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
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.primary,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.9,
    },
    section: {
        padding: 24,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuEmoji: {
        fontSize: 24,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
    },
    menuArrow: {
        fontSize: 24,
        color: Colors.gray400,
        fontWeight: '300',
    },
    logoutButton: {
        backgroundColor: Colors.error,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
});
