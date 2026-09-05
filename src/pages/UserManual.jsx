import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { getCurrentUser } from '../services/authService';
import ClientLayout from '../components/ClientLayout';

const BRAND = '#068BC9';

const Step = ({ num, text }) => (
  <div className="flex gap-4 items-start mb-3">
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>{num}</div>
    <p className="text-sm text-gray-600 pt-1">{text}</p>
  </div>
);

const Bullet = ({ text }) => (
  <div className="flex gap-3 items-start mb-2">
    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: BRAND }}></div>
    <p className="text-sm text-gray-600">{text}</p>
  </div>
);

const Note = ({ text, type = 'yellow' }) => {
  const colors = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-800' },
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800' },
  };
  const c = colors[type];
  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4 mt-3`}>
      <p className={`text-xs ${c.text}`}>{text}</p>
    </div>
  );
};

const StatusBadge = ({ status, color }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white mr-2" style={{ backgroundColor: color }}>{status}</span>
);

export default function UserManual() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isLucky = user?.companyId === 3;
  const companyName = isLucky ? 'Lucky Computers' : 'Roppen Transportation Services Pvt. Ltd.';
  const loginEmail = isLucky ? 'Vishnujaunbar@gmail.com' : 'rapidofrontdesk@rapido.bike';
  const minBalance = isLucky ? '₹2,000' : '₹10,000';

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'documents', label: 'Documents' },
    { id: 'rate-calculator', label: 'Rate Calculator' },
    { id: 'wallet', label: 'Wallet & Billing' },
    { id: 'support', label: 'Support' },
  ];

  const [activeSection, setActiveSection] = useState('getting-started');

  const renderSection = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Getting Started</h2>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-1">Portal URL</p>
              <p className="text-sm text-blue-700">https://one.prodiligix.com</p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Login</h3>
              <Step num="1" text="Open your browser and go to https://one.prodiligix.com" />
              <Step num="2" text={`Enter your Email: ${loginEmail}`} />
              <Step num="3" text="Enter your Password (provided by ProDiligix CRM)" />
              <Step num="4" text='Click Login' />
              <Note text="📌 If you forget your password, click 'Forgot Password?' on the login page or contact your ProDiligix CRM team." />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Dashboard Overview</h3>
              <p className="text-sm text-gray-600 mb-3">After logging in, you will see the main dashboard showing:</p>
              <Bullet text="Total service request counts for each service" />
              <Bullet text="Status breakdown — Booked, In Transit, Delivered, Cancelled" />
              <Bullet text="Weekly activity chart (last 7 days)" />
              <Bullet text="Wallet balance details" />
              <Bullet text="Quick access to Rate Calculator, Knowledge Base, Wallet Ledger" />
            </div>
          </div>
        );
      case 'logistics':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Logistics Management</h2>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Booking a New Shipment</h3>
              <Step num="1" text="Click Book Shipment from the Logistics Dashboard." />
              <Step num="2" text="Select Pickup Address — search your saved addresses or click + Add." />
              <Step num="3" text="Select Delivery Address — similarly search or add a new one." />
              <Step num="4" text="Select Transport Mode: Air, Surface, Air Urgent, or Surface Urgent." />
              <Step num="5" text="Select Transporter: Delhivery or Bluedart." />
              <Step num="6" text="Select Mode Type: Forward (sending), Reverse (return), or Point to Point." />
              <Step num="7" text="Fill in Shipment Details: Declared Value, Challan No., Type, Category, Description." />
              <Step num="8" text="Upload Invoice / DC Copy if available." />
              <Step num="9" text="Enter Actual Weight (in Kg) and Number of Boxes." />
              <Step num="10" text="Add Box Dimensions (L × W × H in cm)." />
              <Step num="11" text="Select Insurance (Yes/No) and Packaging (Yes/No)." />
              <Step num="12" text="The Final Rate will be shown. Click Book Shipment to confirm." />
              <Note text={`📌 Minimum wallet balance of ${minBalance} is required to book a shipment.`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">After Booking</h3>
              <p className="text-sm text-gray-600 mb-2">Once booked, the CRM team will:</p>
              <Bullet text="Review and approve the shipment" />
              <Bullet text="Book the carrier and assign AWB number" />
              <Bullet text="Send the shipping label to your email" />
            </div>
          </div>
        );
      case 'tracking':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Tracking Your Shipments</h2>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">How to Track</h3>
              <Step num="1" text="Go to Logistics Management in the sidebar." />
              <Step num="2" text="Click on any shipment to open the detail page." />
              <Step num="3" text="Click the Tracking tab to see the full scan history." />
              <Step num="4" text='Click "Sync Tracking" to get the latest status from the carrier.' />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Delivery Statuses</h3>
              <div className="space-y-2">
                {[
                  { status: 'Booked', desc: 'Shipment created, awaiting carrier booking', color: '#068BC9' },
                  { status: 'Picked', desc: 'Carrier has collected the shipment', color: '#8b5cf6' },
                  { status: 'In Transit', desc: 'Shipment is on its way to destination', color: '#f97316' },
                  { status: 'Delivered', desc: 'Shipment delivered to recipient', color: '#22c55e' },
                  { status: 'Exception', desc: 'Issue with delivery — check tracking for details', color: '#ef4444' },
                  { status: 'Cancelled', desc: 'Shipment cancelled', color: '#6b7280' },
                  { status: 'RTO', desc: 'Return to origin initiated', color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <StatusBadge status={item.status} color={item.color} />
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Documents</h2>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Shipping Label</h3>
              <Bullet text={`Emailed to ${loginEmail} after carrier booking`} />
              <Bullet text="Download from the shipment detail page → Documents tab" />
              <Note text="Print and attach the label to your package before handover to the carrier." type="blue" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Invoice</h3>
              <Bullet text="Go to FINANCE → Invoices in the sidebar" />
              <Bullet text="Find your shipment and click Download" />
              <Bullet text="Or download from shipment detail → Documents tab" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Manifest</h3>
              <Bullet text="Available in the Documents tab after carrier booking for Bluedart shipments" />
            </div>
          </div>
        );
      case 'rate-calculator':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Rate Calculator</h2>
            <p className="text-sm text-gray-600">Get instant shipping quotes before booking a shipment.</p>
            <Step num="1" text="Click Rate Calculator in the sidebar or from the dashboard." />
            <Step num="2" text={`Your company (${companyName}) is pre-selected.`} />
            <Step num="3" text="Enter Pickup Pincode and Delivery Pincode." />
            <Step num="4" text="Select Transport Mode and Transporter." />
            <Step num="5" text="Enter Actual Weight, Declared Value, and box dimensions." />
            <Step num="6" text="Select Insurance and Packaging preference." />
            <Step num="7" text="Click Calculate Rates to see the full price breakdown." />
            <Note text="📌 Rate calculation is available for Air/Surface with Delhivery or Bluedart. For PTL/FTL modes, contact your CRM for a quote." />
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Wallet & Billing</h2>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Checking Your Balance</h3>
              <Bullet text="Main dashboard — Wallet Details section" />
              <Bullet text="Logistics Dashboard — Logistics Wallet section" />
              <Bullet text="FINANCE → Wallet Ledger in the sidebar" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Wallet Ledger</h3>
              <p className="text-sm text-gray-600 mb-2">The Wallet Ledger shows complete transaction history:</p>
              <Bullet text="Date and Service Request ID for each transaction" />
              <Bullet text="Amount debited or credited" />
              <Bullet text="Running balance after each transaction" />
              <Bullet text="Month-wise filtering (This Month, Last Month, 2 Months Ago)" />
              <Bullet text="Recharges tab showing wallet top-up history" />
              <Bullet text="Download as CSV for accounting records" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">How Billing Works</h3>
              <Bullet text="Wallet is topped up by ProDiligix CRM upon receiving payment" />
              <Bullet text="Each shipment deducts the shipping cost when the carrier is booked" />
              <Bullet text={`Minimum wallet balance of ${minBalance} is required to book shipments`} />
            </div>
            <Note text={`⚠️ When your balance is low, contact ProDiligix CRM to arrange a top-up before it falls below ${minBalance}.`} type="red" />
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Support & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">ProDiligix CRM</p>
                <p className="text-sm text-gray-600 mb-1">📞 8904502229</p>
                <p className="text-sm text-gray-600 mb-1">📞 8904054747</p>
                <p className="text-sm text-gray-500 text-xs mt-2">For wallet top-ups, rate queries, booking issues</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Carrier Support</p>
                <p className="text-sm text-gray-600 mb-1">Delhivery: support.delhivery.com</p>
                <p className="text-sm text-gray-600">Bluedart: bluedart.com/customerservice</p>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Tips</h3>
              <Bullet text={`Always keep a minimum wallet balance of ${minBalance} to avoid booking interruptions.`} />
              <Bullet text="Download and print the shipping label immediately after the carrier is booked." />
              <Bullet text="Use the Rate Calculator before booking to estimate costs." />
              <Bullet text="Sync tracking regularly to get the latest delivery status." />
              <Bullet text="Download your Wallet Ledger CSV monthly for accounting records." />
            </div>
          </div>
        );
      default: return null;
    }
  };

  const content = (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <MdArrowBack size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Manual</h1>
          <p className="text-xs text-gray-400">{companyName} — ProDiligix Operations Portal Guide</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sticky top-6">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                style={{
                  backgroundColor: activeSection === s.id ? '#e0f2fe' : 'transparent',
                  color: activeSection === s.id ? BRAND : '#6b7280',
                  fontWeight: activeSection === s.id ? 600 : 400
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );

  return <ClientLayout>{content}</ClientLayout>;
}
