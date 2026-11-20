import React, { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

export default function PayDuration() {
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('vendor_pay_unit') || 'Days';
  });

  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('vendor_pay_duration');
    return saved !== null && !isNaN(Number(saved)) ? Number(saved) : 46;
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    const finalDuration = duration && Number(duration) > 0 ? Number(duration) : (unit === 'Days' ? 46 : 1);
    setDuration(finalDuration);
    localStorage.setItem('vendor_pay_unit', unit);
    localStorage.setItem('vendor_pay_duration', finalDuration.toString());
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const increment = () => {
    setDuration((prev) => (Number(prev) || 0) + 1);
  };

  const decrement = () => {
    setDuration((prev) => Math.max(1, (Number(prev) || 1) - 1));
  };

  const handleDurationChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setDuration('');
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setDuration(Math.max(1, parsed));
    }
  };

  const handleBlur = () => {
    if (!duration || Number(duration) < 1) {
      setDuration(unit === 'Days' ? 46 : 1);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      {/* Centered Portal Themed Card */}
      <div className="w-full max-w-[480px] bg-white/85 backdrop-blur-xl text-slate-800 p-8 sm:p-10 rounded-[32px] border border-slate-200/90 shadow-2xl shadow-slate-200/70 relative transition-all">

        {/* Floating Saved Toast Notification */}
        {savedMessage && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Duration saved successfully</span>
          </div>
        )}

        {/* Header Section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Pay Duration Period
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Set the payment duration period.
          </p>
        </div>

        {/* Duration Segmented Switcher */}
        <div className="mt-8 space-y-3">
          <label className="block text-sm font-bold text-slate-700">
            Duration
          </label>
          <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (unit !== 'Days') {
                  setUnit('Days');
                  if (duration === 1) setDuration(46);
                }
              }}
              className={`py-2.5 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${unit === 'Days'
                  ? 'bg-[#3b5998] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Days
            </button>
            <button
              type="button"
              onClick={() => {
                if (unit !== 'Months') {
                  setUnit('Months');
                  if (duration === 46) setDuration(1);
                }
              }}
              className={`py-2.5 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${unit === 'Months'
                  ? 'bg-[#3b5998] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Months
            </button>
          </div>
        </div>

        {/* Enter Duration Stepper Section */}
        <div className="mt-8 space-y-3">
          <label className="block text-sm font-bold text-slate-700">
            Enter duration ({unit.toLowerCase()})
          </label>

          <div className="flex items-center gap-3.5 pt-1">
            {/* Minus Circle Button */}
            <button
              type="button"
              onClick={decrement}
              aria-label="Decrease duration"
              className="w-12 h-12 shrink-0 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm active:scale-95 transition-all text-xl font-semibold select-none"
            >
              <Minus className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
            </button>

            {/* Middle Number Box */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl py-5 px-4 flex flex-col items-center justify-center shadow-sm">
              <input
                type="number"
                min="1"
                value={duration}
                onChange={handleDurationChange}
                onBlur={handleBlur}
                className="w-full text-center bg-transparent text-slate-900 text-4xl sm:text-[42px] font-extrabold focus:outline-none tracking-tight leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-slate-400 text-xs sm:text-sm mt-2 font-semibold lowercase tracking-wider select-none">
                {unit.toLowerCase()}
              </span>
            </div>

            {/* Plus Circle Button */}
            <button
              type="button"
              onClick={increment}
              aria-label="Increase duration"
              className="w-12 h-12 shrink-0 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm active:scale-95 transition-all text-xl font-semibold select-none"
            >
              <Plus className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Save Duration Button */}
        <div className="mt-9">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold text-base py-3.5 sm:py-4 rounded-full shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all"
          >
            Save Duration
          </button>
        </div>

      </div>
    </div>
  );
}
