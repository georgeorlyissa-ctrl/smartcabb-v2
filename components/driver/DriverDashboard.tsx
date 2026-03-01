import { supabase } from '../../lib/supabase';
import { VEHICLE_PRICING, isDayTime, VehicleCategory } from '../../lib/pricing';
import { getMinimumCreditForCategory } from '../../lib/pricing-config';
import { useDriverLocation, isNearPickupLocation, calculateDistance } from '../../lib/gps-utils';
import { reverseGeocodeWithCache } from '../../lib/geocoding';
import { getVehicleDisplayName } from '../../lib/vehicle-helpers';
import { toast } from '../../lib/toast';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  notifyRideConfirmed,
  notifyDriverEnroute,
  notifyDriverArrived,
  notifyRideStarted,
  notifyRideCompleted,
  notifyPaymentReceived,
  notifyRideCancelled
} from '../../lib/sms-service';
import { RideNotificationSound } from './RideNotificationSound';
import { RideNotification } from './RideNotification';

// ✅ NOUVEAU : Import du système FCM pour notifications push
import { registerDriverFCMToken, isDriverFCMTokenRegistered } from '../../lib/fcm-driver';
import { FCMDiagnostic } from './FCMDiagnostic';

// Icônes SVG inline
const Power = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
);
const Euro = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const Star = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);
const Navigation = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const User = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const Settings = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const Key = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
);
const Percent = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CreditCard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
const Lock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const MapPin = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const Phone = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const MessageSquare = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);
const PlayCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const LogOut = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);
const History = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const Wallet = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
const Activity = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const Bell = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const Car = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-3-3v6m-6 0h12a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2zm0 0l1.5-3h9L18 10z" /></svg>
);

// ✅ v517.77 - Helper pour formater les montants CDF de manière sécurisée
const formatCDF = (amount: number | null | undefined): string => {
  const safeAmount = Number(amount) || 0;
  return `${safeAmount.toLocaleString('fr-FR')} CDF`;
};

// ✅ Fonction helper pour mettre à jour le solde dans le backend
async function updateBalanceInBackend(
  driverId: string,
  operation: 'add' | 'subtract',
  amount: number
): Promise<number | null> {
  // ✅ v517.86: Validation du montant AVANT l'envoi au backend
  if (!amount || isNaN(amount) || amount < 0) {
    console.error('❌ v517.86 - Montant invalide pour update balance:', amount);
    toast.error('Erreur: Montant invalide. Impossible de mettre à jour le solde.');
    return null;
  }
  
  try {
    console.log(`💰 v517.86 - Tentative ${operation} de ${amount} CDF pour driver ${driverId}`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/balance/${operation}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ amount })
      }
    );

    const data = await response.json();

    if (data.success && typeof data.newBalance === 'number') {
      console.log(`✅ v517.86 - Nouveau solde confirmé:`, data.newBalance, 'CDF');
      return data.newBalance;
    } else {
      console.error('❌ v517.86 - Échec update balance:', data.error);
      
      // Si le backend indique un montant négatif, c'est un cas spécial
      if (data.error?.includes('négatif') || data.error?.includes('insuffisant')) {
        return typeof data.newBalance === 'number' ? data.newBalance : null;
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour solde backend:', error);
    return null;
  }
}

