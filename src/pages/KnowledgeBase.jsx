import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import {
  MdArrowBack, MdInfo, MdCheckCircle, MdCancel,
  MdWarning, MdQrCodeScanner, MdLocalBar, MdArrowUpward,
  MdWaterDrop, MdLocalFireDepartment, MdScience, MdRestaurant,
  MdMilitaryTech, MdLocalGasStation, MdPrecisionManufacturing,
  MdCoronavirus, MdDiamond, MdAttachMoney, MdAcUnit
} from 'react-icons/md';

const tabs = [
  { key: 'basics', label: '1. Selection' },
  { key: 'outer', label: '2. Outer Pack' },
  { key: 'inner', label: '3. Protection' },
  { key: 'sealing', label: '4. Sealing' },
  { key: 'labeling', label: '5. Labeling' },
  { key: 'special', label: '6. Special' },
  { key: 'restricted', label: '7. Restricted' },
];

const basicsCards = [
  { title: 'Dimensions', desc: 'Minimize inventory cost' },
  { title: 'Weight', desc: 'Optimize box strength' },
  { title: 'Fragility', desc: 'Determine cushioning' },
  { title: 'Physical State', desc: 'Liquid/Solid protection' },
];

const packagingMaterials = [
  { name: 'Bubble Wrap', cushion: true, voidFill: true, surface: true, divider: false },
  { name: 'Foam Sheet', cushion: true, voidFill: true, surface: true, divider: false },
  { name: 'Air Bags', cushion: false, voidFill: true, surface: false, divider: false },
  { name: 'Shredded Paper', cushion: false, voidFill: true, surface: false, divider: false },
  { name: 'Crumbled Paper', cushion: false, voidFill: true, surface: false, divider: false },
  { name: 'Corrugated Inserts', cushion: false, voidFill: true, surface: false, divider: true },
];

const labelReqs = [
  { title: 'Barcode Height', caption: 'Min. size: 8 mm' },
  { title: 'Waybill & Order No.', caption: 'Min. size: 8 MIL (1 MIL = 0.2032mm)' },
  { title: 'Address Font', caption: 'Min. 8pts, Calibri body' },
  { title: 'Invoice', caption: 'Retail/Tax Invoice Details' },
];

const specialLabels = [
  { label: 'Fragile', icon: MdLocalBar, color: '#374151' },
  { label: 'This Side Up', icon: MdArrowUpward, color: '#374151' },
  { label: 'Keep Dry', icon: MdWaterDrop, color: '#068BC9' },
  { label: 'Flammable', icon: MdLocalFireDepartment, color: '#ef4444' },
  { label: 'Corrosive', icon: MdScience, color: '#374151' },
  { label: 'Perishables', icon: MdRestaurant, color: '#22c55e' },
  { label: 'Dangerous Goods', icon: MdWarning, color: '#f97316' },
];

