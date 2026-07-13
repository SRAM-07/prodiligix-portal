import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack } from 'react-icons/md';

const boxAttributes = [
  { attribute: 'box_type', quantity: 3, same: '"Flyer"', mixed: '"Flyer"|"Wooden Box"|"Corrugated Box"' },
  { attribute: 'shipment_length', quantity: 3, same: '10', mixed: '10|20|30' },
  { attribute: 'shipment_width', quantity: 3, same: '10', mixed: '10|10|20' },
  { attribute: 'shipment_height', quantity: 3, same: '10', mixed: '10|20|20' },
];

const transportModes = [
  { mode: 'Air', transporters: 'Delhivery, Bluedart, Indigo, Air India, Akasa Air, Royal King Courier Services' },
  { mode: 'Air Urgent', transporters: 'Indigo, Air India, Akasa Air' },
  { mode: 'Surface', transporters: 'Delhivery, Bluedart' },
  { mode: 'Surface Urgent', transporters: 'Delhivery, Bluedart, Royal King Courier Services' },
  { mode: 'PTL (Part Truck Load)', transporters: 'Delhivery, Royal King Courier Services, DSN' },
  { mode: 'FTL (FullTruckLoad)', transporters: 'DSN, Royal King Courier Services' },
];

export default function BulkUploadInstructions() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/client/bulk-upload')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600"/>
          </button>
          <div>
            <p className="text-gray-400 text-xs">Bulk Upload</p>
            <h1 className="text-base font-bold text-gray-800">Upload Instructions</h1>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">📌</span>
              <h2 className="text-base font-bold text-gray-800">Instructions:</h2>
            </div>

            {/* Rules */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Do <strong>NOT</strong> change the column headers.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  <strong>Remove Dummy data before adding records.</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm font-medium text-gray-700">Box Attributes & values</p>
              </div>
            </div>

            {/* Box attributes table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Attribute</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Quantity</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Same</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Mixed</th>
                  </tr>
                </thead>
                <tbody>
                  {boxAttributes.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-none">
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{row.attribute}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.quantity}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.same}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{row.mixed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* More rules */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  The number of <code className="bg-gray-100 px-1 rounded text-xs font-mono">boxes</code> attribute values must match <code className="bg-gray-100 px-1 rounded text-xs font-mono">box_quantity</code>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  <code className="bg-gray-100 px-1 rounded text-xs font-mono">Insurance Required</code> should be either <strong>Yes</strong> or <strong>No</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Choose <code className="bg-gray-100 px-1 rounded text-xs font-mono">box_type</code> From{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs font-mono">['Flyer', 'Envelope Cover', 'Corrugated Box', 'Wooden Box', 'Other']</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Choose <code className="bg-gray-100 px-1 rounded text-xs font-mono">transport_modes</code> From{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs font-mono">['Air', 'Air Urgent', 'Surface', 'Surface Urgent', 'PTL (Part Truck Load)', 'FTL (FullTruckLoad)']</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Choose <code className="bg-gray-100 px-1 rounded text-xs font-mono">modes</code> From{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs font-mono">['Forward', 'Reverse', 'PointToPoint']</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-sm font-medium text-gray-700">Transport Modes & Transporters</p>
              </div>
            </div>

            {/* Transport modes table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Transport Mode</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 border-b border-gray-200">Transporters</th>
                  </tr>
                </thead>
                <tbody>
                  {transportModes.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{row.mode}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.transporters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}