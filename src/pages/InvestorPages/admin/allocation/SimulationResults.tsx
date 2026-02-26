import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Download,
  Share,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Settings
} from 'lucide-react';

// Mock simulation data
const simulationResults = {
  id: 'SIM-2024-001',
  strategyId: 'STR-001',
  strategyName: 'High Risk Preferred V2',
  executedAt: '2024-01-22T15:30:00Z',
  status: 'completed',
  inputParams: {
    useLivePools: true,
    selectedLoans: ['LOAN-001', 'LOAN-002', 'LOAN-003'],
    totalLoanAmount: 15000000,
    simulationDate: '2024-01-22'
  },
  summary: {
    totalAllocated: 14250000,
    allocationSuccess: 95,
    investorsUsed: 12,
    avgAllocationSize: 1187500,
    expectedReturn: 13.2,
    riskScore: 'Medium-High'
  },
  allocations: [
    {
      loanId: 'LOAN-001',
      loanAmount: 5000000,
      customerRisk: 'High',
      productType: 'MSME Working Capital',
      allocations: [
        { investorId: 'INV-001', investorName: 'Al-Rajhi Capital', amount: 2000000, percentage: 40, riskTolerance: 'Aggressive', expectedReturn: 14.5 },
        { investorId: 'INV-007', investorName: 'Jadwa Investment', amount: 1500000, percentage: 30, riskTolerance: 'Aggressive', expectedReturn: 14.2 },
        { investorId: 'INV-012', investorName: 'SNB Capital', amount: 1500000, percentage: 30, riskTolerance: 'Balanced', expectedReturn: 13.8 }
      ],
      fallbackUsed: false,
      warnings: []
    },
    {
      loanId: 'LOAN-002',
      loanAmount: 7500000,
      customerRisk: 'Medium',
      productType: 'Auto Loan V2',
      allocations: [
        { investorId: 'INV-003', investorName: 'Saudi Fransi Capital', amount: 3000000, percentage: 40, riskTolerance: 'Balanced', expectedReturn: 11.2 },
        { investorId: 'INV-008', investorName: 'Riyad Capital', amount: 2250000, percentage: 30, riskTolerance: 'Balanced', expectedReturn: 11.5 },
        { investorId: 'INV-015', investorName: 'Alinma Investment', amount: 2250000, percentage: 30, riskTolerance: 'Conservative', expectedReturn: 10.8 }
      ],
      fallbackUsed: false,
      warnings: ['Investor INV-015 approaching exposure limit']
    },
    {
      loanId: 'LOAN-003',
      loanAmount: 2500000,
      customerRisk: 'Low',
      productType: 'POS Loan V1',
      allocations: [
        { investorId: 'INV-005', investorName: 'Gulf Capital', amount: 1250000, percentage: 50, riskTolerance: 'Conservative', expectedReturn: 8.5 },
        { investorId: 'INV-011', investorName: 'Alkhabeer Capital', amount: 1000000, percentage: 40, riskTolerance: 'Conservative', expectedReturn: 8.2 }
      ],
      fallbackUsed: true,
      fallbackReason: 'Insufficient Conservative investors, allocated remaining 10% to manual queue',
      warnings: ['250k SAR requires manual allocation']
    }
  ],
  riskAnalysis: {
    portfolioRisk: 'Medium-High',
    diversificationScore: 85,
    concentrationRisk: 'Low',
    liquidityRisk: 'Medium'
  },
  warnings: [
    'Investor INV-015 (Alinma Investment) exposure will reach 78% of limit',
    'LOAN-003 requires 250k SAR manual allocation',
    'High risk allocation increased by 15% from target'
  ]
};

const investorExposureData = [
  { investor: 'Al-Rajhi Capital', currentExposure: 45, newExposure: 52, limit: 60, status: 'safe' },
  { investor: 'Jadwa Investment', currentExposure: 32, newExposure: 38, limit: 50, status: 'safe' },
  { investor: 'Saudi Fransi Capital', currentExposure: 28, newExposure: 35, limit: 45, status: 'safe' },
  { investor: 'Alinma Investment', currentExposure: 68, newExposure: 78, limit: 80, status: 'warning' },
  { investor: 'Gulf Capital', currentExposure: 22, newExposure: 28, limit: 40, status: 'safe' }
];

