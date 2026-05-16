import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, Users, FolderKanban } from 'lucide-react';
import api from '../api/client';

const COLORS = ['#0f766e', '#2d9d78', '#e87537', '#d4912a', '#5f7a73'];

const Analytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/analytics');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading analytics...</div>;
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in page-container" style={{ padding: '0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Analytics & Progress</h1>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Visualize team performance and project health.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Task Status Distribution */}
        <div className="card animate-slide-up delay-100">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" /> Workspace Task Status
          </h3>
          <div style={{ height: '300px' }}>
            {data.taskStatusCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.taskStatusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.taskStatusCounts.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Tasks']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No active tasks to display.
              </div>
            )}
          </div>
        </div>

        {/* Member Contributions */}
        <div className="card animate-slide-up delay-200">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--success)" /> Member Contributions
          </h3>
          <div style={{ height: '300px' }}>
            {data.memberContributions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.memberContributions} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--bg-hover)' }} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Tasks" stackId="a" fill="var(--warning)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No active members.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Project Progress */}
      <div className="card animate-slide-up delay-300">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderKanban size={20} color="var(--primary)" /> Project Progress
        </h3>
        <div style={{ height: '350px' }}>
          {data.projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectProgress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-hover)' }} />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="total" name="Total Tasks" fill="var(--border)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No projects found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
