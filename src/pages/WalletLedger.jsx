import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';
import ClientLayout from '../components/ClientLayout';
import Sidebar from '../components/Sidebar';

const BRAND = '#068BC9';

const REASON_LABELS = {
  shipment_charge: 'Logistics Shipment',
  stamp_paper_charge: 'Stamp Paper',
  rto_charge: 'RTO Charge',
  shipment_rto_charge: 'RTO Charge',
  wallet_recharge: 'Wallet Recharge',
  cancellation_refund: 'Cancellation Refund',
  manual_deduction: 'Manual Deduction',
};

export default function WalletLedger() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isClient = ['company_user', 'company_admin'].includes(user?.role);
  const isAdmin = ['super_admin', 'crm_user'].includes(user?.role);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('company') || '');
  const [companies, setCompanies] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('transactions');
  const [recharges, setRecharges] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/api/companies').then(res => setCompanies(res.data)).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    const companyId = isClient ? user?.companyId : selectedCompany;
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      api.get(`/api/wallet/transactions/${companyId}`),
      api.get(`/api/wallet/balance/${companyId}`),
      api.get(`/api/wallet/recharges/${companyId}`),
    ]).then(([txRes, walletRes, rechargeRes]) => {
      setTransactions(txRes.data);
      setWallet(walletRes.data);
      setRecharges(rechargeRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedCompany, user?.companyId]);

  const filteredTransactions = transactions.filter(t => {
    if (filterMonth === 'all') return true;
    const date = new Date(t.createdAt);
    const now = new Date();
    if (filterMonth === 'this') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (filterMonth === 'last') { const d = new Date(now.getFullYear(), now.getMonth() - 1); return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear(); }
    if (filterMonth === 'two') { const d = new Date(now.getFullYear(), now.getMonth() - 2); return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear(); }
    return true;
  });

  const downloadCSV = () => {
    const headers = ['Date', 'Service Request ID', 'Type', 'Description', 'Amount', 'Balance After'];
    const rows = filteredTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString('en-IN'),
      t.serviceRequestId || '—',
      t.transactionType === 'debit' ? 'Debit' : 'Credit',
      REASON_LABELS[t.reason] || t.reason,
      '"' + (t.transactionType === 'debit' ? '-' : '+') + parseFloat(t.amount).toFixed(2) + '"',
      t.balanceAfter ? '"' + parseFloat(t.balanceAfter).toFixed(2) + '"' : '—',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-ledger-${selectedCompany || user?.companyId}.csv`;
    a.click();
  };

  const content = (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <MdArrowBack size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Wallet Ledger</h1>
            <p className="text-xs text-gray-400">Complete transaction history</p>
          </div>
        </div>
        <button onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: BRAND }}>
          <MdDownload size={16} /> Download CSV
        </button>
      </div>

      {/* Company selector for admin */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select Company</p>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
            <option value="">Select a company</option>
            {companies.filter(c => c.billingType === 'wallet').map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Wallet Summary */}
      {wallet && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Total Recharged</p>
            <p className="text-lg font-bold text-gray-800">₹{parseFloat(wallet.totalRechargedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Total Used</p>
            <p className="text-lg font-bold text-gray-800">₹{parseFloat(wallet.walletUsedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Available Balance</p>
            <p className="text-lg font-bold" style={{ color: BRAND }}>₹{parseFloat(wallet.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[['transactions', 'Transactions'], ['recharges', 'Recharges']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{ borderColor: activeTab === tab ? '#068BC9' : 'transparent', color: activeTab === tab ? '#068BC9' : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'recharges' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Recharge History ({recharges.length})</p>
          </div>
          {recharges.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No recharges found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Transaction ID', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recharges.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {r.rechargedDate || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.transactionNumber || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-green-600 whitespace-nowrap">
                        +₹{parseFloat(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50">Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>

      {/* Month Filter */}
      <div className="flex gap-2">
        {[['all','All Time'],['this','This Month'],['last','Last Month'],['two','2 Months Ago']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterMonth(val)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: filterMonth === val ? '#068BC9' : '#f3f4f6', color: filterMonth === val ? 'white' : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Transaction History ({filteredTransactions.length})</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <MdAccountBalanceWallet size={36} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Service Request ID', 'Description', 'Type', 'Amount', 'Balance After'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {t.serviceRequestId ? (
                        <span className="font-medium" style={{ color: BRAND }}>{t.serviceRequestId}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {REASON_LABELS[t.reason] || t.reason}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full font-medium ${t.transactionType === 'debit' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                        {t.transactionType === 'debit' ? <MdArrowDownward size={12} /> : <MdArrowUpward size={12} />}
                        {t.transactionType === 'debit' ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      <span className={t.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'}>
                        {t.transactionType === 'debit' ? '-' : '+'}₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {t.balanceAfter != null ? '₹' + parseFloat(t.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </div>
      )}
    </div>
  );

  if (isClient) return <ClientLayout>{content}</ClientLayout>;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />
      <div className="flex-1 transition-all duration-300 overflow-auto"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>
        {content}
      </div>
    </div>
  );
}
