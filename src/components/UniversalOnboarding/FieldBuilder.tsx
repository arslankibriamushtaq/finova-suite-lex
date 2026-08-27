import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Lock, 
  Eye, 
  Type, 
  Calendar, 
  Hash, 
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  CheckCircle2,
  FileSearch,
  Fingerprint
} from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface FieldBuilderProps {
  selectedStep?: any;
}

const FieldBuilder: React.FC<FieldBuilderProps> = ({ selectedStep }) => {
  // Dynamic fields state based on user provided JSON structure
  const [fields, setFields] = useState([
    {
      "key": "cnic_number",
      "label": "CNIC Number",
      "type": "TEXT",
      "required": true,
      "isPii": true,
      "action": {
        "hasButton": true,
        "buttonLabel": "Verify NADRA",
        "apiUrl": "http://kyc-adapter/api/v1/pk/nadra/verify",
        "apiMethod": "POST"
      },
      "order": 1
    },
    {
      "key": "cnic_front_pic",
      "label": "Scan CNIC Front",
      "type": "DOCUMENT_SCAN",
      "required": true,
      "isPii": false,
      "action": {
        "hasButton": false,
        "buttonLabel": null,
        "apiUrl": null,
        "apiMethod": null
      },
      "order": 2
    },
    {
      "key": "date_of_birth",
      "label": "Date of Birth",
      "type": "DATE_PICKER",
      "required": true,
      "isPii": false,
      "action": {
        "hasButton": false,
        "buttonLabel": null,
        "apiUrl": null,
        "apiMethod": null
      },
      "order": 3
    }
  ]);

  const fieldTypes = ['TEXT', 'NUMBER', 'DOCUMENT_SCAN', 'SELFIE_LIVENESS', 'DATE_PICKER', 'OTP_SMS', 'DROP_DOWN'];

  const updateField = (index: number, key: string, value: any) => {
    const newFields: any = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const updateAction = (index: number, key: string, value: any) => {
    const newFields: any = [...fields];
    newFields[index].action[key] = value;
    setFields(newFields);
  };

  if (!selectedStep) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
         <div className="p-8 bg-blue-50 rounded-full text-blue-600 animate-pulse">
            <Workflow className="w-16 h-16" />
         </div>
         <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Step Selected</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Please select a step from the Flow Builder tab to configure its fields.</p>
         </div>
         <Button className="rounded-2xl h-12 px-8 font-black bg-slate-900 text-white">Go to Flow Builder</Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Fingerprint className="w-6 h-6 text-blue-600" />
             Fields for <span className="text-blue-600">{selectedStep.stepName}</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Define regional input requirements and external service triggers for this step.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest text-slate-400">
             Import JSON
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5 me-2" />
            Append Field
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Field Details</TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security & Req</TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">External Action</TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-end">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.key} className="group hover:bg-blue-50/10 transition-all border-b border-slate-50 last:border-0">
                <TableCell className="px-8 py-8">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-white shadow-sm transition-all border border-slate-100 mt-1">
                      {field.type.includes('SCAN') ? <FileSearch className="w-6 h-6" /> : <Type className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1.5 flex-1">
                       <input 
                        type="text" 
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        className="font-black text-slate-900 block bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-base w-full"
                       />
                       <div className="flex items-center gap-2">
                          <code className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">KEY: {field.key}</code>
                          <select 
                            value={field.type}
                            onChange={(e) => updateField(index, 'type', e.target.value)}
                            className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest border-none outline-none cursor-pointer"
                          >
                            {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                       </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-8 py-8">
                   <div className="flex gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => updateField(index, 'isPii', !field.isPii)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ${
                            field.isPii ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${
                            field.isPii ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${field.isPii ? 'text-blue-600' : 'text-slate-400'}`}>
                          {field.isPii ? 'PII VAULT' : 'PUBLIC'}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => updateField(index, 'required', !field.required)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ${
                            field.required ? 'bg-slate-900' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${
                            field.required ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${field.required ? 'text-slate-900' : 'text-slate-400'}`}>
                          {field.required ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                      </div>
                   </div>
                </TableCell>

                <TableCell className="px-8 py-8">
                   {field.action.hasButton ? (
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all">
                        <div className="flex items-center gap-2 mb-2">
                           <Zap className="w-3.5 h-3.5 text-amber-500" />
                           <input 
                            type="text" 
                            value={field.action.buttonLabel || ''}
                            onChange={(e) => updateAction(index, 'buttonLabel', e.target.value)}
                            className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-transparent border-none focus:outline-none w-full"
                           />
                        </div>
                        <input 
                          type="text" 
                          value={field.action.apiUrl || ''}
                          onChange={(e) => updateAction(index, 'apiUrl', e.target.value)}
                          className="text-[10px] font-mono text-slate-400 bg-transparent border-none focus:outline-none w-full mb-1"
                        />
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{field.action.apiMethod}</span>
                           <button 
                            onClick={() => updateAction(index, 'hasButton', false)}
                            className="text-[9px] font-black text-red-400 uppercase hover:text-red-600"
                           >
                            Remove
                           </button>
                        </div>
                     </div>
                   ) : (
                     <Button 
                      variant="ghost" 
                      onClick={() => {
                         updateAction(index, 'hasButton', true);
                         updateAction(index, 'buttonLabel', 'New Action');
                         updateAction(index, 'apiUrl', 'https://api.hook');
                         updateAction(index, 'apiMethod', 'POST');
                      }}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 h-10 border border-dashed border-slate-200 rounded-xl px-4"
                     >
                       + Configure Trigger
                     </Button>
                   )}
                </TableCell>

                <TableCell className="px-8 py-8 text-end">
                   <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-slate-100">
                        <Settings className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setFields(fields.filter(f => f.key !== field.key))}
                        className="rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-12 flex justify-end gap-4">
         <Button variant="outline" className="rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
            Discard Changes
         </Button>
         <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-14 font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
            Save Schema Configuration
         </Button>
      </div>
    </div>
  );
};

export default FieldBuilder;
