import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  MdFilterList,
  MdRefresh,
  MdSearch,
  MdClose,
  MdVisibility,
  MdAdd,
} from "react-icons/md";

const eventsData = [
  {
    id: "EVT-20260701001",
    company: "Rapido Technologies Pvt. Ltd.",
    eventType: "Team Outing",
    eventDate: "2026-07-20",
    venue: "Coorg Resort",
    location: "Coorg, Karnataka",
    participants: 85,
    duration: "2 Days",
    createdDate: "2026-07-01",
    eventStatus: "In Progress",
    quotationStatus: "Accepted",
  },
  {
    id: "EVT-20260701002",
    company: "Coca-Cola India Pvt. Ltd.",
    eventType: "Corporate Conference",
    eventDate: "2026-07-25",
    venue: "Taj Vivanta",
    location: "Bangalore, Karnataka",
    participants: 200,
    duration: "1 Day",
    createdDate: "2026-07-02",
    eventStatus: "Under Review",
    quotationStatus: "Pending",
  },
  {
    id: "EVT-20260701003",
    company: "Infosys Limited",
    eventType: "Annual Celebration",
    eventDate: "2026-08-15",
    venue: "Kanteerava Stadium",
    location: "Bangalore, Karnataka",
    participants: 1200,
    duration: "1 Day",
    createdDate: "2026-07-03",
    eventStatus: "Under Review",
    quotationStatus: "Pending",
  },
  {
    id: "EVT-20260701004",
    company: "Wipro Technologies",
    eventType: "Team Building",
    eventDate: "2026-07-18",
    venue: "Della Adventure Park",
    location: "Pune, Maharashtra",
    participants: 120,
    duration: "1 Day",
    createdDate: "2026-07-04",
    eventStatus: "Completed",
    quotationStatus: "Accepted",
  },
  {
    id: "EVT-20260701005",
    company: "HCL Technologies",
    eventType: "Product Launch",
    eventDate: "2026-07-30",
    venue: "ITC Windsor",
    location: "Bangalore, Karnataka",
    participants: 300,
    duration: "1 Day",
    createdDate: "2026-07-05",
    eventStatus: "In Progress",
    quotationStatus: "Accepted",
  },
];

const eventStatusConfig = {
  "In Progress": { color: "#3b82f6", bg: "#eff6ff" },
  "Under Review": { color: "#f97316", bg: "#ffedd5" },
  Completed: { color: "#22c55e", bg: "#dcfce7" },
  Cancelled: { color: "#ef4444", bg: "#fee2e2" },
};

const quotationStatusConfig = {
  Accepted: { color: "#22c55e", bg: "#dcfce7" },
  Pending: { color: "#f97316", bg: "#ffedd5" },
  Rejected: { color: "#ef4444", bg: "#fee2e2" },
};

const filterOptions = [
  "Latest",
  "Since Date",
  "Date Range",
  "Status",
  "Company",
  "Reset / Show All",
];

export default function Events() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Latest");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filtered = eventsData.filter(
    (o) =>
      o.id.toLowerCase().includes(searchText.toLowerCase()) ||
      o.company.toLowerCase().includes(searchText.toLowerCase()) ||
      o.eventType.toLowerCase().includes(searchText.toLowerCase()),
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
              Event & Team Outing Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, Company or Event..."
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
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-gray-800">
                {eventsData.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Completed</p>
              <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>
                {eventsData.filter((e) => e.eventStatus === "Completed").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">In Progress</p>
              <p className="text-2xl font-bold" style={{ color: "#3b82f6" }}>
                {
                  eventsData.filter((e) => e.eventStatus === "In Progress")
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Under Review</p>
              <p className="text-2xl font-bold" style={{ color: "#f97316" }}>
                {
                  eventsData.filter((e) => e.eventStatus === "Under Review")
                    .length
                }
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
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/events/new")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: "#22c55e" }}
            >
              <MdAdd size={18} />
              New Event
            </button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Service Request ID or Company Name"
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
                    Company Name
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Event Type
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Event Date
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Venue
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Location
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Participants
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Duration
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Created Date
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Event Status
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Quotation Status
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, i) => {
                  const es =
                    eventStatusConfig[event.eventStatus] ||
                    eventStatusConfig["Under Review"];
                  const qs =
                    quotationStatusConfig[event.quotationStatus] ||
                    quotationStatusConfig["Pending"];
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: "#068BC9" }}
                        onClick={() => navigate("/events/detail")}
                      >
                        {event.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.company}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.eventType}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.eventDate}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.venue}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.location}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.participants}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.duration}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {event.createdDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: es.color, backgroundColor: es.bg }}
                        >
                          {event.eventStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: qs.color, backgroundColor: qs.bg }}
                        >
                          {event.quotationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate("/events/detail")}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            color: "#068BC9",
                            backgroundColor: "#e0f2fe",
                          }}
                        >
                          <MdVisibility size={14} />
                          View
                        </button>
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
