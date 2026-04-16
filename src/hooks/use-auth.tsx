"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/db';
import { useRouter } from 'next/navigation';

interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: {
        display_name?: string;
    };
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user as AuthUser | null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user as AuthUser | null);
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
