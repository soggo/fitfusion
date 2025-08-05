import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // If user exists, fetch their profile
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.email === 'fitfusion081@gmail.com';
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Sign up new customer
  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    });
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    return { error };
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } };
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!error) {
        setProfile(data);
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Get user addresses
  const getUserAddresses = async () => {
    if (!user) return { data: [], error: { message: 'No user logged in' } };
    
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  };

  // Add new address
  const addAddress = async (addressData) => {
    if (!user) return { error: { message: 'No user logged in' } };
    
    try {
      // If this is set as default, unset other defaults first
      if (addressData.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', addressData.type || 'shipping');
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...addressData
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Update address
  const updateAddress = async (addressId, updates) => {
    if (!user) return { error: { message: 'No user logged in' } };
    
    try {
      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', updates.type || 'shipping');
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!user) return { error: { message: 'No user logged in' } };
    
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Get user orders (for when orders system is implemented)
  const getUserOrders = async () => {
    if (!user) return { data: [], error: { message: 'No user logged in' } };
    
    try {
      // This will work once orders table is properly set up
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              slug,
              images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getUserOrders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 