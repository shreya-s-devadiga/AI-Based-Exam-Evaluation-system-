import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Search,
  Users,
  User,
  BookOpen,
  Trash2,
  X,
  AlertTriangle,
  Filter,
  Edit2,
  Save,
  XCircle,
  Eye,
  FileText,
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  Shield,
  Download,
  Database
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [publishBatch, setPublishBatch] = useState({});
  const [deleteEmail, setDeleteEmail] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const itemsPerPage = 10;

  // Fetch data functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    } catch (err) {
      alert("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedPapers = async () => {
    try {
      setPapersLoading(true);
      const res = await API.get("/admin/published-papers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPapers(res.data);
    } catch (err) {
      alert("Failed to load published papers");
      console.error(err);
    } finally {
      setPapersLoading(false);
    }
  };

  const publishPaper = async (subjectId) => {
    const batch = publishBatch[subjectId];
    if (!batch) {
      alert("Please select a batch");
      return;
    }

    try {
      await API.put(
        `/admin/publish-paper/${subjectId}`,
        { course_batch: batch },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchPublishedPapers();
    } catch (err) {
      alert("Failed to publish paper");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPublishedPapers();
  }, []);

  // Edit functions
  const startEditing = (user) => {
    setEditingUser(user.email);
    setEditForm({ name: user.name, email: user.email });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "" });
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert("Name and email cannot be empty");
      return;
    }

    try {
      setSaveLoading(true);
      await API.put(
        `/admin/update-user/${editingUser}`,
        { name: editForm.name.trim(), email: editForm.email.trim().toLowerCase() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setUsers(prev => prev.map(user => 
        user.email === editingUser 
          ? { ...user, name: editForm.name.trim(), email: editForm.email.trim().toLowerCase() }
          : user
      ));
      
      setEditingUser(null);
      setEditForm({ name: "", email: "" });
    } catch (err) {
      alert("Failed to update user");
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await API.delete(
        `/admin/delete-user?email=${encodeURIComponent(deleteEmail.toLowerCase())}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setUsers((prev) => prev.filter((u) => u.email !== deleteEmail));
      setDeleteEmail(null);
    } catch (err) {
      alert("Failed to delete user");
      console.error(err);
    }
  };

  // Filter and pagination
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                       u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchBatch = batchFilter === "all" ||
                      (u.role === "student" && u.course_batch === batchFilter);
    return matchSearch && matchRole && matchBatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const students = users.filter((u) => u.role === "student").length;
  const teachers = users.filter((u) => u.role === "teacher").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const totalPapers = papers.length;

  // Menu items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "papers", label: "Papers", icon: <FileText size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarOpen ? '260px' : '80px',
      }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Shield size={24} />
            </div>
            {sidebarOpen && <span style={styles.logoText}>Admin Panel</span>}
          </div>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.menuItem,
                ...(activeTab === item.id ? styles.activeMenuItem : {})
              }}
            >
              <div style={styles.menuIcon}>{item.icon}</div>
              {sidebarOpen && <span style={styles.menuLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.collapseButton}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: sidebarOpen ? '260px' : '80px',
      }}>
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "users" && "User Management"}
              {activeTab === "papers" && "Published Papers"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>
          
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>AD</span>
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>Administrator</div>
                <div style={styles.userRole}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <>
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Overview</h2>
                  <p style={styles.sectionSubtitle}>System statistics and quick actions</p>
                </div>

                {/* Stats Cards - Simplified to 4 cards */}
                <div style={styles.statsGrid}>
                  <StatCard
                    title="Total Users"
                    value={users.length}
                    icon={<Users size={24} />}
                    color="#3b82f6"
                    description="Registered users in system"
                  />
                  <StatCard
                    title="Students"
                    value={students}
                    icon={<User size={24} />}
                    color="#10b981"
                    description="Active student accounts"
                  />
                  <StatCard
                    title="Teachers"
                    value={teachers}
                    icon={<BookOpen size={24} />}
                    color="#8b5cf6"
                    description="Teaching staff members"
                  />
                  <StatCard
                    title="Published Papers"
                    value={totalPapers}
                    icon={<FileText size={24} />}
                    color="#f59e0b"
                    description="Available exam papers"
                  />
                </div>

                {/* Quick Actions */}
                {/* <div style={styles.quickActions}>
                  <button 
                    onClick={() => setActiveTab("users")}
                    style={styles.quickActionButton}
                  >
                    <Users size={20} />
                    <span>Manage Users</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("papers")}
                    style={styles.quickActionButton}
                  >
                    <FileText size={20} />
                    <span>Manage Papers</span>
                  </button>
                  <button style={styles.quickActionButton}>
                    <Database size={20} />
                    <span>Export Data</span>
                  </button>
                </div> */}
              </div>
            </>
          )}

          {/* Users Management */}
          {activeTab === "users" && (
            <div style={styles.section}>
              {/* <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>User Management</h2>
                  <p style={styles.sectionSubtitle}>Manage all user accounts and permissions</p>
                </div>
                <button 
                  onClick={fetchUsers}
                  style={styles.refreshButton}
                >
                  Refresh
                </button>
              </div> */}

              {/* Filters */}
              <div style={styles.filters}>
                <div style={styles.searchBox}>
                  <Search size={18} color="#666" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.filterControls}>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.select}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select
                    value={batchFilter}
                    onChange={(e) => {
                      setBatchFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.select}
                  >
                    <option value="all">All Batches</option>
                    <option value="MCA Batch 2026">MCA 2026</option>
                    <option value="MCA Batch 2025">MCA 2025</option>
                    <option value="BCA Batch 2026">BCA 2026</option>
                    <option value="BCA Batch 2025">BCA 2025</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div style={styles.tableContainer}>
                {loading ? (
                  <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={styles.empty}>
                    <Users size={48} color="#ccc" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <>
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Batch</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((u, i) => (
                            <tr key={i} style={styles.tr}>
                              <td style={styles.td}>
                                {editingUser === u.email ? (
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Name"
                                  />
                                ) : (
                                  <div style={styles.user}>
                                    <div style={styles.avatar}>
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{u.name}</span>
                                  </div>
                                )}
                              </td>
                              <td style={styles.td}>
                                {editingUser === u.email ? (
                                  <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Email"
                                  />
                                ) : (
                                  u.email
                                )}
                              </td>
                              <td style={styles.td}>
                                {u.role === "student" ? u.course_batch || "-" : "-"}
                              </td>
                              <td style={styles.td}>
                                <RoleBadge role={u.role} />
                              </td>
                              <td style={styles.td}>
                                <div style={styles.actions}>
                                  {editingUser === u.email ? (
                                    <>
                                      <button
                                        onClick={saveEdit}
                                        style={styles.actionButton}
                                        disabled={saveLoading}
                                        title="Save"
                                      >
                                        {saveLoading ? (
                                          <div style={styles.smallSpinner}></div>
                                        ) : (
                                          <Save size={16} />
                                        )}
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        style={styles.actionButton}
                                        title="Cancel"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditing(u)}
                                        style={styles.actionButton}
                                        title="Edit"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      {u.role !== "admin" && (
                                        <button
                                          onClick={() => setDeleteEmail(u.email)}
                                          style={{...styles.actionButton, color: '#dc3545'}}
                                          title="Delete"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={styles.pagination}>
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          style={styles.pageButton}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span style={styles.pageInfo}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          style={styles.pageButton}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Papers Management */}
          {activeTab === "papers" && (
            <div style={styles.section}>
              {/* <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Published Papers</h2>
                  <p style={styles.sectionSubtitle}>Manage and publish examination papers</p>
                </div>
                <button 
                  onClick={fetchPublishedPapers}
                  style={styles.refreshButton}
                >
                  Refresh
                </button>
              </div> */}

              <div style={styles.tableContainer}>
                {papersLoading ? (
                  <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading papers...</p>
                  </div>
                ) : papers.length === 0 ? (
                  <div style={styles.empty}>
                    <FileText size={48} color="#ccc" />
                    <p>No papers published yet</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Subject</th>
                          <th style={styles.th}>Teacher</th>
                          <th style={styles.th}>Questions</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {papers.map((paper, i) => (
                          <tr key={i} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.user}>
                                <FileText size={20} color="#555" />
                                <span style={{ fontWeight: 500 }}>{paper.subject_name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={{ color: '#666', fontSize: '14px' }}>
                                {paper.teacher_email}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badge}>
                                {paper.total_questions}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {paper.status === "draft" ? (
                                <div>
                                  <select
                                    value={publishBatch[paper.subject_id] || ""}
                                    onChange={(e) =>
                                      setPublishBatch(prev => ({
                                        ...prev,
                                        [paper.subject_id]: e.target.value
                                      }))
                                    }
                                    style={{...styles.select, width: '100%', marginBottom: '4px'}}
                                  >
                                    <option value="">Select Batch</option>
                                    <option value="MCA Batch 2026">MCA 2026</option>
                                    <option value="MCA Batch 2025">MCA 2025</option>
                                    <option value="BCA Batch 2026">BCA 2026</option>
                                    <option value="BCA Batch 2025">BCA 2025</option>
                                  </select>
                                  <button
                                    onClick={() => publishPaper(paper.subject_id)}
                                    style={styles.publishButton}
                                  >
                                    Publish
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#28a745', fontSize: '14px' }}>
                                  Published ({paper.target_batch})
                                </span>
                              )}
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actions}>
                                <button
                                  onClick={() => window.open(`/admin/paper/${paper.subject_id}`, '_blank')}
                                  style={styles.textButton}
                                  title="View"
                                >
                                  <Eye size={16} />
                                  <span style={{ marginLeft: '4px' }}>View</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Analytics</h2>
                <p style={styles.sectionSubtitle}>System usage and performance metrics</p>
              </div>
              <div style={styles.analyticsContent}>
                <div style={styles.analyticsCard}>
                  <h3 style={styles.analyticsTitle}>User Distribution</h3>
                  <div style={styles.chartPlaceholder}>
                    <BarChart3 size={48} color="#ccc" />
                    <p>User distribution chart</p>
                  </div>
                </div>
                <div style={styles.analyticsCard}>
                  <h3 style={styles.analyticsTitle}>Paper Statistics</h3>
                  <div style={styles.chartPlaceholder}>
                    <FileText size={48} color="#ccc" />
                    <p>Paper publication trends</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Settings</h2>
                <p style={styles.sectionSubtitle}>System configuration and preferences</p>
              </div>
              <div style={styles.settingsContent}>
                {/* <div style={styles.settingsCard}>
                  <h3 style={styles.settingsTitle}>System Settings</h3>
                  <div style={styles.settingItem}>
                    <label>System Name</label>
                    <input type="text" placeholder="Exam Portal" style={styles.settingInput} />
                  </div>
                  <div style={styles.settingItem}>
                    <label>Default Batch</label>
                    <select style={styles.settingInput}>
                      <option>MCA Batch 2026</option>
                      <option>MCA Batch 2025</option>
                      <option>BCA Batch 2026</option>
                      <option>BCA Batch 2025</option>
                    </select>
                  </div>
                  <button style={styles.saveSettingsButton}>Save Settings</button>
                </div> */}
                {/* <div style={styles.settingsCard}>
                  <h3 style={styles.settingsTitle}>Security</h3>
                  <div style={styles.settingItem}>
                    <label>Session Timeout</label>
                    <select style={styles.settingInput}>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                  <button style={styles.logoutButton}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deleteEmail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <AlertTriangle size={24} color="#dc3545" />
              <h3 style={styles.modalTitle}>Delete User</h3>
              <button onClick={() => setDeleteEmail(null)} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>
                Delete user <strong>{users.find(u => u.email === deleteEmail)?.name}</strong>?
              </p>
              <p style={styles.warning}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setDeleteEmail(null)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button onClick={confirmDelete} style={styles.dangerButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Components */
function StatCard({ title, value, icon, color, description }) {
  return (
    <div style={styles.statCard}>
      <div style={{...styles.statIcon, backgroundColor: `${color}20`, color: color}}>
        {icon}
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
        {description && (
          <div style={styles.statDescription}>{description}</div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const colors = {
    student: { bg: '#e8f5e9', color: '#2e7d32' },
    teacher: { bg: '#e3f2fd', color: '#1565c0' },
    admin: { bg: '#fce4ec', color: '#c2185b' },
  };
  
  const style = colors[role] || { bg: '#f5f5f5', color: '#666' };
  
  return (
    <span style={{
      ...styles.roleBadge,
      backgroundColor: style.bg,
      color: style.color,
    }}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

/* Styles */
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f8f9fa',
  },
  
  // Sidebar Styles
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
  },
  
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #333',
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  
  nav: {
    flex: 1,
    padding: '20px 0',
  },
  
  menuItem: {
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#b0b0b0',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  
  activeMenuItem: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderLeft: '4px solid #3b82f6',
  },
  
  menuIcon: {
    flexShrink: 0,
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  menuLabel: {
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #333',
  },
  
  collapseButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#b0b0b0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Main Content Styles
  main: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
  },
  
  topHeader: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  
  pageTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  userAvatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  
  userRole: {
    fontSize: '12px',
    color: '#666',
  },
  
  // Content Styles
  content: {
    padding: '24px',
  },
  
  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  
  sectionHeader: {
    padding: '24px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  
  sectionSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  
  refreshButton: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    color: '#555',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  
  // Stats Grid
  statsGrid: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    lineHeight: 1,
  },
  
  statTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    marginTop: '4px',
  },
  
  statDescription: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },
  
  // Quick Actions
  quickActions: {
    padding: '24px',
    paddingTop: '0',
    display: 'flex',
    gap: '16px',
  },
  
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  
  // Filters
  filters: {
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  
  filterControls: {
    display: 'flex',
    gap: '12px',
  },
  
  select: {
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#333',
    background: 'white',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '160px',
  },
  
  // Table Styles
  tableContainer: {
    padding: '24px',
  },
  
  tableWrapper: {
    overflowX: 'auto',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
  },
  
  tr: {
    borderBottom: '1px solid #f5f5f5',
  },
  
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#333',
  },
  
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    fontSize: '14px',
  },
  
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  },
  
  actions: {
    display: 'flex',
    gap: '8px',
  },
  
  actionButton: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    color: '#555',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textButton: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    color: '#555',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  
  roleBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
  },
  
  badge: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  
  publishButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  
  // Loading & Empty States
  loading: {
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  
  empty: {
    padding: '60px',
    textAlign: 'center',
    color: '#999',
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #555',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #555',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  // Pagination
  pagination: {
    paddingTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  
  pageButton: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    color: '#555',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pageInfo: {
    fontSize: '14px',
    color: '#666',
  },
  
  // Analytics
  analyticsContent: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  
  analyticsCard: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  
  analyticsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  
  chartPlaceholder: {
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px dashed #ddd',
  },
  
  // Settings
  settingsContent: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  
  settingsCard: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  
  settingsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  
  settingItem: {
    marginBottom: '20px',
  },
  
  settingInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '8px',
    backgroundColor: '#fff',
  },
  
  saveSettingsButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
  },
  
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
  },
  
  modalHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #eee',
  },
  
  modalTitle: {
    flex: 1,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    padding: '4px',
  },
  
  modalBody: {
    padding: '20px',
  },
  
  warning: {
    fontSize: '13px',
    color: '#dc3545',
    marginTop: '12px',
  },
  
  modalFooter: {
    padding: '20px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    borderTop: '1px solid #eee',
  },
  
  secondaryButton: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    color: '#333',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  
  dangerButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);