import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdArrowBack, MdDownload, MdAttachFile,
  MdLocalShipping, MdLocationOn, MdInventory,
  MdCheckCircle, MdUpload, MdSync
} from 'react-icons/md';
import api from '../services/api';

const statusConfig = {
  'Booked': { color: '#068BC9', bg: '#e0f2fe' },
  'In Transit': { color: '#1d4ed8', bg: '#dbeafe' },
  'Picked Up': { color: '#0ea5e9', bg: '#e0f2fe' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7' },
  'Exception': { color: '#ef4444', bg: '#fee2e2' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
  'RTO': { color: '#f97316', bg: '#ffedd5' },
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [shipment, setShipment] = useState(null);
  const [pickupAddress, setPickupAddress] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState('');

  const tabs = ['details', 'documents', 'tracking'];

  const fetchAll = async () => {
    try {
      const shipmentRes = await api.get(`/api/shipments/${id}`);
      setShipment(shipmentRes.data);

      if (shipmentRes.data.pickupAddressId) {
        try {
          const pickupRes = await api.get(`/api/addresses/${shipmentRes.data.pickupAddressId}`);
          setPickupAddress(pickupRes.data);
        } catch (e) {
          console.error('Failed to fetch pickup address:', e);
        }
      }

      if (shipmentRes.data.deliveryAddressId) {
        try {
          const deliveryRes = await api.get(`/api/addresses/${shipmentRes.data.deliveryAddressId}`);
          setDeliveryAddress(deliveryRes.data);
        } catch (e) {
          console.error('Failed to fetch delivery address:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/api/shipments/${id}/sync-tracking`);
      setToast(res.data.message || 'Tracking synced');
      fetchAll();
    } catch (error) {
      setToast(error.response?.data?.error || 'Failed to sync tracking');
    } finally {
      setSyncing(false);
    }
  };

  const safeParseBoxes = (boxesStr) => {
    if (!boxesStr) return [];
    try {
      const parsed = JSON.parse(boxesStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const safeParseScans = (scansStr) => {
    if (!scansStr) return [];
    try {
      const parsed = JSON.parse(scansStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Loading shipment...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Shipment not found</p>
      </div>
    );
  }

  const s = statusConfig[shipment.deliveryStatus] || { color: '#9ca3af', bg: '#f3f4f6' };
  const boxes = safeParseBoxes(shipment.boxes);
  const scans = safeParseScans(shipment.scans);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/logistics')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600"/>
          </button>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Logistics Management</p>
            <h1 className="text-base font-bold text-gray-800">{shipment.serviceRequestId}</h1>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: s.color, backgroundColor: s.bg }}>
            {shipment.deliveryStatus}
          </span>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-6 max-w-5xl mx-auto">

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">AWB Number</p>
              <p className="text-sm font-bold text-gray-800">{shipment.shipmentAwbNumber || '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{shipment.transporter || '—'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Declared Value</p>
              <p className="text-sm font-bold text-gray-800">₹{shipment.shipmentDeclaredValue?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{shipment.shipmentDetails || '—'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Final Rate</p>
              <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                {shipment.shipmentRate ? `₹${shipment.shipmentRate}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {shipment.rateType} · {shipment.requestApproved ? 'Approved' : 'Pending'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Expected Delivery</p>
              <p className="text-sm font-bold text-gray-800">
                {shipment.expectedDeliveryDate ? shipment.expectedDeliveryDate.split('T')[0] : 'Pending'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{shipment.transportMode} · {shipment.modes}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  backgroundColor: activeTab === tab ? '#068BC9' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#6b7280'
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-4">

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn size={18} style={{ color: '#068BC9' }}/>
                    <p className="text-sm font-semibold text-gray-700">Pickup Address</p>
                  </div>
                  {pickupAddress ? (
                    <>
                      <p className="text-sm text-gray-800 font-medium">{pickupAddress.facilityName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {pickupAddress.address}, {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zipcode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Phone: {pickupAddress.contactPersonPhonenumber}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No pickup address set</p>
                  )}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn size={18} style={{ color: '#22c55e' }}/>
                    <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                  </div>
                  {deliveryAddress ? (
                    <>
                      <p className="text-sm text-gray-800 font-medium">{deliveryAddress.facilityName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {deliveryAddress.address}, {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipcode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Phone: {deliveryAddress.contactPersonPhonenumber}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No delivery address set</p>
                  )}
                </div>
              </div>

              {/* Shipment info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdLocalShipping size={18} style={{ color: '#068BC9' }}/>
                  <p className="text-sm font-semibold text-gray-700">Shipment Information</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Transport Mode', value: shipment.transportMode || '—' },
                    { label: 'Transporter', value: shipment.transporter || '—' },
                    { label: 'Mode Type', value: shipment.modes || '—' },
                    { label: 'Declared Value', value: `₹${shipment.shipmentDeclaredValue?.toLocaleString() || '0'}` },
                    { label: 'Challan No.', value: shipment.deliveryChallanNumber || 'N/A' },
                    { label: 'Shipment Detail', value: shipment.shipmentDetails || '—' },
                    { label: 'Description', value: shipment.shipmentDetailsDescription || '—' },
                    { label: 'Actual Weight', value: `${shipment.actualWeight || 0} kg` },
                    { label: 'Volumetric Weight', value: `${shipment.volumetricWeight || 0} kg` },
                    { label: 'Scan Weight', value: `${shipment.scanWeight || 0} kg` },
                    { label: 'No. of Boxes', value: shipment.boxQuantity || '—' },
                    { label: 'Rate Type', value: shipment.rateType || '—' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box groups */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdInventory size={18} style={{ color: '#068BC9' }}/>
                  <p className="text-sm font-semibold text-gray-700">Box Groups</p>
                </div>
                {boxes.length === 0 ? (
                  <p className="text-xs text-gray-400">No box details recorded</p>
                ) : boxes.map((box, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-start mb-2 last:mb-0">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div><p className="text-xs text-gray-400">Boxes</p><p className="text-sm font-medium text-gray-700">{box.noOfBoxes || '—'}</p></div>
                      <div><p className="text-xs text-gray-400">Box Type</p><p className="text-sm font-medium text-gray-700">{box.boxType || '—'}</p></div>
                      <div><p className="text-xs text-gray-400">Dimensions (L×W×H)</p><p className="text-sm font-medium text-gray-700">{box.length} × {box.width} × {box.height} {shipment.dimensionUnit}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insurance + Packaging */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Additional Options</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Insurance</p>
                    <p className="text-sm font-medium text-gray-700">{shipment.insuranceRequired ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Package</p>
                    <p className="text-sm font-medium text-gray-700">{shipment.packageRequired ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Approval banner */}
              {shipment.requestApproved ? (
                <div className="rounded-xl p-4 border flex items-start gap-3"
                  style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                  <MdCheckCircle size={20} style={{ color: '#22c55e' }} className="flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                      Shipment amount approved and processed successfully
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>
                      Approved at: {shipment.approvedAt || '—'} · Deducted: ₹{shipment.lastDeductedAmount || '0'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 border flex items-start gap-3"
                  style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                  <p className="text-sm font-medium" style={{ color: '#c2410c' }}>
                    Payment not yet processed for this shipment.
                  </p>
                </div>
              )}

              {shipment.cancellationReason && (
                <div className="rounded-xl p-4 border flex items-start gap-3"
                  style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <p className="text-sm font-medium text-red-600">
                    Cancelled: {shipment.cancellationReason}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pb-4">
                <button
                  onClick={() => navigate('/logistics')}
                  className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Back to List
                </button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Documents</p>
                <div className="grid grid-cols-2 gap-4">

                  {shipment.invoiceCopy ? (
                    <a href={shipment.invoiceCopy} target="_blank" rel="noreferrer"
                      className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                          <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Invoice / DC Copy</p>
                      </div>
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </a>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
                      <MdUpload size={28} className="text-gray-300"/>
                      <p className="text-sm text-gray-500 font-medium">No Invoice / DC Copy</p>
                    </div>
                  )}

                  {shipment.shipmentWithLabel ? (
                    <a href={shipment.shipmentWithLabel} target="_blank" rel="noreferrer"
                      className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                          <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Shipment Label</p>
                      </div>
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </a>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-gray-400">No label uploaded yet</p>
                    </div>
                  )}

                  {shipment.manifest ? (
                    <a href={shipment.manifest} target="_blank" rel="noreferrer"
                      className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                          <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Manifest</p>
                      </div>
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </a>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-gray-400">No manifest generated yet</p>
                    </div>
                  )}

                  {shipment.podCopy ? (
                    <a href={shipment.podCopy} target="_blank" rel="noreferrer"
                      className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                          <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                        </div>
                        <p className="text-sm font-medium text-gray-700">POD Copy</p>
                      </div>
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </a>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
                      <MdUpload size={28} className="text-gray-300"/>
                      <p className="text-sm text-gray-500 font-medium">No POD yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-gray-700">Tracking Timeline</p>
                {shipment.shipmentAwbNumber && (
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}>
                    <MdSync size={14} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync Tracking'}
                  </button>
                )}
              </div>

              {!shipment.shipmentAwbNumber ? (
                <p className="text-sm text-gray-400 text-center py-8">No AWB number set — tracking unavailable until this shipment is booked with a carrier.</p>
              ) : scans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No tracking scans yet. Click "Sync Tracking" to fetch the latest status.</p>
              ) : (
                <div className="flex flex-col gap-0">
                  {scans.map((scan, i, arr) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#068BC9' }}>
                          <MdCheckCircle size={18} className="text-white"/>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-0.5 h-10 mt-1" style={{ backgroundColor: '#068BC9' }}/>
                        )}
                      </div>
                      <div className="pb-8">
                        <p className="text-sm font-medium text-gray-700">{scan.scan || 'Scan update'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{scan.location || '—'}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{scan.scan_datetime || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}