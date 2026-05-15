import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Info, User, Calendar, ArrowLeft, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description, status, dueDate: dueDate || null, projectId: id, assigneeId: assigneeId || undefined });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDueDate('');
      setAssigneeId('');
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await api.patch(`/tasks/${editingTask.id}`, { 
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        dueDate: editingTask.dueDate || null,
        assigneeId: editingTask.assigneeId || undefined
      });
      setEditingTask(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse">Loading Tasker Board...</div>
    </div>
  );

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Project Not Found</h2>
      <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>We couldn't find the project you're looking for.</p>
      <button className="btn btn-primary" onClick={() => navigate('/projects')}>Back to Projects</button>
    </div>
  );

  const renderColumn = (columnStatus: string, columnTitle: string, icon: any, color: string) => {
    const columnTasks = tasks.filter(t => t.status === columnStatus);
    return (
      <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0.5rem 0.25rem', borderBottom: `2px solid ${color}40`
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            {React.cloneElement(icon, { size: 16, color: color })}
            {columnTitle}
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{columnTasks.length}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {columnTasks.map((task) => (
            <div 
              key={task.id} 
              className="card" 
              onClick={() => setEditingTask({...task, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''})}
              style={{ padding: '1rem', cursor: 'pointer', borderLeft: `4px solid ${color}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>{task.title}</h4>
                {(isAdmin || user?.id === task.assigneeId) && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {task.description || 'No description.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)' }}>
                  <User size={10} /> {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
                </div>
                {task.dueDate && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', opacity: 0.4, fontSize: '0.8rem' }}>
              No tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={14} /> Projects
        </button>
        <div className="flex-between">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{project.name}</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingRight: '1rem', paddingBottom: '1rem' }}>
          {renderColumn('TODO', 'To Do', <ListTodo />, 'var(--text-muted)')}
          {renderColumn('IN_PROGRESS', 'In Progress', <Clock />, 'var(--warning)')}
          {renderColumn('DONE', 'Completed', <CheckCircle2 />, 'var(--success)')}
        </div>

        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--primary-light)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} /> Guidelines
            </h3>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{project.guidelines || 'No guidelines.'}</p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Team</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                  {project.owner?.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{project.owner?.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Owner</p>
                </div>
              </div>
              {project.members?.filter((m: any) => m.id !== project.ownerId).map((m: any) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Member</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="input-group">
                <label>Assignee</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {project.members?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Status</label>
                <select value={editingTask.status} onChange={e => setEditingTask({...editingTask, status: e.target.value})}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
