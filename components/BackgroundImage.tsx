import React, { ReactNode } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

type BackgroundType =
    | 'kitchen'
    | 'table'
    | 'menu'
    | 'inventory'
    | 'analytics'
    | 'customer'
    | 'payment'
    | 'qr'
    | 'staff'
    | 'reservation'
    | 'dashboard'
    | 'auth';

interface BackgroundImageProps {
    type: BackgroundType;
    children: ReactNode;
    overlay?: boolean;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
    type,
    children,
    overlay = true
}) => {
    const getGradientColors = (): string[] => {
        switch (type) {
            case 'kitchen':
                return ['#FF6B35', '#F7931E', '#FDC830'];
            case 'table':
                return ['#8E2DE2', '#4A00E0', '#7E22CE'];
            case 'menu':
                return ['#FF512F', '#DD2476', '#F09819'];
            case 'inventory':
                return ['#11998E', '#38EF7D', '#0BA360'];
            case 'analytics':
                return ['#4776E6', '#8E54E9', '#6C5CE7'];
            case 'customer':
                return ['#FFD194', '#D1913C', '#FFB75E'];
            case 'payment':
                return ['#2ECC71', '#27AE60', '#16A085'];
            case 'qr':
                return ['#E74C3C', '#C0392B', '#E67E22'];
            case 'staff':
                return ['#FF6B9D', '#C06C84', '#F67280'];
            case 'reservation':
                return ['#4FACFE', '#00F2FE', '#43E97B'];
            case 'dashboard':
                return ['#FA709A', '#FEE140', '#FF6B35'];
            case 'auth':
                return ['#667EEA', '#764BA2', '#F093FB'];
            default:
                return Colors.gradientPrimary;
        }
    };

    const getPattern = (): ReactNode => {
        // Create CSS-based patterns for different screens
        const patterns = {
            kitchen: (
                <View style={styles.patternContainer}>
                    {/* Fire/flame pattern */}
                    {Array.from({ length: 15 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.flame,
                                {
                                    left: `${(i * 7) % 100}%`,
                                    top: `${(i * 13) % 100}%`,
                                    opacity: 0.1 + (i % 3) * 0.05,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            table: (
                <View style={styles.patternContainer}>
                    {/* Circular table pattern */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.circle,
                                {
                                    left: `${(i * 23) % 100}%`,
                                    top: `${(i * 31) % 100}%`,
                                    opacity: 0.08,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            menu: (
                <View style={styles.patternContainer}>
                    {/* Plate pattern */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.plate,
                                {
                                    left: `${(i * 17) % 100}%`,
                                    top: `${(i * 19) % 100}%`,
                                    opacity: 0.06 + (i % 2) * 0.04,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            inventory: (
                <View style={styles.patternContainer}>
                    {/* Box/crate pattern */}
                    {Array.from({ length: 18 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.box,
                                {
                                    left: `${(i * 15) % 100}%`,
                                    top: `${(i * 21) % 100}%`,
                                    opacity: 0.07,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            analytics: (
                <View style={styles.patternContainer}>
                    {/* Chart bars pattern */}
                    {Array.from({ length: 25 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.bar,
                                {
                                    left: `${(i * 11) % 100}%`,
                                    top: `${(i * 17) % 100}%`,
                                    height: 20 + (i % 5) * 15,
                                    opacity: 0.08,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            customer: (
                <View style={styles.patternContainer}>
                    {/* User/people icons pattern */}
                    {Array.from({ length: 16 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.userIcon,
                                {
                                    left: `${(i * 19) % 100}%`,
                                    top: `${(i * 23) % 100}%`,
                                    opacity: 0.06,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            payment: (
                <View style={styles.patternContainer}>
                    {/* Card/money pattern */}
                    {Array.from({ length: 14 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.card,
                                {
                                    left: `${(i * 21) % 100}%`,
                                    top: `${(i * 27) % 100}%`,
                                    opacity: 0.07,
                                    transform: [{ rotate: `${(i * 15) % 360}deg` }]
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            qr: (
                <View style={styles.patternContainer}>
                    {/* QR code squares pattern */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.qrSquare,
                                {
                                    left: `${(i * 13) % 100}%`,
                                    top: `${(i * 11) % 100}%`,
                                    opacity: 0.05,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            staff: (
                <View style={styles.patternContainer}>
                    {/* Team/group pattern */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.teamIcon,
                                {
                                    left: `${(i * 25) % 100}%`,
                                    top: `${(i * 29) % 100}%`,
                                    opacity: 0.08,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            reservation: (
                <View style={styles.patternContainer}>
                    {/* Calendar dates pattern */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.calendarDate,
                                {
                                    left: `${(i * 16) % 100}%`,
                                    top: `${(i * 18) % 100}%`,
                                    opacity: 0.06,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            dashboard: (
                <View style={styles.patternContainer}>
                    {/* Grid/dashboard squares */}
                    {Array.from({ length: 24 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dashSquare,
                                {
                                    left: `${(i * 14) % 100}%`,
                                    top: `${(i * 16) % 100}%`,
                                    opacity: 0.05,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
            auth: (
                <View style={styles.patternContainer}>
                    {/* Lock/shield pattern */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.shield,
                                {
                                    left: `${(i * 27) % 100}%`,
                                    top: `${(i * 33) % 100}%`,
                                    opacity: 0.07,
                                }
                            ]}
                        />
                    ))}
                </View>
            ),
        };

        return patterns[type] || patterns.dashboard;
    };

    return (
        <View style={styles.container}>
            {/* Animated gradient background */}
            <LinearGradient
                colors={getGradientColors()}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Pattern layer */}
            {getPattern()}

            {/* Overlay for readability */}
            {overlay && (
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.5)']}
                    style={styles.overlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            )}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width,
        height,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    patternContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        zIndex: 10,
    },
    // Pattern shapes
    flame: {
        position: 'absolute',
        width: 60,
        height: 80,
        backgroundColor: '#FF6B35',
        borderRadius: 30,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        transform: [{ rotate: '15deg' }],
    },
    circle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    plate: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    box: {
        position: 'absolute',
        width: 50,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    bar: {
        position: 'absolute',
        width: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    userIcon: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
    },
    card: {
        position: 'absolute',
        width: 80,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    qrSquare: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#FFFFFF',
    },
    teamIcon: {
        position: 'absolute',
        width: 80,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
    },
    calendarDate: {
        position: 'absolute',
        width: 45,
        height: 45,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    dashSquare: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    shield: {
        position: 'absolute',
        width: 70,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
});

export default BackgroundImage;
