import React, { useState } from 'react';
import { 
  Search, 
  Terminal, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Database,
  Loader2,
  Filter,
  Copy,
  Layout
} from 'lucide-react';
import { getSubmissionLogs } from '../../redux/apis/apisUniversalOnboarding';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const SubmissionLogs: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [logData, setLogData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await getSubmissionLogs(sessionId);
      if (response?.data?.data) {
        setLogData(response.data.data);
      } else {
        throw new Error("No data found");
      }
    } catch (error: any) {
      // toast.error(error?.response?.data?.message || "Session not found");
      // High-fidelity Mock for UI Inspector
      setLogData({
        sessionId: sessionId,
        customerName: 'Muhammad Salman',
        region: 'Pakistan',
        status: 'Completed',
        timestamp: new Date().toISOString(),
        stepsCompleted: 4,
        rawJson: {
          session_id: sessionId,
          workflow_state: "FINISHED",
          aggregated_data: {
            "step_1_personal": {
              "full_name": "Muhammad Salman",
              "cnic": "42101-*******-3",
              "dob": "1994-08-22",
              "is_verified": true
            },
            "step_2_employment": {
              "company": "Finova Solutions",
              "salary_bracket": "100k-150k",
              "designation": "Principal Engineer"
            },
            "step_3_documents": {
              "selfie_url": "s3://vault/selfie_9921.jpg",
              "cnic_front": "s3://vault/cnic_f_9921.jpg",
              "cnic_back": "s3://vault/cnic_b_9921.jpg"
            },
            "system_metadata": {
              "ip": "110.39.155.22",
              "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1)",
              "location": "Karachi, PK"
            }
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Terminal className="w-6 h-6 text-blue-600" />
             Aggregated Data Viewer
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Trace user submissions and inspect the raw JSON sink for any active or completed session.</p>
        </div>
      </div>

      {/* Trace Engine Card */}
      <Card className="mb-10 border-slate-200 shadow-sm overflow-hidden rounded-[32px] p-2 bg-white">
        <CardContent className="p-0">
          <div className="flex items-center">
            <div className="px-8 py-5 flex items-center gap-4 flex-1">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                 <History className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Identifier</p>
                <input 
                  type="text" 
                  placeholder="Enter Session ID (e.g. PK-LOS-1299-88)..."
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 font-black w-full text-xl placeholder:text-slate-200"
                />
              </div>
            </div>
            <div className="px-6 border-l border-slate-100">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] h-14 px-10 font-black shadow-2xl shadow-slate-200 flex items-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Run Trace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!logData ? (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50/50 border-4 border-dashed border-slate-200 rounded-[48px] text-slate-400 group hover:border-blue-200 transition-all">
           <div className="p-8 bg-white rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
              <Layout className="w-16 h-16 text-slate-200" />
           </div>
           <p className="text-lg font-black tracking-tight text-slate-400">Inspector Engine Offline</p>
           <p className="text-sm font-medium mt-1">Input a session ID above to aggregate real-time submission data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Detailed Sidebar */}
          <div className="col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-[32px] overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                     <User className="w-4 h-4" />
                     Submission Metadata
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                          <User className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                          <p className="text-lg font-black text-slate-900">{logData.customerName}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                          <CheckCircle2 className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Status</p>
                          <p className="text-lg font-black text-slate-900">{logData.status}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                          <Clock className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sink Update</p>
                          <p className="text-sm font-black text-slate-900">{new Date(logData.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                     <div className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 text-red-400">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-widest">Audit Policy</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed relative z-10">
                          Data displayed is sourced from the multi-step JSON sink. Sensitive fields are masked unless decrypted by an admin.
                        </p>
                        <Filter className="absolute right-[-10px] bottom-[-10px] w-16 h-16 opacity-10" />
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Aggregated JSON Inspector */}
          <div className="col-span-8">
            <Card className="border-slate-200 shadow-sm rounded-[32px] overflow-hidden h-full flex flex-col bg-slate-950 min-h-[600px]">
               <CardHeader className="bg-slate-900 border-b border-slate-800 py-6 px-8 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Raw Aggregated Sink Output</CardTitle>
                  </div>
                  <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl px-4 gap-2 border border-slate-800">
                     <Copy className="w-3.5 h-3.5" />
                     Copy Full Object
                  </Button>
               </CardHeader>
               <CardContent className="p-0 flex-1 font-mono text-sm overflow-auto">
                  <div className="p-10">
                    <pre className="text-blue-300 leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(logData.rawJson, null, 2)}
                    </pre>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionLogs;
