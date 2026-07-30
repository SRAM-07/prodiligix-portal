import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { MdUploadFile, MdDownload, MdInfo, MdCheckCircle, MdError } from 'react-icons/md';
import Papa from 'papaparse';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setResult(null);
    } else {
      alert('Please drop a valid CSV file');
    }
  };

  const parseCsv = (csvFile) => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data),
        error: (err) => reject(err),
      });
    });
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const rows = await parseCsv(file);

      if (rows.length === 0) {
        setResult({ success: false, error: 'The CSV file appears to be empty.' });
        setUploading(false);
        return;
      }

      const shipmentDtos = [];
      const rowErrors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const pickupRes = await api.post('/api/addresses', {
            companyId,
            userId: user?.userId,
            type: 'pickup',
            facilityName: row.pickup_name,
            contactPersonName: row.pickup_name,
            contactPersonPhonenumber: row.pickup_phone,
            address: row.pickup_address,
            city: row.pickup_city,
            state: row.pickup_state,
            zipcode: row.pickup_pincode,
          });

          const deliveryRes = await api.post('/api/addresses', {
            companyId,
            userId: user?.userId,
            type: 'delivery',
            facilityName: row.delivery_name,
            contactPersonName: row.delivery_name,
            contactPersonPhonenumber: row.delivery_phone,
            address: row.delivery_address,
            city: row.delivery_city,
            state: row.delivery_state,
            zipcode: row.delivery_pincode,
          });

          const boxes = JSON.stringify([{
            id: 1,
            noOfBoxes: parseInt(row.box_quantity) || 1,
            boxType: row.box_type || 'Corrugated Box',
            length: row.shipment_length,
            width: row.shipment_width,
            height: row.shipment_height,
          }]);

          const actualWeight = parseFloat(row.actual_weight) || 0;

          shipmentDtos.push({
            companyId,
            pickupAddressId: pickupRes.data.id,
            deliveryAddressId: deliveryRes.data.id,
            transportMode: row.transport_mode || 'Surface',
            shipmentDetails: row.shipment_detail,
            shipmentDetailsDescription: row.shipment_detail,
            shipmentDeclaredValue: parseFloat(row.declared_value) || 0,
            actualWeight: actualWeight,
            boxQuantity: parseInt(row.box_quantity) || 1,
            boxes: boxes,
            dimensionUnit: 'cms',
            volumetricWeight: actualWeight,
            scanWeight: actualWeight,
            insuranceRequired: (row.insurance_required || '').toLowerCase() === 'yes',
            packageRequired: false,
            modes: (row.modes || 'Forward').toLowerCase(),
            transporter: row.transporter || 'DelhiveryOne',
            sourceType: 'wallet',
          });
        } catch (rowErr) {
          rowErrors.push(`Row ${i + 2}: ${rowErr.response?.data?.error || rowErr.message}`);
        }
      }

      if (shipmentDtos.length === 0) {
        setResult({ success: false, error: 'No valid rows could be processed.', rowErrors });
        setUploading(false);
        return;
      }

      const bulkRes = await api.post('/api/shipments/bulk', shipmentDtos);
      setResult({
        success: true,
        total: bulkRes.data.total,
        successCount: bulkRes.data.successCount,
        failureCount: bulkRes.data.failureCount,
        results: bulkRes.data.results,
        rowErrors,
      });
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.error || error.message || 'Upload failed. Please check your file format.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `pickup_name,pickup_address,pickup_city,pickup_state,pickup_pincode,pickup_phone,delivery_name,delivery_address,delivery_city,delivery_state,delivery_pincode,delivery_phone,shipment_detail,declared_value,actual_weight,box_quantity,box_type,shipment_length,shipment_width,shipment_height,transport_mode,transporter,modes,insurance_required
Rapido Bangalore,Spatium Commercio Tower A,Bangalore,Karnataka,560103,7406633660,John Doe,123 Main St,Chennai,Tamil Nadu,600001,9876543210,Laptops,32000,3.5,1,Corrugated Box,49,32,11,Air,Bluedart,Forward,Yes`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ClientLayout>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div>
          <p className="text-gray-400 text-xs">Tools</p>
          <h1 className="text-base font-bold text-gray-800">Bulk Upload</h1>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">

        {/* Upload card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors"
            style={{ borderColor: dragOver ? '#068BC9' : '#e5e7eb', backgroundColor: dragOver ? '#f0f9ff' : '#fafafa' }}>
            <MdUploadFile size={40} className="mx-auto mb-3" style={{ color: dragOver ? '#068BC9' : '#d1d5db' }}/>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Drag and drop your CSV file here
            </p>
            <p className="text-xs text-gray-400 mb-4">or click to browse</p>
            <label className="cursor-pointer">
              <span className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#068BC9' }}>
                Select CSV File
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Selected file */}
          {file && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#e0f2fe', color: '#068BC9' }}>
                  <MdUploadFile size={18}/>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {result?.success && (
                <MdCheckCircle size={20} style={{ color: '#22c55e' }}/>
              )}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-opacity"
            style={{
              backgroundColor: result?.success ? '#22c55e' : '#068BC9',
              opacity: (!file || uploading) ? 0.6 : 1,
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
            }}>
            {uploading ? 'Uploading...' : result?.success ? '✅ Uploaded Successfully!' : 'Upload'}
          </button>

          {/* Result summary */}
          {result && (
            <div className="mt-4">
              {result.success ? (
                <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                  <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                    {result.successCount} of {result.total} shipments created successfully.
                  </p>
                  {result.failureCount > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#c2410c' }}>
                      {result.failureCount} row(s) failed — check details below.
                    </p>
                  )}
                  <div className="mt-3 flex flex-col gap-1">
                    {result.results?.map((r, i) => (
                      <div key={i} className="text-xs flex items-center gap-2">
                        {r.success ? (
                          <MdCheckCircle size={14} style={{ color: '#22c55e' }} />
                        ) : (
                          <MdError size={14} style={{ color: '#ef4444' }} />
                        )}
                        <span className={r.success ? 'text-gray-600' : 'text-red-500'}>
                          {r.success ? r.serviceRequestId : r.error}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/client/logistics')}
                    className="mt-3 text-xs font-medium underline"
                    style={{ color: '#068BC9' }}>
                    View in Logistics →
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-lg border bg-red-50 border-red-100">
                  <p className="text-sm font-medium text-red-600">{result.error}</p>
                  {result.rowErrors?.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {result.rowErrors.map((e, i) => (
                        <p key={i} className="text-xs text-red-500">{e}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm mb-3 hover:opacity-80 transition-opacity"
            style={{ color: '#068BC9' }}>
            <MdDownload size={18}/>
            Download the Sample File to fill data [Shipment Template]
          </button>
          <button
            onClick={() => navigate('/client/bulk-upload-instructions')}
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#068BC9' }}>
            <MdInfo size={18}/>
            View Bulk Upload Instructions
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}