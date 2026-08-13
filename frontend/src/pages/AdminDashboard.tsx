import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Trash2, Shield, LogOut, Search, CheckCircle, AlertTriangle, Edit2, X, Download, Loader2, ClipboardList, Menu } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { userService } from "../services/userService";
import { reportService } from "../services/reportService";
import { formatUsd, formatTokenCount } from "../services/aiUsageService";
import { User } from "../types";

export default function AdminDashboard() {
  const { handleLogout, currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      showToast("Failed to load users from backend.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    if (currentUser?.id === userId) {
      alert("You cannot delete your own account.");
      return;
    }
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast("User deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete user.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await userService.updateUser(editingUser.id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        role: editingUser.role
      });
      await loadData();
      setEditingUser(null);
      showToast(
        editingUser.role === 'doctor'
          ? 'User promoted to doctor successfully.'
          : 'User profile updated successfully.'
      );
    } catch (error) {
      console.error("Update error:", error);
      showToast("Failed to update user profile.");
    }
  };

  const handlePromoteToDoctor = async (user: User) => {
    if (user.role === 'doctor') return;
    try {
      await userService.updateUser(user.id, { role: 'doctor' });
      await loadData();
      showToast(`${user.firstName} ${user.lastName} is now a doctor.`);
    } catch (error) {
      console.error("Promote error:", error);
      showToast("Failed to promote user to doctor.");
    }
  };


  const handleDownloadPDF = async (user: User) => {
    setDownloadingId(user.id);
    setToast("We are preparing the report... Please wait.");
    try {
      const fileName = `Clinical_Report_${user.id}.pdf`;
      await reportService.downloadReport(user.id, fileName);
      showToast("PDF report downloaded successfully.");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Failed to download PDF report.");
    } finally {
      setDownloadingId(null);
    }
  };

  const roleBadge = (role: User["role"]) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700",
      doctor: "bg-blue-100 text-blue-700",
      user: "bg-green-100 text-green-700",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarContent = (
    <>
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Shield className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight">Admin Panel</span>
        </div>

        <div className="flex flex-col gap-2 px-3">
          <div className="px-4 py-3 rounded-xl flex items-center gap-3 bg-blue-50 text-blue-700 font-semibold shadow-sm">
            <Users size={18} />
            <span>User Directory</span>
          </div>
          <Link
            to="/doctor"
            onClick={() => setSidebarOpen(false)}
            className="px-4 py-3 rounded-xl flex items-center gap-3 text-cyan-700 hover:bg-cyan-50 font-semibold transition-all"
          >
            <ClipboardList size={18} />
            <span>Clinical Panel</span>
          </Link>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="mb-4 px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Logged in as</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              {currentUser?.firstName?.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-700 truncate">{currentUser?.firstName}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium active:scale-95"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col md:flex-row">
      {toast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 z-50 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                  <input
                    type="text" required
                    value={editingUser.firstName}
                    onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                  <input
                    type="text" required
                    value={editingUser.lastName}
                    onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email (Read-only)</label>
                <input
                  type="text" disabled
                  value={editingUser.email}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Account Role</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="user">User (Patient)</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-2 ml-1">
                  New signups are always patients. Promote trusted users to Doctor here.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Shield className="text-white" size={18} />
          </div>
          <span className="font-bold text-sm text-gray-800 tracking-tight truncate">Admin Panel</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-end p-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white/70 backdrop-blur-xl border-r flex-col shadow-xl shrink-0">
        {sidebarContent}
      </aside>

      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registered Users</h1>
            <p className="text-gray-500 text-sm mt-1">Manage accounts, promote users to doctors, and download reports.</p>
          </div>
          <div className="relative max-w-md w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-500 text-sm font-medium">Synchronizing with server...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Users size={32} />
              </div>
              <h3 className="text-gray-900 font-bold">No Users Found</h3>
              <p className="text-gray-500 text-sm mt-1">We couldn't find any users matching your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <td className="px-6 py-4">User Details</td>
                    <td className="px-6 py-4">AI Usage</td>
                    <td className="px-6 py-4">Role</td>
                    <td className="px-6 py-4 text-right">Actions</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => {
                    const isMe = currentUser?.id === user.id;
                    const isPatient = user.role === 'user';
                    const isDownloading = downloadingId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold shrink-0">
                              {user.firstName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {user.firstName} {user.lastName}
                                {isMe && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase font-black">Admin</span>}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.aiUsage ? (
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-bold text-gray-800">In:</span> {formatTokenCount(user.aiUsage.tokens.input)} · {formatUsd(user.aiUsage.costs.input)}</p>
                              <p><span className="font-bold text-gray-800">Out:</span> {formatTokenCount(user.aiUsage.tokens.output)} · {formatUsd(user.aiUsage.costs.output)}</p>
                              <p className="font-bold text-blue-700">Total: {formatUsd(user.aiUsage.costs.total)}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No usage yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {roleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {isPatient && (
                              <button
                                onClick={() => void handlePromoteToDoctor(user)}
                                title="Promote to doctor"
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-100 transition-all"
                              >
                                Make Doctor
                              </button>
                            )}

                            {isPatient && user.reportGeneratable && (
                              <button
                                onClick={() => handleDownloadPDF(user)}
                                disabled={isDownloading}
                                title="Download professional PDF report"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all shadow-sm disabled:bg-blue-400"
                              >
                                {isDownloading ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Download size={14} />
                                )}
                                <span>PDF</span>
                              </button>
                            )}

                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-blue-100"
                              title="Edit user profile"
                            >
                              <Edit2 size={18} />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isMe}
                              title={isMe ? "Security restriction" : "Delete user profile"}
                              className={`p-2.5 rounded-xl transition-all ${isMe
                                ? "text-gray-200 cursor-not-allowed"
                                : "text-red-500 hover:bg-red-50 hover:text-red-700 active:scale-95 border border-transparent hover:border-100"
                                }`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-600 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <AlertTriangle size={32} className="text-blue-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Admin Privileges</h3>
              <p className="text-blue-100 text-sm mt-1 max-w-xl">
                You have full control over the user directory. Only generate reports for users who have given consent and have active session data. Account deletions are immediate and permanent.
              </p>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
