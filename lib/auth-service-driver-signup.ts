import { supabase } from './supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { normalizePhoneNumber } from './phone-utils';

export interface AuthResult {
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
  accessToken?: string;
}

/**
 * Créer un compte conducteur avec toutes les données associées
 * NOUVELLE VERSION : Utilise toujours l'endpoint serveur (Admin API)
 * car Supabase Auth côté client rejette tous les formats d'email
 */
export async function signUpDriver(driverData: {
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleCategory: 'smart_standard' | 'smart_confort' | 'smart_plus' | 'smart_business';
  licenseNumber?: string;
  profilePhoto?: string; // 📸 Photo en Base64
}): Promise<AuthResult> {
  try {
    const { fullName, email, phone, password, vehicleMake, vehicleModel, vehiclePlate, vehicleColor, vehicleCategory, profilePhoto } = driverData;
    
    console.log('📝 Inscription conducteur via serveur:', fullName, 'téléphone:', phone);
    
    // Validation du mot de passe
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères.'
      };
    }
    
    // Normaliser le téléphone
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide. Format attendu : 9 chiffres (ex: 812345678)'
      };
    }
    
    // Appeler l'endpoint serveur (Admin API) pour TOUS les cas
    console.log('🌐 Appel endpoint serveur /drivers/signup');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email?.trim() || null,
          phone: normalizedPhone,
          password,
          vehicleMake,
          vehicleModel,
          vehiclePlate,
          vehicleColor,
          vehicleCategory,
          profilePhoto: profilePhoto || null // 📸 Photo en Base64
        })
      }
    );

    const serverData = await response.json();

    if (!response.ok || !serverData.success) {
      console.error('❌ Erreur serveur:', serverData.error);
      
      // Messages d'erreur spécifiques
      if (serverData.error && serverData.error.includes('déjà utilisé')) {
        return {
          success: false,
          error: serverData.error
        };
      }
      
      return {
        success: false,
        error: serverData.error || 'Erreur lors de l\'inscription'
      };
    }

    console.log('✅ Inscription serveur réussie, connexion automatique...');

    // Se connecter immédiatement avec les credentials
    const tempEmail = serverData.credentials.tempEmail;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password
    });

    // ✅ FIX: Vérifier authData.access_token au lieu de authData.session
    if (authError || !authData.access_token) {
      console.error('❌ Erreur connexion:', authError);
      return {
        success: false,
        error: 'Compte créé mais erreur de connexion. Essayez de vous connecter manuellement.'
      };
    }

    console.log('✅ Conducteur créé et connecté:', serverData.profile.full_name);
    
    return {
      success: true,
      user: authData.user,
      profile: serverData.profile,
      accessToken: authData.access_token // ✅ FIX: Utiliser authData.access_token directement
    };

  } catch (error) {
    console.error('❌ Erreur inattendue inscription conducteur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue lors de l\'inscription'
    };
  }
}
