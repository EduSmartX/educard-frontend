import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Mail, Clock, Settings, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/branding/logo';
import { ROUTES } from '@/constants/app-config';

interface RegistrationData {
  organizationName: string;
  organizationType: string;
  organizationEmail: string;
  adminName: string;
  adminEmail: string;
}

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationData = location.state as RegistrationData;

  // Redirect to login if no registration data
  useEffect(() => {
    if (!registrationData) {
      navigate(ROUTES.AUTH.LOGIN);
    }
  }, [registrationData, navigate]);

  if (!registrationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4">
                <CheckCircle2 className="h-16 w-16 text-teal-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Registration Successful! 🎉</h1>
            <p className="text-teal-50 text-lg">Welcome to EduCard, {registrationData.adminName}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <p className="text-lg text-gray-700">
                <strong>Congratulations!</strong> Your organization{' '}
                <strong className="text-teal-600">"{registrationData.organizationName}"</strong> has
                been successfully registered with EduCard.
              </p>
            </div>

            {/* Organization Details */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
              <h3 className="font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Organization Details
              </h3>
              <div className="space-y-2.5 text-sm font-mono">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-48">Name</span>
                  <span className="text-gray-700 mx-3">:</span>
                  <span className="text-gray-600 font-sans">
                    {registrationData.organizationName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-48">Type</span>
                  <span className="text-gray-700 mx-3">:</span>
                  <span className="text-gray-600 font-sans capitalize">
                    {registrationData.organizationType}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-48">Organization Email</span>
                  <span className="text-gray-700 mx-3">:</span>
                  <span className="text-gray-600 font-sans">
                    {registrationData.organizationEmail}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-48">Admin</span>
                  <span className="text-gray-700 mx-3">:</span>
                  <span className="text-gray-600 font-sans">
                    {registrationData.adminName} ({registrationData.adminEmail})
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-6">
              <h3 className="font-semibold text-cyan-800 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                What's Next?
              </h3>
              <p className="text-gray-700 mb-4">
                Your organization registration has been received successfully. Our team will review
                your application and verify the details.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-800 mb-3">
                  Once EduCard approves your organization, you will be notified via email and you
                  can:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Access your organization dashboard</strong> - View analytics and
                      manage your institution
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Settings className="h-5 w-5 text-cyan-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Set organization preferences</strong> - Configure academic year,
                      terms, and grading systems
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Add team members</strong> - Invite teachers, staff, and manage
                      permissions
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Configure leave allocations</strong> - Set up leave policies for staff
                      and teachers
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⏱️ Verification Timeline:</strong> This verification process typically
                  takes 24-48 hours. You will receive a confirmation email once your organization is
                  approved.
                </p>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Check your email!</strong> We've sent a confirmation email to{' '}
                  <strong className="text-blue-600">{registrationData.adminEmail}</strong> and{' '}
                  <strong className="text-blue-600">{registrationData.organizationEmail}</strong>{' '}
                  with all the details.
                </p>
              </div>
            </div>

            {/* Need Help Section */}
            <div className="text-center pt-4 border-t">
              <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions or need assistance, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <a
                  href="mailto:support@educard.com"
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  📧 support@educard.com
                </a>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-gray-600">📞 +91 1800-123-4567</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                className="flex-1 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 h-12 border-2 bg-white hover:bg-gray-50"
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 text-white p-6 text-center text-sm rounded-b-lg">
            <div className="flex justify-center mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-gray-400">
              This is an automated message. For support, contact us at{' '}
              <a href="mailto:support@educard.com" className="text-teal-400 hover:text-teal-300">
                support@educard.com
              </a>
            </p>
            <p className="text-gray-500 mt-2">© 2026 EduCard. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
