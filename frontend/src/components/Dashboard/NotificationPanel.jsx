import React from 'react';
import ReactDOM from 'react-dom';
import { FiX, FiBell, FiMessageSquare, FiCalendar, FiCheckCircle, FiTrash2, FiClock } from 'react-icons/fi';
import { markAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api/notificationApi';
import { updateAppointmentStatus } from '../../api/appointmentApi';
import { toast } from 'sonner';

export default function NotificationPanel({ isOpen, onClose, notifications = [], setNotifications, fetchData, setUnreadCount }) {
    const [filter, setFilter] = React.useState('ALL');

    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    const filteredNotifications = safeNotifications.filter(n => {
        if (filter === 'UNREAD') return !n.isRead;
        if (filter === 'READ') return n.isRead;
        return true;
    });

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("CENTRAL REGISTRY SYNCHRONIZED");
        } catch (err) {
            console.error(err);
            toast.error("SYNC FAILED");
        }
    };

    const handleAppointmentAction = async (e, notification, status) => {
        e.stopPropagation();
        try {
            if (!notification.referenceId) {
                toast.error("Invalid Appointment Reference");
                return;
            }
            await updateAppointmentStatus(notification.referenceId, status);
            toast.success(`Appointment ${status.toLowerCase()}!`);

            // Mark as read after action
            handleMarkAsRead(notification.id);

            // Dispatch event to refresh schedule if needed
            window.dispatchEvent(new CustomEvent('appointmentUpdated'));
        } catch (err) {
            console.error(err);
            toast.error("Action Failed");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            const notif = safeNotifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notif && !notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (n) => {
        // Determine target page based on notification message or type
        let targetPage = 'overview';
        const msg = (n.message || '').toLowerCase();

        if (msg.includes('appointment') || n.type === 'APPOINTMENT') {
            targetPage = 'appointments';
        } else if (msg.includes('message') || n.type === 'MESSAGE') {
            targetPage = 'messages';
        } else if (msg.includes('match') || n.type === 'MATCH') {
            targetPage = 'matches';
        } else if (msg.includes('case') || msg.includes('verif')) {
            targetPage = 'cases';
        }

        // Dispatch custom event for dashboard navigation
        const event = new CustomEvent('navigateDashboard', {
            detail: { page: targetPage }
        });
        window.dispatchEvent(event);

        // Mark as read and close
        if (!n.isRead) handleMarkAsRead(n.id);
        onClose();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'MESSAGE': return <FiMessageSquare className="text-blue-400" />;
            case 'APPOINTMENT': return <FiCalendar className="text-purple-400" />;
            case 'MATCH': return <FiCheckCircle className="text-emerald-400" />;
            default: return <FiBell className="text-[#D4AF37]" />;
        }
    };

    if (!isOpen) return null;

    const unreadCount = safeNotifications.filter(n => !n.isRead).length;

    // Use Portal for z-index fix
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden flex justify-end">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="relative w-full max-w-md bg-[#080808] border-l border-[#222] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 border-b border-[#1a1a1a] bg-[#0c0c0c] relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-white font-serif tracking-tighter">Notifications</h2>
                            <div className="flex items-center gap-3 mt-4">
                                <span className="bg-[#D4AF37] text-black text-[9px] font-black px-2 py-0.5 rounded tracking-[0.1em]">
                                    {unreadCount} ACTIVE
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Live Registry Feed</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-[#151515] border border-[#222] hover:border-[#D4AF37]/50 rounded-2xl transition-all text-gray-400 hover:text-white"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="px-8 py-4 border-b border-[#111] bg-[#0a0a0a] flex items-center justify-between">
                    <div className="flex bg-[#111] p-1 rounded-xl gap-1">
                        {['ALL', 'UNREAD', 'READ'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${filter === f
                                    ? 'bg-[#D4AF37] text-black shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] hover:underline flex items-center gap-1.5"
                        >
                            Sync All
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#080808]">
                    {filteredNotifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-16 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center mb-8 border border-[#222]">
                                <FiBell size={32} className="text-gray-800" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 leading-relax">Registry Void • No protocol history detected</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#151515]">
                            {filteredNotifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-8 group relative transition-all duration-300 hover:bg-[#0c0c0c] cursor-pointer ${!n.isRead ? 'bg-[#D4AF37]/[0.02]' : ''}`}
                                >
                                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]"></div>}

                                    <div className="flex gap-6">
                                        <div className="mt-1 w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center shadow-2xl shrink-0 group-hover:border-[#D4AF37]/30 transition-colors">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-bold text-white' : 'text-gray-500 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] mt-1.5 shrink-0 animate-pulse"></div>}
                                            </div>

                                            <div className="flex items-center gap-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><FiClock size={10} /> {new Date(n.createdAt).toLocaleDateString()}</span>
                                                <span className="bg-[#111] px-2 py-0.5 rounded tracking-[0.1em]">• {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>

                                            {/* Advanced Actions */}
                                            <div className="flex gap-5 mt-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                                {!n.isRead && n.type === 'APPOINTMENT' && localStorage.getItem("role") !== "CITIZEN" ? (
                                                    <>
                                                        <button onClick={(e) => handleAppointmentAction(e, n, 'CONFIRMED')} className="text-[9px] font-black text-green-500 hover:text-green-400 uppercase tracking-[0.2em] border-b border-transparent hover:border-green-500">
                                                            Confirm
                                                        </button>
                                                        <button onClick={(e) => handleAppointmentAction(e, n, 'REJECTED')} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-[0.2em] border-b border-transparent hover:border-red-500">
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : !n.isRead && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }} className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] border-b border-transparent hover:border-[#D4AF37]">
                                                        Resolve
                                                    </button>
                                                )}

                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} className="text-[9px] font-black text-gray-600 hover:text-red-500 uppercase tracking-[0.2em] border-b border-transparent hover:border-red-500">
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#1a1a1a] bg-[#0c0c0c]">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-transparent border border-[#222] rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all shadow-xl"
                    >
                        Minimize Nexus
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
