import React, { useState, useEffect } from 'react';
import { 
  Car, Wrench, Calendar, Plus, Trash2, Edit2, Search, 
  CheckCircle, AlertTriangle, Camera, FileText, ChevronRight, X 
} from 'lucide-react';

export default function App() {
  // Lade Daten aus dem lokalen Speicher oder nutze Standardwerte
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('kfz_vehicles');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'BMW 320d',
        plate: 'M-AB 1234',
        mileage: 145000,
        tuev: '2027-05',
        image: null
      }
    ];
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('kfz_services');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        vehicleId: '1',
        title: 'Ölwechsel & Filter',
        category: 'Wartung',
        date: '2025-06-15',
        mileage: 140000,
        cost: 180,
        notes: 'Mit 5W30 Öl und Originalfilter.',
        image: null
      }
    ];
  });

  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Modal-Zustände
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Formular-Felder Fahrzeug
  const [vehicleForm, setVehicleForm] = useState({ name: '', plate: '', mileage: '', tuev: '', image: null });
  
  // Formular-Felder Service
  const [serviceForm, setServiceForm] = useState({ 
    title: '', category: 'Wartung', date: new Date().toISOString().split('T')[0], mileage: '', cost: '', notes: '', image: null 
  });

  // Daten automatisch speichern
  useEffect(() => {
    localStorage.setItem('kfz_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('kfz_services', JSON.stringify(services));
  }, [services]);

  // Hilfsfunktion: Sonderzeichen für Suche ignorieren
  const normalizeString = (str) => {
    return str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    const newVehicle = {
      id: Date.now().toString(),
      ...vehicleForm,
      mileage: Number(vehicleForm.mileage)
    };
    setVehicles([...vehicles, newVehicle]);
    setVehicleForm({ name: '', plate: '', mileage: '', tuev: '', image: null });
    setShowVehicleModal(false);
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    const newService = {
      id: Date.now().toString(),
      vehicleId: selectedVehicle.id,
      ...serviceForm,
      mileage: Number(serviceForm.mileage),
      cost: Number(serviceForm.cost)
    };
    setServices([newService, ...services]);
    setServiceForm({ title: '', category: 'Wartung', date: new Date().toISOString().split('T')[0], mileage: '', cost: '', notes: '', image: null });
    setShowServiceModal(false);
  };

  const deleteVehicle = (id) => {
    if (confirm('Fahrzeug und alle dazugehörigen Einträge wirklich löschen?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      setServices(services.filter(s => s.vehicleId !== id));
      if (selectedVehicle?.id === id) setSelectedVehicle(null);
    }
  };

  const deleteService = (id) => {
    if (confirm('Diesen Service-Eintrag löschen?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleImageUpload = (e, formType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formType === 'vehicle') {
          setVehicleForm(prev => ({ ...prev, image: reader.result }));
        } else {
          setServiceForm(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Gefilterte Fahrzeuge anhand der Suche
  const filteredVehicles = vehicles.filter(v => {
    const query = normalizeString(searchQuery);
    return normalizeString(v.name).includes(query) || normalizeString(v.plate).includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedVehicle(null)}>
            <Car className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold tracking-wide">Kfz-Serviceplaner</h1>
          </div>
          
          {/* Suchleiste */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Suchen (ignoriert Sonderzeichen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-24">
        {!selectedVehicle ? (
          /* Ansicht: Fahrzeugliste */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-200">Meine Fahrzeuge</h2>
              <button 
                onClick={() => setShowVehicleModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" /> Fahrzeug hinzufügen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVehicles.map(vehicle => {
                const vehicleServices = services.filter(s => s.vehicleId === vehicle.id);
                return (
                  <div 
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-blue-500 cursor-pointer transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {vehicle.image ? (
                            <img src={vehicle.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-600" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-blue-400">
                              <Car className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-white">{vehicle.name}</h3>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md font-mono">{vehicle.plate}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteVehicle(vehicle.id); }}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 my-4 bg-gray-900/50 p-3 rounded-xl">
                        <div>
                          <span className="text-gray-500 block text-xs">Kilometerstand</span>
                          <span className="font-semibold">{vehicle.mileage.toLocaleString()} km</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">TÜV Ablauf</span>
                          <span className="font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" /> {vehicle.tuev || 'Unbekannt'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-700/50">
                      <span>{vehicleServices.length} Service-Einträge</span>
                      <span className="text-blue-400 flex items-center gap-1 font-medium">Öffnen <ChevronRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Ansicht: Fahrzeugdetails & Historie */
          <div>
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="text-sm text-blue-400 hover:underline mb-4 flex items-center gap-1"
            >
              ← Zurück zur Übersicht
            </button>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {selectedVehicle.image ? (
                  <img src={selectedVehicle.image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-gray-600" />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center text-blue-400">
                    <Car className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedVehicle.name}</h2>
                  <p className="text-sm text-gray-400 font-mono mt-0.5">{selectedVehicle.plate} • {selectedVehicle.mileage.toLocaleString()} km</p>
                </div>
              </div>

              <button 
                onClick={() => setShowServiceModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Service eintragen
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-200 mb-4">Wartungshistorie</h3>

            {services.filter(s => s.vehicleId === selectedVehicle.id).length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 border border-dashed border-gray-700 rounded-2xl text-gray-400">
                <Wrench className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Noch keine Service-Einträge vorhanden.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services
                  .filter(s => s.vehicleId === selectedVehicle.id)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(service => (
                    <div key={service.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-xl mt-1">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">{service.title}</h4>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md">{service.category}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{service.date} • {service.mileage.toLocaleString()} km • {service.cost} €</p>
                          {service.notes && <p className="text-sm text-gray-300 mt-2 bg-gray-900/40 p-2.5 rounded-lg">{service.notes}</p>}
                          {service.image && (
                            <div className="mt-3">
                              <img src={service.image} alt="Beleg" className="w-24 h-24 rounded-lg object-cover border border-gray-700" />
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteService(service.id)}
                        className="text-gray-500 hover:text-red-400 p-2 self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Neues Fahrzeug */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Fahrzeug hinzufügen</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Modell / Name</label>
                <input 
                  type="text" required placeholder="z.B. Golf 7 GTI"
                  value={vehicleForm.name} onChange={e => setVehicleForm({...vehicleForm, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Kennzeichen</label>
                <input 
                  type="text" required placeholder="z.B. B-XY 1234"
                  value={vehicleForm.plate} onChange={e => setVehicleForm({...vehicleForm, plate: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kilometerstand</label>
                  <input 
                    type="number" required placeholder="z.B. 120000"
                    value={vehicleForm.mileage} onChange={e => setVehicleForm({...vehicleForm, mileage: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">TÜV Ablauf (Monat)</label>
                  <input 
                    type="month" required
                    value={vehicleForm.tuev} onChange={e => setVehicleForm({...vehicleForm, tuev: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Foto (optional)</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'vehicle')} className="text-xs text-gray-400" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-lg mt-2">
                Speichern
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Neuer Service */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Service eintragen</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tätigkeit / Titel</label>
                <input 
                  type="text" required placeholder="z.B. Bremsen vorne neu"
                  value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kategorie</label>
                  <select 
                    value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Wartung">Wartung</option>
                    <option value="Reparatur">Reparatur</option>
                    <option value="Inspektion">Inspektion</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Datum</label>
                  <input 
                    type="date" required
                    value={serviceForm.date} onChange={e => setServiceForm({...serviceForm, date: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Km-Stand bei Service</label>
                  <input 
                    type="number" required placeholder="z.B. 125000"
                    value={serviceForm.mileage} onChange={e => setServiceForm({...serviceForm, mileage: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kosten (€)</label>
                  <input 
                    type="number" placeholder="z.B. 250"
                    value={serviceForm.cost} onChange={e => setServiceForm({...serviceForm, cost: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notizen / Details</label>
                <textarea 
                  rows="2" placeholder="Was wurde gemacht..."
                  value={serviceForm.notes} onChange={e => setServiceForm({...serviceForm, notes: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Foto / Beleg (optional)</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'service')} className="text-xs text-gray-400" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-lg mt-2">
                Hinzufügen
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
