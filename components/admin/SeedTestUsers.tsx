import { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from '../../lib/toast';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * Composant pour créer des utilisateurs de test
 * À utiliser uniquement en développement
 */
export function SeedTestUsers() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);

  const createTestUsers = async () => {
    setLoading(true);
    
    try {
      console.log('🌱 Création des utilisateurs de test...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/seed-test-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Utilisateurs créés:', data);
        setCreated(data.credentials);
        
        toast.success('Utilisateurs de test créés !', {
          description: 'Voir les identifiants ci-dessous',
          duration: 5000
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur création:', error);
      toast.error('Erreur lors de la création', {
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🌱 Créer des utilisateurs de test</h2>
        
        <p className="text-gray-600 mb-6">
          Cette fonction crée automatiquement :
        </p>
        
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
          <li>1 <strong>Conducteur</strong> de test (approuvé, avec véhicule)</li>
          <li>1 <strong>Passager</strong> de test</li>
        </ul>

        <Button
          onClick={createTestUsers}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Création en cours...</span>
            </div>
          ) : (
            '🌱 Créer les utilisateurs de test'
          )}
        </Button>

        {created && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                🚗 Conducteur de test
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Téléphone :</strong> {created.driver?.phone} ou 0990666661</p>
                <p><strong>Email :</strong> {created.driver?.email}</p>
                <p><strong>Mot de passe :</strong> <code className="bg-blue-100 px-2 py-1 rounded">{created.driver?.password}</code></p>
                <p><strong>Statut :</strong> {created.driver?.status === 'created' ? '✅ Créé' : '⚠️ Existait déjà'}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                👤 Passager de test
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Téléphone :</strong> {created.passenger?.phone} ou 0990666662</p>
                <p><strong>Email :</strong> {created.passenger?.email}</p>
                <p><strong>Mot de passe :</strong> <code className="bg-green-100 px-2 py-1 rounded">{created.passenger?.password}</code></p>
                <p><strong>Statut :</strong> {created.passenger?.status === 'created' ? '✅ Créé' : '⚠️ Existait déjà'}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Astuce :</strong> Vous pouvez maintenant vous connecter avec ces identifiants sur les écrans de connexion conducteur ou passager.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-bold mb-2">📋 Comment utiliser ?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Cliquez sur "Créer les utilisateurs de test" ci-dessus</li>
          <li>Attendez la confirmation (environ 5 secondes)</li>
          <li>Notez les identifiants affichés</li>
          <li>Utilisez-les pour vous connecter sur /driver ou /passenger</li>
        </ol>
      </div>
    </div>
  );
}
