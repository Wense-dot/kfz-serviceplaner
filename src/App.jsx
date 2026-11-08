import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Wrench, 
  ClipboardCheck, 
  History, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  Printer, 
  Download, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Gauge,
  Calendar,
  ShieldCheck,
  Disc,
  Droplet,
  Cog,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  X
} from 'lucide-react';

// Helper Component to Render Dynamic Icons
const RenderIcon = ({ name, className }) => {
  switch (name) {
    case 'disc': return <Disc className={className} />;
    case 'shield': return <ShieldCheck className={className} />;
    case 'droplet': return <Droplet className={className} />;
    case 'wrench':
    default: return <Wrench className={className} />;
  }
};

// --- INITIAL DEFAULT DATA ---
const DEFAULT_VEHICLES = [
  {
    id: 'v1',
    brand: 'Volkswagen',
    model: 'Golf 7 GTI',
    licensePlate: 'M-KW 2024',
    year: '2019',
    mileage: '85000',
    tuvDate: '2025-11',
    notes: '2.0 TSI Engine, TFSI DSG'
  },
  {
    id: 'v2',
    brand: 'BMW',
    model: '320d Touring',
    licensePlate: 'B-MA 4567',
    year: '2021',
    mileage: '62000',
    tuvDate: '2026-04',
    notes: 'Farbe: Mineralgrau Metallic'
  }
];

