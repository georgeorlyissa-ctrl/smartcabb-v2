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

    console.log('✅ Inscription serveur réussie:', serverData);
    console.log('📧 Email utilisateur:', serverData.user?.email);
    console.log('👤 Profil:', serverData.profile);

    // ✅ FIX: Utiliser l'email de l'utilisateur créé au lieu de credentials.tempEmail
    const userEmail = serverData.user?.email || serverData.profile?.email;
    
    if (!userEmail) {
      console.error('❌ Email non trouvé dans la réponse serveur:', serverData);
      return {
        success: false,
        error: 'Erreur serveur: email non retourné après inscription'
      };
    }

    console.log('🔐 Connexion automatique avec email:', userEmail);

    // Se connecter immédiatement avec les credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password
    });

    if (authError || !authData?.user) {
      console.error('❌ Erreur connexion:', authError);
      console.log('⚠️ Tentative de reconnexion après 2s...');
      
      // Retry une fois après 2 secondes
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password
      });
      
      if (retryError || !retryData?.user) {
        console.error('❌ Erreur reconnexion:', retryError);
        return {
          success: false,
          error: 'Compte créé mais erreur de connexion. Essayez de vous connecter manuellement.'
        };
      }
      
      console.log('✅ Conducteur créé et connecté (retry):', serverData.profile.full_name);
      
      return {
        success: true,
        user: retryData.user,
        profile: serverData.profile,
        accessToken: retryData.session?.access_token
      };
    }

    console.log('✅ Conducteur créé et connecté:', serverData.profile.full_name);
    
    return {
      success: true,
      user: authData.user,
      profile: serverData.profile,
      accessToken: authData.session?.access_token
    };

  } catch (error) {
    console.error('❌ Erreur inattendue inscription conducteur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue lors de l\'inscription'
    };
  }
}
