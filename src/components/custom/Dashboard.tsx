'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboardStore } from '~/store/dashboardStore';
import { Progress } from '~/components/ui/progress';

// Generate colors for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
  '#FF6B6B', '#4ECDC4', '#FF9F1C', '#ACD8AA', '#F9C80E',
  '#6A0572', '#AB83A1', '#D57A66', '#25283D'
];

export function Dashboard() {
  const { 
    clientWorkloads, 
    memberWorkloads,
    averageMemberWorkloadPercentage,
    isLoading,
    fetchDashboardData 
  } = useDashboardStore();
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {/* Client Workload Card */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Client Workload Distribution</CardTitle>
          <CardDescription>Total workload percentage per client across all sprints</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto sm:overflow-visible">
          {clientWorkloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No client workload data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={clientWorkloads}
                margin={{ top: 20, right: 10, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="clientName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  interval={0}
                  tick={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  label={{ 
                    value: 'Percentage', 
                    angle: -90, 
                    position: 'insideLeft',
                    dx: -15,
                    dy: -10,
                    style: { textAnchor: 'middle', fontSize: '0.7rem' }
                  }}
                  tickFormatter={(value) => `${Math.round(value)}%`}
                  width={50}
                  minTickGap={5}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Workload']}
                  labelFormatter={(label) => `Client: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)', 
                    color: 'var(--popover-foreground)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                  cursor={{ fill: 'var(--accent)' }}
                />
                <Bar dataKey="percentage" fill="var(--primary)" name="Workload %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Average Member Workload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Average Team Workload</CardTitle>
          <CardDescription>Mean workload percentage across all team members</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="stroke-muted-foreground/20"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
                fill="none"
              />
              {/* Foreground circle (progress) */}
              <circle
                className="stroke-primary"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * Math.min(averageMemberWorkloadPercentage, 100)) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-3xl font-bold">{averageMemberWorkloadPercentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Team Average</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Member Workload Card */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Team Member Workloads</CardTitle>
          <CardDescription>Workload percentage per team member across all sprints</CardDescription>
        </CardHeader>
        <CardContent>
          {memberWorkloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No member workload data available.</p>
          ) : (
            <div className="space-y-4">
              {memberWorkloads.map((member) => (
                <div key={member.memberId} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 text-center" title={member.name}>
                    {member.emoji}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground">{member.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={member.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Client Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Client Distribution</CardTitle>
          <CardDescription>Visual breakdown of client workload</CardDescription>
        </CardHeader>
        <CardContent>
          {clientWorkloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No client data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientWorkloads}
                  dataKey="totalHours"
                  nameKey="clientName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => entry.clientName}
                  labelLine={false}
                >
                  {clientWorkloads.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} hours`, 'Hours']} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconSize={8}
                  fontSize={10}
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
