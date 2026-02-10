import { StyleSheet } from 'react-native';
import Colors from './Colors';

// Global Styles
export const GlobalStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },

    // Cards
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },

    // Buttons
    primaryButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },

    // Input Fields
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.gray300,
        marginVertical: 8,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    // Typography
    heading1: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
    },
    heading3: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    body1: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
    },
    body2: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        color: Colors.textLight,
    },

    // Spacing
    marginTop8: { marginTop: 8 },
    marginTop16: { marginTop: 16 },
    marginTop24: { marginTop: 24 },
    marginBottom8: { marginBottom: 8 },
    marginBottom16: { marginBottom: 16 },
    marginBottom24: { marginBottom: 24 },
    padding16: { padding: 16 },
    padding24: { padding: 24 },

    // Flex
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default GlobalStyles;