export default function SimulationResults() {
  const { strategyId } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const isGlobal = searchParams.get('global') === 'true';

  const [selectedView, setSelectedView] = useState('summary');
  const [committing, setCommitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleCommitAllocation = async () => {
    if (confirm('Are you sure you want to commit this allocation? This action cannot be undone.')) {
      setCommitting(true);
      // Simulate API call
      setTimeout(() => {
        alert('Allocation committed successfully!');
        setCommitting(false);
      }, 2000);
    }
  };

  const handleExportResults = () => {
    alert('Exporting simulation results...');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={isGlobal ? "/admin/allocation" : `/admin/allocation/strategies/${strategyId}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isGlobal ? 'Back to Dashboard' : 'Back to Strategy'}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Simulation Results</h1>
              <p className="text-gray-600">
                {isPreview ? 'Strategy Preview' : isGlobal ? 'Global Simulation' : simulationResults.strategyName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportResults}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            {!isPreview && (
              <button
                onClick={handleCommitAllocation}
                disabled={committing}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {committing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {committing ? 'Committing...' : 'Commit Allocation'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-black mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Simulation {isPreview ? 'Preview' : 'Completed Successfully'}
              </h3>
              <p className="text-sm text-gray-800">
                {isPreview ? 'This is a preview of your strategy configuration' : 
                 `Executed on ${new Date(simulationResults.executedAt).toLocaleString()}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-900">Simulation ID</div>
            <div className="text-sm text-gray-800">{simulationResults.id}</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Total Allocated</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(simulationResults.summary.totalAllocated)}</p>
            <p className="text-xs text-gray-500">
              {simulationResults.summary.allocationSuccess}% allocation success
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Investors Used</h3>
            <Users className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{simulationResults.summary.investorsUsed}</p>
            <p className="text-xs text-gray-500">
              Avg: {formatCurrency(simulationResults.summary.avgAllocationSize)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Expected Return</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{simulationResults.summary.expectedReturn}%</p>
            <p className="text-xs text-gray-500">Weighted average</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Risk Score</h3>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">{simulationResults.summary.riskScore}</p>
            <p className="text-xs text-gray-500">Portfolio risk level</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'summary', label: 'Allocation Summary', icon: BarChart3 },
              { key: 'details', label: 'Loan Details', icon: FileText },
              { key: 'exposure', label: 'Investor Exposure', icon: Users },
              { key: 'warnings', label: 'Warnings & Risks', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedView === tab.key
                    ? 'border-gray-700 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {selectedView === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Allocation Pie Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Allocation by Risk Level</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {[
                { risk: 'High Risk', amount: 5000000, percentage: 35.1, color: 'bg-red-500' },
                { risk: 'Medium Risk', amount: 7500000, percentage: 52.6, color: 'bg-yellow-500' },
                { risk: 'Low Risk', amount: 1750000, percentage: 12.3, color: 'bg-green-500' }
              ].map((item) => (
                <div key={item.risk} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.risk}</span>
                    <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Allocations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Investor Allocations</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {simulationResults.allocations
                .flatMap(loan => loan.allocations)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((allocation, index) => (
                  <div key={`${allocation.investorId}-${index}`} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allocation.investorName}</div>
                      <div className="text-xs text-gray-500">{allocation.riskTolerance} • {allocation.expectedReturn}% return</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(allocation.amount)}</div>
                      <div className="text-xs text-gray-500">{allocation.percentage}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'details' && (
        <div className="space-y-6">
          {simulationResults.allocations.map((loan) => (
            <div key={loan.loanId} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{loan.loanId}</h3>
                  <p className="text-sm text-gray-600">{loan.productType} • {loan.customerRisk} Risk • {formatCurrency(loan.loanAmount)}</p>
                </div>
                <div className="text-right">
                  {loan.fallbackUsed && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                      Fallback Used
                    </div>
                  )}
                  {loan.warnings.length > 0 && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {loan.warnings.length} Warning(s)
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Risk Tolerance</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Expected Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loan.allocations.map((allocation) => (
                      <tr key={allocation.investorId}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{allocation.investorName}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(allocation.amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{allocation.percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            allocation.riskTolerance === 'Aggressive' ? 'bg-red-100 text-red-800' :
                            allocation.riskTolerance === 'Balanced' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {allocation.riskTolerance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{allocation.expectedReturn}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loan.fallbackUsed && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Fallback:</strong> {loan.fallbackReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedView === 'exposure' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Investor Exposure Analysis</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Exposure</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">New Exposure</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limit</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilization</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investorExposureData.map((investor) => (
                  <tr key={investor.investor}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{investor.investor}</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600">{investor.currentExposure}%</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">{investor.newExposure}%</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600">{investor.limit}%</td>
                    <td className="px-4 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            investor.newExposure / investor.limit > 0.9 ? 'bg-red-500' :
                            investor.newExposure / investor.limit > 0.75 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(investor.newExposure / investor.limit) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((investor.newExposure / investor.limit) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        investor.status === 'safe' ? 'bg-green-100 text-green-800' :
                        investor.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedView === 'warnings' && (
        <div className="space-y-4">
          {simulationResults.warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Warning {index + 1}</h4>
                  <p className="text-sm text-yellow-700 mt-1">{warning}</p>
                </div>
              </div>
            </div>
          ))}
          
          {simulationResults.warnings.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h4 className="text-sm font-medium text-green-900">No Warnings</h4>
              <p className="text-sm text-green-700 mt-1">The simulation completed without any warnings or risks detected.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
