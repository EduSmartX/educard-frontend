/**
 * Employee Dashboard Page
 * 
 * Main dashboard for employee role (Teachers/Staff)
 * Shows personal attendance, classes, and tasks
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  UserPlus,
  ClipboardList,
  Bell,
  TrendingUp,
  Award,
  FileText,
  CalendarDays
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  // Hardcoded data - replace with API calls later
  const [isClassTeacher] = useState(true); // Simulating class teacher status
  const classTeacherData = {
    className: 'Grade 10-A',
    totalStudents: 42,
    presentToday: 38,
    absentToday: 4,
    attendancePercentage: 90.5,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        {isClassTeacher && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Award className="w-4 h-4 mr-1" />
            Class Teacher - {classTeacherData.className}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes Today</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next: 10:00 AM - Mathematics
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across 4 different classes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Days remaining this year
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Timesheet submission due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Teacher Section - Only shown if user is a class teacher */}
      {isClassTeacher && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Class Overview Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    My Class - {classTeacherData.className}
                  </CardTitle>
                  <CardDescription>Class teacher responsibilities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold">{classTeacherData.totalStudents}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Attendance Today</p>
                  <p className="text-3xl font-bold text-green-600">
                    {classTeacherData.attendancePercentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Present: {classTeacherData.presentToday}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Absent: {classTeacherData.absentToday}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Attendance Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Student Attendance Overview
              </CardTitle>
              <CardDescription>Weekly attendance summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monday</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tuesday</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wednesday</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '88%' }}></div>
                    </div>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thursday</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '90%' }}></div>
                    </div>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 font-semibold">Today (Friday)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '90.5%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">90.5%</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications and Updates */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Exam Notifications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Exam Notifications
            </CardTitle>
            <CardDescription>Upcoming exams and assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Mathematics Mid-Term Exam</p>
                  <p className="text-xs text-muted-foreground">March 15, 2026 • Grade 10-A</p>
                  <p className="text-xs mt-1">Exam papers need to be submitted by March 13</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Science Unit Test</p>
                  <p className="text-xs text-muted-foreground">March 18, 2026 • Grade 9-B</p>
                  <p className="text-xs mt-1">Topics: Chemistry Ch. 1-3</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">History Quiz - Completed</p>
                  <p className="text-xs text-muted-foreground">March 8, 2026 • Grade 10-A</p>
                  <p className="text-xs mt-1">Results published, average score: 82%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex flex-col items-center justify-center bg-purple-600 text-white rounded-lg w-14 h-14 shrink-0">
                  <span className="text-xs font-medium">10:00</span>
                  <span className="text-xs">AM</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Mathematics</p>
                  <p className="text-xs text-muted-foreground">Grade 10-A • Room 305</p>
                  <Badge variant="secondary" className="mt-1 text-xs">Next Class</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col items-center justify-center bg-gray-600 text-white rounded-lg w-14 h-14 shrink-0">
                  <span className="text-xs font-medium">11:30</span>
                  <span className="text-xs">AM</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Physics</p>
                  <p className="text-xs text-muted-foreground">Grade 9-B • Lab 201</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col items-center justify-center bg-gray-600 text-white rounded-lg w-14 h-14 shrink-0">
                  <span className="text-xs font-medium">2:00</span>
                  <span className="text-xs">PM</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Chemistry</p>
                  <p className="text-xs text-muted-foreground">Grade 10-C • Lab 203</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
