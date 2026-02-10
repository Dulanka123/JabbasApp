import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import BackgroundImage from '../components/BackgroundImage';


const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
        setIsLogin(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <BackgroundImage type="auth">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={Colors.gradientPrimary}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>👨‍🍳</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Jabba's Kitchen</Text>
            <Text style={styles.subtitle}>Delicious Food Management</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={Colors.gray500}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={Colors.gray500}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.loader}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleAuth}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Login' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton}>
                  <Text style={styles.switchButtonText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <Text
                      style={styles.switchButtonLink}
                      onPress={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray200,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray600,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray300,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loader: {
    marginVertical: 24,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  switchButtonLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});