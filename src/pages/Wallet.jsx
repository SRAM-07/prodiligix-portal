import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdRefresh, MdAdd, MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward, MdReceiptLong } from 'react-icons/md';
import api from '../services/api';

export default function Wallet() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditTransactionId, setCreditTransactionId] = useState('');
  const [creditSubmitting, setCreditSubmitting] = useState(false);
  const [newWalletAmount, setNewWalletAmount] = useState('');
  const [newWalletExpiry, setNewWalletExpiry] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchWalletData = async (companyId) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [balanceRes, walletsRes] = await Promise.all([
        api.get(`/api/wallet/balance/${companyId}`),
        api.get(`/api/wallet/company/${companyId}`),
      ]);
      setWalletData(balanceRes.data);
      setWallets(walletsRes.data);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchWalletData(selectedCompany);
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleCredit = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) return;
    setCreditSubmitting(true);
    try {
      await api.post('/api/wallet', {
        companyId: parseInt(selectedCompany),
        transactionNumber: creditTransactionId || 'TXN-' + Date.now(),
        totalRechargedAmount: parseFloat(creditAmount),
        walletUsedAmount: 0,
        rechargedDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
      setToast(`₹${creditAmount} credited successfully`);
      setCreditAmount('');
      setCreditTransactionId('');
      setShowCreditDialog(false);
      fetchWalletData(selectedCompany);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to credit wallet');
    } finally {
      setCreditSubmitting(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletAmount || parseFloat(newWalletAmount) <= 0) return;
    setCreateSubmitting(true);
    try {
      await api.post('/api/wallet', {
        companyId: parseInt(selectedCompany),
        transactionNumber: creditTransactionId || 'TXN-' + Date.now(),
        totalRechargedAmount: parseFloat(newWalletAmount),
        walletUsedAmount: 0,
        rechargedDate: newWalletExpiry || new Date().toISOString().split('T')[0],
        isActive: true,
      });
      setToast('Wallet created successfully');
      setNewWalletAmount('');
      setNewWalletExpiry('');
      setShowCreateDialog(false);
      fetchWalletData(selectedCompany);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to create wallet');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const selectedCompanyName = companies.find(c => c.id === parseInt(selectedCompany))?.businessName || '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Resources</p>
            <h1 className="text-base font-bold text-gray-800">Wallet Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">Select Company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </select>
            {selectedCompany && (
              <button onClick={() => fetchWalletData(selectedCompany)}
                className="p-1.5 rounded-lg hover:bg-gray-100">
                <MdRefresh size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">
          {!selectedCompany ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Select a company to view wallet details
            </div>
          ) : loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Loading wallet data...</div>
          ) : (
            <>
              {/* Balance cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#e0f2fe' }}>
                      <MdAccountBalanceWallet size={22} style={{ color: '#068BC9' }} />
                    </div>
                    <p className="text-sm text-gray-500">Total Balance</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: '#068BC9' }}>
                    ₹{(walletData?.balanceAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{selectedCompanyName}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#dcfce7' }}>
                      <MdArrowUpward size={22} style={{ color: '#22c55e' }} />
                    </div>
                    <p className="text-sm text-gray-500">Active Wallets</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>
                    {wallets.filter(w => w.isActive).length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">of {wallets.length} total</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#fef3c7' }}>
                      <MdArrowDownward size={22} style={{ color: '#f59e0b' }} />
                    </div>
                    <p className="text-sm text-gray-500">Amount Used</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                    ₹{walletData?.walletUsedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Total deducted</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setShowCreditDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#22c55e' }}>
                  <MdArrowUpward size={16} />
                  Top Up Wallet
                </button>
                <button
                  onClick={() => navigate(`/wallet/ledger?company=${selectedCompany}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>
                  <MdReceiptLong size={16} />
                  View Ledger
                </button>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ color: '#068BC9', borderColor: '#068BC9' }}>
                  <MdAdd size={16} />
                  Create New Wallet
                </button>
              </div>

              {/* Wallet list */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">Wallet Details</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['ID', 'Balance', 'Used', 'Expiry Date', 'Transaction ID', 'Status'].map((col, i) => (
                          <th key={i} className="text-left text-xs text-gray-400 font-medium px-5 py-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                            No wallets found for this company
                          </td>
                        </tr>
                      ) : wallets.map((wallet, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm text-gray-600">#{wallet.id}</td>
                          <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#068BC9' }}>
                            ₹{parseFloat(wallet.totalRechargedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">
                            ₹{parseFloat(wallet.walletUsedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">
                            {wallet.rechargedDate ? wallet.rechargedDate.split('T')[0] : '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">
                            {wallet.transactionNumber || '—'}
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-medium px-2 py-1 rounded-full"
                              style={{
                                color: wallet.isActive ? '#22c55e' : '#ef4444',
                                backgroundColor: wallet.isActive ? '#dcfce7' : '#fee2e2'
                              }}>
                              {wallet.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Credit Dialog */}
      {showCreditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Top Up Wallet</h2>
            <p className="text-xs text-gray-400 mb-1">Amount (₹) <span className="text-red-400">*</span></p>
            <input
              type="number"
              placeholder="Enter amount"
              value={creditAmount}
              onChange={e => setCreditAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none mb-3" />
            <p className="text-xs text-gray-400 mb-1">Transaction ID / Reference No.</p>
            <input
              type="text"
              placeholder="e.g. NEFT/UPI reference number"
              value={creditTransactionId}
              onChange={e => setCreditTransactionId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowCreditDialog(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCredit} disabled={creditSubmitting}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#22c55e' }}>
                {creditSubmitting ? 'Processing...' : 'Top Up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Wallet Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Create New Wallet</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Initial Balance (₹) <span className="text-red-400">*</span></p>
                <input
                  type="number"
                  placeholder="Enter initial balance"
                  value={newWalletAmount}
                  onChange={e => setNewWalletAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Expiry Date (optional)</p>
                <input
                  type="date"
                  value={newWalletExpiry}
                  onChange={e => setNewWalletExpiry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCreateDialog(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCreateWallet} disabled={createSubmitting}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#068BC9' }}>
                {createSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}