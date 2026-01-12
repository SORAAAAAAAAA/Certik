import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '../context/authContext';
import { isValidEmail, isValidPassword, isNonEmptyString } from '../validators/authValidator';
import { signUpWithSupabase } from '../utils/supabase/util.signup';

export default function SignUp() {
  
  const { signIn } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (!isNonEmptyString(name)) {
      alert('Name cannot be empty.');
      return;
    }

    if (signupError) {
      alert(signupError);
      return;
    }
    
    setLoading(true);
    setSignupError('');
    
    const { user, error } = await signUpWithSupabase(name, email, password);
    if (error) {
      setSignupError(error);
      setLoading(false);
      return;
    }
    
    if (user) {
      const userData = { email, password };
      await signIn(userData); 
      setLoading(false);
    }
  };

  return (
    loading ? (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinnerWrapper}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text style={styles.loadingText}>Creating your account...</Text>
          <Text style={styles.loadingSubtext}>This will only take a moment</Text>
        </View>
      </SafeAreaView>
    ) : (
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.logoContainer} />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your journey with Certik</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'name' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9ca3af"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'email' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Create a password"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                  <Text style={styles.inputHint}>Must be at least 6 characters</Text>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleSignUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Link href="/signin" asChild>
                    <TouchableOpacity>
                      <Text style={styles.link}>Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingSpinnerWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: -8,
  },

  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    letterSpacing: -0.2,
  },

  // Form Styles
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  inputContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    backgroundColor: '#ffffff',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  inputHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    marginTop: -4,
  },

  // Button Styles
  button: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Divider Styles
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },

  // Footer Styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#6b7280',
    letterSpacing: -0.2,
  },
  link: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});