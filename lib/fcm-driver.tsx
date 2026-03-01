import { Hono } from "npm:hono";
import * as kv from './kv_store.tsx';
import { sendFCMNotification, isFirebaseAdminConfigured } from './firebase-admin.ts';

const app = new Hono();

/**
 * 💾 Sauvegarder le token FCM d'un utilisateur
 * POST /fcm/save-token
 */
app.post("/save-token", async (c) => {
  try {
    const { userId, token } = await c.req.json();

    if (!userId || !token) {
      return c.json({ success: false, error: "userId et token requis" }, 400);
    }

    console.log(`💾 Sauvegarde token FCM pour ${userId}:`, token.substring(0, 20) + '...');

    // Sauvegarder dans KV store
    await kv.set(`fcm_token_${userId}`, token);
    await kv.set(`fcm_user_${userId}`, {
      userId,
      token,
      updatedAt: new Date().toISOString(),
      platform: 'web'
    });

    console.log(`✅ Token FCM sauvegardé pour ${userId}`);

    return c.json({ 
      success: true, 
      message: 'Token FCM sauvegardé avec succès',
      userId 
    });
  } catch (error) {
    console.error("❌ Erreur sauvegarde token FCM:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur serveur" 
    }, 500);
  }
});

/**
 * 📤 Récupérer le token FCM d'un utilisateur
 * GET /fcm/get-token/:userId
 */
app.get("/get-token/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ success: false, error: "userId requis" }, 400);
    }

    const token = await kv.get(`fcm_token_${userId}`);

    if (!token) {
      return c.json({ success: false, error: "Token non trouvé" }, 404);
    }

    return c.json({ 
      success: true, 
      token,
      userId 
    });
  } catch (error) {
    console.error("❌ Erreur récupération token FCM:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur serveur" 
    }, 500);
  }
});

/**
 * 🧪 Tester l'envoi d'une notification FCM
 * POST /fcm/test-notification
 */
app.post("/test-notification", async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: "userId requis" }, 400);
    }

    console.log(`🧪 Test notification FCM pour ${userId}`);

    // Vérifier la config Firebase
    if (!isFirebaseAdminConfigured()) {
      console.error('❌ Firebase Admin non configuré');
      return c.json({ 
        success: false, 
        error: 'Firebase non configuré - Vérifiez FIREBASE_PROJECT_ID et FIREBASE_SERVICE_ACCOUNT_JSON' 
      }, 500);
    }

    // Récupérer le token de l'utilisateur
    const token = await kv.get(`fcm_token_${userId}`);

    if (!token) {
      console.error(`❌ Token FCM non trouvé pour ${userId}`);
      return c.json({ 
        success: false, 
        error: 'Token FCM non trouvé pour cet utilisateur. Assurez-vous d\'avoir autorisé les notifications.' 
      }, 404);
    }

    console.log(`📱 Envoi notification test au token:`, token.substring(0, 20) + '...');

    // Envoyer la notification de test
    const result = await sendFCMNotification(token, {
      title: '🧪 Test SmartCabb',
      body: 'Vos notifications push fonctionnent correctement ! 🎉',
      data: {
        type: 'test',
        userId,
        timestamp: new Date().toISOString()
      }
    });

    if (result.success) {
      console.log(`✅ Notification test envoyée à ${userId}:`, result.messageId);
      return c.json({ 
        success: true, 
        message: 'Notification envoyée avec succès',
        messageId: result.messageId,
        userId 
      });
    } else {
      console.error(`❌ Échec envoi notification à ${userId}:`, result.error);
      return c.json({ 
        success: false, 
        error: result.error || 'Erreur inconnue lors de l\'envoi' 
      }, 500);
    }
  } catch (error) {
    console.error("❌ Erreur test notification FCM:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur serveur" 
    }, 500);
  }
});

/**
 * 📨 Envoyer une notification personnalisée
 * POST /fcm/send
 */
app.post("/send", async (c) => {
  try {
    const { userId, title, body, data } = await c.req.json();

    if (!userId || !title || !body) {
      return c.json({ success: false, error: "userId, title et body requis" }, 400);
    }

    // Vérifier la config Firebase
    if (!isFirebaseAdminConfigured()) {
      return c.json({ 
        success: false, 
        error: 'Firebase non configuré' 
      }, 500);
    }

    // Récupérer le token
    const token = await kv.get(`fcm_token_${userId}`);

    if (!token) {
      return c.json({ 
        success: false, 
        error: 'Token FCM non trouvé' 
      }, 404);
    }

    // Envoyer la notification
    const result = await sendFCMNotification(token, {
      title,
      body,
      data: data || {}
    });

    if (result.success) {
      return c.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return c.json({ 
        success: false, 
        error: result.error 
      }, 500);
    }
  } catch (error) {
    console.error("❌ Erreur envoi notification FCM:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur serveur" 
    }, 500);
  }
});

/**
 * 🔍 Diagnostic FCM serveur
 * GET /fcm/diagnostic
 */
app.get("/diagnostic", async (c) => {
  try {
    const firebaseConfigured = isFirebaseAdminConfigured();
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const hasServiceAccount = !!Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');

    return c.json({
      success: true,
      firebaseConfigured,
      projectId: projectId || 'NON CONFIGURÉ',
      hasServiceAccount,
      environment: 'production',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erreur diagnostic FCM:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur serveur" 
    }, 500);
  }
});

export default app;