export function DriverDashboard() {
  const { state, setCurrentScreen, updateDriver, setCurrentDriver, setCurrentView, setCurrentRide, updateRide, clearCurrentRide } = useAppState();
  const driver = state.currentDriver; // Récupérer le conducteur actuel
  
  // 🔥 State local
  const [activeTab, setActiveTab] = useState<'home' | 'earnings' | 'history' | 'profile'>('home');
  const [isOnline, setIsOnline] = useState(driver?.status === 'online' || false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('Localisation en cours...');
  const [showFCMDiagnostic, setShowFCMDiagnostic] = useState(false);
  const [pendingRideRequest, setPendingRideRequest] = useState<any>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayRides, setTodayRides] = useState(0);
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showBalanceManager, setShowBalanceManager] = useState(false);
  
  // Refs pour les intervalles
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ridePollingRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ FIX: Construire l'objet vehicleInfo depuis les champs individuels du driver
  const vehicleInfo = useMemo(() => {
    if (!driver) return null;
    
    // Si l'objet vehicle existe ET n'est pas vide, l'utiliser
    if (driver.vehicle && (driver.vehicle.make || driver.vehicle.category || driver.vehicle.license_plate)) {
      return {
        make: driver.vehicle.make || driver.vehicle_make || '',
        model: driver.vehicle.model || driver.vehicle_model || '',
        color: driver.vehicle.color || driver.vehicle_color || '',
        plate: driver.vehicle.license_plate || driver.vehicle_plate || driver.license_plate || '',
        type: driver.vehicle.category || driver.vehicle_category || driver.vehicle_type || 'smart_standard',
        year: driver.vehicle.year || driver.vehicle_year || new Date().getFullYear(),
        seats: driver.vehicle.seats || 4
      };
    }
    
    // Sinon, construire depuis les champs individuels
    if (driver.vehicle_category || driver.vehicle_make || driver.vehicle_plate) {
      return {
        make: driver.vehicle_make || '',
        model: driver.vehicle_model || '',
        color: driver.vehicle_color || '',
        plate: driver.vehicle_plate || driver.license_plate || '',
        type: driver.vehicle_category || driver.vehicle_type || 'smart_standard',
        year: driver.vehicle_year || new Date().getFullYear(),
        seats: 4
      };
    }
    
    return null;
  }, [driver]);
  
  // ✅ DEBUG: Logger les infos du véhicule
  useEffect(() => {
    if (driver) {
      console.log('🚗 Informations véhicule du conducteur:');
      console.log('   - vehicle (objet):', driver.vehicle);
      console.log('   - vehicle_category:', driver.vehicle_category);
      console.log('   - vehicle_make:', driver.vehicle_make);
      console.log('   - vehicle_model:', driver.vehicle_model);
      console.log('   - vehicle_plate:', driver.vehicle_plate);
      console.log('   - vehicleInfo construit:', vehicleInfo);
    }
  }, [driver, vehicleInfo]);
  
  // ✅ NOUVEAU : Enregistrer le token FCM pour recevoir les notifications push
  useEffect(() => {
    const setupFCMToken = async () => {
      if (!driver?.id) return;
      
      // Vérifier si le token est déjà enregistré (moins de 7 jours)
      if (isDriverFCMTokenRegistered(driver.id)) {
        console.log('✅ Token FCM déjà enregistré, pas besoin de ré-enregistrer');
        return;
      }
      
      try {
        console.log('📱 Enregistrement du token FCM pour notifications push...');
        const success = await registerDriverFCMToken(driver.id);
        
        if (success) {
          console.log('✅ Token FCM enregistré avec succès ! Les notifications push fonctionneront.');
          // ✅ FIX: Afficher le message de succès seulement si vraiment réussi
          toast.success('Notifications activées ! Vous recevrez les demandes de course.');
        } else {
          console.warn('⚠️ Impossible d\'enregistrer le token FCM. L\'application fonctionnera quand même.');
          // ✅ FIX: Ne pas afficher de toast d'erreur car ce n'est pas bloquant
        }
      } catch (error) {
        console.error('❌ Erreur enregistrement token FCM:', error);
        // ✅ FIX: Ne pas afficher d'erreur à l'utilisateur
      }
    };
    
    setupFCMToken();
  }, [driver?.id]);

  // ✅ Géolocalisation en temps réel
  useEffect(() => {
    if (!driver?.id || !isOnline) return;
    
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            setCurrentLocation(location);
            
            // Reverse geocoding pour obtenir l'adresse
            try {
              const address = await reverseGeocodeWithCache(location.lat, location.lng);
              setCurrentAddress(address);
            } catch (error) {
              console.error('Erreur reverse geocoding:', error);
            }
            
            // Mettre à jour la position dans le backend
            try {
              await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/location`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`
                  },
                  body: JSON.stringify({
                    lat: location.lat,
                    lng: location.lng
                  })
                }
              );
            } catch (error) {
              console.error('Erreur mise à jour localisation:', error);
            }
          },
          (error) => {
            console.error('Erreur géolocalisation:', error);
            toast.error('Impossible d\'obtenir votre position');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    };
    
    // Mise à jour immédiate puis toutes les 10 secondes
    updateLocation();
    locationIntervalRef.current = setInterval(updateLocation, 10000);
    
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [driver?.id, isOnline]);

  // ✅ Polling pour les nouvelles courses
  useEffect(() => {
    if (!driver?.id || !isOnline) return;
    
    const checkForNewRides = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/pending-rides`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const data = await response.json();
        
        if (data.success && data.pendingRide) {
          setPendingRideRequest(data.pendingRide);
        }
      } catch (error) {
        console.error('Erreur vérification nouvelles courses:', error);
      }
    };
    
    // Vérification toutes les 5 secondes
    ridePollingRef.current = setInterval(checkForNewRides, 5000);
    
    return () => {
      if (ridePollingRef.current) {
        clearInterval(ridePollingRef.current);
      }
    };
  }, [driver?.id, isOnline]);

  // ✅ Charger l'historique et les statistiques du jour
  useEffect(() => {
    if (!driver?.id) return;
    
    const loadDriverStats = async () => {
      setIsLoadingHistory(true);
      
      try {
        // Charger les statistiques du jour
        const statsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/stats/today`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setTodayEarnings(statsData.earnings || 0);
          setTodayRides(statsData.ridesCount || 0);
        }
        
        // Charger l'historique des courses
        const historyResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/rides/history`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
          setRideHistory(historyData.rides || []);
        }
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadDriverStats();
  }, [driver?.id]);

  // ✅ Gérer le changement de statut Online/Offline
  const handleToggleOnline = async () => {
    if (!driver?.id) return;
    
    const newStatus = !isOnline;
    
    // Si on veut passer en ligne, vérifier le crédit minimum
    if (newStatus) {
      const vehicleCategory = vehicleInfo?.type || 'smart_standard';
      const minimumCredit = getMinimumCreditForCategory(vehicleCategory as VehicleCategory);
      const currentBalance = driver.balance || 0;
      
      if (currentBalance < minimumCredit) {
        toast.error(`Crédit insuffisant ! Vous devez avoir au moins ${formatCDF(minimumCredit)} pour vous mettre en ligne.`);
        setShowBalanceManager(true);
        return;
      }
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            status: newStatus ? 'online' : 'offline',
            available: newStatus
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setIsOnline(newStatus);
        updateDriver({ ...driver, status: newStatus ? 'online' : 'offline' });
        toast.success(newStatus ? '✅ Vous êtes maintenant en ligne !' : '⏸️ Vous êtes maintenant hors ligne');
      } else {
        toast.error('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // ✅ Accepter une course
  const handleAcceptRide = async (rideId: string) => {
    if (!driver?.id) return;
    
    try {
      stopAllNotifications();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/${rideId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            driverId: driver.id
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.ride) {
        setPendingRideRequest(null);
        setCurrentRide(data.ride);
        toast.success('✅ Course acceptée !');
        
        // Notifier le passager par SMS
        if (data.ride.passenger?.phone) {
          await notifyRideConfirmed(
            data.ride.passenger.phone,
            driver.full_name || driver.name,
            vehicleInfo?.make || 'Véhicule',
            vehicleInfo?.plate || '',
            '5 minutes'
          );
        }
        
        // Rediriger vers l'écran de course active
        setCurrentScreen('active-ride');
      } else {
        toast.error(data.error || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Erreur acceptation course:', error);
      toast.error('Erreur lors de l\'acceptation de la course');
    }
  };

  // ✅ Refuser une course
  const handleDeclineRide = async (rideId: string) => {
    stopAllNotifications();
    setPendingRideRequest(null);
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/${rideId}/decline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            driverId: driver?.id
          })
        }
      );
    } catch (error) {
      console.error('Erreur refus course:', error);
    }
  };

  // ✅ Déconnexion
  const handleLogout = async () => {
    try {
      // Mettre le statut à offline
      if (driver?.id) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              status: 'offline',
              available: false
            })
          }
        );
      }
      
      // Déconnexion Supabase
      await supabase.auth.signOut();
      
      // Nettoyer l'état
      setCurrentDriver(null);
      setCurrentScreen('driver-welcome');
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">Conducteur non connecté</p>
          <Button onClick={() => setCurrentScreen('driver-welcome')}>
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ Rendu de l'onglet HOME (principal)
  const renderHomeTab = () => {
    const vehicleCategory = vehicleInfo?.type || 'smart_standard';
    const minimumCredit = getMinimumCreditForCategory(vehicleCategory as VehicleCategory);
    const currentBalance = driver.balance || 0;
    const hasEnoughCredit = currentBalance >= minimumCredit;

    return (
      <div className="space-y-6">
        {/* En-tête avec statut */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{driver.full_name || driver.name}</h2>
              <p className="text-white/80">{vehicleInfo ? `${vehicleInfo.make} ${vehicleInfo.model}` : 'Véhicule non configuré'}</p>
            </div>
            <div className="text-right">
              <Badge className={`${isOnline ? 'bg-green-500' : 'bg-gray-400'} text-white px-4 py-2`}>
                {isOnline ? '🟢 EN LIGNE' : '⚫ HORS LIGNE'}
              </Badge>
            </div>
          </div>
          
          {/* Toggle Online/Offline */}
          <div className="flex items-center justify-between bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Power className="w-6 h-6" />
              <div>
                <p className="font-semibold">Disponibilité</p>
                <p className="text-sm text-white/80">
                  {isOnline ? 'Vous recevez des demandes' : 'Vous ne recevez pas de demandes'}
                </p>
              </div>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              disabled={!hasEnoughCredit && !isOnline}
            />
          </div>
          
          {/* Avertissement crédit insuffisant */}
          {!hasEnoughCredit && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Crédit insuffisant</p>
                <p className="text-xs text-white/90 mt-1">
                  Vous devez avoir au moins {formatCDF(minimumCredit)} pour vous mettre en ligne.
                  Votre solde actuel: {formatCDF(currentBalance)}
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-white text-primary hover:bg-white/90"
                  onClick={() => setShowBalanceManager(true)}
                >
                  Recharger mon compte
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Position actuelle */}
        {isOnline && currentLocation && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Position actuelle</p>
                <p className="text-sm text-gray-600">{currentAddress}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700">GPS actif</Badge>
            </div>
          </Card>
        )}

        {/* Statistiques du jour */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gains du jour</p>
                <p className="text-xl font-bold text-gray-900">{formatCDF(todayEarnings)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-xl font-bold text-gray-900">{todayRides}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Solde du compte */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde du compte</p>
                <p className="text-2xl font-bold text-gray-900">{formatCDF(currentBalance)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalanceManager(true)}
            >
              Gérer
            </Button>
          </div>
        </Card>

        {/* État d'attente */}
        {isOnline && !pendingRideRequest && (
          <Card className="p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">En attente de courses...</h3>
            <p className="text-sm text-gray-600">Vous serez notifié dès qu'un passager demande une course</p>
          </Card>
        )}

        {/* Bouton diagnostic FCM (dev) */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFCMDiagnostic(!showFCMDiagnostic)}
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            {showFCMDiagnostic ? 'Masquer' : 'Afficher'} diagnostic FCM
          </Button>
        )}
      </div>
    );
  };

  // ✅ Rendu de l'onglet GAINS
  const renderEarningsTab = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques du jour</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Gains totaux</p>
              <p className="text-2xl font-bold text-green-600">{formatCDF(todayEarnings)}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Courses</p>
              <p className="text-2xl font-bold text-blue-600">{todayRides}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gain moyen/course</span>
              <span className="font-semibold">
                {todayRides > 0 ? formatCDF(todayEarnings / todayRides) : formatCDF(0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Solde actuel</span>
              <span className="font-semibold">{formatCDF(driver.balance || 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Gestion du solde</h3>
          <DriverBalanceManager 
            driverId={driver.id} 
            currentBalance={driver.balance || 0}
            onBalanceUpdate={(newBalance) => {
              updateDriver({ ...driver, balance: newBalance });
            }}
          />
        </Card>
      </div>
    );
  };

  // ✅ Rendu de l'onglet HISTORIQUE
  const renderHistoryTab = () => {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des courses</h3>
          
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement...</p>
            </div>
          ) : rideHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">Aucune course pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rideHistory.map((ride) => (
                <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{ride.passenger?.name || 'Passager'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ride.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={`${
                      ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                      ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ride.status === 'completed' ? 'Terminée' :
                       ride.status === 'cancelled' ? 'Annulée' :
                       ride.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{ride.pickup?.address || 'Non spécifié'}</span>
                    </div>
                    
                    {ride.destination && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{ride.destination.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {ride.final_price && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Montant</span>
                      <span className="font-bold text-green-600">{formatCDF(ride.final_price)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ✅ Rendu de l'onglet PROFIL
  const renderProfileTab = () => {
    return (
      <div className="space-y-4">
        {/* Informations personnelles */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{driver.full_name || driver.name}</h3>
              <p className="text-sm text-gray-600">{driver.phone}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold">{driver.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-xs text-gray-500">({driver.total_rides || 0} courses)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium">{driver.email || 'Non renseigné'}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Téléphone</span>
              <span className="text-sm font-medium">{driver.phone}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Type de compte</span>
              <Badge className="bg-primary/10 text-primary">
                {driver.account_type || 'Postpayé'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Informations véhicule */}
        {vehicleInfo && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mon véhicule</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Marque / Modèle</span>
                <span className="text-sm font-medium">{vehicleInfo.make} {vehicleInfo.model}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Immatriculation</span>
                <span className="text-sm font-medium font-mono">{vehicleInfo.plate}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Couleur</span>
                <span className="text-sm font-medium">{vehicleInfo.color}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Catégorie</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {getVehicleDisplayName(vehicleInfo.type)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Places</span>
                <span className="text-sm font-medium">{vehicleInfo.seats} passagers</span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentScreen('driver-settings')}
            >
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">SmartCabb Driver</h1>
          <div className="flex items-center gap-2">
            <Badge className={`${isOnline ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
              {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Navigation inférieure */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === 'home' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-xs font-medium">Accueil</span>
          </button>
          
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === 'earnings' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Gains</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-xs font-medium">Historique</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profil</span>
          </button>
        </div>
      </div>

      {/* Notification de nouvelle course */}
      {pendingRideRequest && (
        <RideNotification
          rideRequest={pendingRideRequest}
          onAccept={handleAcceptRide}
          onDecline={handleDeclineRide}
          timeoutSeconds={15}
        />
      )}

      {/* Diagnostic FCM */}
      {showFCMDiagnostic && driver?.id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-lg">Diagnostic FCM</h3>
              <button
                onClick={() => setShowFCMDiagnostic(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FCMDiagnostic 
                driverId={driver.id} 
                driverName={driver.full_name || driver.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gestionnaire de solde (modal) */}
      {showBalanceManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">Gestion du solde</h3>
              <button
                onClick={() => setShowBalanceManager(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <DriverBalanceManager 
                driverId={driver.id} 
                currentBalance={driver.balance || 0}
                onBalanceUpdate={(newBalance) => {
                  updateDriver({ ...driver, balance: newBalance });
                  setShowBalanceManager(false);
                  toast.success('Solde mis à jour avec succès');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notification sonore de course */}
      <RideNotificationSound />
    </div>
  );
}
