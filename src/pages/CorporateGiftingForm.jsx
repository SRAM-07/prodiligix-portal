import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdArrowBack, MdAdd, MdClose } from 'react-icons/md';

const purposeOptions = [
  'Employee Onboarding/Welcome Kit',
  'Festival/Occasional Gifting',
  'Client Appreciation',
  'Corporate Events/Milestones',
  'Custom Request',
];

const quantityOptions = ['50', '50-100', '100-200', '250-500', '500+', 'Others'];

const deliveryTypeOptions = [
  'Bulk Delivery to One Location',
  'Individual Deliveries (PAN-India)',
  'International Deliveries (If applicable)',
];

const productOptions = [
  'Custom Apparel (T-shirts, Hoodies)',
  'Drinkware (Mugs, Bottles)',
  'Desk Essentials (Calendars, Plants)',
  'Gourmet Treats (Chocolates, Dry Fruits)',
  'Tech Accessories (USB, Power Banks)',
  'Personalized Items (Name tags, Notes)',
  'Other Suggestions',
];

const brandOptionsMap = {
  'Custom Apparel (T-shirts, Hoodies)': ['Puma', 'Adidas', 'Nike', 'Allen Solly', 'Others'],
  'Drinkware (Mugs, Bottles)': ['Milton', 'Cello', 'Borosil', 'Yeti', 'Others'],
  'Desk Essentials (Calendars, Plants)': ['Faber-Castell', 'Bamboo', 'Others'],
  'Gourmet Treats (Chocolates, Dry Fruits)': ['Ferrero Rocher', 'Lindt', 'Haldirams', 'Others'],
  'Tech Accessories (USB, Power Banks)': ['Boat', 'Portronics', 'Ambrane', 'Sony', 'Others'],
  'Personalized Items (Name tags, Notes)': ['Parker', 'Cross', 'Others'],
};

const brandingOptions = [
  'Logo Printed',
  'Custom Sleeves',
  'Personalized Notes',
  'Eco-friendly Packaging',
  'Gift Wraps & Tags',
];

const logoPrintedOptions = ['Embroidery', 'Screen printing', 'DTF', 'UV'];

const additionalServiceOptions = [
  'Warehousing',
  'Custom Kit Building',
  'Budget Planning Support',
  'Others',
];

