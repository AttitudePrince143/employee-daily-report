import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginRegister from "./pages/LoginRegister"
import AdminDashboard from "./pages/AdminDashboard"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import LeaveRequest from "./pages/LeaveRequest"
import AdminLeaves from "./pages/AdminLeaves"

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>

        {/* Login / Register Page */}
        <Route path="/" element={<LoginRegister />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Leave */}
        <Route
          path="/employee/leave"
          element={
            <ProtectedRoute allowedRole="employee">
              <LeaveRequest />
            </ProtectedRoute>
          }
        />

        {/* Admin Leaves */}
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLeaves />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<LoginRegister />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
