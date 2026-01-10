import React, { createContext, useContext, useState, useEffect} from 'react';
import { Alert, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithSupabase } from '../utils/supabase/util.signin';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
    signIn: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
    session: any;
    user: any;
    loading: boolean;
    setSession: React.Dispatch<React.SetStateAction<any>>;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

type userType = {
    user: User;
    session: Session;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(false);
    const [user, setUser] = useState<userType | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check for existing session in storage
                const storedSession = await SecureStore.getItemAsync('userSession');
                if (storedSession) {
                    // User has a previous session
                    setSession(true);
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setLoading(false); // App is ready
            }
        };

        initializeApp();
    }, []);

    // API calls i2
    async function signIn(data: any) {
        
        const { email, password } = data;
        const { data: userData, error } = await signInWithSupabase(email, password);

        if (error) {
            Alert.alert('Sign-In Error', error);
            return;
        }

        if (userData) {
            await SecureStore.setItemAsync('userSession', JSON.stringify(userData));
            setUser(userData);
            setSession(true);
        }
        
    }

    async function signOut() {
        await SecureStore.deleteItemAsync('userSession');
        setUser(null);
        setSession(false);
    }

    return (
        <AuthContext.Provider value={{signIn, session, user, loading, setSession, setUser, signOut}}>
            {loading ? (
                <SafeAreaView
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: 'white'
                    }}
                    >
                    <Text>Loading...</Text>
                </SafeAreaView>
            ) : (
                children
                )
            }  
        </AuthContext.Provider>
    );
}

const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export {useAuth, AuthContext, AuthProvider};