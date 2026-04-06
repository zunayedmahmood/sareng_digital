'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import hrmService from '@/services/hrmService';
import RewardFineDialog from '@/components/hrm/RewardFineDialog';
import AccessControl from '@/components/AccessControl';
import { 
  Award, 
  AlertTriangle,
  Search, 
  Plus, 
  Calendar,
  MinusCircle,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';

export default function RewardsFinesPage() {
  const { selectedStoreId } = useStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    employee: any;
    editData: any;
  }>({
    isOpen: false,
    employee: null,
    editData: null
  });

  // Expandable row states
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedStoreId) {
      loadData();
    }
  }, [selectedStoreId, selectedMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await hrmService.getCumulatedRewardFine({
        store_id: selectedStoreId!,
        month: selectedMonth
      });
      setEmployees(data.rows || []);
      
      // Calculate store summary from rows
      const totalReward = data.rows?.reduce((acc: number, row: any) => acc + row.total_reward, 0) || 0;
      const totalFine = data.rows?.reduce((acc: number, row: any) => acc + row.total_fine, 0) || 0;
      
      setSummaryData({
        total_reward: totalReward,
        total_fine: totalFine,
        net: totalReward - totalFine,
        count: data.rows?.length || 0
      });
    } catch (error) {
      console.error('Failed to load rewards/fines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = async (employeeId: number) => {
    if (expandedEmployeeId === employeeId) {
      setExpandedEmployeeId(null);
      return;
    }
    setExpandedEmployeeId(employeeId);
    setIsLoadingDetails(true);
    try {
      const data = await hrmService.getRewardFineReport({
        store_id: selectedStoreId!,
        employee_id: employeeId,
        month: selectedMonth
      });
      setEmployeeDetails(data?.rows || []);
    } catch (error) {
      console.error('Failed to load employee details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filteredEmployees = employees.filter(row => 
    row.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedStoreId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <Award className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Store Selected</h3>
        <p className="text-gray-500 dark:text-gray-400">Please select a store to manage rewards and fines.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rewards & Fines Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage employee incentives and penalties.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Calendar className="w-5 h-5 text-orange-500 ml-2" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-none focus:ring-0 bg-transparent text-sm font-bold text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Summary Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Total Rewards</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">৳{(summaryData?.total_reward || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <PlusCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Total Fines</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">৳{(summaryData?.total_fine || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <MinusCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-black text-white p-6 rounded-2xl shadow-lg shadow-black/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Net Adjustment</p>
            <p className={`text-2xl font-black ${ (summaryData?.net || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ৳{(summaryData?.net || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Employee Breakdown</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-black outline-none w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Rewards (৳)</th>
                <th className="px-6 py-4">Fines (৳)</th>
                <th className="px-6 py-4">Net Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredEmployees.map((row) => (
                <React.Fragment key={row.employee.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors cursor-pointer" onClick={() => toggleRow(row.employee.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center font-bold text-amber-600">
                          {row.employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{row.employee.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{row.employee.employee_code || 'No Code'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      +৳{row.total_reward.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">
                      -৳{row.total_fine.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${row.net_adjustment >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {row.net_adjustment >= 0 ? '+' : ''}৳{row.net_adjustment.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <AccessControl roles={['super-admin', 'admin', 'branch-manager']}>
                          <button 
                            onClick={() => setDialog({ isOpen: true, employee: row.employee, editData: null })}
                            className="p-2 bg-black dark:bg-blue-600 text-white rounded-xl hover:scale-105 transition-transform"
                            title="Add Entry"
                          >
                             <Plus className="w-4 h-4" />
                          </button>
                        </AccessControl>
                        <button onClick={() => toggleRow(row.employee.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          {expandedEmployeeId === row.employee.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedEmployeeId === row.employee.id && (
                    <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                      <td colSpan={5} className="p-0 border-b border-gray-100 dark:border-gray-700">
                        <div className="p-6">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Detailed Entries ({format(new Date(selectedMonth + '-01'), 'MMMM yyyy')})</h4>
                          {isLoadingDetails ? (
                            <div className="text-center py-4 text-gray-500">Loading details...</div>
                          ) : employeeDetails.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
                                  <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Title & Notes</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {employeeDetails.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        {format(new Date(entry.entry_date), 'dd MMM, yyyy')}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${entry.entry_type === 'reward' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                          {entry.entry_type.toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <p className="font-bold text-gray-900 dark:text-white">{entry.title}</p>
                                        {entry.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.notes}</p>}
                                      </td>
                                      <td className={`px-4 py-3 font-bold ${entry.entry_type === 'reward' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        ৳{entry.amount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <AccessControl roles={['super-admin', 'admin', 'branch-manager']}>
                                          <button 
                                            onClick={() => setDialog({ isOpen: true, employee: row.employee, editData: entry })}
                                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-blue-600 dark:text-blue-400 ml-auto"
                                            title="Edit Entry"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                        </AccessControl>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                              No entries found for this month.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No reward/fine data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialog.isOpen && (
        <RewardFineDialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog({ ...dialog, isOpen: false })}
          storeId={selectedStoreId}
          employee={dialog.employee}
          onSuccess={loadData}
          editData={dialog.editData}
        />
      )}
    </div>
  );
}
