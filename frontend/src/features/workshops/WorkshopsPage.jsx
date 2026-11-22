import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Mail, Wrench, Navigation } from 'lucide-react';
import apiClient from '../../api/client';
import { Card, Badge, Button } from '../../components/Button';

// Fix Leaflet default icon URL issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  const states = ['All', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Bihar', 'Punjab'];
  const types = ['All', 'FabLab', 'ToolLibrary', 'VillageWorkshop', 'PolytechnicMakerSpace'];

  useEffect(() => {
    fetchWorkshops();
  }, [selectedState, selectedType]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const params = {
        state: selectedState !== 'All' ? selectedState : undefined,
        type: selectedType !== 'All' ? selectedType : undefined,
      };
      const res = await apiClient.get('/workshops', { params });
      setWorkshops(res.data);
    } catch (e) {
      console.warn('Error loading workshops', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rural Makerspaces & Tool Libraries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Locate community fab labs, welding workshops, and machining hubs across India where rural innovators can build prototypes.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Facility Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 font-medium">
          Showing {workshops.length} verified rural makerspaces
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-soft relative bg-slate-100 z-10">
        <MapContainer
          center={[20.5937, 78.9629]} // Geographic center of India
          zoom={5}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {workshops.map((w) => (
            <Marker key={w.id} position={[w.latitude, w.longitude]}>
              <Popup>
                <div className="p-1 space-y-1 text-slate-800">
                  <div className="font-bold text-xs text-teal-800">{w.name}</div>
                  <div className="text-[11px] text-slate-600">{w.address}, {w.state}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Type: {w.type}</div>
                  {w.contact_phone && (
                    <div className="text-[10px] text-slate-700 font-mono mt-1">📞 {w.contact_phone}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Workshop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((w) => (
          <Card key={w.id} className="p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="teal">{w.type}</Badge>
                <span className="text-[11px] font-semibold text-slate-500">{w.state}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{w.name}</h3>
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{w.address}, {w.city_village} - {w.pincode}</span>
              </p>

              {w.available_tools && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Available Machinery & Tools
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {w.available_tools.map((tool, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {w.contact_phone ? (
                <a href={`tel:${w.contact_phone}`} className="flex items-center gap-1 text-teal-700 font-semibold hover:underline">
                  <Phone className="w-3.5 h-3.5" /> {w.contact_phone}
                </a>
              ) : (
                <span className="text-slate-400">Walk-in Hub</span>
              )}

              <a
                href={`https://maps.google.com/?q=${w.latitude},${w.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <Navigation className="w-3.5 h-3.5" /> Directions
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkshopsPage;
