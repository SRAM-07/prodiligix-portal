import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdDownload, MdAdd } from 'react-icons/md';

const stampData = [
  {
    id: "STMP-20260703001",
    firstParty: "Roppen Transportation Services Private Limited",
    secondParty: "SWAI Technologies Private Limited",
    denomination: 500,
    quantity: 1,
    totalCharges: 559,
    status: "in transit",
    requestDate: "2026-07-03",
    deliveryDate: "",
    scannedCopy: null,
  },
  {
    id: "STMP-20260702001",
    firstParty: "Hivenix Inc.",
    secondParty: "CTRLX TECHNOLOGIES PRIVATE LIMITED",
    denomination: 500,
    quantity: 1,
    totalCharges: 559,
    status: "in transit",
    requestDate: "2026-07-02",
    deliveryDate: "",
    scannedCopy: null,
  },
  {
    id: "STMP-20260701007",
    firstParty: "ROPPEN TRANSPORTATION SERVICES PRIVATE LIMITED",
    secondParty: "ADVOXE DESIGN PRIVATE LIMITED",
    denomination: 500,
    quantity: 1,
    totalCharges: 559,
    status: "in transit",
    requestDate: "2026-07-01",
    deliveryDate: "",
    scannedCopy: "#",
  },
  {
    id: "STMP-20260701006",
    firstParty: "PhonePe Limited",
    secondParty: "Nutana Transportation Services Private Limited",
    denomination: 500,
    quantity: 2,
    totalCharges: 1118,
    status: "delivered",
    requestDate: "2026-07-01",
    deliveryDate: "2026-07-01",
  },
  {
    id: "STMP-20260701005",
    firstParty: "RZPX PRIVATE LIMITED",
    secondParty: "Roppen Transportation Services Private Limited",
    denomination: 500,
    quantity: 2,
    totalCharges: 1118,
    status: "delivered",
    requestDate: "2026-07-01",
    deliveryDate: "2026-07-01",
  },
  {
    id: "STMP-20260701004",
    firstParty: "Coca-Cola India Pvt. Ltd.",
    secondParty: "Sunrise Vendors Private Limited",
    denomination: 100,
    quantity: 5,
    totalCharges: 650,
    status: "pending",
    requestDate: "2026-07-01",
    deliveryDate: "",
  },
];

const statusConfig = {
  "in transit": { color: "#068BC9", bg: "#e0f2fe", label: "In Transit" },
  delivered: { color: "#22c55e", bg: "#dcfce7", label: "Delivered" },
  pending: { color: "#f97316", bg: "#ffedd5", label: "Pending" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", label: "Cancelled" },
};

const filterOptions = [
  "Latest",
  "Since Date",
  "Date Range",
  "Status",
  "Company",
  "Reset / Show All",
];

export default function StampPaper() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Latest");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filtered = stampData.filter(
    (o) =>
      o.id.toLowerCase().includes(searchText.toLowerCase()) ||
      o.firstParty.toLowerCase().includes(searchText.toLowerCase()) ||
      o.secondParty.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? "240px" : "64px" }}
      >
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">
              Stamp Paper Procurement Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or Party Name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-56 text-gray-600"
              />
              {searchText && (
                <MdClose
                  size={14}
                  className="text-gray-400 cursor-pointer"
                  onClick={() => setSearchText("")}
                />
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {stampData.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Delivered</p>
              <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>
                {stampData.filter((s) => s.status === "delivered").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">In Transit</p>
              <p className="text-2xl font-bold" style={{ color: "#068BC9" }}>
                {stampData.filter((s) => s.status === "in transit").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold" style={{ color: "#f97316" }}>
                {stampData.filter((s) => s.status === "pending").length}
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: "#068BC9" }}
              >
                <MdFilterList size={18} />
                Add Filter
                <span className="ml-1">{showFilter ? "▲" : "▼"}</span>
              </button>
              {showFilter && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-52">
                  <p className="text-xs text-gray-400 px-4 py-1 font-medium uppercase tracking-wider">
                    Select Filter Type
                  </p>
                  {filterOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveFilter(opt);
                        setShowFilter(false);
                      }}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm"
                      style={{
                        color:
                          opt === "Reset / Show All" ? "#ef4444" : "#374151",
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "#068BC9" }}
              >
                {activeFilter}: {filtered.length}
              </span>
              <MdClose
                size={14}
                className="text-gray-400 cursor-pointer"
                onClick={() => setActiveFilter("Latest")}
              />
            </div>

            <span className="text-sm text-gray-500">({filtered.length})</span>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
  <MdRefresh size={18} className="text-gray-400"/>
</button>

<button
  onClick={() => navigate('/stamp-paper/new')}
  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
  style={{ backgroundColor: '#22c55e' }}>
  <MdAdd size={18}/>
  Book A Stamp Paper
</button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="First Party Name or SR ID"
                  className="bg-transparent text-xs outline-none w-52 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Service Request ID
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    1st Party Name
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    2nd Party Name
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Denomination
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Quantity
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Total Charges
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Request Date
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Delivery Date
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const s =
                    statusConfig[order.status] || statusConfig["pending"];
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: "#068BC9" }}
                        onClick={() => navigate("/stamp-paper/detail")}
                      >
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                        {order.firstParty}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                        {order.secondParty}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        ₹{order.denomination}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        ₹{order.totalCharges}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {order.requestDate}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {order.deliveryDate || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("/stamp-paper/detail")}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{
                              color: "#068BC9",
                              backgroundColor: "#e0f2fe",
                            }}
                          >
                            <MdVisibility size={14} />
                            View
                          </button>
                          {order.scannedCopy ? (
                            <button
                              onClick={() =>
                                window.open(order.scannedCopy, "_blank")
                              }
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              style={{
                                color: "#22c55e",
                                backgroundColor: "#dcfce7",
                              }}
                            >
                              <MdDownload size={14} />
                              Stamp Paper
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No Doc
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
