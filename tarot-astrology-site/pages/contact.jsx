import { useState, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const SITE_EMAIL = 'Whissspernuance@gmail.com';
const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const UNAVAILABLE_DAYS = [5, 6, 0]; // Fri=5, Sat=6, Sun=0 - grayed out

function getDaysForPackage(selectedPackageId) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDays = 60;
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    if (UNAVAILABLE_DAYS.includes(dayOfWeek)) continue; // Skip Fri, Sat, Sun
    // Weekly & Monthly: only 7+ days ahead
    if ((selectedPackageId === 'weekly' || selectedPackageId === 'monthly') && d < weekAhead) continue;
    days.push(d);
  }
  return days;
}

function getMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function Contact() {
  const form = useRef();
  const [step, setStep] = useState('package'); // 'package' | 'calendar' | 'form'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const packages = [
    {
      id: 'daily',
      name: 'Daily Reading',
      price: '11.11',
      duration: '15–20 minutes',
      description: 'Start your day with clarity. Same-day requests welcome and subject to approval—making tarot more accessible.',
      features: [
        '15–20 minute personalized reading',
        'Daily guidance and insight',
        'Single card or 3-card spread',
        'Email delivery of reading',
      ],
      popular: false,
      note: 'Same-day bookings may be requested; subject to availability and approval.',
      stripeUrl: 'https://buy.stripe.com/00w28q7mfgrXb5XgYV4Ja02',
    },
    {
      id: 'weekly',
      name: 'Weekly Reading',
      price: '33.33',
      duration: '30 minutes',
      description: 'Weekly insights and guidance. Book at least one week ahead so we can prepare your reading.',
      features: [
        '30-minute personalized reading',
        'Weekly guidance and insights',
        '3-card spread',
        'Email delivery of reading',
        'Follow-up questions via email',
      ],
      popular: false,
      note: 'Sessions open from 7 days ahead.',
      stripeUrl: 'https://buy.stripe.com/aFa9ASeOHb7Da1T0ZX4Ja01',
    },
    {
      id: 'monthly',
      name: 'Monthly Reading',
      price: '55.55',
      duration: '1 hour',
      description: 'Comprehensive monthly forecast. Book at least one week ahead for the best experience.',
      features: [
        '1-hour comprehensive reading',
        'Full month forecast',
        'Celtic Cross spread (10 cards)',
        'Detailed written report',
        'Email delivery + optional video call',
        'Priority support',
      ],
      popular: true,
      note: 'Sessions open from 7 days ahead.',
      stripeUrl: 'https://buy.stripe.com/eVqeVc8qj8Zvde53854Ja00',
    },
  ];

  const selectableDays = useMemo(() => selectedPackage ? getDaysForPackage(selectedPackage.id) : [], [selectedPackage]);
  const firstSelectableDate = selectableDays[0];
  const displayMonth = firstSelectableDate ? new Date(firstSelectableDate.getFullYear(), firstSelectableDate.getMonth() + calendarMonthOffset, 1) : new Date();
  const monthDays = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = [];
    const daySet = new Set(selectableDays.map(d => d.toDateString()));
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      const isSelectable = daySet.has(date.toDateString());
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      days.push({ date, isSelectable, isSelected, dayOfWeek: date.getDay() });
    }
    return days;
  }, [displayMonth, selectableDays, selectedDate]);

  const goToCalendar = () => {
    if (!selectedPackage) return;
    setSelectedDate(null);
    setSelectedTime(null);
    setCalendarMonthOffset(0);
    setStep('calendar');
  };

  const goToForm = () => {
    if (!selectedDate || !selectedTime) return;
    setStep('form');
  };

  const sendForm = (e) => {
    e.preventDefault();
    const formElement = form.current;
    if (!formElement) {
      setError('Form not found');
      return;
    }
    const packageInfo = packages.find(p => p.id === selectedPackage?.id);
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
    const setVal = (name, val) => { const el = formElement.querySelector(`[name="${name}"]`); if (el) el.value = val || ''; };
    setVal('booking_date', dateStr);
    setVal('booking_time', selectedTime || '');
    setVal('package_name', packageInfo?.name || '');
    setVal('package_price', packageInfo?.price || '');
    setVal('package_duration', packageInfo?.duration || '');
    setVal('_next', packageInfo?.stripeUrl || '');
    const userEmailEl = formElement.querySelector('[name="user_email"]');
    let emailEl = formElement.querySelector('input[name="email"]');
    if (!emailEl && userEmailEl) {
      emailEl = document.createElement('input');
      emailEl.type = 'hidden';
      emailEl.name = 'email';
      formElement.appendChild(emailEl);
    }
    if (emailEl && userEmailEl) emailEl.value = userEmailEl.value;
    setLoading(true);
    formElement.submit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950 via-purple-950 to-black text-white pt-16">
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2">
              <CalendarIcon className="text-purple-300" size={20} />
              <span className="text-purple-200 text-sm font-medium">Book Your Reading</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Schedule Your Session
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Choose your reading, pick a date & time, then complete your booking. We’ll confirm and send details to your email.
          </p>
        </div>
      </section>

      {/* Step 1: Choose package */}
      {step === 'package' && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-gray-400 mb-8">Step 1 — Choose your reading</p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-gradient-to-br ${
                    pkg.popular ? 'from-purple-900/40 to-pink-900/40 border-purple-400/50' : 'from-indigo-900/30 to-purple-900/30 border-purple-500/30'
                  } backdrop-blur-sm border-2 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer ${
                    selectedPackage?.id === pkg.id ? 'ring-4 ring-purple-400/50 scale-[1.02]' : ''
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-purple-200">{pkg.name}</h3>
                    {selectedPackage?.id === pkg.id && <CheckCircle className="text-purple-400" size={24} />}
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">${pkg.price}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300 mb-4">
                    <Clock size={18} />
                    <span>{pkg.duration}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{pkg.description}</p>
                  {pkg.note && <p className="text-gray-400 text-xs italic mb-4">{pkg.note}</p>}
                  <ul className="space-y-2 mb-4">
                    {pkg.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <Sparkles className="text-purple-400 flex-shrink-0 mt-0.5" size={14} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={goToCalendar}
                disabled={!selectedPackage}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
              >
                <span>Pick date & time</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Calendar + time */}
      {step === 'calendar' && selectedPackage && (
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-gray-400 mb-4">Step 2 — Pick date and time (Mon–Thu, 8am–11am)</p>
            <p className="text-center text-purple-200 font-medium mb-6">
              {selectedPackage.id === 'daily' && 'Daily readings: same-day possible, subject to approval.'}
              {(selectedPackage.id === 'weekly' || selectedPackage.id === 'monthly') && 'Available from 7 days ahead.'}
            </p>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCalendarMonthOffset(o => o - 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-lg font-semibold text-purple-200">{getMonthYear(displayMonth)}</span>
              <button
                type="button"
                onClick={() => setCalendarMonthOffset(o => o + 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((name, i) => (
                <div
                  key={name}
                  className={`text-center text-sm font-medium py-2 ${UNAVAILABLE_DAYS.includes(i) ? 'text-gray-500' : 'text-gray-300'}`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar grid - align first day */}
            <div className="grid grid-cols-7 gap-1 mb-8">
              {(() => {
                const firstDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay();
                const blanks = Array(firstDay).fill(null);
                return (
                  <>
                    {blanks.map((_, i) => (
                      <div key={`b-${i}`} className="aspect-square" />
                    ))}
                    {monthDays.map(({ date, isSelectable, isSelected, dayOfWeek }) => (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => isSelectable && setSelectedDate(date)}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          !isSelectable
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                            : isSelected
                              ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Time slots */}
            <p className="text-gray-300 font-medium mb-2">Available times (8am–11am)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedTime === t ? 'bg-purple-500 text-white ring-2 ring-purple-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                onClick={() => setStep('package')}
                className="px-6 py-3 rounded-full border border-white/30 text-gray-300 hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToForm}
                disabled={!selectedDate || !selectedTime}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Continue to form</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Form */}
      {step === 'form' && (
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 md:p-12">
              <p className="text-center text-gray-400 mb-2">Step 3 — Complete your booking</p>
              <p className="text-center text-purple-200 font-semibold mb-2">
                {selectedPackage?.name} — {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
              </p>
              <p className="text-center text-gray-400 text-sm mb-6">Fill out the form, then you&apos;ll be redirected to secure payment. After payment, you&apos;ll receive a confirmation email with your booked date.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
                  <XCircle className="text-red-400" size={20} />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              <form ref={form} onSubmit={sendForm} action="https://formsubmit.co/Whissspernuance@gmail.com" method="POST" className="space-y-6">
                <input type="hidden" name="_subject" value="New Whisper Nuance Booking" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_next" value="" />
                <input type="hidden" name="_autoresponse" value="Thank you! Your Whisper Nuance reading booking has been received. We'll confirm your chosen date and time and redirect you to secure payment. — Whisper Nuance" />
                <input type="hidden" name="booking_date" value={selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''} />
                <input type="hidden" name="booking_time" value={selectedTime || ''} />
                <input type="hidden" name="package_name" value={selectedPackage ? packages.find(p => p.id === selectedPackage.id)?.name : ''} />
                <input type="hidden" name="package_price" value={selectedPackage ? packages.find(p => p.id === selectedPackage.id)?.price : ''} />
                <input type="hidden" name="package_duration" value={selectedPackage ? packages.find(p => p.id === selectedPackage.id)?.duration : ''} />
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Your Name *</label>
                  <input name="user_name" type="text" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Email Address *</label>
                  <input name="user_email" type="email" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="For your booking confirmation" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">What guidance are you seeking? *</label>
                  <textarea name="message" required rows={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Your question or focus for the reading..." />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete booking &amp; pay</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </form>
              <p className="text-center text-gray-400 text-sm mt-4">
                You’ll receive an email confirming your chosen date and time. Questions? Email us at <a href={`mailto:${SITE_EMAIL}`} className="text-purple-300 hover:underline">{SITE_EMAIL}</a>.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-purple-500/20 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Whisper Nuance • whispernuance.com • Tarot readings by appointment</p>
        </div>
      </footer>
    </div>
  );
}
