import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [darkMode, setDarkMode] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const headers = { Authorization: `Bearer ${token}` };

  // --- STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [tasks, setTasks] = useState("");
  const [workDetails, setWorkDetails] = useState("");
  const [reports, setReports] = useState([]);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  // --- Monthly Summary ---
const [currentMonth, setCurrentMonth] = useState(new Date());

// Counts
const [fullDays, setFullDays] = useState(0);
const [shortDays, setShortDays] = useState(0);
const [checkInOnlyDays, setCheckInOnlyDays] = useState(0);
const [leaveDays, setLeaveDays] = useState(0);
const [holidayDays, setHolidayDays] = useState(0);
const [absentDays, setAbsentDays] = useState(0);
const [indianHolidays, setIndianHolidays] = useState([]);



  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  // --- Clock ---
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Fetch employee info ---
  const fetchUser = async () => {
    try {
      const res = await API.get("/users/me", { headers });
      setEmployeeName(res.data.user.name);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error fetching user info");
    }
  };

  // --- Fetch Reports and Leaves ---
  const fetchReportsAndLeaves = async () => {
    try {
      const [repRes, leaveRes] = await Promise.all([
        API.get("/dailyreport/myreports", { headers }),
       API.get("/leave/my", { headers }),
      ]);
      setReports(repRes.data.reports || []);
      setLeaves(leaveRes.data.leaves || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error fetching reports/leaves");
    }
  };

  // --- Fetch Attendance ---
  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/my", { headers });
      setAttendance(res.data.attendance || null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error fetching attendance");
    }
  };

  // --- Initial fetch ---
  useEffect(() => {
    if (!token) return;
    fetchUser();
    fetchReportsAndLeaves();
    fetchAttendance();

    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // --- Attendance ---
  const handleCheckIn = async () => {
    try {
      const res = await API.post("/attendance/checkin", {}, { headers });
      setAttendance(res.data.attendance);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error checking in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.post("/attendance/checkout", {}, { headers });
      setAttendance(res.data.attendance);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error checking out");
    }
  };

  // --- Submit Daily Report ---
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/dailyreport/submit", { tasks, workDetails }, { headers });
      setReports([res.data.report, ...reports]);
      setTasks("");
      setWorkDetails("");
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting report");
    }
  };

  // --- Submit Leave ---
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/leave/request", { startDate: leaveStartDate, endDate: leaveEndDate, reason: leaveReason }, { headers });
      setLeaves([res.data.leave, ...leaves]);
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveReason("");
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error requesting leave");
    }
  };

  // --- Filtered Reports ---
  const filteredReports = filterMonth
    ? reports.filter(r => new Date(r.date).toISOString().slice(0, 7) === filterMonth)
    : reports;

  // --- Download PDF ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("My Reports", 10, 10);
    let y = 20;
    filteredReports.forEach((r) => {
      doc.text(`Date: ${new Date(r.date).toDateString()}`, 10, y); y += 6;
      doc.text(`Tasks: ${r.tasks}`, 10, y); y += 6;
      doc.text(`Details: ${r.workDetails}`, 10, y); y += 10;
    });
    doc.save("my_reports.pdf");
  };


  useEffect(() => {
  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  let full = 0, short = 0, checkOnly = 0, leaveCount = 0, holidayCount = 0, absent = 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().slice(0,10);

    // Holiday
    if (indianHolidays.includes(dateStr)) {
      holidayCount++;
      continue;
    }

    // Approved leave
    const isApprovedLeave = leaves.some(
      l => l.status === "Approved" && date >= new Date(l.startDate) && date <= new Date(l.endDate)
    );
    if (isApprovedLeave) {
      leaveCount++;
      continue;
    }

    // Attendance for this day
    const dayAttendance =
      attendance && new Date(attendance.date).toDateString() === date.toDateString()
        ? attendance
        : null;

    if (!dayAttendance) {
      absent++;
    } else if (dayAttendance.loginTime && dayAttendance.logoutTime) {
      const hours = (new Date(dayAttendance.logoutTime) - new Date(dayAttendance.loginTime)) / (1000*60*60);
      if (hours >= 8) full++;
      else short++;
    } else if (dayAttendance.loginTime && !dayAttendance.logoutTime) {
      checkOnly++;
    }
  }

  setFullDays(full);
  setShortDays(short);
  setCheckInOnlyDays(checkOnly);
  setLeaveDays(leaveCount);
  setHolidayDays(holidayCount);
  setAbsentDays(absent);

}, [attendance, leaves, currentMonth, indianHolidays]);



