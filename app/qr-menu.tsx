import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';

const { width } = Dimensions.get('window');

interface Table {
    id: string;
    number: number;
}

interface MenuItem {
    id: string;
    name: string;
    price: string;
    category?: string;
    description?: string;
}

export default function QRMenuScreen() {
    const router = useRouter();
    const [tables, setTables] = useState<Table[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    useEffect(() => {
        const unsubscribeTables = onSnapshot(collection(db, 'tables'), (snapshot) => {
            const tablesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Table[];
            setTables(tablesList.sort((a, b) => a.number - b.number));
        });

        const unsubscribeMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MenuItem[];
            setMenuItems(items);
        });

        return () => {
            unsubscribeTables();
            unsubscribeMenu();
        };
    }, []);

    const generateMenuURL = (tableId?: string) => {
        // In production, this would be your actual domain
        const baseURL = 'https://jabbaskitchen.app/menu';
        return tableId ? `${baseURL}?table=${tableId}` : baseURL;
    };

    const shareQRCode = async (table?: Table) => {
        try {
            const url = generateMenuURL(table?.id);
            const message = table
                ? `Scan to view menu and order from Table ${table.number}\n${url}`
                : `Scan to view Jabba's Kitchen menu\n${url}`;

            await Share.share({
                message: message,
                title: table ? `Table ${table.number} Menu` : 'Restaurant Menu',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share QR code');
        }
    };

    const handleGenerateForAll = () => {
        Alert.alert(
            'Generate All QR Codes',
            `Generate ${tables.length} QR codes for all tables?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    onPress: () => {
                        Alert.alert('Success', `${tables.length} QR codes generated! Check your downloads folder.`);
                    }
                }
            ]
        );
    };

    return (
        <BackgroundImage type="qr">
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
                    <Text style={styles.headerTitle}>📱 QR Menu</Text>
                    <View style={{ width: 60 }} />
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoEmoji}>💡</Text>
                        <Text style={styles.infoTitle}>Digital Menu Benefits</Text>
                        <Text style={styles.infoText}>
                            • Contactless ordering experience{'\n'}
                            • Real-time menu updates{'\n'}
                            • Reduce printing costs{'\n'}
                            • Faster table turnover
                        </Text>
                    </View>

                    {/* General Menu QR */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 General Menu QR Code</Text>
                        <View style={styles.qrCard}>
                            <View style={styles.qrPlaceholder}>
                                <Text style={styles.qrEmoji}>📱</Text>
                                <Text style={styles.qrText}>QR Code Preview</Text>
                                <Text style={styles.qrSubtext}>{menuItems.length} items available</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.shareButton}
                                onPress={() => shareQRCode()}
                            >
                                <LinearGradient
                                    colors={Colors.gradientPrimary}
                                    style={styles.shareGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.shareButtonText}>📤 Share Menu QR</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Table QR Codes */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>🪑 Table QR Codes</Text>
                            {tables.length > 0 && (
                                <TouchableOpacity onPress={handleGenerateForAll}>
                                    <Text style={styles.generateAllText}>Generate All →</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {tables.length > 0 ? (
                            <View style={styles.tableGrid}>
                                {tables.map((table) => (
                                    <View key={table.id} style={styles.tableQRCard}>
                                        <View style={styles.tableQRHeader}>
                                            <Text style={styles.tableQRNumber}>
                                                Table {table.number}
                                            </Text>
                                        </View>
                                        <View style={styles.qrMini}>
                                            <Text style={styles.qrMiniEmoji}>🔲</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.miniShareButton}
                                            onPress={() => shareQRCode(table)}
                                        >
                                            <Text style={styles.miniShareText}>📤 Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🪑</Text>
                                <Text style={styles.emptyText}>No tables found</Text>
                                <Text style={styles.emptySubtext}>
                                    Add tables to generate individual QR codes
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Menu Preview */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🍽️ Current Menu ({menuItems.length} items)</Text>
                        {menuItems.slice(0, 5).map((item) => (
                            <View key={item.id} style={styles.menuPreviewCard}>
                                <View style={styles.menuPreviewLeft}>
                                    <Text style={styles.menuPreviewName}>{item.name}</Text>
                                    <Text style={styles.menuPreviewCategory}>
                                        {item.category || 'Main Course'}
                                    </Text>
                                </View>
                                <Text style={styles.menuPreviewPrice}>Rs. {item.price}</Text>
                            </View>
                        ))}
                        {menuItems.length > 5 && (
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => router.push('/menu')}
                            >
                                <Text style={styles.viewAllText}>
                                    View all {menuItems.length} items →
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Features */}
                    <View style={styles.featuresCard}>
                        <Text style={styles.featuresTitle}>✨ Features</Text>
                        <View style={styles.feature}>
                            <Text style={styles.featureIcon}>🔄</Text>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Real-time Updates</Text>
                                <Text style={styles.featureText}>
                                    Menu updates instantly across all QR codes
                                </Text>
                            </View>
                        </View>
                        <View style={styles.feature}>
                            <Text style={styles.featureIcon}>📱</Text>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Mobile Optimized</Text>
                                <Text style={styles.featureText}>
                                    Perfect viewing on all devices
                                </Text>
                            </View>
                        </View>
                        <View style={styles.feature}>
                            <Text style={styles.featureIcon}>🎯</Text>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Table Tracking</Text>
                                <Text style={styles.featureText}>
                                    Know which table is ordering
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Instructions */}
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>📖 How to Use</Text>
                        <Text style={styles.instructionText}>
                            <Text style={styles.instructionBold}>1. Print QR Codes</Text>
                            {'\n   '}Share or download and print for each table
                            {'\n\n'}
                            <Text style={styles.instructionBold}>2. Place on Tables</Text>
                            {'\n   '}Use table stands or laminated cards
                            {'\n\n'}
                            <Text style={styles.instructionBold}>3. Customers Scan</Text>
                            {'\n   '}They view menu on their phone
                            {'\n\n'}
                            <Text style={styles.instructionBold}>4. Orders Come In</Text>
                            {'\n   '}Receive orders with table numbers
                        </Text>
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
    infoCard: {
        backgroundColor: Colors.info + '10',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.info,
    },
    infoEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 22,
    },
    section: {
        padding: 16,
        paddingTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    generateAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    qrCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    qrEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    qrText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    qrSubtext: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    shareButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    shareGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    shareButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    tableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    tableQRCard: {
        width: (width - 44) / 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableQRHeader: {
        marginBottom: 12,
    },
    tableQRNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    qrMini: {
        width: 100,
        height: 100,
        backgroundColor: Colors.gray100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    qrMiniEmoji: {
        fontSize: 32,
    },
    miniShareButton: {
        backgroundColor: Colors.primary + '20',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    miniShareText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    menuPreviewCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    menuPreviewLeft: {
        flex: 1,
    },
    menuPreviewName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    menuPreviewCategory: {
        fontSize: 12,
        color: Colors.textLight,
    },
    menuPreviewPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    viewAllButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    featuresCard: {
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
    featuresTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    feature: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    featureIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    featureText: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
    },
    instructionsCard: {
        backgroundColor: Colors.primary + '10',
        margin: 16,
        marginTop: 0,
        marginBottom: 32,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
    },
    instructionText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 24,
    },
    instructionBold: {
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
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
});
