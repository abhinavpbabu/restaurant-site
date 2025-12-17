


// File: src/LavishFamilyDemo.jsx
import React, { useState, useRef, useEffect } from "react";
import './App.css'
import rawMenu from './menu.json';

// Replace ADMIN_WHATSAPP with the admin number in international format without plus, e.g. 919876543210
const ADMIN_WHATSAPP = "918589903513";

export default function LavishFamilyDemo() {
  const [menu, setMenu] = useState([]);
  const [plate, setPlate] = useState(() => {
    try { return JSON.parse(localStorage.getItem('plate') || '[]'); } catch { return []; }
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [qtyById, setQtyById] = useState({});
  const [justAddedIds, setJustAddedIds] = useState([]);
  const [pulsePlate, setPulsePlate] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => { localStorage.setItem('plate', JSON.stringify(plate)); }, [plate]);

  // load menu and ensure every item has a stable id
  useEffect(() => {
    const withIds = rawMenu.map(section => ({
      ...section,
      items: section.items.map(item => ({ id: item.id || crypto.randomUUID(), ...item }))
    }));
    setMenu(withIds);
  }, []);

  function openCategory(catTitle) {
    const cat = menu.find(m => m.title === catTitle);
    if (!cat) return;
    const map = {};
    cat.items.forEach(it => map[it.id] = 1);
    setQtyById(map);
    setActiveCategory(cat);
    setShowCategoryModal(true);
  }

  function addToPlateWithQty(item, qty = 1) {
    if (!qty || qty <= 0) return;
    setPlate(prev => {
      const idx = prev.findIndex(p => p.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: (copy[idx].qty || 1) + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });

    setJustAddedIds(ids => [...ids, item.id]);
    setTimeout(() => setJustAddedIds(ids => ids.filter(i => i !== item.id)), 850);
    setPulsePlate(true);
    setTimeout(() => setPulsePlate(false), 900);
  }

  function changeQty(index, delta) {
    setPlate(prev => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const newQty = (item.qty || 1) + delta;
      if (newQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index] = { ...item, qty: newQty };
      }
      return copy;
    });
  }

  function removeFromPlate(index) {
    setPlate(p => p.filter((_, i) => i !== index));
  }

  function placeOrder() {
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Please fill name, phone and address.');
      return;
    }
    if (!plate.length) { alert('Your plate is empty.'); return; }

    const lines = [];
    lines.push(`Order from ${customer.name}`);
    lines.push(`Phone: ${customer.phone}`);
    lines.push(`Address: ${customer.address}`);
    lines.push('---');
    plate.forEach((it, i) => {
      const qty = it.qty || 1;
      lines.push(`${qty} x ${it.name}`); // qty first for clarity
    });
    lines.push('---');
    lines.push('Please confirm availability and total.');

    const text = encodeURIComponent(lines.join('\n'));
    const waNumber = ADMIN_WHATSAPP === 'REPLACE_WITH_ADMIN_NUMBER' ? prompt('Enter admin whatsapp number (e.g. 9198...):') : ADMIN_WHATSAPP;
    if (!waNumber) return;
    const url = `https://wa.me/${waNumber}?text=${text}`;
    window.open(url, '_blank');

    setPlate([]);
    setShowCheckout(false);
    alert('Order opened in WhatsApp. Complete the send from your phone/WhatsApp Web.');
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  const plateCount = plate.reduce((s, i) => s + (i.qty || 0), 0);

  function getCatImgSrc(index) {
    // 1-based: cat1, cat2...
    const base = `${import.meta.env.BASE_URL}images/cat${index + 1}`; // index from menu.map
    return `${base}.jpg`; // primary try: .jpg
  }

  const totalPrice = plate.reduce(
    (sum, it) => sum + it.price * it.qty,
    0
  );


  return (
    <div className="min-h-screen bg-white text-gray-800 antialiased">
      <header ref={headerRef} className="fixed w-full z-40 bg-white/60 backdrop-blur-md shadow-sm h-14 md:h-auto">
        <div className="max-w-6xl mx-auto md:px-6 md:py-4 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">L</div>
            <div className="font-semibold">Lavish</div>
          </div>
          <nav className="space-x-6 hidden md:flex">
            <button onClick={() => scrollToId('menu')} className="hover:text-orange-500">Menu</button>
            <button onClick={() => scrollToId('location')} className="hover:text-orange-500">Location</button>
            <button onClick={() => scrollToId('contact')} className="hover:text-orange-500">Contact</button>
          </nav>
        </div>
      </header>

      <section className="pt-14 md:pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-none md:rounded-2xl overflow-hidden shadow-2xl">
            <img alt="Lavish Family Restaurant" src={`${import.meta.env.BASE_URL}images/banner.jpg`} className="w-full h-96 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold">Lavish Family Restaurant</h1>
                <p className="mt-2 max-w-xl opacity-90">Premium family dining · Warm murals · Curated flavours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold">Our Menu</h2>
            <p className="text-sm text-gray-500">Tap a section to see items and add to plate</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((sec, idx) => (
              <article
                key={sec.title}
                className="
                  bg-white rounded-2xl shadow-md
                  overflow-hidden cursor-pointer
                  transition-all duration-200 ease-out
                  hover:shadow-xl hover:-translate-y-1
                "
                onClick={() => openCategory(sec.title)}
              >
                <div className="h-44 sm:h-40 lg:h-48 overflow-hidden bg-gray-100 relative flex items-center justify-center">
                  <img
                    src={getCatImgSrc(idx)}
                    alt={`cat-${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // try .png next
                      if (!e.target.dataset.triedPng) {
                        e.target.dataset.triedPng = '1';
                        e.target.src = `/images/cat${idx + 1}.png`;
                        return;
                      }
                      // hide image completely if both fail
                      e.target.style.display = 'none';
                      // show fallback text
                      const fallback = e.target.parentNode.querySelector('.fallback-text');
                      if (fallback) fallback.style.opacity = 1;
                    }}
                    onLoad={(e) => {
                      // image loaded: hide fallback text
                      const fallback = e.target.parentNode.querySelector('.fallback-text');
                      if (fallback) fallback.style.opacity = 0;
                    }}
                  />

                  {/* fallback text only visible when image fails */}
                  <div
                    className="fallback-text absolute text-gray-400 pointer-events-none transition-opacity duration-200"
                    style={{ opacity: 0 }}
                  >
                    {sec.title}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg">{sec.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{sec.items.length} items</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Category Modal */}
      {showCategoryModal && activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategoryModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{activeCategory.title}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4 space-y-4">
              {activeCategory.items.map(it => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-500">₹{it.price}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center border rounded overflow-hidden">
                      <button onClick={() => setQtyById(q => ({ ...q, [it.id]: Math.max(1, (q[it.id] || 1) - 1) }))} className="px-3 py-1">-</button>
                      <div className="px-4 py-1">{qtyById[it.id] || 1}</div>
                      <button onClick={() => setQtyById(q => ({ ...q, [it.id]: (q[it.id] || 1) + 1 }))} className="px-3 py-1">+</button>
                    </div>

                    <button onClick={() => addToPlateWithQty(it, qtyById[it.id] || 1)} className={`px-3 py-1 rounded-full text-sm ${justAddedIds.includes(it.id) ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                      {justAddedIds.includes(it.id) ? 'Added' : 'Add to plate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout / Plate Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCheckout(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your Plate</h3>
              <button onClick={() => setShowCheckout(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4 space-y-3">
              {plate.length === 0 && <div className="text-sm text-gray-500">Plate is empty.</div>}
              {plate.map((it, i) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => changeQty(i, -1)} className="px-2 py-1 rounded-full border text-sm">-</button>
                    <div className="px-2">{it.qty}</div>
                    <button onClick={() => changeQty(i, +1)} className="px-2 py-1 rounded-full border text-sm">+</button>
                    {/* <button onClick={() => removeFromPlate(i)} className="px-2 py-1 rounded-full border text-sm">Remove</button> */}
                    <div className="font-semibold text-md">₹{it.price * it.qty}</div>
                  </div>
                </div>
              ))}
              {plate.length > 0 && (
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg">₹{totalPrice}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Customer Details</h4>
              <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="mt-2 w-full p-2 border rounded" placeholder="Name" />
              <input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="mt-2 w-full p-2 border rounded" placeholder="Phone (e.g. 9198...)" />
              <textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className="mt-2 w-full p-2 border rounded" placeholder="Address"></textarea>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowCheckout(false); }} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={placeOrder} className="px-4 py-2 rounded bg-orange-500 text-white">Place order via WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      <section id="location" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Find Us</h2>
            <p className="text-gray-600 mb-4">Lavish Family Restaurant · Family-friendly · Reservations welcome</p>

            <div className="rounded-xl overflow-hidden shadow">
              <iframe title="Lavish Family Location" src="https://www.google.com/maps?q=10.8505,76.2711&z=15&output=embed" className="w-full h-72 border-0" loading="lazy"></iframe>
            </div>

            <div id="contact" className="mt-6 bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold">Contact</h3>
              <p className="mt-2 text-sm text-gray-600">Address: 12 Market Lane, Sample City, Kerala</p>
              <p className="mt-1 text-sm text-gray-600">Phone: +91 98765 43210</p>
              <p className="mt-1 text-sm text-gray-600">Email: hello@lavishfamily.example</p>
              <div className="mt-4 flex gap-3">
                <a className="px-4 py-2 rounded-full border border-orange-200 text-orange-600 text-sm" href="tel:+919876543210">Call</a>
                <a className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm" href="#">Reserve</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h4 className="font-semibold">Opening Hours</h4>
              <p className="text-sm text-gray-600 mt-2">Mon - Sun · 11:00 AM - 11:00 PM</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h4 className="font-semibold">Quick Menu Picks</h4>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• Signature Family Platter</li>
                <li>• Slow-cooked Lamb Shank</li>
                <li>• Sizzling Teppan Noodles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">© Lavish Family • demo by Abhinav p Babu</div>
      </footer>

      <div className="fixed right-6 bottom-6">
        <button onClick={() => setShowCheckout(true)} className={`bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg transform transition-all ${pulsePlate ? 'scale-105 animate-pulse' : ''}`}>
          Plate ({plateCount})
        </button>
      </div>
    </div>
  );
}
