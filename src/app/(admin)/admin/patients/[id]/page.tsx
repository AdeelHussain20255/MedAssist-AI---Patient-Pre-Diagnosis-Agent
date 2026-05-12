import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import OverrideForm from "@/components/admin/OverrideForm"; // We will create this client component

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.patientSession.findUnique({
    where: { id },
    include: {
      appointments: true,
      auditLogs: {
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  if (!session) return notFound();

  let conversation = [];
  try {
    if (session.conversationLog) {
      conversation = JSON.parse(session.conversationLog);
    }
  } catch (e) {
    console.error("Failed to parse conversation log", e);
  }

  const appointment = session.appointments[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Session Review</h1>
          <p className="text-sm text-gray-500">ID: {session.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Override */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="text-brand-600" size={20} />
                Triage Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Level</p>
                <div className="mt-1">
                  {session.triageLevel === 'CRITICAL' && <span className="triage-badge-critical text-base px-4 py-1">CRITICAL</span>}
                  {session.triageLevel === 'URGENT' && <span className="triage-badge-urgent text-base px-4 py-1">URGENT</span>}
                  {session.triageLevel === 'MILD' && <span className="triage-badge-mild text-base px-4 py-1">MILD</span>}
                  {!session.triageLevel && <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Pending</span>}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Source</p>
                <p className="font-medium mt-1">{session.triageSource || 'N/A'}</p>
              </div>

              {session.redFlagTriggered && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm font-medium">
                  🚩 Red flags detected: {session.redFlagMatches.join(", ")}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-2">Reasoning</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {session.triageReasoning || 'No reasoning recorded'}
                </p>
              </div>

              {/* Client Component for Overriding Triage */}
              <div className="pt-4 border-t border-gray-100">
                <OverrideForm sessionId={session.id} currentLevel={session.triageLevel || 'MILD'} />
              </div>
            </CardContent>
          </Card>

          {appointment && (
            <Card>
              <CardHeader className="bg-brand-50 border-b border-brand-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-brand-800">
                  <Calendar className="text-brand-600" size={20} />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{appointment.patientName}</span>
                </div>
                <div className="text-sm text-gray-600 pl-6">{appointment.patientEmail}</div>
                {appointment.patientPhone && <div className="text-sm text-gray-600 pl-6">{appointment.patientPhone}</div>}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">Scheduled For</p>
                  <p className="font-semibold text-gray-900">
                    {appointment.scheduledFor.toLocaleString('en-PK')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Logs */}
          <Card>
            <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="text-brand-600" size={20} />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                {session.auditLogs.map((log) => (
                  <li key={log.id} className="text-sm border-l-2 border-brand-200 pl-4 py-1">
                    <p className="font-semibold text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.timestamp.toLocaleString()} • By {log.performedBy}
                    </p>
                  </li>
                ))}
                {session.auditLogs.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No audit logs found.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transcript */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl">Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 bg-surface-secondary space-y-4 min-h-[500px]">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No conversation recorded.</div>
              ) : (
                conversation.map((msg: any, idx: number) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={idx} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] shadow-sm ${
                        isUser 
                          ? "bg-brand-600 text-white rounded-br-sm" 
                          : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
