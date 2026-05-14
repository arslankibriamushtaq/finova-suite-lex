import React, { useEffect, useState } from 'react';
import { Globe, Search, Layers, Activity, Loader2, ChevronRight, Plus } from 'lucide-react';
import { getWorkflows } from '../../redux/apis/apisUniversalOnboarding';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface Country {
  countryName: string;
  countryCode: string;
  status: string;
  stepCount?: number;
}

const CountryManager: React.FC<{ 
  onSelectCountry: (code: string) => void;
  onGoToSteps: () => void;
}> = ({ onSelectCountry, onGoToSteps }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await getWorkflows();
      if (response?.data?.data) {
        setCountries(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch workflows");
      setCountries([
        { countryName: 'Saudi Arabia', countryCode: 'SA', status: 'Active', stepCount: 12 },
        { countryName: 'Pakistan', countryCode: 'PK', status: 'Under Review', stepCount: 8 },
        { countryName: 'United Arab Emirates', countryCode: 'AE', status: 'Active', stepCount: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const filteredCountries = countries.filter(c => 
    c.countryName.toLowerCase().includes(search.toLowerCase()) || 
    c.countryCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Regional Workflows</h2>
          <p className="text-slate-500 text-sm font-medium">Select a country to manage its specific onboarding sequence.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search regions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-72"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="font-bold">Syncing workflow data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <div 
              key={country.countryCode}
              className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => { 
                onSelectCountry(country.countryCode); 
                onGoToSteps();
              }}
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0 p-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  country.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                  country.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {country.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl w-fit mb-4 group-hover:bg-blue-50 transition-colors">
                <Globe className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{country.countryName}</h3>
              <p className="text-slate-500 text-xs font-mono tracking-tighter mb-6 uppercase">Region ID: {country.countryCode}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{country.stepCount || 0} Steps</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                   Configure <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Placeholder */}
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500/50 hover:text-blue-500 transition-all cursor-pointer group">
             <Button variant="ghost" className="h-auto p-4 flex flex-col gap-2 rounded-2xl">
               <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                 <Plus className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold">Add New Region</span>
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManager;
