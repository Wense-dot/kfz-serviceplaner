import React, { useState, useEffect } from 'react';
import { 
  Car, Wrench, Plus, Trash2, Calendar, ShieldCheck, 
  Search, Fuel, Bell, AlertTriangle, CheckCircle, FileText 
} from 'lucide-react';

export default function App() {
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('kfz_vehicles');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'BMW 320d',
        plate: 'M-AB 1234',
        tuev: '2026-08',
        mileage: 145000,
        services: [
          { id: '101', title: 'Ölwechsel & Filter', date: '2025-06-15', mileage: 140000, cost: 180, notes: '5W30 ÖL' }
        ]
      }
    ];
  });

  const [activeTab, setActiveTab] = useState('garage'); // 'garage' | 'tuev' | 'services'
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Form States - Fahrzeug (Nur Kennzeichen ist Pflichtfeld!)
  const [newVehicle, setNewVehicle] = useState({ name: '', plate: '', tuev: '', mileage: '' });
  // Form States - Service
  const [newService, setNewService] = useState({ title: '', date: '', mileage: '', cost: '', notes: '' });

  useEffect(() => {
    localStorage.setItem('kfz_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Fahrzeug hinzufügen
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.plate.trim()) return; // Nur Kennzeichen ist Pflicht!

    const created = {
      id: Date.now().toString(),
      name: newVehicle.name.trim() || 'Fahrzeug ohne Name',
      plate: newVehicle.plate.trim().toUpperCase(),
      tuev: newVehicle.tuev || '',
      mileage: Number(newVehicle.mileage) || 0,
      services: []
    };

    setVehicles([...vehicles, created]);
    setSelectedVehicleId(created.id);
    setNewVehicle({ name: '', plate: '', tuev: '', mileage: '' });
    setShowVehicleModal(false);
  };

  // Fahrzeug löschen
  const handleDeleteVehicle = (id) => {
    if (window.confirm('Fahrzeug wirklich löschen?')) {
      const updated = vehicles.filter(v => v.id !== id);
      setVehicles(updated);
      if (selectedVehicleId === id) {
        setSelectedVehicleId(updated[0]?.id || null);
      }
    }
  };

  // Service eintagen
  const handleAddService = (e) => {
    e.preventDefault();
    if (!selectedVehicleId || !newService.title.trim()) return;

    const entry = {
      id: Date.now().toString(),
      title: newService.title,
      date: newService.date || new Date().toISOString().split('T')[0],
      mileage: Number(newService.mileage) || selectedVehicle.mileage,
      cost: Number(newService.cost) || 0,
      notes: newService.notes
    };

    setVehicles(vehicles.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          mileage: Math.max(v.mileage, entry.mileage),
          services: [entry, ...v.services]
        };
      }
      return v;
    }));

    setNewService({ title: '', date: '', mileage: '', cost: '', notes: '' });
    setShowServiceModal(false);
  };

  // Service löschen
  const handleDeleteService = (serviceId) => {
    setVehicles(vehicles.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          services: v.services.filter(s => s.id !== serviceId)
        };
      }
      return v;
    }));
  };

  // Filtern für die Suche
  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Navigation / Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-7 h-7 text-blue-500" />
            <h1 className="font-bold text-lg tracking-wide text-white">Kfz-Serviceplaner</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-36 sm:w-48"
              />
            </div>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Fahrzeug</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-5xl mx-auto px-4 flex space-x-6 border-t border-slate-800/60 text-sm font-medium">
          <button
            onClick={() => setActiveTab('garage')}
            className={`py-2.5 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'garage' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Garage ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tuev')}
            className={`py-2.5 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'tuev' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>TÜV-Planer</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-2.5 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'services' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Historie & Kosten</span>
          </button>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="max-w-5xl mx-auto px-4 pt-6">

        {/* TAB 1: GARAGE */}
        {activeTab === 'garage' && (
          <div className="space-y-6">
            {/* Fahrzeugauswahl Horizontal */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {filteredVehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition w-48 ${
                    selectedVehicleId === v.id
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-base truncate">{v.name}</div>
                  <div className="text-xs text-blue-400 font-mono mt-1">{v.plate}</div>
                </button>
              ))}
            </div>

            {/* Details des gewählten Fahrzeugs */}
            {selectedVehicle ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedVehicle.name}</h2>
                    <span className="inline-block bg-slate-800 border border-slate-700 text-blue-400 font-mono px-2.5 py-1 rounded-md text-sm mt-2">
                      {selectedVehicle.plate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition"
                    title="Fahrzeug löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Kennzahlen */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400 font-medium">Kilometerstand</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {selectedVehicle.mileage.toLocaleString()} km
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400 font-medium">Nächster TÜV</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {selectedVehicle.tuev || 'Nicht hinterlegt'}
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400 font-medium">Wartungen gesamt</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {selectedVehicle.services.length} Einträge
                    </div>
                  </div>
                </div>

                {/* Service Historie Auszug */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Letzte Wartungen</h3>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Eintrag hinzufügen</span>
                    </button>
                  </div>

                  {selectedVehicle.services.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Noch keine Service-Einträge vorhanden.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedVehicle.services.map(s => (
                        <div key={s.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-white">{s.title}</div>
                            <div className="text-xs text-slate-400 mt-1 space-x-3">
                              <span>{s.date}</span>
                              <span>•</span>
                              <span>{s.mileage.toLocaleString()} km</span>
                              {s.cost > 0 && <><span>•</span><span className="text-emerald-400">{s.cost} €</span></>}
                            </div>
                            {s.notes && <div className="text-xs text-slate-400 mt-2 bg-slate-900 p-2 rounded border border-slate-800">{s.notes}</div>}
                          </div>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="text-slate-600 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Kein Fahrzeug ausgewählt oder vorhanden.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TÜV PLANER */}
        {activeTab === 'tuev' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span>TÜV & Hauptuntersuchungen</span>
            </h2>
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{v.name} ({v.plate})</div>
                    <div className="text-xs text-slate-400 mt-0.5">TÜV fällig im: <span className="text-blue-400 font-mono">{v.tuev || 'Kein Datum'}</span></div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {v.tuev ? `Fällig: ${v.tuev}` : 'Nicht eingetragen'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KOSTEN & HISTORIE */}
        {activeTab === 'services' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Wrench className="w-6 h-6 text-blue-500" />
              <span>Gesamte Service-Historie</span>
            </h2>
            {vehicles.flatMap(v => v.services.map(s => ({ ...s, vehicleName: v.name, plate: v.plate }))).length === 0 ? (
              <div className="text-slate-500 py-6 text-center">Keine Wartungseinträge in allen Fahrzeugen.</div>
            ) : (
              vehicles.flatMap(v => v.services.map(s => ({ ...s, vehicleName: v.name, plate: v.plate }))).map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono mr-2">{item.plate}</span>
                    <span className="font-semibold text-white">{item.title}</span>
                    <div className="text-xs text-slate-400 mt-1">{item.date} • {item.mileage.toLocaleString()} km</div>
                  </div>
                  <div className="text-emerald-400 font-bold">{item.cost > 0 ? `${item.cost} €` : '-'}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* MODAL: NEUES FAHRZEUG (Nur Kennzeichen ist Pflicht!) */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Neues Fahrzeug anlegen</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Amtliches Kennzeichen <span className="text-red-400">* (Pflichtfeld)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. M-AB 1234"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Fahrzeugname (Optional)</label>
                <input
                  type="text"
                  placeholder="z.B. BMW 320d"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nächster TÜV (Optional)</label>
                <input
                  type="month"
                  value={newVehicle.tuev}
                  onChange={(e) => setNewVehicle({ ...newVehicle, tuev: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Aktueller Kilometerstand (Optional)</label>
                <input
                  type="number"
                  placeholder="z.B. 145000"
                  value={newVehicle.mileage}
                  onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg font-medium"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEUE WARTUNG */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Wartung eintragen</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Wartung / Reparatur *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Ölwechsel & Filter"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Datum</label>
                  <input
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Kosten (€)</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={newService.cost}
                    onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Kilometerstand</label>
                <input
                  type="number"
                  placeholder="140000"
                  value={newService.mileage}
                  onChange={(e) => setNewService({ ...newService, mileage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notizen / Teile</label>
                <textarea
                  rows="2"
                  placeholder="z.B. 5W30 ÖL verwendet"
                  value={newService.notes}
                  onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg font-medium"
                >
                  Eintragen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
