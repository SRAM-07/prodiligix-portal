import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack } from 'react-icons/md';

const eventTypeOptions = [
  'Corporate Event',
  'Team Outing',
  'Offsite Retreat',
  'Celebration/Annual Day',
  'Product Launch/Awards Night',
  'Other',
];

const eventDurationOptions = ['Half Day', 'Full Day', 'Multiple Days'];

const servicesList = [
  'Event Concept & Theme Planning',
  'Venue Booking',
  'Travel & Transport Arrangements',
  'Accommodation (if multi-day)',
  'Food & Catering',
  'Stage Setup & AV Equipment',
  'Team Building Activities',
  'Anchors/Emcees/Entertainment',
  'Branding & Print Collaterals',
  'Photo & Videography',
  'Gifting & Giveaways',
  'On-ground Event Management',
];

export default function EventManagementForm() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [customEventType, setCustomEventType] = useState('');
  const [isOtherServiceSelected, setIsOtherServiceSelected] = useState(false);
  const [customServiceValue, setCustomServiceValue] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    contactPersonName: '',
    designation: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    companyAddress: '',
    eventType: '',
    eventDate: '',
    participants: '',
    location: '',
    venue: '',
    budget: '',
    eventDuration: '',
    servicesRequired: [],
    eventNotes: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleService = (service) => {
    setForm(prev => ({
      ...prev,
      servicesRequired: prev.servicesRequired.includes(service)
        ? prev.servicesRequired.filter(s => s !== service)
        : [...prev.servicesRequired, service]
    }));
  };

  const toggleAllServices = () => {
    if (form.servicesRequired.length === servicesList.length) {
      setForm(prev => ({ ...prev, servicesRequired: [] }));
    } else {
      setForm(prev => ({ ...prev, servicesRequired: [...servicesList] }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.businessName) newErrors.businessName = 'Required';
    if (!form.contactPersonName) newErrors.contactPersonName = 'Required';
    if (!form.designation) newErrors.designation = 'Required';
    if (!form.contactPersonEmail || !/^\S+@\S+\.\S+$/.test(form.contactPersonEmail)) newErrors.contactPersonEmail = 'Enter valid email';
    if (!form.contactPersonPhone || !/^[0-9]{10}$/.test(form.contactPersonPhone)) newErrors.contactPersonPhone = 'Enter valid 10-digit number';
    if (!form.companyAddress) newErrors.companyAddress = 'Required';
    if (!form.eventDate) newErrors.eventDate = 'Required';
    if (!form.participants || form.participants <= 0) newErrors.participants = 'Required';
    if (!form.location) newErrors.location = 'Required';
    if (!form.venue) newErrors.venue = 'Required';
    if (!form.budget || form.budget <= 0) newErrors.budget = 'Required';
    if (!form.eventDuration) newErrors.eventDuration = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => navigate('/events'), 2500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#dcfce7' }}>
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Event Request Submitted!</h2>
          <p className="text-sm text-gray-400 mb-1">Your event request has been submitted successfully.</p>
          <p className="text-sm text-gray-400">ProDiligix team will get back to you with a quotation.</p>
          <p className="text-xs text-gray-300 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/events')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600" />
          </button>
          <div>
            <p className="text-gray-400 text-xs">Event & Team Outing</p>
            <h1 className="text-base font-bold text-gray-800">New Event Request</h1>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">

          {/* Company Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Company Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Company Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.businessName}
                  onChange={e => handleChange('businessName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Company Address <span className="text-red-400">*</span></p>
                <input type="text" value={form.companyAddress}
                  onChange={e => handleChange('companyAddress', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.companyAddress && <p className="text-xs text-red-400 mt-1">{errors.companyAddress}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Person Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.contactPersonName}
                  onChange={e => handleChange('contactPersonName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.contactPersonName && <p className="text-xs text-red-400 mt-1">{errors.contactPersonName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Designation <span className="text-red-400">*</span></p>
                <input type="text" value={form.designation}
                  onChange={e => handleChange('designation', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.designation && <p className="text-xs text-red-400 mt-1">{errors.designation}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Email ID <span className="text-red-400">*</span></p>
                <input type="email" value={form.contactPersonEmail}
                  onChange={e => handleChange('contactPersonEmail', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.contactPersonEmail && <p className="text-xs text-red-400 mt-1">{errors.contactPersonEmail}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone Number <span className="text-red-400">*</span></p>
                <input type="tel" maxLength={10} value={form.contactPersonPhone}
                  onChange={e => handleChange('contactPersonPhone', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.contactPersonPhone && <p className="text-xs text-red-400 mt-1">{errors.contactPersonPhone}</p>}
              </div>
            </div>
          </div>

          {/* Event Type */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Event Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Select Event Type</p>
                <select value={form.eventType}
                  onChange={e => handleChange('eventType', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Type</option>
                  {eventTypeOptions.map((o, i) => <option key={i}>{o}</option>)}
                </select>
              </div>
              {form.eventType === 'Other' && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Please Specify</p>
                  <input type="text" value={customEventType}
                    onChange={e => setCustomEventType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Event Details</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Preferred Event Date <span className="text-red-400">*</span></p>
                <input type="date" value={form.eventDate}
                  onChange={e => handleChange('eventDate', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.eventDate && <p className="text-xs text-red-400 mt-1">{errors.eventDate}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Number of Heads <span className="text-red-400">*</span></p>
                <input type="number" min="1" value={form.participants}
                  onChange={e => handleChange('participants', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.participants && <p className="text-xs text-red-400 mt-1">{errors.participants}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Preferred Location/City <span className="text-red-400">*</span></p>
                <input type="text" value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Venue <span className="text-red-400">*</span></p>
                <input type="text" value={form.venue}
                  onChange={e => handleChange('venue', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.venue && <p className="text-xs text-red-400 mt-1">{errors.venue}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Budget Range (₹) <span className="text-red-400">*</span></p>
                <input type="number" min="1" value={form.budget}
                  onChange={e => handleChange('budget', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.budget && <p className="text-xs text-red-400 mt-1">{errors.budget}</p>}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Duration <span className="text-red-400">*</span></p>
              <div className="flex gap-6">
                {eventDurationOptions.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="duration" value={opt}
                      checked={form.eventDuration === opt}
                      onChange={() => handleChange('eventDuration', opt)}
                      style={{ accentColor: '#068BC9' }} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.eventDuration && <p className="text-xs text-red-400 mt-1">{errors.eventDuration}</p>}
            </div>
          </div>

          {/* Services Required */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Services Required</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {servicesList.map((service, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form.servicesRequired.includes(service)}
                    onChange={() => toggleService(service)}
                    style={{ accentColor: '#068BC9' }} />
                  <span className="text-xs text-gray-600">{service}</span>
                </label>
              ))}

              {/* Select All */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={form.servicesRequired.length === servicesList.length}
                  onChange={toggleAllServices}
                  style={{ accentColor: '#068BC9' }} />
                <span className="text-xs font-medium text-gray-700">All</span>
              </label>

              {/* Others */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={isOtherServiceSelected}
                  onChange={() => setIsOtherServiceSelected(!isOtherServiceSelected)}
                  style={{ accentColor: '#068BC9' }} />
                <span className="text-xs text-gray-600">Others</span>
              </label>
            </div>

            {isOtherServiceSelected && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Please specify other services</p>
                <textarea rows={2} value={customServiceValue}
                  onChange={e => setCustomServiceValue(e.target.value)}
                  maxLength={500}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Any Specific Theme/Ideas or Notes</h3>
            <textarea rows={4} value={form.eventNotes}
              onChange={e => handleChange('eventNotes', e.target.value)}
              maxLength={3000}
              placeholder="Enter any specific theme, ideas or notes..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={() => navigate('/events')}
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
  );
}