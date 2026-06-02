import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const API_URL = 'http://127.0.0.1:8000/api/tasks';

  // Show status notification
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Fetch only top 5 recent incomplete tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks from server. Ensure backend is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch(`${API_URL}/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        if (!response.ok) throw new Error('Update failed');
        addToast("Task updated successfully!");
        setEditingTask(null);
      } else {
        // Create new task
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        if (!response.ok) throw new Error('Create failed');
        addToast("Task created successfully!");
      }
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      addToast("Failed to save task. Please try again.", "error");
    }
  };

  // Mark task as complete (Done)
  const handleComplete = async (id, taskTitle) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true }),
      });
      if (!response.ok) throw new Error('Completion update failed');
      addToast(`"${taskTitle}" completed!`);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      addToast("Failed to complete task.", "error");
    }
  };

  // Delete task permanently
  const handleDelete = async (id, taskTitle) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Deletion failed');
      addToast(`"${taskTitle}" deleted permanently.`);
      // If we are currently editing the deleted task, reset editing state
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
        setTitle('');
        setDescription('');
      }
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      addToast("Failed to delete task.", "error");
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    addToast(`Editing "${task.title}"`, "info");
    
    // Smooth scroll to form on mobile devices
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    addToast("Editing cancelled.", "info");
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Toast Notification HUD */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" style={{
            borderLeft: `4px solid ${toast.type === 'error' ? 'var(--accent-danger)' : toast.type === 'info' ? 'var(--accent-indigo)' : 'var(--accent-success)'}`
          }}>
            {toast.type === 'error' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-danger)' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            {toast.type === 'info' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-indigo)' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
            {toast.type === 'success' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-success)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Brand & Header Section */}
      <header className="dashboard-header">
        <div className="brand-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h1 className="dashboard-title">TaskFlow</h1>
        </div>
        <p className="dashboard-subtitle">A high-performance workspace to design, execute, and monitor your daily milestones.</p>
      </header>

      {/* Main Grid Dashboard */}
      <main className="dashboard-grid">
        
        {/* Left Side: Create/Edit card */}
        <section className={`glass-card ${editingTask ? 'editing' : ''}`}>
          <div className="card-header">
            {editingTask ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            )}
            <h2 className="card-title">{editingTask ? 'Edit Task Details' : 'Add New Task'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Task Title</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-desc" className="form-label">Description (Optional)</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Add some details or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="btn-container">
              <button type="submit" className="btn btn-primary">
                {editingTask ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Update Task
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create Task
                  </>
                )}
              </button>

              {editingTask && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Side: List of Tasks */}
        <section className="glass-card">
          <div className="list-section-header">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-indigo)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
              Recent Action Items
            </h3>
            <span className="count-badge">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} pending
            </span>
          </div>

          {loading && tasks.length === 0 ? (
            <div className="tasks-container loading-pulse">
              <div className="task-item" style={{ height: '120px' }}></div>
              <div className="task-item" style={{ height: '120px' }}></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h4 className="empty-title">All Caught Up!</h4>
              <p className="empty-desc">Your queue is clear. Add new tasks on the left to start planning your workflow.</p>
            </div>
          ) : (
            <div className="tasks-container">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-body">
                    {/* Custom checkbox-style trigger for done/deletion */}
                    <div className="task-checkbox-wrapper">
                      <button 
                        onClick={() => handleDelete(task.id, task.title)}
                        className="task-checkbox-custom"
                        title="Delete task"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="task-checkbox-icon">
                          <polyline points="20 6 9 17 5 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="task-content-details">
                      <h4 className="task-item-title">{task.title}</h4>
                      {task.description && (
                        <p className="task-item-description">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="task-actions-row">
                    <div className="task-meta">
                      <span className="task-status-pill status-pending">
                        <span style={{ width: '6px', height: '6px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                        Active
                      </span>
                    </div>

                    <div className="action-buttons">
                      <button 
                        onClick={() => startEdit(task)}
                        className="action-btn action-btn-edit"
                        title="Edit Task"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-btn-icon">
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id, task.title)}
                        className="action-btn action-btn-delete"
                        title="Delete Task"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-btn-icon">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
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