const DEFAULT_TEMPLATES = [
  {
    id: 't1',
    title: 'Kundendienst / Inspektion',
    icon: 'wrench',
    description: 'Große Inspektion inkl. Flüssigkeiten und Filtern',
    items: [
      { text: 'Motoröl & Ölfilter wechseln', checked: false },
      { text: 'Luftfilter & Innenraumfilter (Pollenfilter) ersetzen', checked: false },
      { text: 'Zündkerzen / Glühkerzen prüfen & ggf. erneuern', checked: false },
      { text: 'Bremsflüssigkeit prüfen / testen (Siedepunkt)', checked: false },
      { text: 'Kühlflüssigkeit & Frostschutz prüfen', checked: false },
      { text: 'Batterie-Gesundheitscheck (Spannung & Startstrom)', checked: false },
      { text: 'Beleuchtungsanlage & Scheibenwaschanlage testen', checked: false },
      { text: 'Fahrwerk, Aufhängung & Manschetten auf Spiel/Risse prüfen', checked: false }
    ]
  },
  {
    id: 't2',
    title: 'Saisonaler Reifenwechsel',
    icon: 'disc',
    description: 'Räderwechsel Sommer/Winter inkl. Sicherheits-Check',
    items: [
      { text: 'Räder abmontieren und Bremsscheiben visuell prüfen', checked: false },
      { text: 'Profiltiefe aller 4 Reifen messen (Min. 1.6 mm, Empfohlen: 4 mm)', checked: false },
      { text: 'Reifenfülldruck gemäß Herstellervorgabe anpassen', checked: false },
      { text: 'Radnaben säubern und dünn einfetten', checked: false },
      { text: 'Räder montieren und mit Drehmomentschlüssel anziehen (z.B. 120 Nm)', checked: false },
      { text: 'RDKS (Reifendruck-Kontrollsystem) im Bordcomputer zurücksetzen', checked: false }
    ]
  },
  {
    id: 't3',
    title: 'Bremsen-Service',
    icon: 'shield',
    description: 'Komplette Wartung von Bremsbelägen und Scheiben',
    items: [
      { text: 'Dicke der Bremsbeläge prüfen (Vorder- & Hinterachse)', checked: false },
      { text: 'Bremsscheiben auf Grat, Rillen und Stärke kontrollieren', checked: false },
      { text: 'Bremsführungsschienen reinigen & Führungsbolzen fetten', checked: false },
      { text: 'Bremsflüssigkeit wechseln & System entlüften', checked: false },
      { text: 'Handbremse / Elektronische Parkbremse auf Funktion testen', checked: false },
      { text: 'Probefahrt & Einbremsen der neuen Komponenten', checked: false }
    ]
  },
  {
    id: 't4',
    title: 'Ölwechsel & Basis-Service',
    icon: 'droplet',
    description: 'Schnellservice für Motoröl und Dichtungen',
    items: [
      { text: 'Altöl bei betriebswarmem Motor vollständig ablassen', checked: false },
      { text: 'Ölfiltergehäuse säubern und neuen Filter mit O-Ring einsetzen', checked: false },
      { text: 'Ölablassschraube mit neuem Kupfer-Dichtring festziehen', checked: false },
      { text: 'Neues Marken-Motoröl (Herstellerfreigabe beachten) auffüllen', checked: false },
      { text: 'Ölstand per Messstab / Bordcomputer prüfen', checked: false },
      { text: 'Service-Intervall-Anzeige im Fahrzeug zurücksetzen', checked: false }
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'templates' | 'new-service' | 'history'
  
  // Search States
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Data State with LocalStorage Sync
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('kfz_vehicles');
    return saved ? JSON.parse(saved) : DEFAULT_VEHICLES;
  });

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('kfz_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('kfz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Active Service Execution State (Array to support multiple active services)
  const [activeServices, setActiveServices] = useState(() => {
    const saved = localStorage.getItem('kfz_active_services');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Form Modals / Edit States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('kfz_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('kfz_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('kfz_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('kfz_active_services', JSON.stringify(activeServices));
  }, [activeServices]);

  // --- VEHICLE ACTIONS ---
  const handleSaveVehicle = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newVehicle = {
      id: editingVehicle ? editingVehicle.id : 'v_' + Date.now(),
      brand: formData.get('brand') || '',
      model: formData.get('model') || '',
      licensePlate: formData.get('licensePlate'),
      year: formData.get('year') || '',
      mileage: formData.get('mileage'),
      tuvDate: formData.get('tuvDate'),
      notes: formData.get('notes') || ''
    };

    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? newVehicle : v));
    } else {
      setVehicles([...vehicles, newVehicle]);
    }

    setIsVehicleModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  // --- TEMPLATE ACTIONS ---
  const handleSaveTemplate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawItems = formData.get('itemsStr').split('\n').filter(i => i.trim() !== '');

    const newTemplate = {
      id: editingTemplate ? editingTemplate.id : 't_' + Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      icon: formData.get('icon') || 'wrench',
      items: rawItems.map(item => ({ text: item.trim(), checked: false }))
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? newTemplate : t));
    } else {
      setTemplates([...templates, newTemplate]);
    }

    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  // --- SERVICE PROCESS ACTIONS ---
  const startNewService = (vehicleId, templateId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const template = templates.find(t => t.id === templateId);

    if (!vehicle || !template) return;

    const newService = {
      id: 'srv_' + Date.now(),
      vehicle,
      templateTitle: template.title,
      startDate: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      currentMileage: vehicle.mileage,
      mechanicNotes: '',
      photos: [],
      items: template.items.map(item => ({ ...item, checked: false }))
    };

    setActiveServices(prev => [...prev, newService]);
    setSelectedServiceId(newService.id);
    setActiveTab('new-service');
  };

  const toggleCheckItem = (serviceId, index) => {
    setActiveServices(prev => prev.map(srv => {
      if (srv.id === serviceId) {
        const updatedItems = [...srv.items];
        updatedItems[index].checked = !updatedItems[index].checked;
        return { ...srv, items: updatedItems };
      }
      return srv;
    }));
  };

  const updateServiceMileage = (serviceId, mileage) => {
    setActiveServices(prev => prev.map(srv => srv.id === serviceId ? { ...srv, currentMileage: mileage } : srv));
  };

  const updateServiceNotes = (serviceId, notes) => {
    setActiveServices(prev => prev.map(srv => srv.id === serviceId ? { ...srv, mechanicNotes: notes } : srv));
  };

  const handleAddPhoto = (serviceId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoObj = {
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          url: reader.result,
          caption: ''
        };
        setActiveServices(prev => prev.map(srv => {
          if (srv.id === serviceId) {
            return { ...srv, photos: [...(srv.photos || []), photoObj] };
          }
          return srv;
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdatePhotoCaption = (serviceId, photoId, caption) => {
    setActiveServices(prev => prev.map(srv => {
      if (srv.id === serviceId) {
        const updatedPhotos = (srv.photos || []).map(p => p.id === photoId ? { ...p, caption } : p);
        return { ...srv, photos: updatedPhotos };
      }
      return srv;
    }));
  };

  const handleDeletePhoto = (serviceId, photoId) => {
    setActiveServices(prev => prev.map(srv => {
      if (srv.id === serviceId) {
        return { ...srv, photos: (srv.photos || []).filter(p => p.id !== photoId) };
      }
      return srv;
    }));
  };

  const finishService = (serviceId) => {
    const serviceToFinish = activeServices.find(srv => srv.id === serviceId);
    if (!serviceToFinish) return;

    const completedService = {
      ...serviceToFinish,
      completedDate: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    // Update vehicle mileage
    setVehicles(vehicles.map(v => {
      if (v.id === serviceToFinish.vehicle.id) {
        return { ...v, mileage: serviceToFinish.currentMileage };
      }
      return v;
    }));

    setHistory([completedService, ...history]);
    setActiveServices(prev => prev.filter(srv => srv.id !== serviceId));
    
    // Select next active service if available
    const remaining = activeServices.filter(srv => srv.id !== serviceId);
    if (remaining.length > 0) {
      setSelectedServiceId(remaining[0].id);
    } else {
      setSelectedServiceId(null);
      setActiveTab('history');
    }
  };

  const cancelService = (serviceId) => {
    if (window.confirm('Möchten Sie diesen Service abbrechen? Alle Fortschritte gehen verloren.')) {
      setActiveServices(prev => prev.filter(srv => srv.id !== serviceId));
      const remaining = activeServices.filter(srv => srv.id !== serviceId);
      if (remaining.length > 0) {
        setSelectedServiceId(remaining[0].id);
      } else {
        setSelectedServiceId(null);
      }
    }
  };

  // Helper to format TÜV Date (YYYY-MM to MM/YYYY) & check status
  const getTuvStatus = (tuvStr) => {
    if (!tuvStr) return { text: 'Kein TÜV', isDueSoon: false, isOverdue: false };
    const [year, month] = tuvStr.split('-');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const tuvYear = parseInt(year);
    const tuvMonth = parseInt(month);

    const formatted = `${month.padStart(2, '0')}/${year}`;

    if (tuvYear < currentYear || (tuvYear === currentYear && tuvMonth < currentMonth)) {
      return { text: `${formatted} (Abgelaufen!)`, isDueSoon: false, isOverdue: true };
    }
    if (tuvYear === currentYear && tuvMonth - currentMonth <= 1) {
      return { text: `${formatted} (Fällig!)`, isDueSoon: true, isOverdue: false };
    }

    return { text: formatted, isDueSoon: false, isOverdue: false };
  };

  // Helper for flexible license plate matching (ignores hyphens, spaces, and case)
  const matchesSearch = (text, query) => {
    if (!query) return true;
    if (!text) return false;
    const cleanText = text.toString().toLowerCase().replace(/[\s-]/g, '');
    const cleanQuery = query.toString().toLowerCase().replace(/[\s-]/g, '');
    return cleanText.includes(cleanQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-6 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Kfz-Serviceplaner</h1>
              <p className="text-xs text-slate-400">Werkstatt & Vorlagen-Manager</p>
            </div>
          </div>
          {activeServices.length > 0 && (
            <span className="animate-pulse bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {activeServices.length} {activeServices.length === 1 ? 'Service aktiv' : 'Services aktiv'}
            </span>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full">

        {/* --- TAB 1: FAHRZEUGE --- */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Fahrzeugpark</h2>
                <p className="text-sm text-slate-500">Verwalte deine Autos und Kilometerstände</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar for Vehicles */}
                {vehicles.length > 0 && (
                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      value={vehicleSearchQuery}
                      onChange={(e) => setVehicleSearchQuery(e.target.value)}
                      placeholder="Kennzeichen / Modell suchen..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                    />
                    <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    {vehicleSearchQuery && (
                      <button
                        onClick={() => setVehicleSearchQuery('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => { setEditingVehicle(null); setIsVehicleModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Auto hinzufügen
                </button>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 mb-1">Keine Fahrzeuge vorhanden</h3>
                <p className="text-sm text-slate-500 mb-4">Füge dein erstes Fahrzeug hinzu, um Servicepläne zu starten.</p>
                <button
                  onClick={() => { setEditingVehicle(null); setIsVehicleModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Fahrzeug anlegen
                </button>
              </div>
            ) : (() => {
              const filteredVehicles = vehicles.filter(vehicle => {
                const query = vehicleSearchQuery.trim();
                if (!query) return true;
                const plateMatches = matchesSearch(vehicle.licensePlate, query);
                const brandMatches = matchesSearch(vehicle.brand, query);
                const modelMatches = matchesSearch(vehicle.model, query);
                return plateMatches || brandMatches || modelMatches;
              });

              if (filteredVehicles.length === 0) {
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-slate-500">Kein Fahrzeug für "{vehicleSearchQuery}" gefunden.</p>
                  </div>
                );
              }

              return (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {vehicle.licensePlate}
                          </span>
                          <h3 className="font-bold text-lg text-slate-900 mt-1">
                            {vehicle.brand || vehicle.model ? `${vehicle.brand} ${vehicle.model}`.trim() : vehicle.licensePlate}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingVehicle(vehicle); setIsVehicleModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            title="Bearbeiten"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 text-sm bg-slate-50 p-2.5 rounded-xl text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-slate-400" />
                          <span>{parseInt(vehicle.mileage || 0).toLocaleString('de-DE')} km</span>
                        </div>
                        {vehicle.year ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Bj. {vehicle.year}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic">
                            <span>Ohne Bj.</span>
                          </div>
                        )}
                        <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-slate-200/60 mt-1">
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-xs">TÜV bis:</span>
                          {(() => {
                            const tuv = getTuvStatus(vehicle.tuvDate);
                            return (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                tuv.isOverdue 
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                  : tuv.isDueSoon 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'text-slate-800'
                              }`}>
                                {tuv.text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {vehicle.notes && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic border-t border-slate-100 pt-2">
                          "{vehicle.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        )}

        {/* --- TAB 2: VORLAGEN --- */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Service-Vorlagen</h2>
                <p className="text-sm text-slate-500">Standardisierte Checklisten für Wartungsarbeiten</p>
              </div>
              <button
                onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Neue Vorlage
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <RenderIcon name={template.icon} className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingTemplate(template); setIsTemplateModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                          title="Bearbeiten"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mb-1">{template.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{template.description}</p>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Arbeitsschritte ({template.items.length})
                      </span>
                      {template.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="truncate">{item.text}</span>
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <span className="text-[11px] text-blue-600 font-medium pl-3 block pt-0.5">
                          + {template.items.length - 3} weitere Punkte...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Auf ein Fahrzeug anwenden:</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          startNewService(e.target.value, template.id);
                        }
                      }}
                      defaultValue=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Fahrzeug auswählen...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} ({v.brand} {v.model})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: DURCHFÜHRUNG / SERVICE --- */}
        {activeTab === 'new-service' && (
          <div className="space-y-6">
            {activeServices.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Kein Service aktiv</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Wähle in der Rubrik „Vorlagen“ eine Checkliste aus und starte die Durchführung für ein Fahrzeug.
                </p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 shadow-sm"
                >
                  Zu den Vorlagen <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (() => {
              const currentActiveService = activeServices.find(s => s.id === selectedServiceId) || activeServices[0];

              return (
                <div className="space-y-6">
                  {/* Selector for Multiple Active Services */}
                  {activeServices.length > 1 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Offene Service-Aufträge ({activeServices.length})
                        </span>
                        <span className="text-xs text-blue-600 font-medium">Klicke zum Wechseln</span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {activeServices.map((srv) => {
                          const doneCount = srv.items.filter(i => i.checked).length;
                          const progress = Math.round((doneCount / srv.items.length) * 100);
                          const isSelected = srv.id === currentActiveService.id;

                          return (
                            <div
                              key={srv.id}
                              onClick={() => setSelectedServiceId(srv.id)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-900 block truncate">{srv.vehicle.licensePlate}</span>
                                <span className="text-xs text-slate-500 truncate block">{srv.templateTitle}</span>
                              </div>
                              <div className="text-right pl-2">
                                <span className="text-xs font-semibold text-slate-600">{progress}%</span>
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Service Execution Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-900 text-white p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                          Aktive Durchführung
                        </span>
                        <span className="text-xs text-slate-400">{currentActiveService.startDate}</span>
                      </div>
                      <h2 className="text-xl font-bold">{currentActiveService.templateTitle}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-300">
                        <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {currentActiveService.vehicle.licensePlate}
                        </span>
                        <span>{currentActiveService.vehicle.brand} {currentActiveService.vehicle.model}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-6">
                      {/* Mileage Input */}
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                            Aktueller Kilometerstand
                          </label>
                          <p className="text-xs text-slate-500">Wird nach Abschluss im Fahrzeugstamm aktualisiert</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={currentActiveService.currentMileage}
                            onChange={(e) => updateServiceMileage(currentActiveService.id, e.target.value)}
                            className="w-32 bg-white border border-blue-200 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-600">km</span>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-slate-900">Checkliste</h3>
                          <span className="text-xs font-semibold text-slate-500">
                            {currentActiveService.items.filter(i => i.checked).length} von {currentActiveService.items.length} erledigt
                          </span>
                        </div>

                        <div className="space-y-2">
                          {currentActiveService.items.map((item, index) => (
                            <div
                              key={index}
                              onClick={() => toggleCheckItem(currentActiveService.id, index)}
                              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${
                                item.checked 
                                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-800' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                item.checked 
                                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                                  : 'border-slate-300 bg-slate-50'
                              }`}>
                                {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-500' : ''}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mechanic Notes */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Werkstatt-Notizen & Mängel
                        </label>
                        <textarea
                          rows="3"
                          value={currentActiveService.mechanicNotes}
                          onChange={(e) => updateServiceNotes(currentActiveService.id, e.target.value)}
                          placeholder="Besondere Beobachtungen, ausgetauschte Teilenummern oder empfohlene Folgereparaturen..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                      </div>

                      {/* Photo Attachment Section */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-blue-600" /> Fotos & Dokumentation (Schrauben, Defekte)
                          </label>
                          <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition">
                            <Plus className="w-3.5 h-3.5" /> Foto hinzufügen
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleAddPhoto(currentActiveService.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {(!currentActiveService.photos || currentActiveService.photos.length === 0) ? (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Keine Fotos angehängt. Nutze die Kamera oder Uploads für Beweisbilder oder Schraubenpositionen.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {currentActiveService.photos.map((photo) => (
                              <div key={photo.id} className="relative group bg-slate-100 border border-slate-200 rounded-xl overflow-hidden p-1.5 space-y-1.5">
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                                  <img src={photo.url} alt="Service Foto" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => handleDeletePhoto(currentActiveService.id, photo.id)}
                                    className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-600 transition"
                                    title="Foto löschen"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={photo.caption}
                                  onChange={(e) => handleUpdatePhotoCaption(currentActiveService.id, photo.id, e.target.value)}
                                  placeholder="Beschriftung (z.B. Schraube Dreieckslenker)"
                                  className="w-full text-xs p-1 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => finishService(currentActiveService.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Service abschließen & Speichern
                        </button>
                        <button
                          onClick={() => cancelService(currentActiveService.id)}
                          className="px-4 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- TAB 4: HISTORIE --- */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Service-Historie</h2>
                <p className="text-sm text-slate-500">Alle bereits durchgeführten Kundendienste und Protokolle</p>
              </div>

              {/* Search Bar */}
              {history.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Suchen nach Kennzeichen oder Service..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 mb-1">Keine Protokolle vorhanden</h3>
                <p className="text-sm text-slate-500">Schließe deinen ersten Service ab, um Historien-Einträge zu sehen.</p>
              </div>
            ) : (() => {
              // Filter history by search query (tolerant against hyphens & spaces)
              const filteredHistory = history.filter((record) => {
                const query = historySearchQuery.trim();
                if (!query) return true;
                
                const plateMatches = matchesSearch(record.vehicle.licensePlate, query);
                const titleMatches = matchesSearch(record.templateTitle, query);
                const brandMatches = matchesSearch(record.vehicle.brand, query);
                const modelMatches = matchesSearch(record.vehicle.model, query);

                return plateMatches || titleMatches || brandMatches || modelMatches;
              });

              if (filteredHistory.length === 0) {
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-slate-500">Keine Service-Einträge für "{historySearchQuery}" gefunden.</p>
                  </div>
                );
              }

              // Group filtered history entries by year
              const groupedByYear = filteredHistory.reduce((acc, record) => {
                const year = record.completedDate ? record.completedDate.split('.')[2] || 'Unbekannt' : 'Unbekannt';
                if (!acc[year]) acc[year] = [];
                acc[year].push(record);
                return acc;
              }, {});

              const sortedYears = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

              return (
                <div className="space-y-6">
                  {sortedYears.map((year) => (
                    <div key={year} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                          {year}
                        </span>
                        <div className="h-[1px] bg-slate-200 flex-1"></div>
                      </div>

                      <div className="space-y-3">
                        {groupedByYear[year].map((record) => (
                          <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {record.vehicle.licensePlate}
                                  </span>
                                  <span className="text-xs text-slate-400">• {record.completedDate}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">{record.templateTitle}</h3>
                                <p className="text-xs text-slate-500">
                                  {record.vehicle.brand} {record.vehicle.model} • Kilometerstand: {parseInt(record.currentMileage || 0).toLocaleString('de-DE')} km
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedReport(record)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition self-end sm:self-center"
                            >
                              <FileText className="w-4 h-4 text-slate-500" /> Protokoll ansehen
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

      </main>

      {/* --- MODAL: FAHRZEUG FORMULAR --- */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug anlegen'}
            </h3>

            <form onSubmit={handleSaveVehicle} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kennzeichen *</label>
                <input
                  required
                  name="licensePlate"
                  defaultValue={editingVehicle?.licensePlate || ''}
                  placeholder="z.B. M-XY 1234"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kilometerstand (km) *</label>
                <input
                  required
                  type="number"
                  name="mileage"
                  defaultValue={editingVehicle?.mileage || ''}
                  placeholder="z.B. 75000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">TÜV gültig bis (Monat/Jahr) *</label>
                <input
                  required
                  type="month"
                  name="tuvDate"
                  defaultValue={editingVehicle?.tuvDate || ''}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Marke (optional)</label>
                  <input
                    name="brand"
                    defaultValue={editingVehicle?.brand || ''}
                    placeholder="z.B. Audi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Modell (optional)</label>
                  <input
                    name="model"
                    defaultValue={editingVehicle?.model || ''}
                    placeholder="z.B. A4 Avant"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Baujahr (optional)</label>
                <input
                  name="year"
                  defaultValue={editingVehicle?.year || ''}
                  placeholder="z.B. 2020"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Notizen / Spezifikationen (optional)</label>
                <textarea
                  name="notes"
                  rows="2"
                  defaultValue={editingVehicle?.notes || ''}
                  placeholder="z.B. Motoröl 5W-30, Reifengröße 225/45 R17"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VORLAGE FORMULAR --- */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Titel der Vorlage *</label>
                <input
                  required
                  name="title"
                  defaultValue={editingTemplate?.title || ''}
                  placeholder="z.B. Getriebeöl-Service"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Beschreibung</label>
                <input
                  name="description"
                  defaultValue={editingTemplate?.description || ''}
                  placeholder="Kurze Übersicht über die Arbeiten"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Icon</label>
                <select
                  name="icon"
                  defaultValue={editingTemplate?.icon || 'wrench'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="wrench">Schraubenschlüssel (Inspektion)</option>
                  <option value="disc">Reifen / Rad</option>
                  <option value="shield">Sicherheit / Bremsen</option>
                  <option value="droplet">Öl / Flüssigkeit</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Checklisten-Punkte (Ein Punkt pro Zeile) *
                </label>
                <textarea
                  required
                  name="itemsStr"
                  rows="6"
                  defaultValue={editingTemplate ? editingTemplate.items.map(i => i.text).join('\n') : ''}
                  placeholder={'Altöl ablassen\nNeuen Filter einbauen\nÖl auffüllen'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: BERICHT / DRUCK-ANSICHT --- */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Service-Protokoll</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ×
              </button>
            </div>

            {/* Printable Area */}
            <div className="space-y-4 text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block">Fahrzeug:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedReport.vehicle.brand || selectedReport.vehicle.model 
                      ? `${selectedReport.vehicle.brand} ${selectedReport.vehicle.model}`.trim() 
                      : selectedReport.vehicle.licensePlate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kennzeichen:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedReport.vehicle.licensePlate}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block">Kilometerstand:</span>
                  <span className="font-semibold text-slate-800">{parseInt(selectedReport.currentMileage || 0).toLocaleString('de-DE')} km</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block">Datum:</span>
                  <span className="font-semibold text-slate-800">{selectedReport.completedDate}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">{selectedReport.templateTitle}</h4>
                <div className="space-y-1.5">
                  {selectedReport.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {item.checked ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className={item.checked ? 'text-slate-700' : 'text-amber-700 font-medium'}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.mechanicNotes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Anmerkungen:</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{selectedReport.mechanicNotes}"
                  </p>
                </div>
              )}

              {selectedReport.photos && selectedReport.photos.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-2 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-600" /> Fotodokumentation ({selectedReport.photos.length}):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.photos.map((photo) => (
                      <div key={photo.id} className="bg-white p-1.5 rounded-lg border border-slate-200 space-y-1">
                        <img src={photo.url} alt="Dokumentationsfoto" className="w-full aspect-video object-cover rounded" />
                        {photo.caption && (
                          <p className="text-[11px] text-slate-600 font-medium px-1 truncate">{photo.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Protokoll Drucken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR (MOBILE FIRST) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-4xl mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              activeTab === 'vehicles' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Car className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Fahrzeuge</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              activeTab === 'templates' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Vorlagen</span>
          </button>

          <button
            onClick={() => setActiveTab('new-service')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl relative transition ${
              activeTab === 'new-service' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Service</span>
            {activeServices.length > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              activeTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Historie</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
