import { useState, useEffect } from "react"
import API from "../api/axios" // use your axios instance

export default function LeaveRequest() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState("")
  const [leaves, setLeaves] = useState([])

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/my", { headers })
      setLeaves(res.data.leaves || [])
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || "Error fetching leaves")
    }
  }

  useEffect(() => {
    if (token) fetchLeaves()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post(
        "/leave/request",
        { startDate, endDate, reason },
        { headers }
      )
      setMessage("Leave request submitted successfully!")
      setStartDate("")
      setEndDate("")
      setReason("")
      fetchLeaves()
    } catch (err) {
      setMessage(err.response?.data?.message || "Server error")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Request Leave</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Start Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">End Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Reason</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Submit Request
        </button>
      </form>

      <h3 className="text-xl font-bold mt-8 mb-2">My Leave Requests</h3>
      {leaves.length === 0 ? (
        <p>No leave requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {leaves.map((leave) => (
            <li
              key={leave._id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <span className="font-semibold">From:</span>{" "}
                  {new Date(leave.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">To:</span>{" "}
                  {new Date(leave.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Reason:</span> {leave.reason}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-white ${
                  leave.status === "Approved"
                    ? "bg-green-500"
                    : leave.status === "Rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {leave.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
