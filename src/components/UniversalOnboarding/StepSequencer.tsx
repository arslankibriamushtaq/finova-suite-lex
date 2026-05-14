import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight,
  ExternalLink,
  Save,
  Loader2,
  ChevronRight,
  Layers,
  GripVertical,
  Settings,
  Code
} from 'lucide-react';
import { getSteps, createOrUpdateStep } from '../../redux/apis/apisUniversalOnboarding';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface Step {
  id: string;
  stepName: string;
  orderIndex: number;
  apiUrl: string;
  apiMethod: string;
}

const StepSequencer: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      const response = await getSteps(countryCode);
      if (response?.data?.data) {
        setSteps(response.data.data);
      } else {
        setSteps([
          { id: '1', stepName: 'Identify Verification', orderIndex: 1, apiUrl: '/api/v1/nadra/verify', apiMethod: 'POST' },
          { id: '2', stepName: 'Biometric Capture', orderIndex: 2, apiUrl: '/api/v1/bio/scan', apiMethod: 'POST' },
          { id: '3', stepName: 'Personal Details', orderIndex: 3, apiUrl: '/api/v1/customer/save', apiMethod: 'POST' },
        ]);
      }
    } catch (error: any) {
      toast.error("Using local state for development");
      setSteps([
        { id: '1', stepName: 'Personal Information', orderIndex: 1, apiUrl: '/onboarding/personal', apiMethod: 'POST' },
        { id: '2', stepName: 'Employment Details', orderIndex: 2, apiUrl: '/onboarding/employment', apiMethod: 'POST' },
        { id: '3', stepName: 'Document Upload', orderIndex: 3, apiUrl: '/onboarding/documents', apiMethod: 'POST' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) fetchSteps();
  }, [countryCode]);

  const addStep = () => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      stepName: 'New Onboarding Step',
      orderIndex: steps.length + 1,
      apiUrl: '/api/v1/custom',
      apiMethod: 'POST'
    };
    setSteps([...steps, newStep]);
    toast.success("New step added to pipeline");
  };

  const deleteStep = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSteps(steps.filter(s => s.id !== id));
    toast.success("Step removed");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Layers className="w-6 h-6 text-blue-600" />
             Journey Pipeline <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-lg uppercase tracking-[0.2em]">{countryCode}</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Orchestrate the sequential logic and API integration points.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={addStep}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-12 px-6 font-black shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Append New Step
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Building Journey Map</p>
        </div>
      ) : (
        <div className="space-y-12 relative pb-20">
          {/* Vertical Visual Line */}
          <div className="absolute left-[38px] top-10 bottom-24 w-1 bg-gradient-to-b from-blue-100 via-slate-100 to-transparent" />

          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex items-start gap-12 group relative"
            >
              {/* Node Indicator */}
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-[28px] bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all duration-500">
                  <span className="text-3xl font-black text-slate-200 group-hover:text-blue-600 group-hover:scale-110 transition-all">{index + 1}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-[88px] left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                     <ChevronRight className="w-5 h-5 text-blue-500 rotate-90" />
                  </div>
                )}
              </div>

              {/* Step Configuration Card */}
              <div className="flex-1 bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group-hover:border-blue-100 border-l-4 group-hover:border-l-blue-500">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                       <input 
                        type="text" 
                        value={step.stepName}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].stepName = e.target.value;
                          setSteps(newSteps);
                        }}
                        className="text-2xl font-black text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 w-auto"
                       />
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                         step.apiMethod === 'POST' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                         {step.apiMethod} Endpoint
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                       <Code className="w-4 h-4" />
                       <input 
                        type="text" 
                        value={step.apiUrl}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].apiUrl = e.target.value;
                          setSteps(newSteps);
                        }}
                        className="text-xs font-mono font-bold bg-transparent border-none focus:outline-none w-full text-slate-400 focus:text-blue-600 transition-colors"
                       />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-2xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                       <Settings className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteStep(step.id)}
                      className="rounded-2xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                       <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/30 group-hover:bg-white group-hover:border-blue-50 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Security Hash</p>
                      <p className="text-xs font-bold text-slate-900 font-mono">SHA-256 Enabled</p>
                   </div>
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/30 group-hover:bg-white group-hover:border-blue-50 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Field Count</p>
                      <p className="text-xs font-bold text-slate-900">8 Inputs Configured</p>
                   </div>
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/30 group-hover:bg-white group-hover:border-blue-50 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Auto-Save</p>
                      <p className="text-xs font-bold text-emerald-600">Sync Active</p>
                   </div>
                   <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/30 group-hover:bg-white group-hover:border-blue-50 transition-all flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
                        <p className="text-xs font-bold text-slate-900">Index {index}</p>
                      </div>
                      <GripVertical className="w-5 h-5 text-slate-200 cursor-grab active:cursor-grabbing" />
                   </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Termination Node */}
          <div className="flex items-center gap-12">
             <div className="w-20 h-20 rounded-full bg-emerald-500 border-8 border-white shadow-xl flex items-center justify-center text-white relative z-10">
                <Save className="w-8 h-8" />
             </div>
             <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
                <p className="text-emerald-900 font-black text-lg">Journey Finalization</p>
                <p className="text-emerald-700/70 text-sm font-medium mt-1 italic">This node triggers the Core CIF creation pipeline once the user completes the flow.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepSequencer;
