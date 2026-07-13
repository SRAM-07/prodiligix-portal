import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdUploadFile, MdDownload, MdInfo, MdCheckCircle } from 'react-icons/md';

export default function BulkUpload() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setUploaded(false);
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
      setUploaded(false);
    } else {
      alert('Please drop a valid CSV file');
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 2000);
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

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
                {uploaded && (
                  <MdCheckCircle size={20} style={{ color: '#22c55e' }}/>
                )}
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || uploaded}
              className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: uploaded ? '#22c55e' : '#068BC9',
                opacity: (!file || uploading) ? 0.6 : 1,
                cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
              }}>
              {uploading ? 'Uploading...' : uploaded ? '✅ Uploaded Successfully!' : 'Upload'}
            </button>

            {uploaded && (
              <p className="text-xs text-center text-gray-400 mt-3">
                Your addresses have been uploaded. You can now use them while booking shipments.
              </p>
            )}
          </div>

          {/* Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm mb-3 hover:opacity-80 transition-opacity"
              style={{ color: '#068BC9' }}>
              <MdDownload size={18}/>
              Download the Sample File to fill data [Address Template]
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
      </div>
    </div>
  );
}