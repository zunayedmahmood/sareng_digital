'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import hrmService from '@/services/hrmService';
import { 
  Calendar, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function PayrollPage() {
  const { selectedStoreId } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [payingEmployeeId, setPayingEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedStoreId) {
      loadSalarySheet();
    }
  }, [selectedStoreId, selectedMonth]);

  const loadSalarySheet = async () => {
    setIsLoading(true);
    try {
      const data = await hrmService.getMonthlySalarySheet({
        store_id: selectedStoreId!,
        month: selectedMonth
      });
      if (data && data.sheet) {
        setSheetData(data.sheet);
      } else {
        setSheetData([]);
      }
    } catch (error) {
      console.error('Failed to load salary sheet:', error);
      toast.error('Failed to load payroll data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySalary = async (employeeId: number) => {
    if (!window.confirm('Are you sure you want to mark this salary as paid? This action cannot be reversed and will apply all unapplied fines and rewards for this month.')) {
      return;
    }

    setPayingEmployeeId(employeeId);
    try {
      const response = await hrmService.payMonthlySalary({
        employee_id: employeeId,
        store_id: selectedStoreId!,
        month: selectedMonth
      });
      
      if (response.success) {
        toast.success(response.message || 'Salary marked as paid.');
        loadSalarySheet(); // Refresh fully
      } else {
        toast.error(response.message || 'Failed to pay salary.');
      }
    } catch (error: any) {
      console.error('Error paying salary:', error);
      toast.error(error.response?.data?.message || 'Error executing payment.');
    } finally {
      setPayingEmployeeId(null);
    }
  };

  const filteredSheet = sheetData.filter((item: any) => 
    item.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedStoreId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Store Selected</h3>
        <p className="text-gray-500 dark:text-gray-400">Please select a store to manage payroll.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-black focus:border-black dark:bg-gray-700 dark:text-white"
            />
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-black focus:border-black dark:bg-gray-700 dark:text-white"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold text-right">Basic Salary</th>
                <th className="px-6 py-4 font-semibold text-right text-emerald-600">Rewards</th>
                <th className="px-6 py-4 font-semibold text-right text-emerald-600">Overtime</th>
                <th className="px-6 py-4 font-semibold text-right text-red-600">Fines</th>
                <th className="px-6 py-4 font-semibold text-right text-red-600">Late Fees</th>
                <th className="px-6 py-4 font-semibold text-right">Net Payable</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
                      Loading salary sheet...
                    </div>
                  </td>
                </tr>
              ) : filteredSheet.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No active employees found for this month.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSheet.map((row) => (
                  <tr key={row.employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {row.employee.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.employee.employee_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
                      Tk. {Number(row.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-emerald-600 font-medium">
                      +{(Number(row.rewards) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-emerald-600 font-medium">
                      +{(Number(row.overtime_pay) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-red-600 font-medium">
                      -{(Number(row.fines) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-red-600 font-medium">
                      -{(Number(row.late_fees) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white text-base">
                      Tk. {Number(row.net_payable).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {row.is_paid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handlePaySalary(row.employee.id)}
                        disabled={row.is_paid || payingEmployeeId === row.employee.id}
                        className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          row.is_paid
                            ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                            : 'border-transparent text-white bg-black hover:bg-gray-800 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-white'
                        }`}
                      >
                        {payingEmployeeId === row.employee.id ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-black dark:border-t-transparent" />
                            Processing...
                          </>
                        ) : row.is_paid ? (
                          'Settled'
                        ) : (
                          'Mark as Paid'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
