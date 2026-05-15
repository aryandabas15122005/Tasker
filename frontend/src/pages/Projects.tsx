import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Users, Search, Filter } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Modal State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/projects', { name, description, guidelines, memberIds: selectedMembers });
      setShowModal(false);
      setName('');
      setDescription('');
      setGuidelines('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse">Loading Tasker Projects...</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', fontFamily: 'var(--font-heading)' }}>Projects</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Manage and track your team's initiatives in Tasker.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary animate-slide-up" onClick={() => setShowModal(true)}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project, index) => (
            <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={`card animate-slide-up`} style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                animationDelay: `${index * 50}ms`,
                borderBottom: '4px solid var(--primary-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>
                    <Folder size={24} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{project.name}</h3>
                </div>
                <p className="text-muted" style={{ flex: 1, marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {project.description || 'No description provided for this project.'}
                </p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
                      {project.owner?.name?.charAt(0)}
                    </div>
                    <span className="text-muted">By {project.owner?.name?.split(' ')[0]}</span>
                  </div>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <Users size={14}/> {project.members?.length || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="animate-slide-up" style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Folder size={40} color="var(--text-muted)" opacity={0.5} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>No projects in Tasker yet</h3>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Ready to organize your team? Create your first project to start assigning tasks and tracking progress.
          </p>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} /> Create Your First Project
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(19, 52, 48, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>Create New Project</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Define your project and assign team members.</p>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Q3 Marketing Sprint" />
              </div>
              <div className="input-group">
                <label>Short Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this project about?" />
              </div>
              <div className="input-group">
                <label>Project Guidelines</label>
                <textarea value={guidelines} onChange={e => setGuidelines(e.target.value)} rows={4} placeholder="Key rules, links, or expectations for the team..." style={{ fontSize: '0.9rem' }} />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Assign Members
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>{selectedMembers.length} Selected</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '180px', overflowY: 'auto', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  {allUsers.filter(u => u.id !== user?.id).map(u => (
                    <label key={u.id} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', 
                      borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s',
                      backgroundColor: selectedMembers.includes(u.id) ? 'var(--primary-light)' : 'transparent'
                    }} onMouseOver={e => e.currentTarget.style.backgroundColor = selectedMembers.includes(u.id) ? 'var(--primary-light)' : 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = selectedMembers.includes(u.id) ? 'var(--primary-light)' : 'transparent'}>
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(u.id)} 
                        onChange={() => toggleMember(u.id)} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                      <span className={`badge ${u.role}`} style={{ fontSize: '0.6rem' }}>{u.role}</span>
                    </label>
                  ))}
                  {allUsers.length <= 1 && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>No other team members found in Tasker.</div>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isCreating}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating} style={{ padding: '0.75rem 2rem' }}>
                  {isCreating ? 'Creating...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
