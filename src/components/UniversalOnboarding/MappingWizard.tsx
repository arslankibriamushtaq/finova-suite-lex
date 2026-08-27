import React, { useState } from 'react';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Search, 
  Link2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MappingWizard: React.FC = () => {
  const [mappings, setMappings] = useState([
    { source: 'customer.full_name', target: 'cif.name', status: 'mapped' },
    { source: 'identity.id_number', target: 'cif.national_id', status: 'mapped' },
    { source: 'contact.mobile', target: 'cif.phone_primary', status: 'unmapped' },
    { source: 'employment.salary', target: 'cif.monthly_income', status: 'mapped' },
  ]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Response Data Mapping</h2>
          <p className="text-slate-500 text-sm font-medium">Map external JSON fields to internal Core Banking (CIF) schemas.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 relative">
        {/* Source JSON Schema */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Code className="w-5 h-5 text-amber-600" />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">External Provider Schema</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 font-mono text-sm overflow-hidden relative shadow-xl">
            <div className="absolute top-6 right-8 text-slate-600 text-[10px] font-black uppercase tracking-widest select-none">JSON Definition</div>
            <pre className="text-amber-400/90 leading-relaxed">
{`{
  "customer": {
    "`}<span className="text-white underline decoration-amber-500/50 underline-offset-4">full_name</span>{`": "string",
    "email": "string"
  },
  "identity": {
    "`}<span className="text-white underline decoration-amber-500/50 underline-offset-4">id_number</span>{`": "string"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Target CIF Schema */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Core Banking (CIF) Schema</span>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-8 font-mono text-sm overflow-hidden relative shadow-sm h-full">
             <div className="absolute top-6 right-8 text-slate-300 text-[10px] font-black uppercase tracking-widest select-none">Database Table</div>
             <div className="space-y-4 pt-4">
                {[
                  { name: 'full_name', type: 'VARCHAR(255)', active: true },
                  { name: 'national_id', type: 'VARCHAR(50)', active: true },
                  { name: 'phone_primary', type: 'VARCHAR(20)', active: false },
                  { name: 'email_address', type: 'VARCHAR(100)', active: false },
                ].map((col) => (
                  <div key={col.name} className={`flex justify-between items-center p-3 rounded-xl border ${
                    col.active ? 'bg-red-50 border-red-100 text-red-900' : 'bg-slate-50 border-slate-100 text-slate-400'
                  } transition-all hover:scale-[1.02] cursor-pointer`}>
                    <span className="font-black">{col.name}</span>
                    <span className="text-[10px] opacity-60 uppercase font-black tracking-widest">{col.type}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Connector SVG placeholder logic */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center shadow-xl z-20">
          <Link2 className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Mapping List */}
      <div className="mt-16 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Validated Mapping Pipeline</h3>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">3 Active Rules</span>
        </div>
        
        {mappings.map((m, i) => (
          <div 
            key={i}
            className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[28px] hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
          >
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Code className="w-5 h-5" />
                </div>
                <span className="text-sm font-black text-slate-900">{m.source}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                 <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-all duration-500" />
                 <span className="text-[8px] font-black text-slate-300 uppercase">Map To</span>
              </div>

              <div className="flex items-center gap-4 text-end">
                <span className="text-sm font-black text-slate-900">{m.target}</span>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="w-px h-10 bg-slate-100" />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${
              m.status === 'mapped' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {m.status === 'mapped' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-[11px] font-black uppercase tracking-widest">
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MappingWizard;
