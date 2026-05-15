import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Clock, ListTodo, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon, color, accentBorder, delay }: any) => (
  <div className={`card animate-slide-up ${delay}`} style={{ 
    padding: '1.5rem', 
    borderLeft: `4px solid ${accentBorder}`,
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ 
      position: 'absolute', 
      top: '-10px', 
      right: '-10px', 
      opacity: 0.05, 
      transform: 'rotate(-15deg)' 
    }}>
      {React.cloneElement(icon as React.ReactElement, { size: 80 })}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
      <div>
        <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{title}</p>
        <h3 style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{value}</h3>
      </div>
      <div style={{ color: color, padding: '0.5rem', backgroundColor: `${color}15`, borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        setMetrics(res.data);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse">Loading workspace...</div>
    </div>
  );

  const personalTotal = (metrics?.personalCompleted || 0) + (metrics?.personalPending || 0);
  const personalPct = personalTotal === 0 ? 0 : Math.round(((metrics?.personalCompleted || 0) / personalTotal) * 100);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Welcome Section */}
      <div style={{ 
        marginBottom: '2.5rem', 
        padding: '2rem', 
        borderRadius: '20px', 
        background: 'linear-gradient(135deg, #133430 0%, #0f766e 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -10px rgba(15, 118, 110, 0.4)'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Sparkles size={180} color="white" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} /> Welcome back to your workspace
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '400px' }}>
            You have <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{metrics?.personalPending || 0}</span> tasks waiting for you today. Let's make it productive!
          </p>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard delay="" title="Total Tasks" value={metrics?.totalTasks || 0} icon={<BarChart3 size={24} />} color="var(--primary)" accentBorder="var(--primary)" />
        <StatCard delay="delay-100" title="To Do" value={metrics?.todoTasks || 0} icon={<ListTodo size={24} />} color="var(--text-muted)" accentBorder="var(--border)" />
        <StatCard delay="delay-200" title="In Progress" value={metrics?.inProgressTasks || 0} icon={<Clock size={24} />} color="var(--warning)" accentBorder="var(--warning)" />
        <StatCard delay="delay-300" title="Completed" value={metrics?.doneTasks || 0} icon={<CheckCircle2 size={24} />} color="var(--success)" accentBorder="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Personal Progress */}
        <div className="card animate-slide-up delay-200" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '10px' }}>
                <TrendingUp size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>My Progress</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{personalPct}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Efficiency</span>
            </div>
          </div>
          
          <div style={{ height: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary), var(--success))',
              borderRadius: '999px',
              width: `${personalPct}%`,
              transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
            }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Done</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{metrics?.personalCompleted || 0}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>{metrics?.personalPending || 0}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Roadmap */}
        <div className="animate-slide-up delay-300">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--accent-light)', borderRadius: '10px' }}>
              <Calendar size={20} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Priority Tasks</h2>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {metrics?.upcomingTasks?.length > 0 ? (
              <div>
                {metrics.upcomingTasks.map((task: any, index: number) => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                  return (
                    <div 
                      key={task.id} 
                      style={{ 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: index !== metrics.upcomingTasks.length - 1 ? '1px solid var(--border)' : 'none', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        borderLeft: isOverdue ? '4px solid var(--danger)' : '4px solid transparent'
                      }} 
                      onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }} 
                      onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{task.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>{task.project?.name}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className={`badge ${task.status}`} style={{ fontSize: '0.65rem' }}>{task.status.replace('_', ' ')}</span>
                        <p style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                          {isOverdue ? 'OVERDUE' : new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No urgent tasks. Relax!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
