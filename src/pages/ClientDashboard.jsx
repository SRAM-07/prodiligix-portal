import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  MdLocalShipping,
  MdDescription,
  MdCardGiftcard,
  MdEvent,
  MdComputer,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { day: "29 Jun", orders: 9 },
  { day: "30 Jun", orders: 4 },
  { day: "01 Jul", orders: 3 },
  { day: "02 Jul", orders: 13 },
  { day: "03 Jul", orders: 21 },
  { day: "04 Jul", orders: 12 },
  { day: "05 Jul", orders: 0 },
];

const services = [
  {
    icon: <MdLocalShipping size={16} />,
    title: "Logistic Management Services",
    color: "#068BC9",
    bg: "#e0f2fe",
    path: "/client/logistics",
  },
  {
    icon: <MdDescription size={16} />,
    title: "Stamp Paper Procurement",
    color: "#8b5cf6",
    bg: "#ede9fe",
    path: "/stamp-paper",
  },
  {
    icon: <MdCardGiftcard size={16} />,
    title: "Corporate Gifting",
    color: "#22c55e",
    bg: "#dcfce7",
    path: "/gifting",
  },
  {
    icon: <MdEvent size={16} />,
    title: "Event & Team Outing",
    color: "#f97316",
    bg: "#ffedd5",
    path: "/events",
  },
  {
    icon: <MdComputer size={16} />,
    title: "IT Solutions",
    color: "#06b6d4",
    bg: "#e0f9ff",
    path: "/it-solutions",
  },
];

const actionStats = [
  { label: "Shipment Booked", value: 1, color: "#068BC9" },
  { label: "Shipment Picked Up", value: 0, color: "#068BC9" },
  { label: "Exceptions", value: 0, color: "#068BC9" },
  { label: "In Transit", value: 43, color: "#068BC9" },
  { label: "Delivered", value: 2, color: "#22c55e" },
  { label: "Cancelled", value: 1, color: "#ef4444" },
];

const walletDetails = [
  { label: "Wallet Amount", value: "3,08,205.97" },
  { label: "Amount Used", value: "40,599.12" },
  { label: "Balance Amount", value: "15,000.00" },
];

export default function ClientDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [walletPeriod, setWalletPeriod] = useState("This Month");
  const navigate = useNavigate();

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
            <p className="text-gray-400 text-xs">Welcome back,</p>
            <h1 className="text-base font-bold text-gray-800">
              Rapido — Frontdesk
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-400">AWB</span>
              <span className="text-gray-300">|</span>
              <input
                type="text"
                placeholder="Provide AWB number"
                className="bg-transparent text-sm outline-none w-44 text-gray-600"
              />
              <button
                className="text-xs text-white px-3 py-1 rounded-lg font-medium"
                style={{ backgroundColor: "#068BC9" }}
              >
                Search
              </button>
            </div>
            <p className="text-xs font-medium text-gray-600">
              Roppen Transportation Service Pvt. Ltd.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-5">
            {/* Left — main content */}
            <div className="col-span-2">
              {/* Greeting */}
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                Hi, Roppen Transportation Service Private Limited
              </h2>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                <h3 className="text-base font-semibold text-gray-700 mb-5">
                  Actions
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {actionStats.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-center">
                      <p
                        className="text-3xl font-bold mb-1"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {actionStats.slice(3).map((s, i) => (
                    <div key={i} className="text-center">
                      <p
                        className="text-3xl font-bold mb-1"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Book a Shipment button */}
                <div className="border-t border-gray-50 pt-4 flex justify-end">
                  <button
                    onClick={() => navigate("/client/logistics/book")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#22c55e" }}
                  >
                    + Book a Shipment
                  </button>
                </div>
              </div>

              {/* Upcoming Pickups */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                <h3 className="text-base font-semibold text-gray-700 mb-3">
                  Upcoming Pickups
                </h3>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-3">
                    You have shipments ready to be picked up.
                  </p>
                  <button
                    onClick={() => navigate("/client/logistics")}
                    className="flex items-center gap-2 mx-auto text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    style={{ color: "#068BC9", backgroundColor: "#e0f2fe" }}
                  >
                    🚚 View Pickups
                  </button>
                </div>
              </div>

              {/* Weekly chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Weekly Service Requests
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#068BC9"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "inside", fill: "#fff", fontSize: 11 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right — wallet + quick links + services */}
            <div className="col-span-1 flex flex-col gap-4">
              {/* Wallet */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Wallet Details
                  </h3>
                  <select
                    value={walletPeriod}
                    onChange={(e) => setWalletPeriod(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none text-gray-600 bg-gray-50"
                  >
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last 3 Months</option>
                  </select>
                </div>
                <div className="flex flex-col gap-0">
                  {walletDetails.map((w, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none"
                    >
                      <span className="text-sm text-gray-500">{w.label}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {w.value}
                      </span>
                    </div>
                  ))}
                  {parseFloat(walletDetails[2].value.replace(/,/g, "")) <
                    20000 && (
                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xs text-red-500 font-medium">
                        Wallet balance is low. Please contact CRM to recharge
                        immediately.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-medium text-gray-600">
                    📚 Knowledge Base
                  </p>
                </button>
                <button
                  onClick={() => navigate("/rate-calculator")}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-600">
                    🧮 Rate Calculator
                  </p>
                </button>
              </div>

              {/* Services list */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Services
                </h3>
                <div className="flex flex-col gap-1">
                  {services.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(s.path)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {s.icon}
                      </div>
                      <span className="text-xs text-gray-600">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