function MultiSelect({ label, options, selected, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: '#068BC9' }}>
              {s}
              <button onClick={() => onChange(selected.filter(x => x !== s))}>
                <MdClose size={12} />
              </button>
            </span>
          ))}
        </div>
        <select
          className="w-full bg-transparent text-sm text-gray-600 outline-none"
          onChange={e => {
            const val = e.target.value;
            if (val && !selected.includes(val)) onChange([...selected, val]);
            e.target.value = '';
          }}>
          <option value="">Select...</option>
          {options.filter(o => !selected.includes(o)).map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function CorporateGiftingForm() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    companyName: '',
    contactPersonName: '',
    designation: '',
    primaryPhone: '',
    email: '',
    companyWebsite: '',
    purposeOfGifting: '',
    estimatedQuantity: '',
    others: '',
    requiredDeliveryDate: '',
    deliveryType: '',
    preferredItems: [],
    otherSuggestions: '',
    itemBrands: {},
    otherItemBrands: {},
    brandingRequirements: [],
    logoPrintedOptions: [],
    additionalServices: [],
    otherAdditionalServices: '',
    specificNotes: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName) newErrors.companyName = 'Required';
    if (!form.contactPersonName) newErrors.contactPersonName = 'Required';
    if (!form.primaryPhone || !/^\d{10}$/.test(form.primaryPhone)) newErrors.primaryPhone = 'Enter valid 10-digit number';
    if (!form.requiredDeliveryDate) newErrors.requiredDeliveryDate = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => navigate('/gifting'), 2500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#dcfce7' }}>
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-sm text-gray-400 mb-1">Your corporate gifting request has been submitted.</p>
          <p className="text-sm text-gray-400">ProDiligix team will get back to you with a quotation.</p>
          <p className="text-xs text-gray-300 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/gifting')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600" />
          </button>
          <div>
            <p className="text-gray-400 text-xs">Corporate Gifting</p>
            <h1 className="text-base font-bold text-gray-800">New Request</h1>
          </div>
        </div>

        <div
          className="relative min-h-screen overflow-hidden"
          style={{ backgroundColor: '#F7FBFF' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/corporate-gifting-bg.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left bottom',
              backgroundSize: 'contain',
              opacity: 0.22,
              pointerEvents: 'none'
            }}
          />
          <div className="relative z-10 p-6 max-w-4xl mx-auto">

          {/* Company Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Company Information</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Company Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.companyName && <p className="text-xs text-red-400 mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Person Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.contactPersonName}
                  onChange={e => handleChange('contactPersonName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.contactPersonName && <p className="text-xs text-red-400 mt-1">{errors.contactPersonName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Designation</p>
                <input type="text" value={form.designation}
                  onChange={e => handleChange('designation', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Number <span className="text-red-400">*</span></p>
                <input type="tel" maxLength={10} value={form.primaryPhone}
                  onChange={e => handleChange('primaryPhone', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.primaryPhone && <p className="text-xs text-red-400 mt-1">{errors.primaryPhone}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <input type="email" value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Company Website</p>
                <input type="text" value={form.companyWebsite}
                  onChange={e => handleChange('companyWebsite', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
            </div>
          </div>

          {/* Gifting Requirement */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Gifting Requirement</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Purpose of Gifting</p>
                <select value={form.purposeOfGifting}
                  onChange={e => handleChange('purposeOfGifting', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Purpose</option>
                  {purposeOptions.map((o, i) => <option key={i}>{o}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Estimated Quantity</p>
                <select value={form.estimatedQuantity}
                  onChange={e => handleChange('estimatedQuantity', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Quantity</option>
                  {quantityOptions.map((o, i) => <option key={i}>{o}</option>)}
                </select>
              </div>
              {form.estimatedQuantity === 'Others' && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Specify Quantity</p>
                  <input type="text" value={form.others}
                    onChange={e => handleChange('others', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Required Delivery Date <span className="text-red-400">*</span></p>
                <input type="date" value={form.requiredDeliveryDate}
                  onChange={e => handleChange('requiredDeliveryDate', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.requiredDeliveryDate && <p className="text-xs text-red-400 mt-1">{errors.requiredDeliveryDate}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Delivery Type</p>
                <select value={form.deliveryType}
                  onChange={e => handleChange('deliveryType', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Type</option>
                  {deliveryTypeOptions.map((o, i) => <option key={i}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Preferred Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Preferred Items</h3>
            <div className="mb-4">
              <MultiSelect
                label="Preferred Items to Include"
                options={productOptions}
                selected={form.preferredItems}
                onChange={val => handleChange('preferredItems', val)}
              />
            </div>

            {form.preferredItems.includes('Other Suggestions') && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Other Suggestions</p>
                <textarea rows={3} value={form.otherSuggestions}
                  onChange={e => handleChange('otherSuggestions', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
              </div>
            )}

            {/* Dynamic brand selectors per item */}
            <div className="grid grid-cols-2 gap-4">
              {form.preferredItems.filter(item => item !== 'Other Suggestions').map((item, i) => (
                <div key={i}>
                  <MultiSelect
                    label={`Brands for ${item.split(' ')[0]}`}
                    options={brandOptionsMap[item] || ['Generic/Unbranded', 'Others']}
                    selected={form.itemBrands[item] || []}
                    onChange={val => handleChange('itemBrands', { ...form.itemBrands, [item]: val })}
                  />
                  {(form.itemBrands[item] || []).includes('Others') && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Other Brands for {item.split(' ')[0]}</p>
                      <input type="text"
                        value={form.otherItemBrands[item] || ''}
                        onChange={e => handleChange('otherItemBrands', { ...form.otherItemBrands, [item]: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Branding Requirements */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Branding Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <MultiSelect
                label="Branding Requirements"
                options={brandingOptions}
                selected={form.brandingRequirements}
                onChange={val => handleChange('brandingRequirements', val)}
              />
              {form.brandingRequirements.includes('Logo Printed') && (
                <MultiSelect
                  label="Select Printing Type"
                  options={logoPrintedOptions}
                  selected={form.logoPrintedOptions}
                  onChange={val => handleChange('logoPrintedOptions', val)}
                />
              )}
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Additional Services</h3>
            <div className="grid grid-cols-2 gap-4">
              <MultiSelect
                label="Select Additional Services"
                options={additionalServiceOptions}
                selected={form.additionalServices}
                onChange={val => handleChange('additionalServices', val)}
              />
              {form.additionalServices.includes('Others') && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Other Additional Services</p>
                  <textarea rows={3} value={form.otherAdditionalServices}
                    onChange={e => handleChange('otherAdditionalServices', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Notes / Requests</h3>
            <textarea rows={4} value={form.specificNotes}
              onChange={e => handleChange('specificNotes', e.target.value)}
              placeholder="Any specific notes or requests..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={() => navigate('/gifting')}
              className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="px-8 py-2.5 rounded-lg text-sm text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#068BC9' }}>
              Submit Request
            </button>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}