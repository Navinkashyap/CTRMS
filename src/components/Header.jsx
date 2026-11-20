import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, Phone, Mail, Calendar, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';

const Header = ({ onToggleSidebar, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Keep dropdown card stable for ~2.5 seconds when mouse drifts away
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setDropOpen(false);
    }, 2500);
  };

  const toggleDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropOpen((p) => !p);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setDropOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);
  const [profileData, setProfileData] = useState({
    mobile: '',
    email: 'piyush@perfectrans.com',
    dob: '2015-06-01',
    gender: 'Male',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    address: 'Delhi',
    active: true,
    role: 'Super Admin'
  });

  const roles = [
    ['Super Admin', 'Admin'],
    ['Project Head', 'Accountant'],
    ['Project Manager', 'Project Executive'],
    ['Sales Head', 'Sales Manager'],
    ['Sales Executive', 'Accountant'],
    ['Vendor Manager', 'Vendor']
  ];

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Profile Updated:', profileData);
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <header className="h-[64px] bg-white/70 backdrop-blur-xl border-b border-white flex items-center px-4 md:px-8 gap-4 sticky top-0 z-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
        {/* Hamburger */}
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              onToggleMobileMenu();
            } else {
              onToggleSidebar();
            }
          }}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 outline-none flex items-center justify-center"
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>

        <div className="flex-1" />

        {/* User profile */}
        <div
          ref={dropdownRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full hover:bg-white transition-all border border-transparent hover:border-slate-200 hover:shadow-sm outline-none cursor-pointer"
            aria-label="User menu"
            aria-expanded={dropOpen}
          >
            {/* Avatar placeholder */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-[13px] font-extrabold shadow-inner ring-2 ring-white">
              PK
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight hidden sm:block">
              Piyush Kumar
            </span>
            <i className={`fa-solid fa-angle-down text-[10px] text-slate-600 transition-transform duration-300 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-2xl min-w-[210px] shadow-[0_12px_36px_rgba(0,0,0,0.12)] z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* User Quick Info Header */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
                <p className="text-[13px] font-extrabold text-slate-800 m-0 leading-tight">Piyush Kumar</p>
                <p className="text-[11px] font-semibold text-indigo-600 m-0 mt-0.5">Super Admin</p>
              </div>

              <div className="p-2 flex flex-col gap-1">
                {[
                  {
                    name: "Profile",
                    icon: "fa-regular fa-user",
                    action: () => setIsProfileModalOpen(true),
                  },
                  {
                    name: "Settings",
                    icon: "fa-solid fa-gear",
                    action: () => navigate("/menus"),
                  },
                  {
                    name: "Logout",
                    icon: "fa-solid fa-arrow-right-from-bracket",
                    textClass: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
                    action: () => navigate("/logout"),
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                      setDropOpen(false);
                      item.action();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all outline-none border-none cursor-pointer text-left ${item.textClass || ''}`}
                  >
                    <i className={`${item.icon} w-4 text-center text-xs opacity-75`} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsProfileModalOpen(false)}
          />

          <div className="relative bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Profile Details</h2>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-left">Manage your account information</p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-8">
              {/* Grid 1: Mobile & Email */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Mobile <span className="text-red-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Mobile No"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={profileData.mobile}
                    onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Email <span className="text-red-500 font-black">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Grid 2: DOB & Gender */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Date of Birth <span className="text-red-500 font-black">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold outline-none"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Gender <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid 3: Country & State */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Country <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option>India</option>
                      <option>USA</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    State <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option>Delhi</option>
                      <option>Maharashtra</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid 4: City & Zip Code */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    City
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option>New Delhi</option>
                      <option>Mumbai</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                    Zip Code <span className="text-red-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Zip Code"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={profileData.zipCode}
                    onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                  Address <span className="text-red-500 font-black">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                    checked={profileData.active}
                    onChange={(e) => setProfileData({ ...profileData, active: e.target.checked })}
                  />
                  <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Active</span>
              </label>

              {/* Roles Section */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 text-left">
                  Assign Roles <span className="text-red-500 font-black">*</span>
                </label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {roles.map((row, idx) => (
                    <React.Fragment key={idx}>
                      {row.map((role) => (
                        <label key={role} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="role"
                            className="hidden"
                            checked={profileData.role === role}
                            onChange={() => setProfileData({ ...profileData, role })}
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${profileData.role === role ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                            {profileData.role === role && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in-50" />}
                          </div>
                          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 text-left">{role}</span>
                        </label>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#3f5bb5] hover:bg-[#344d9c] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default Header;
