import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
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
    description?: string;
    imageUri?: string;
}

const CATEGORY_GRADIENTS: { [key: string]: string[] } = {
    'Appetizers': ['#FF6B6B', '#FFE66D'],
    'Main Course': ['#FF6B35', '#F7B731'],
    'Desserts': ['#FF8ED4', '#FFC3E1'],
    'Beverages': ['#4FACFE', '#00F2FE'],
};

export default function MenuScreen() {
    const router = useRouter();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MenuItem[];
            setMenuItems(items);
        });
        return unsubscribe;
    }, []);

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'menu', id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderMenuItem = ({ item }: { item: MenuItem }) => {
        const gradientColors = CATEGORY_GRADIENTS[item.category || 'Main Course'] || Colors.gradientPrimary;

        return (
            <TouchableOpacity
                style={styles.menuCard}
                activeOpacity={0.9}
            >
                {/* Image with Gradient Overlay */}
                <View style={styles.imageContainer}>
                    {item.imageUri ? (
                        <Image
                            source={{ uri: item.imageUri }}
                            style={styles.menuImage}
                        />
                    ) : (
                        <LinearGradient
                            colors={gradientColors}
                            style={styles.menuImagePlaceholder}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.placeholderEmoji}>
                                {item.category === 'Beverages' ? '🥤' :
                                    item.category === 'Desserts' ? '🍰' :
                                        item.category === 'Appetizers' ? '🥗' : '🍔'}
                            </Text>
                        </LinearGradient>
                    )}

                    {/* Price Badge */}
                    <View style={styles.priceBadge}>
                        <LinearGradient
                            colors={['#11998E', '#38EF7D']}
                            style={styles.priceBadgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.priceText}>Rs.{item.price}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.menuContent}>
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.categoryBadge}>
                        <LinearGradient
                            colors={gradientColors}
                            style={styles.categoryBadgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.categoryBadgeText}>{item.category || 'Main Course'}</Text>
                        </LinearGradient>
                    </View>
                    {item.description && (
                        <Text style={styles.menuDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.menuActions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`/edit-menu-item?id=${item.id}` as any)}
                    >
                        <LinearGradient
                            colors={['#667EEA', '#764BA2']}
                            style={styles.actionButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.actionButtonText}>✏️ Edit</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id, item.name)}
                    >
                        <LinearGradient
                            colors={['#F093FB', '#F5576C']}
                            style={styles.actionButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BackgroundImage type="menu">
            <View style={styles.container}>
                {/* Vibrant Header */}
                <LinearGradient
                    colors={['#FF6B35', '#F7B731', '#FF8ED4']}
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
                    <Text style={styles.headerEmoji}>🍽️</Text>
                    <Text style={styles.headerTitle}>Menu Gallery</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredItems.length} delicious items
                    </Text>
                </LinearGradient>

                {/* Search Bar - Colorful */}
                <View style={styles.searchContainer}>
                    <LinearGradient
                        colors={['#FFFFFF', '#F8F9FA']}
                        style={styles.searchGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        <Text style={styles.searchEmoji}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search delicious foods..."
                            placeholderTextColor={Colors.gray500}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </LinearGradient>
                </View>

                {/* Category Filter - Vibrant Pills */}
                <View style={styles.categoryContainer}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const isActive = selectedCategory === item;
                            const gradientColors = item === 'All'
                                ? ['#667EEA', '#764BA2']
                                : CATEGORY_GRADIENTS[item] || Colors.gradientPrimary;

                            return (
                                <TouchableOpacity
                                    style={styles.categoryPill}
                                    onPress={() => setSelectedCategory(item)}
                                    activeOpacity={0.8}
                                >
                                    {isActive ? (
                                        <LinearGradient
                                            colors={gradientColors}
                                            style={styles.categoryPillGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={styles.categoryPillTextActive}>{item}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.categoryPillInactive}>
                                            <Text style={styles.categoryPillText}>{item}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                {/* Menu Grid */}
                <FlatList
                    data={filteredItems}
                    renderItem={renderMenuItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <LinearGradient
                                colors={['#FF6B35', '#F7B731']}
                                style={styles.emptyCircle}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.emptyEmoji}>🍽️</Text>
                            </LinearGradient>
                            <Text style={styles.emptyText}>No menu items found</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => router.push('/add-menu-item')}
                            >
                                <LinearGradient
                                    colors={['#11998E', '#38EF7D']}
                                    style={styles.addButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.addButtonText}>➕ Add First Item</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    }
                />

                {/* Floating Add Button - Rainbow */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/add-menu-item')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#FF6B35', '#F7B731', '#FF8ED4']}
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
        backgroundColor: '#FFF5F7',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 8,
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
        opacity: 0.95,
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    searchGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text,
    },
    categoryContainer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    categoryPill: {
        marginRight: 10,
        borderRadius: 24,
        overflow: 'hidden',
    },
    categoryPillGradient: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    categoryPillInactive: {
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: Colors.gray300,
        borderRadius: 24,
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    categoryPillTextActive: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.white,
    },
    listContent: {
        padding: 16,
    },
    columnWrapper: {
        gap: 16,
    },
    menuCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 140,
    },
    menuImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.gray200,
    },
    menuImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 48,
    },
    priceBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    priceBadgeGradient: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    priceText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '800',
    },
    menuContent: {
        padding: 12,
    },
    menuName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 6,
    },
    categoryBadgeGradient: {
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.white,
        textTransform: 'uppercase',
    },
    menuDescription: {
        fontSize: 11,
        color: Colors.textLight,
        lineHeight: 15,
    },
    menuActions: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        paddingTop: 0,
    },
    editButton: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    deleteButton: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textLight,
        marginBottom: 24,
    },
    addButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#11998E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
    addButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
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
