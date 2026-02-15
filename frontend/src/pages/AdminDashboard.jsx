// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date());

  // --- Live Clock ---
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Fetch All Data ---
  const fetchData = async () => {
    try {
      const [usersRes, attRes, reportsRes, leavesRes] = await Promise.all([
       API.get("/users", { headers }),
       API.get("/attendance/all", { headers }),
        API.get("/dailyreport/all", { headers }),
        API.get("/leave/all", { headers }),
      ]);
      setUsers(usersRes.data.users || []);
      setAttendance(attRes.data.attendance || []);
      setReports(reportsRes.data.reports || []);
      setLeaves(leavesRes.data.leaves || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const userMap = {};
  users.forEach(u => { userMap[u._id] = u; });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const todayAttendance = attendance.filter(a =>
    new Date(a.date).toDateString() === new Date().toDateString()
  );

  const getAttendanceByDate = date =>
    attendance.filter(a => new Date(a.date).toDateString() === new Date(date).toDateString());

  const filteredLeaves = leaves.filter(l =>
    l.userId?.name?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    r.userId?.name?.toLowerCase().includes(searchUser.toLowerCase())
  );

// --- Actions ---

// Leave actions (approve/reject)
const handleLeaveAction = async (id, action) => {
  try {
    // Backend expects /api/leave/approve/:id or /api/leave/reject/:id
   await API.put(`/users/${action}/${id}`, {}, { headers });

    fetchData();
  } catch (err) {
    console.error("Leave action error:", err.response?.data || err.message);
  }
};

// User status actions (approve, reject, block, unblock)
const handleUserAction = async (id, action) => {
  try {
    // Backend expects /api/users/approve/:id, /reject/:id, /block/:id, /unblock/:id
    await API.put(`/users/${action}/${id}`, {}, { headers });;
    fetchData();
  } catch (err) {
    console.error("User action error:", err.response?.data || err.message);
  }
};

// Save edited user info
const handleSaveUser = async (user) => {
  try {
   await API.put(`/users/update/${user._id}`, 
  { name: user.name, email: user.email, role: user.role }, 
  { headers }
);

    fetchData();
  } catch (err) {
    console.error("Save user error:", err.response?.data || err.message);
  }
};


// Delete user
const handleDeleteUser = async (id) => {
  try {
    // Backend expects /api/users/delete/:id
    await API.delete(`/users/delete/${id}`, { headers });;
    fetchData();
  } catch (err) {
    console.error("Delete user error:", err.response?.data || err.message);
  }
};



  // --- PDF Downloads ---
  const downloadReportsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("All Reports", 10, 10);
    let y = 20;
    filteredReports.forEach(r => {
      const user = r.userId;
      doc.text(`User: ${user?.name || "Unknown"}`, 10, y); y += 6;
      doc.text(`Email: ${user?.email || "-"}`, 10, y); y += 6;
      doc.text(`Date: ${new Date(r.date).toDateString()}`, 10, y); y += 6;
      doc.text(`Tasks: ${r.tasks || "-"}`, 10, y); y += 6;
      doc.text(`Details: ${r.workDetails || "-"}`, 10, y); y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("all_reports.pdf");
  };

  const downloadAttendancePDF = date => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Attendance - ${new Date(date).toDateString()}`, 10, 10);
    let y = 20;
    getAttendanceByDate(date).forEach(a => {
      const user = a.userId ? userMap[a.userId._id] : null;
      const checkIn = a.loginTime ? new Date(a.loginTime).toLocaleTimeString() : "-";
      const checkOut = a.logoutTime ? new Date(a.logoutTime).toLocaleTimeString() : "-";
      let hours = "-";
      if(a.loginTime && a.logoutTime) hours = ((new Date(a.logoutTime)-new Date(a.loginTime))/(1000*60*60)).toFixed(2);
      doc.text(`Name: ${user?.name || "Unknown"}`, 10, y); y+=6;
      doc.text(`Email: ${user?.email || "-"}`,10,y); y+=6;
      doc.text(`Check-in: ${checkIn}`,10,y); y+=6;
      doc.text(`Check-out: ${checkOut}`,10,y); y+=6;
      doc.text(`Hours Worked: ${hours}`,10,y); y+=10;
      if(y>280){doc.addPage();y=20;}
    });
    doc.save(`attendance_${new Date(date).toDateString()}.pdf`);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-linear-to-br from-purple-500 via-blue-400 to-pink-400"} min-h-screen flex transition-colors duration-300`}>
      
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="hidden md:block text-2xl font-bold mb-6">Admin</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {["dashboard","users","attendance","reports","leaves"].map(tab => (
            <button
              key={tab}
              className={`flex items-center gap-3 px-2 py-3 rounded hover:bg-gray-700 transition ${activeTab===tab?"bg-gray-700":""}`}
              onClick={()=>setActiveTab(tab)}
              title={tab.charAt(0).toUpperCase()+tab.slice(1)}
            >
              <span className="text-lg">{{
                dashboard:"📊", users:"👤", attendance:"⏰", reports:"📝", leaves:"🛑"
              }[tab]}</span>
              <span className="hidden md:block">{tab.charAt(0).toUpperCase()+tab.slice(1)}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button className="px-2 py-2 bg-yellow-400 text-black rounded w-full mt-4" onClick={()=>setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}</h1>
          <span className="font-medium">{currentTime.toLocaleString()}</span>
        </div>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-600/80 rounded shadow p-4 text-center text-white">Total Users<br/><strong>{users.length}</strong></div>
            <div className="bg-yellow-400/80 rounded shadow p-4 text-center text-black">Pending Users<br/><strong>{users.filter(u=>u.status==="pending").length}</strong></div>
            <div className="bg-green-600/80 rounded shadow p-4 text-center text-white">Reports<br/><strong>{reports.length}</strong></div>
            <div className="bg-purple-600/80 rounded shadow p-4 text-center text-white">Leaves<br/><strong>{leaves.length}</strong></div>
            <div className="bg-red-600/80 rounded shadow p-4 text-center text-white">Attendance Today<br/><strong>{todayAttendance.length}</strong></div>
          </div>
        )}
{/* USERS SECTION */}
{activeTab === "users" && (
  <div className="space-y-4">
    {/* Search */}
    <input
      type="text"
      placeholder="Search by name..."
      className="border p-2 rounded w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
      value={searchUser}
      onChange={e => setSearchUser(e.target.value)}
    />

    {/* User Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredUsers.map(u => (
        <div
          key={u._id}
          className="bg-white/20 dark:bg-gray-800 backdrop-blur-lg rounded-xl shadow-lg p-4 flex flex-col gap-3 hover:shadow-xl transition transform hover:scale-105"
        >
          {/* Editable Name */}
          <input
            type="text"
            value={u.name}
            onChange={e => {
              const updated = users.map(user =>
                user._id === u._id ? { ...user, name: e.target.value } : user
              );
              setUsers(updated);
            }}
            className="border rounded px-2 py-1 bg-white/70 dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Editable Email */}
          <input
            type="email"
            value={u.email}
            onChange={e => {
              const updated = users.map(user =>
                user._id === u._id ? { ...user, email: e.target.value } : user
              );
              setUsers(updated);
            }}
            className="border rounded px-2 py-1 bg-white/70 dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Editable Role */}
          <select
            value={u.role}
            onChange={e => {
              const updated = users.map(user =>
                user._id === u._id ? { ...user, role: e.target.value } : user
              );
              setUsers(updated);
            }}
            className="border rounded px-2 py-1 bg-white/70 dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Badge */}
          <p className="text-sm">
            Status:
            <span
              className={`ml-2 px-2 py-1 rounded text-sm ${
                u.status === "approved"
                  ? "bg-green-500 text-white"
                  : u.status === "pending"
                  ? "bg-yellow-400 text-black"
                  : u.status === "blocked"
                  ? "bg-gray-600 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {u.status}
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Pending Actions */}
            {u.status === "pending" && (
              <>
                <button
                  onClick={() => handleUserAction(u._id, "approve")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUserAction(u._id, "reject")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-sm"
                >
                  Reject
                </button>
              </>
            )}

            {/* Approved Action */}
            {u.status === "approved" && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to block ${u.name}?`)) {
                    handleUserAction(u._id, "block");
                  }
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded px-2 py-1 text-sm"
              >
                Block
              </button>
            )}

            {/* Blocked Action */}
            {u.status === "blocked" && (
              <button
                onClick={() => handleUserAction(u._id, "unblock")}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-sm"
              >
                Unblock
              </button>
            )}

            {/* Save Edited User */}
            <button
              onClick={async () => {
                try {
                  await API.put(`/users/update/${u._id}`, { name: u.name, email: u.email, role: u.role }, { headers });

                  fetchData(); // refresh data
                } catch (err) {
                  console.error("Save user error:", err.response?.data || err.message);
                }
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-sm"
            >
              Save
            </button>

            {/* Delete User */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${u.name}? This action cannot be undone.`)) {
                  handleDeleteUser(u._id);
                }
              }}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white rounded px-2 py-1 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}



        {/* ATTENDANCE */}
        {activeTab==="attendance" && (
          <div>
            <div className="flex gap-4 mb-4 items-center">
              <label className="font-medium">Select Date:</label>
              <input type="date" className="border p-2 rounded" value={attendanceDate.toISOString().slice(0,10)}
                onChange={e=>setAttendanceDate(new Date(e.target.value))}/>
              <button className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600" onClick={()=>downloadAttendancePDF(attendanceDate)}>Download PDF</button>
            </div>
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full border">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Check-in</th>
                    <th className="p-2 border">Check-out</th>
                    <th className="p-2 border">Hours Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {getAttendanceByDate(attendanceDate).map(a=>{
                    const user = a.userId;
                    const checkIn = a.loginTime ? new Date(a.loginTime).toLocaleTimeString() : "-";
                    const checkOut = a.logoutTime ? new Date(a.logoutTime).toLocaleTimeString() : "-";
                    let hours = "-";
                    if(a.loginTime && a.logoutTime) hours = ((new Date(a.logoutTime)-new Date(a.loginTime))/(1000*60*60)).toFixed(2);
                    return (
                      <tr key={a._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="p-2 border">{user?.name}</td>
                        <td className="p-2 border">{user?.email}</td>
                        <td className="p-2 border">{checkIn}</td>
                        <td className="p-2 border">{checkOut}</td>
                        <td className="p-2 border">{hours}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

  {/* REPORTS */}
{activeTab === "reports" && (
  <div>
    <div className="flex gap-4 mb-4 items-center">
      <input
        type="text"
        placeholder="Search user..."
        className="border p-2 rounded flex-1"
        value={searchUser}
        onChange={e => setSearchUser(e.target.value)}
      />
      <button
        className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition"
        onClick={downloadReportsPDF}
      >
        Download PDF
      </button>
    </div>

    <div className="overflow-x-auto rounded shadow">
      <table className="min-w-full border">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Tasks</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(r => {
            const user = r.userId;
            return (
              <tr key={r._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="p-2 border">{user?.name || "Unknown"}</td>
                <td className="p-2 border">{user?.email || "-"}</td>
                <td className="p-2 border">{new Date(r.date).toDateString()}</td>
                <td className="p-2 border">{r.tasks || "-"}</td>
                <td className="p-2 border">{r.workDetails || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}



{/* LEAVES */}
{activeTab === "leaves" && (
  <div>
    <div className="flex gap-4 mb-4 items-center">
      <input
        type="text"
        placeholder="Search user..."
        className="border p-2 rounded flex-1"
        value={searchUser}
        onChange={e => setSearchUser(e.target.value)}
      />
    </div>

    <div className="overflow-x-auto rounded shadow">
      <table className="min-w-full border">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">From</th>
            <th className="p-2 border">To</th>
            <th className="p-2 border">Applied</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.map(l => {
            const user = l.userId;
            if (!user) return null;
            return (
              <tr
                key={l._id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
              >
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{l.reason}</td>
                <td className="p-2 border">{new Date(l.startDate).toDateString()}</td>
                <td className="p-2 border">{new Date(l.endDate).toDateString()}</td>
                <td className="p-2 border">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      l.status === "approved"
                        ? "bg-green-500 text-white"
                        : l.status === "pending"
                        ? "bg-yellow-400 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="p-2 border flex gap-1 whitespace-nowrap">
                  {l.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleLeaveAction(l._id, "approve")}
                        className="bg-green-500 px-2 py-1 rounded text-white hover:bg-green-600 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(l._id, "reject")}
                        className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}



        {/* Footer */}
        <footer className="mt-6 text-center py-4 bg-white/20 backdrop-blur-md text-gray-100 rounded-lg shadow-inner">
          &copy; {new Date().getFullYear()} Admin Dashboard
        </footer>
      </main>
    </div>
  );
}
