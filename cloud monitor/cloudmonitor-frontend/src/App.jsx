
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    status: "Running",
    cpuUsage: "",
    memoryUsage: ""
  });

  const apiUrl = "https://localhost:7036/api/CloudResources";

  // Fetch resources from the backend
  const fetchResources = async () => {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };
useEffect(() => {
  const loadResources = async () => {
    await fetchResources();
  };

  loadResources().catch((error) => {
    console.error("Error loading resources:", error);
  });
}, [isLoggedIn]);
  // Refresh dashboard
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await fetchResources();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle form input changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // Reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      provider: "",
      status: "Running",
      cpuUsage: "",
      memoryUsage: ""
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Add or update a resource
  const handleSubmit = async (event) => {
    event.preventDefault();

    const resourceData = {
      name: formData.name.trim(),
      provider: formData.provider,
      status: formData.status,
      cpuUsage: Number(formData.cpuUsage),
      memoryUsage: Number(formData.memoryUsage)
    };

    try {
      const response = await fetch(
        editingId ? `${apiUrl}/${editingId}` : apiUrl,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(resourceData)
        }
      );

      if (response.ok) {
        resetForm();
        await fetchResources();
      } else {
        alert("Failed to save resource");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Unable to connect to API");
    }
  };

  // Open resource details modal
  const handleViewDetails = (resource) => {
    setSelectedResource(resource);
  };

  // Load resource data into the edit form
  const handleEdit = (resource) => {
    setFormData({
      name: resource.name,
      provider: resource.provider,
      status: resource.status,
      cpuUsage: resource.cpuUsage,
      memoryUsage: resource.memoryUsage
    });

    setEditingId(resource.id);
    setShowForm(true);
    setSelectedResource(null);
  };

  // Delete a resource
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        if (selectedResource?.id === id) {
          setSelectedResource(null);
        }

        await fetchResources();
      } else {
        alert("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Unable to connect to API");
    }
  };

  // Search and filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesProvider =
      providerFilter === "All" ||
      resource.provider === providerFilter;

    const matchesStatus =
      statusFilter === "All" ||
      resource.status === statusFilter;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Dashboard summary values
  const totalResources = resources.length;

  const runningResources = resources.filter(
    (resource) => resource.status === "Running"
  ).length;

  const stoppedResources = resources.filter(
    (resource) => resource.status === "Stopped"
  ).length;

  const averageCpu =
    totalResources > 0
      ? (
          resources.reduce(
            (total, resource) => total + resource.cpuUsage,
            0
          ) / totalResources
        ).toFixed(1)
      : "0.0";

  // Show login page before opening the dashboard
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div className="dashboard">

      {/* Resource details modal */}
      {selectedResource && ( 
<div
  className="modal-overlay"
  onClick={(event) => {
    if (event.target === event.currentTarget) {
      setSelectedResource(null);
    }
  }}
>
  <div className="modal-card">

            <h2>Resource Details</h2>

            <p>
              <strong>Resource Name:</strong>{" "}
              {selectedResource.name}
            </p>

            <p>
              <strong>Provider:</strong>{" "}
              {selectedResource.provider}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedResource.status}
            </p>

            <p>
              <strong>CPU Usage:</strong>{" "}
              {selectedResource.cpuUsage}%
            </p>

            <p>
              <strong>Memory Usage:</strong>{" "}
              {selectedResource.memoryUsage}%
            </p>

            <div className="modal-buttons">
              <button
                className="edit-btn"
                onClick={() => handleEdit(selectedResource)}
              >
                Edit Resource
              </button>

              <button
                className="close-modal-btn"
                onClick={() => setSelectedResource(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div>
          <h1>CloudMonitor</h1>
          <p>Cloud Resource Monitoring Dashboard</p>
        </div>

        <div className="header-buttons">
          <button
            className="add-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Close Form" : "+ Add Resource"}
          </button>

          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="cancel-btn"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container">

        {/* Add and edit form */}
        {showForm && (
          <section className="form-section">
            <h2>
              {editingId
                ? "Update Cloud Resource"
                : "Add Cloud Resource"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                <div className="form-group">
                  <label>Resource Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: AWS EC2"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Provider</label>
                  <select
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="Google Cloud">Google Cloud</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Running">Running</option>
                    <option value="Stopped">Stopped</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>CPU Usage (%)</label>
                  <input
                    type="number"
                    name="cpuUsage"
                    value={formData.cpuUsage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Memory Usage (%)</label>
                  <input
                    type="number"
                    name="memoryUsage"
                    value={formData.memoryUsage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

              </div>

              <div className="form-buttons">
                <button className="save-btn" type="submit">
                  {editingId ? "Update Resource" : "Save Resource"}
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Dashboard summary */}
        <div className="summary-grid">

          <div className="summary-card">
            <h3>Total Resources</h3>
            <div className="value">{totalResources}</div>
          </div>

          <div className="summary-card">
            <h3>Running</h3>
            <div className="value">{runningResources}</div>
          </div>

          <div className="summary-card">
            <h3>Stopped</h3>
            <div className="value">{stoppedResources}</div>
          </div>

          <div className="summary-card">
            <h3>Average CPU</h3>
            <div className="value">{averageCpu}%</div>
          </div>

        </div>

        {/* Resource list */}
        <section className="resource-section">
          <h2>Cloud Resources</h2>

          {/* Search and filters */}
          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search resource..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={providerFilter}
              onChange={(event) => setProviderFilter(event.target.value)}
            >
              <option value="All">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="Google Cloud">Google Cloud</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
            </select>
          </div>

          {resources.length === 0 ? (
            <div className="empty-message">
              No cloud resources found.
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="empty-message">
              No matching resources found.
            </div>
          ) : (
            <div className="resource-grid">

              {filteredResources.map((resource) => (
                <div
                  className="resource-card"
                  key={resource.id}
                >
                  <h3>{resource.name}</h3>

                  <p className="resource-info">
                    <strong>Provider:</strong>{" "}
                    {resource.provider}
                  </p>

                  <p className="resource-info">
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        resource.status.toLowerCase() === "running"
                          ? "status running"
                          : "status stopped"
                      }
                    >
                      {resource.status}
                    </span>
                  </p>

                  {/* CPU usage bar */}
                  <div className="usage-section">
                    <div className="usage-header">
                      <strong>CPU Usage</strong>
                      <span>{resource.cpuUsage}%</span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${resource.cpuUsage}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Memory usage bar */}
                  <div className="usage-section">
                    <div className="usage-header">
                      <strong>Memory Usage</strong>
                      <span>{resource.memoryUsage}%</span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill memory"
                        style={{
                          width: `${resource.memoryUsage}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Resource actions */}
                  <div className="card-buttons">
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(resource)}
                    >
                      View Details
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(resource)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(resource.id)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