useEffect(() => {
  const fetchHolidays = async () => {
    try {
      const year = currentMonth.getFullYear();
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
      const data = await res.json();
      // Store both date and name
      const holidays = data.map(h => ({ date: h.date, name: h.name }));
      setIndianHolidays(holidays);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  fetchHolidays(); // <-- CALL the function here
}, [currentMonth]);



<div className="flex justify-between items-center mb-2">
  <button
    onClick={() =>
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      )
    }
    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
  >
    ◀ Prev
  </button>

  <span className="font-semibold">
    {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
  </span>

  <button
    onClick={() =>
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      )
    }
    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
  >
    Next ▶
  </button>
</div>




const renderCalendar = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun

  const calendarCells = [];

  // Weekday headers
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    calendarCells.push(
      <div key={`week-${day}`} className="font-semibold text-center p-1">{day}</div>
    );
  });

  // Empty slots for first day alignment
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`}></div>);
  }

  // Generate each day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().slice(0,10);

    // Default color
    let bgColor = "bg-gray-300";
    let holidayName = null;

    // Sunday highlight
    if (date.getDay() === 0) bgColor = "bg-red-100";

    // Holiday check
    const holiday = indianHolidays.find(h => h.date === dateStr);
    if (holiday) {
      bgColor = "bg-red-300";
      holidayName = holiday.name;
    }

    // Approved leave (priority after holiday)
    const approvedLeave = leaves.find(
      l => l.status === "Approved" && date >= new Date(l.startDate) && date <= new Date(l.endDate)
    );
    if (!holiday && approvedLeave) {
      bgColor = "bg-green-300";
    }

    // Attendance (priority after leave/holiday)
    else if (!holiday && !approvedLeave && attendance && new Date(attendance.date).toDateString() === date.toDateString()) {
      const a = attendance;
      if (a.loginTime && a.logoutTime) {
        const hours = (new Date(a.logoutTime) - new Date(a.loginTime)) / (1000*60*60);
        bgColor = hours >= 8 ? "bg-green-400" : "bg-orange-300";
      } else if (a.loginTime && !a.logoutTime) {
        bgColor = "bg-blue-300";
      }
    }

    calendarCells.push(
      <div
        key={day}
        className={`${bgColor} border rounded p-2 text-center relative hover:scale-105 transition cursor-pointer`}
        title={`
          ${date.toDateString()}
          Attendance: ${attendance?.loginTime ? "In" : "-"} / ${attendance?.logoutTime ? "Out" : "-"}
          Leave: ${approvedLeave ? approvedLeave.reason : "-"}
          Holiday: ${holidayName ? holidayName : "-"}
        `}
      >
        {day}
      </div>
    );
  }

  return <div className="grid grid-cols-7 gap-1">{calendarCells}</div>;
};






  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-linear-to-br from-purple-500 via-blue-400 to-pink-400"} min-h-screen flex flex-col p-6 space-y-6 transition-colors duration-300`}>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold p-3 rounded shadow-lg bg-white/20 backdrop-blur-md">
          Employee Dashboard {employeeName && `- ${employeeName}`}
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black transition">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition">
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="p-2 rounded bg-white/30 backdrop-blur-sm text-red-600 font-medium">{message}</p>
      )}

      {/* Attendance */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Attendance</h2>
          <p>Current Time: {currentTime.toLocaleTimeString()}</p>
          <p>Checked In: {attendance?.loginTime ? new Date(attendance.loginTime).toLocaleTimeString() : "-"}</p>
          <p>Checked Out: {attendance?.logoutTime ? new Date(attendance.logoutTime).toLocaleTimeString() : "-"}</p>
          <p>Total Hours: {attendance?.totalHours || 0}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleCheckIn} disabled={attendance?.loginTime}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded font-semibold transition">
            Check In
          </button>
          <button onClick={handleCheckOut} disabled={!attendance?.loginTime || attendance?.logoutTime}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded font-semibold transition">
            Check Out
          </button>
        </div>
      </div>
      {/* Calendar */}
<div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-6 mt-4">
  <h2 className="text-xl font-semibold mb-2">Monthly Attendance Calendar</h2>
  {renderCalendar()}

  {/* Summary counts */}
  <div className="flex gap-4 mt-2 text-sm">
    <div>✅ Full Days: {fullDays}</div>
    <div>⚠ Short Days: {shortDays}</div>
    <div>🔵 Check-in Only: {checkInOnlyDays}</div>
    <div>🟡 Leave: {leaveDays}</div>
    <div>🔴 Holidays: {holidayDays}</div>
    <div>❌ Absent: {absentDays}</div>
  </div>
</div>


      {/* Daily Reports */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Submit Daily Report</h2>
        <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
          <input value={tasks} onChange={(e) => setTasks(e.target.value)}
            placeholder="Tasks" required
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
          <textarea value={workDetails} onChange={(e) => setWorkDetails(e.target.value)}
            placeholder="Work Details" required
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
          <button type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold text-white transition">
            Submit Report
          </button>
        </form>

        {/* Reports List */}
        <div className="mt-4">
          <div className="flex gap-2 mb-2">
            <input type="month" className="border p-1 rounded" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}/>
            <button onClick={handleDownloadPDF} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">Download PDF</button>
          </div>
          {filteredReports.length === 0 ? <p>No reports yet.</p> :
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
              {filteredReports.map(r => (
                <div key={r._id} className="p-3 border rounded shadow-sm hover:bg-white/10 transition">
                  <p><strong>Date:</strong> {new Date(r.date).toDateString()}</p>
                  <p><strong>Tasks:</strong> {r.tasks}</p>
                  <p><strong>Details:</strong> {r.workDetails}</p>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Leave Request</h2>
        <form onSubmit={handleSubmitLeave} className="flex flex-col gap-3">
          <input type="date" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} required
            className="border p-2 rounded"/>
          <input type="date" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} required
            className="border p-2 rounded"/>
          <textarea placeholder="Reason" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required
            className="border p-2 rounded"/>
          <button type="submit"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded font-semibold text-white transition">
            Submit Leave Request
          </button>
        </form>

        {/* Leave History */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {leaves.length === 0 ? <p>No leaves yet.</p> :
            leaves.map(l => (
              <div key={l._id} className={`min-w-50 p-3 rounded shadow-sm border ${l.status === "Approved" ? "bg-green-500/40" : l.status === "Rejected" ? "bg-red-500/40" : "bg-yellow-500/40"}`}>
                <p><strong>{l.status}</strong></p>
                <p>{new Date(l.startDate).toDateString()} - {new Date(l.endDate).toDateString()}</p>
                <p>{l.reason}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center bg-white/20 backdrop-blur-md text-gray-100 rounded-lg shadow-inner">
        &copy; Syed Adil {new Date().getFullYear()} Employee Dashboard @ All Rights Reserved
      </footer>
    </div>
  );
}
