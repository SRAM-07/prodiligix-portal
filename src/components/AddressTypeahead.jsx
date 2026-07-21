import React, { useState, useEffect, useRef } from 'react';
import { MdSearch, MdLocationOn } from 'react-icons/md';
import api from '../services/api';

export default function AddressTypeahead({ companyId, type, value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!companyId) return;
      try {
        // Fetch ALL company addresses, not just ones matching this field's type —
        // needed because Reverse-mode shipments use a delivery address as the pickup point (and vice versa)
        const res = await api.get(`/api/addresses/company/${companyId}`);
        setAddresses(res.data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [companyId]);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (addr) => {
    const parts = [addr.facilityName, addr.address, addr.city, addr.state, addr.zipcode].filter(Boolean);
    return parts.join(', ');
  };

  const filtered = addresses.filter(addr => {
    const searchable = [
      addr.facilityName, addr.address, addr.city, addr.state,
      addr.zipcode, addr.contactPersonName
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(query.toLowerCase());
  }).slice(0, 8);

  const handleSelect = (addr) => {
    setQuery(formatAddress(addr));
    setShowDropdown(false);
    if (onSelect) onSelect(addr);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    if (onSelect) onSelect(null); // clear selection until a real option is picked
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || `Search ${type} address...`}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading addresses...</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              {query ? 'No matching addresses found' : 'No addresses available'}
            </p>
          ) : (
            filtered.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSelect(addr)}
                className="flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none">
                <MdLocationOn size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">{addr.facilityName || addr.contactPersonName}</p>
                  <p className="text-xs text-gray-400">{formatAddress(addr)}</p>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 capitalize flex-shrink-0">
                  {addr.type}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}