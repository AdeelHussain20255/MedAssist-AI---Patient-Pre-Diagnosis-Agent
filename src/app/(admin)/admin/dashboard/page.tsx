import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, Activity, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { TriageLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalSessions, mildCases, urgentCases, criticalCases, recentSessions] = await Promise.all([
    prisma.patientSession.count({ where: { createdAt: { gte: today } } }),
    prisma.patientSession.count({ where: { createdAt: { gte: today }, triageLevel: 'MILD' } }),
    prisma.patientSession.count({ where: { createdAt: { gte: today }, triageLevel: 'URGENT' } }),
    prisma.patientSession.count({ where: { createdAt: { gte: today }, triageLevel: 'CRITICAL' } }),
    prisma.patientSession.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { appointments: true }
    })
  ]);

  const getTriageBadge = (level: string | null) => {
    switch (level) {
      case 'CRITICAL': return <span className="triage-badge-critical animate-pulse">Critical</span>;
      case 'URGENT': return <span className="triage-badge-urgent">Urgent</span>;
      case 'MILD': return <span className="triage-badge-mild">Mild</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-content-secondary mt-1">Today's triage overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Triage</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalSessions}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Activity size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Critical Cases</p>
                <h3 className="text-3xl font-bold text-red-600">{criticalCases}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Urgent Cases</p>
                <h3 className="text-3xl font-bold text-amber-600">{urgentCases}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Mild Cases</p>
                <h3 className="text-3xl font-bold text-green-600">{mildCases}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Triage Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100 text-sm font-medium text-gray-500">
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Triage Level</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Symptoms Preview</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No patients have completed triage today.
                    </td>
                  </tr>
                ) : (
                  recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {session.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {getTriageBadge(session.triageLevel)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.triageSource || 'Pending'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                        {session.symptoms || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {session.status === 'BOOKED' ? (
                          <span className="text-brand-600 font-medium">Booked</span>
                        ) : session.status === 'REDIRECTED_EMERGENCY' ? (
                          <span className="text-red-600 font-medium">Emergency</span>
                        ) : (
                          <span className="text-gray-500">{session.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/patients/${session.id}`}
                          className="inline-flex items-center text-brand-600 hover:text-brand-800 font-medium text-sm"
                        >
                          Review <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
