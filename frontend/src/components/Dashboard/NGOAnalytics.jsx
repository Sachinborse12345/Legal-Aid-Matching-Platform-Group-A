import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Line, ComposedChart
} from 'recharts';
import ViewAppointmentModal from './ViewAppointmentModal';
import { toast } from 'react-toastify';
import axios from 'axios';

// API Configuration
const API_BASE_URL = "http://localhost:8080/api";

export default function NGOAnalytics({ profile }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        if (profile?.id) {
            fetchAnalytics();
        }

        const handleUpdate = () => fetchAnalytics();
        window.addEventListener('appointmentUpdated', handleUpdate);
        return () => window.removeEventListener('appointmentUpdated', handleUpdate);
    }, [profile]);

    const fetchAnalytics = async () => {
        if (!profile?.id) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/ngos/${profile.id}/analytics`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!data) return null;

    // Process Chart Data
    const monthlyData = Object.keys(data.monthlyTotal).map(month => ({
        name: month,
        Total: data.monthlyTotal[month],
        Confirmed: data.monthlyConfirmed[month],
        Pending: data.monthlyPending?.[month] || 0,
        Rejected: data.monthlyRejected?.[month] || 0
    }));

    const pieData = Object.keys(data.appointmentTypeBreakdown).map(type => ({
        name: type,
        value: data.appointmentTypeBreakdown[type]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const handleViewCalendar = () => {
        const event = new CustomEvent('navigateDashboard', {
            detail: { page: 'appointments' }
        });
        window.dispatchEvent(event);
    };

    const handleViewMessages = () => {
        const event = new CustomEvent('navigateDashboard', {
            detail: { page: 'messages' }
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="space-y-6 animate-fade-in p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">NGO Analytics Dashboard</h2>
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                    Overview
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Appointments Card */}
                <div className="bg-[#6B9080] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="font-medium">Total Appointments</span>
                        </div>
                        <div className="text-4xl font-bold mb-4">{data.totalAppointments}</div>
                        <div className="text-xs opacity-75">
                            This Month: {data.monthlyTotal[currentMonth] || 0}
                        </div>
                    </div>
                </div>

                {/* Confirmed Appointments Card */}
                <div className="bg-[#4A7C59] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="font-medium">Confirmed</span>
                        </div>
                        <div className="text-4xl font-bold mb-4">{data.confirmedAppointments}</div>
                        <div className="text-xs opacity-75">
                            This Month: {data.monthlyConfirmed[currentMonth] || 0}
                        </div>
                    </div>
                </div>

                {/* Pending Appointments Card */}
                <div className="bg-[#E9C46A] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="font-medium">Pending</span>
                        </div>
                        <div className="text-4xl font-bold mb-4">{data.pendingAppointments}</div>
                        <div className="text-xs opacity-75">
                            This Month: {data.monthlyPending?.[currentMonth] || 0}
                        </div>
                    </div>
                </div>

                {/* Rejected Appointments Card */}
                <div className="bg-red-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="font-medium">Rejected</span>
                        </div>
                        <div className="text-4xl font-bold mb-4">{data.rejectedAppointments || 0}</div>
                        <div className="text-xs opacity-75">
                            This Month: {data.monthlyRejected?.[currentMonth] || 0}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Confirmation Rate Small Card */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-lg flex flex-col justify-center items-center">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Overall Performance</h3>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-[#D4AF37] mb-1">{data.confirmationRate.toFixed(1)}%</div>
                        <div className="text-xs text-green-500 font-bold uppercase tracking-wider">Confirmation Rate</div>
                    </div>
                    <div className="mt-6 w-full bg-gray-100 dark:bg-[#333] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${data.confirmationRate}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                {/* Pie Chart */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-lg flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appointment Breakdown</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#333', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Composed Chart (Bar + Line) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-lg flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Trends (Last 6 Months)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#333', borderColor: '#333', color: '#fff' }}
                                    cursor={{ opacity: 0.1 }}
                                />
                                <Legend />
                                <Bar dataKey="Total" fill="#5B9BD5" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="Pending" fill="#E9C46A" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="Confirmed" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Appointments</h3>
                        <button
                            onClick={handleViewCalendar}
                            className="text-sm text-[#D4AF37] font-medium hover:underline"
                        >
                            View Calendar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-[#222] text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#333]">
                                {data.upcomingAppointments.length > 0 ? (
                                    data.upcomingAppointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-[#222]/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{appt.date}</td>
                                            <td className="px-6 py-4">{appt.time}</td>
                                            <td className="px-6 py-4">{appt.clientName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedAppointment(appt)}
                                                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No upcoming appointments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Client Interaction Stats / Notifications Placeholder */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] shadow-lg overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Client Interactions</h3>
                        <button
                            onClick={handleViewMessages}
                            className="text-sm text-[#D4AF37] font-medium hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        {data.recentInteractions && data.recentInteractions.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-[#333]">
                                {data.recentInteractions.map((interaction) => (
                                    <div key={interaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors flex items-start gap-3 cursor-pointer" onClick={handleViewMessages}>
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#333] flex items-center justify-center text-[#D4AF37] font-bold shrink-0">
                                            {interaction.clientName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{interaction.clientName}</h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{interaction.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{interaction.lastMessage}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col justify-center items-center text-center text-gray-500 h-full">
                                <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-sm">Recent client messages and calls will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedAppointment && (
                <ViewAppointmentModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </div>
    );
}
