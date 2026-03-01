import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../../lib/toast';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Icônes inline
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);

const CreditCard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);

const ArrowDownCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" /></svg>
);

const Plus = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

const RefreshCw = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);

const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

interface DriverWalletManagerProps {
  driverId: string;
  creditBalance: number;
  earningsBalance: number;
  onBalanceUpdate: (creditBalance: number, earningsBalance: number) => void;
}

export function DriverWalletManager({ 
  driverId, 
  creditBalance,
  earningsBalance,
  onBalanceUpdate 
}: DriverWalletManagerProps) {
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recharge' | 'withdraw'>('recharge');

  const formatCDF = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} CDF`;
  };

  const syncBalances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/wallets`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onBalanceUpdate(data.creditBalance || 0, data.earningsBalance || 0);
          toast.success('✅ Soldes synchronisés !');
        }
      } else {
        toast.error('❌ Impossible de synchroniser les soldes');
      }
    } catch (error) {
      console.error('Erreur sync balances:', error);
      toast.error('❌ Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('❌ Montant invalide');
      return;
    }

    if (amount < 1000) {
      toast.error('❌ Le montant minimum de recharge est 1 000 CDF');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/wallet/recharge`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onBalanceUpdate(data.newCreditBalance, earningsBalance);
        setRechargeAmount('');
        toast.success(`✅ Recharge de ${formatCDF(amount)} effectuée !`);
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de la recharge'}`);
      }
    } catch (error) {
      console.error('Erreur recharge:', error);
      toast.error('❌ Erreur lors de la recharge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('❌ Montant invalide');
      return;
    }

    if (amount > earningsBalance) {
      toast.error('❌ Solde insuffisant pour ce retrait');
      return;
    }

    if (amount < 5000) {
      toast.error('❌ Le montant minimum de retrait est 5 000 CDF');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/wallet/withdraw`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onBalanceUpdate(creditBalance, data.newEarningsBalance);
        setWithdrawAmount('');
        toast.success(`✅ Retrait de ${formatCDF(amount)} traité ! Vous recevrez l'argent sous 24-48h.`);
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors du retrait'}`);
      }
    } catch (error) {
      console.error('Erreur retrait:', error);
      toast.error('❌ Erreur lors du retrait');
    } finally {
      setIsLoading(false);
    }
  };

  const quickRechargeAmounts = [5000, 10000, 20000, 50000];
  const quickWithdrawAmounts = [5000, 10000, 20000, 50000];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-700 font-medium">Solde de crédit</p>
              <p className="text-[10px] text-blue-600">Pour se mettre en ligne</p>
            </div>
          </div>
          <p className="text-xl font-bold text-blue-900">{formatCDF(creditBalance)}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-green-700 font-medium">Solde de gains</p>
              <p className="text-[10px] text-green-600">Retirable</p>
            </div>
          </div>
          <p className="text-xl font-bold text-green-900">{formatCDF(earningsBalance)}</p>
        </Card>
      </div>

      <Button
        onClick={syncBalances}
        disabled={isLoading}
        variant="outline"
        className="w-full"
        size="sm"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Actualiser les soldes
      </Button>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('recharge')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'recharge'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Recharger
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'withdraw'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4 inline mr-1" />
          Retirer
        </button>
      </div>

      {activeTab === 'recharge' && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recharge-amount" className="text-sm font-medium text-gray-700">
                Montant à recharger
              </Label>
              <Input
                id="recharge-amount"
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Entrez le montant en CDF"
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 1 000 CDF</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Montants rapides :</p>
              <div className="grid grid-cols-4 gap-2">
                {quickRechargeAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setRechargeAmount(amount.toString())}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {(amount / 1000)}k
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-blue-900 font-medium">Info importante</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Ce solde sera réduit de 15% après chaque course pour couvrir les frais de plateforme.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRecharge}
              disabled={isLoading || !rechargeAmount}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Traitement...' : 'Recharger mon compte'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'withdraw' && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-sm font-medium text-gray-700">
                Montant à retirer
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Entrez le montant en CDF"
                disabled={isLoading}
                className="mt-1"
                max={earningsBalance}
              />
              <p className="text-xs text-gray-500 mt-1">
                Disponible: {formatCDF(earningsBalance)} | Minimum: 5 000 CDF
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Montants rapides :</p>
              <div className="grid grid-cols-4 gap-2">
                {quickWithdrawAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(amount.toString())}
                    disabled={isLoading || amount > earningsBalance}
                    className="text-xs"
                  >
                    {(amount / 1000)}k
                  </Button>
                ))}
              </div>
            </div>

            {earningsBalance === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-900 font-medium">Aucun gain disponible</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Effectuez des courses pour accumuler des gains et pouvoir les retirer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {earningsBalance > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-green-900 font-medium">Comment ça marche ?</p>
                    <p className="text-xs text-green-700 mt-1">
                      Les retraits sont traités sous 24-48h. Vous recevrez l'argent par Mobile Money (M-PESA, Airtel Money, Orange Money).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount || earningsBalance === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Traitement...' : 'Retirer mes gains'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