const restrictedItems = [
  { title: 'Arms & Ammunition', desc: 'Firearms, explosives, and ammunition of any kind.', icon: MdMilitaryTech },
  { title: 'Chemicals & Poisons', desc: 'Insecticides, acids, fertilizers, poisons.', icon: MdScience },
  { title: 'Fuels', desc: 'Fuel for camp stoves, lanterns, torches, heating elements.', icon: MdLocalGasStation },
  { title: 'Certain Machinery', desc: 'Chainsaws, mining equipment, defense equipment.', icon: MdPrecisionManufacturing },
  { title: 'Toxins', desc: 'Sodium cyanide, mercury, botulinum, ricin.', icon: MdCoronavirus },
  { title: 'Jewelry (Restricted)', desc: 'Precious stones, ornaments, gems.', icon: MdDiamond },
  { title: 'Currency', desc: 'Cheques, demand drafts, currency notes, coins.', icon: MdAttachMoney },
  { title: 'Dry Ice', desc: 'Carbon dioxide in solid state.', icon: MdAcUnit },
];

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('basics');
  const navigate = useNavigate();

  return (
    <ClientLayout>
      {/* Header */}
      <div className="text-white px-6 py-8" style={{ background: 'linear-gradient(135deg, #068BC9 0%, #0a1e35 100%)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors">
            <MdArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-bold">Packaging Guidelines</h1>
        </div>
        <p className="text-sm opacity-80 pl-11">
          Official standard operating procedures for packing, sealing, and labeling shipments.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 pb-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 sticky top-0 bg-white z-10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === tab.key ? '#068BC9' : 'transparent',
                  color: activeTab === tab.key ? '#068BC9' : (tab.key === 'restricted' ? '#ef4444' : '#6b7280')
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[500px]">

            {/* 1. Selection */}
            {activeTab === 'basics' && (
              <div>
                <h2 className="text-lg font-bold mb-2" style={{ color: '#068BC9' }}>Packaging Essentials</h2>
                <p className="text-sm text-gray-600 mb-5">
                  Before packing, assess your product based on these four pillars to determine the right materials.
                </p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {basicsCards.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white"
                        style={{ backgroundColor: '#068BC9' }}>
                        <MdCheckCircle size={20} />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                  <MdInfo size={20} style={{ color: '#068BC9' }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <strong>Box Strength Requirement:</strong> Ensure corrugated boxes meet required <strong>Edge Crush Test (ECT)</strong> and <strong>Burst Factor</strong> standards.
                  </p>
                </div>

                <h3 className="text-sm font-bold text-gray-700 mb-3">Box Selection Guide</h3>
                <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <div className="flex flex-col gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">Under 4 Kg (Non-Fragile)</p>
                      <p className="text-xs text-gray-400">Use 3-Ply Corrugated Box</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">Over 4 Kg OR Fragile</p>
                      <p className="text-xs text-gray-400">Use 5-Ply Corrugated Box</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-sm font-semibold text-orange-700">High Value (&gt; ₹7000)</p>
                      <p className="text-xs text-orange-600">Mandatory: Tamper Evident Boxes</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Quick Check:</p>
                    <ul className="text-xs text-gray-600 list-disc pl-4 flex flex-col gap-1">
                      <li>Ensure material withstands edge-crush &amp; burst loads.</li>
                      <li>Inspect for holes, tears, or crushed edges.</li>
                      <li>Box should not be too small or too big.</li>
                      <li>Avoid poor quality boxes.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Outer Pack */}
            {activeTab === 'outer' && (
              <div>
                <h2 className="text-lg font-bold mb-5" style={{ color: '#068BC9' }}>Outer Packaging Types</h2>

                <h3 className="text-base font-semibold text-gray-700 mb-3">Flyers &amp; Polybags</h3>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Best for flexible items (apparels) or external protection against fluids/tampering.
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="flex-shrink-0 mt-0.5" />
                        Choose <strong>60-80 microns</strong> hotmelt glue adhesive LDPE.
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="flex-shrink-0 mt-0.5" />
                        Use <strong>Tamper Evident</strong> bags for High Value (&gt; ₹7000).
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 rounded-lg p-2">
                        <MdCheckCircle size={16} style={{ color: '#16a34a' }} className="flex-shrink-0 mt-0.5" />
                        <strong>Mandatory:</strong> Ensure the polybag opening is completely sealed.
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MdWarning size={16} style={{ color: '#f97316' }} className="flex-shrink-0 mt-0.5" />
                        <strong>Important:</strong> The pocket containing the label should be taped.
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <img src={process.env.PUBLIC_URL + "/knowledge-base/Flyers_Polybags.jpeg"} alt="Flyers and Polybags" className="w-full h-48 object-contain bg-white" />
                    <p className="text-xs text-center text-gray-400 py-2">Standard Polybag / Flyer Sizes</p>
                  </div>
                </div>

                <hr className="border-gray-100 mb-6" />

                <h3 className="text-base font-semibold text-gray-700 mb-4">Box Quality Standards</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: '#22c55e' }}>
                    <img src={process.env.PUBLIC_URL + "/knowledge-base/Correct_Way.png"} alt="Correct packing" className="w-full h-40 object-contain bg-white" />
                    <div className="text-center text-white text-sm font-semibold py-1.5" style={{ backgroundColor: '#16a34a' }}>
                      ✓ Correct Way
                    </div>
                    <div className="p-3">
                      <ul className="text-xs text-gray-600 list-disc pl-4">
                        <li>Sturdy, undamaged box.</li>
                        <li>Size optimized to product dimensions.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: '#ef4444' }}>
                    <img src={process.env.PUBLIC_URL + "/knowledge-base/Incorrect_Way.png"} alt="Incorrect packing" className="w-full h-40 object-contain bg-white" />
                    <div className="text-center text-white text-sm font-semibold py-1.5 bg-red-600">
                      ✕ Incorrect Way
                    </div>
                    <div className="p-3">
                      <ul className="text-xs text-gray-600 list-disc pl-4">
                        <li>Crushed, torn, or weak boxes.</li>
                        <li>Box too large (requires excessive filler).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Protection */}
            {activeTab === 'inner' && (
              <div>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#068BC9' }}>Inner Packaging &amp; Protection</h2>

                <div className="bg-blue-50 text-blue-900 rounded-lg p-4 mb-6">
                  <p className="font-semibold text-sm mb-2">Mandatory Packing Order:</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>1️⃣ Leak proof liquid items</span>
                    <span>2️⃣ Apply cushioning material</span>
                    <span>3️⃣ Place item inside box</span>
                    <span>4️⃣ Fill all voids completely</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold mb-4" style={{ color: '#1e40af' }}>1. Leak Proofing (Liquid Items)</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { img: 'Heat_Shrink_Sleeve.jpeg', title: 'Heat Shrink Sleeve', desc: 'Secure bottle necks.' },
                    { img: 'Taping_Caps.jpeg', title: 'Taping Caps', desc: 'Tape firmly over the cap.' },
                    { img: 'Zip_Lock.jpeg', title: 'Zip Lock Pouches', desc: 'Final barrier against leaks.' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
                      <img src={process.env.PUBLIC_URL + `/knowledge-base/${item.img}`} alt={item.title} className="w-full h-32 object-cover bg-gray-100" />
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-700">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-base font-semibold mb-3" style={{ color: '#1e40af' }}>2. Cushioning Materials</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-100 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Material</th>
                        <th className="px-3 py-2 font-medium text-gray-600">Cushioning</th>
                        <th className="px-3 py-2 font-medium text-gray-600">Void Fill</th>
                        <th className="px-3 py-2 font-medium text-gray-600">Surface Protection</th>
                        <th className="px-3 py-2 font-medium text-gray-600">Divider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagingMaterials.map((mat, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-700">{mat.name}</td>
                          <td className="text-center px-3 py-2">{mat.cushion && <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="mx-auto" />}</td>
                          <td className="text-center px-3 py-2">{mat.voidFill && <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="mx-auto" />}</td>
                          <td className="text-center px-3 py-2">{mat.surface && <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="mx-auto" />}</td>
                          <td className="text-center px-3 py-2">{mat.divider && <MdCheckCircle size={16} style={{ color: '#22c55e' }} className="mx-auto" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Sealing */}
            {activeTab === 'sealing' && (
              <div>
                <h2 className="text-lg font-bold mb-5" style={{ color: '#068BC9' }}>Sealing the Shipment</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Light Weight Shipments</p>
                    <div className="rounded-lg border border-gray-100 overflow-hidden text-center">
                      <img src={process.env.PUBLIC_URL + "/knowledge-base/Center_Seam_Taping.png"} alt="Center Seam Taping" className="w-full h-40 object-contain bg-gray-50" />
                      <div className="bg-gray-50 p-3">
                        <p className="text-sm font-semibold text-gray-700">Center Seam Taping</p>
                        <p className="text-xs text-gray-400">Seal the center seam of top and bottom.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Heavy Weight Shipments</p>
                    <div className="rounded-lg border border-gray-100 overflow-hidden text-center">
                      <img src={process.env.PUBLIC_URL + "/knowledge-base/H-Taping.png"} alt="H-Taping" className="w-full h-40 object-contain bg-gray-50" />
                      <div className="bg-gray-50 p-3">
                        <p className="text-sm font-semibold text-gray-700">H-Taping Method</p>
                        <p className="text-xs text-gray-400">Seal center AND edge seams (H-shape).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Labeling */}
            {activeTab === 'labeling' && (
              <div>
                <h2 className="text-lg font-bold mb-5" style={{ color: '#068BC9' }}>Labeling Standards</h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-900 rounded-lg p-3 mb-4 text-sm">
                      <MdQrCodeScanner size={18} />
                      <span><strong>Barcode Readability:</strong> Clear, flat, and scannable barcodes are essential.</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Essential Data Requirements</p>
                    <div className="flex flex-col gap-2">
                      {labelReqs.map((req, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700">{req.title}</p>
                          <p className="text-xs text-gray-400">{req.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <img src={process.env.PUBLIC_URL + "/knowledge-base/Standard_Label_Layout.png"} alt="Standard Label Layout" className="w-full h-64 object-contain bg-gray-50" />
                    <p className="text-xs text-center text-gray-400 py-2">Standard Label Layout</p>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-red-500 mb-4">Common Labeling Mistakes</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { img: 'Do_not_paste_at_edges.jpeg', label: 'Do not paste at edges' },
                    { img: 'Do_not_paste_over_seams.png', label: 'Do not paste over seams' },
                    { img: 'dont_use_torn_label.png', label: 'Do not use torn barcode/label' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg border-2 border-red-200 overflow-hidden">
                      <img src={process.env.PUBLIC_URL + `/knowledge-base/${item.img}`} alt={item.label} className="w-full h-32 object-cover" />
                      <p className="text-center text-xs font-semibold text-red-500 py-2">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Special */}
            {activeTab === 'special' && (
              <div>
                <h2 className="text-lg font-bold mb-5" style={{ color: '#068BC9' }}>Special Handling Labels</h2>
                <div className="grid grid-cols-4 gap-4">
                  {specialLabels.map((item, i) => {
                    const IconComp = item.icon;
                    return (
                      <div key={i} className="bg-gray-50 rounded-lg p-5 text-center border border-gray-100">
                        <IconComp size={32} className="mx-auto mb-2" style={{ color: item.color }} />
                        <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. Restricted */}
            {activeTab === 'restricted' && (
              <div>
                <div className="flex items-center gap-2 text-red-500 mb-5">
                  <MdWarning size={22} />
                  <h2 className="text-lg font-bold">Restricted &amp; Prohibited Items</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {restrictedItems.map((item, i) => {
                    const IconComp = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <IconComp size={18} style={{ color: '#ef4444' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
