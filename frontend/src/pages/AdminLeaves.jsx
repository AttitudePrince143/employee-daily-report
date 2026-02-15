import { useState, useEffect } from "react";
import API from "../api/axios"; // use your axios instance
import { useNavigate } from "react-router-dom";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // Fetch leaves
  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/leaves/pending", { headers });
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error fetching leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Approve / Reject leave
  const handleAction = async (id, action) => {
    try {
      await API.put(`/leaves/${action}/${id}`, {}, { headers });
      fetchLeaves(); // refresh list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Pending Leave Requests</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {!loading && leaves.length === 0 && <p>No pending leave requests.</p>}

      {!loading && leaves.length > 0 && (
        <ul className="space-y-3">
          {leaves.map((leave) => (
            <li
              key={leave._id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <span className="font-semibold">Employee:</span>{" "}
                  {leave.userId.name} ({leave.userId.email})
                </p>
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
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(leave._id, "approve")}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(leave._id, "reject")}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
