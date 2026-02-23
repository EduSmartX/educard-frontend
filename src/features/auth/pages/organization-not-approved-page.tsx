import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Building2, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/logo';
import { ROUTES } from '@/constants/app-config';
import { USER_ROLES } from '@/constants/user-constants';
import { getParsedLocalStorageItem } from '@/lib/utils/storage';

export default function OrganizationNotApprovedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get organization data from location state or localStorage
  const state = location.state || {};
  const storedOrg =
    getParsedLocalStorageItem<{
      name?: string;
      email?: string;
      phone?: string;
      is_verified?: boolean;
      is_rejected?: boolean;
    }>('organization') || {};

  const organizationName = state.organizationName || storedOrg.name || 'Your Organization';
  const organizationEmail = state.organizationEmail || storedOrg.email;
  const organizationPhone = state.organizationPhone || storedOrg.phone;
  const isVerified = state.isVerified ?? storedOrg.is_verified ?? false;
  const isRejected = state.isRejected ?? storedOrg.is_rejected ?? false;
  const userRole = state.userRole || USER_ROLES.ADMIN;

  const handleLogout = () => {
    localStorage.clear();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl border border-white/40 p-8 space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Status Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`h-24 w-24 rounded-full ${isRejected ? 'bg-gradient-to-br from-red-100 to-rose-100' : 'bg-gradient-to-br from-orange-100 to-amber-100'} flex items-center justify-center animate-pulse`}>
                {isRejected ? (
                  <XCircle className="h-12 w-12 text-red-600" strokeWidth={2} />
                ) : (
                  <Clock className="h-12 w-12 text-orange-600" strokeWidth={2} />
                )}
              </div>
              <div className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-full ${isRejected ? 'bg-red-500' : 'bg-orange-500'} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{isRejected ? '❌' : '⏳'}</span>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-4">
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${isRejected ? 'from-red-600 to-rose-600' : 'from-orange-600 to-amber-600'} bg-clip-text text-transparent`}>
              {isRejected ? 'Organization Rejected' : 'Organization Under Review'}
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              {isRejected ? 'Your organization is not registered with us' : 'Your account is pending approval'}
            </p>
          </div>

          {/* Organization Info Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Building2 className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{organizationName}</h3>
                <div className="space-y-2">
                  {organizationEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-orange-500" />
                      <span>{organizationEmail}</span>
                    </div>
                  )}
                  {organizationPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span>{organizationPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-orange-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                {isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Not Verified</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                {isRejected ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Rejected</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">Pending Approval</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className={`${isRejected ? 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'} rounded-2xl p-6`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{isRejected ? '⚠️' : 'ℹ️'}</span>
              <div className="flex-1 space-y-3">
                {isRejected ? (
                  <>
                    <h3 className="font-bold text-gray-900 text-lg">Organization Not Registered</h3>
                    <div className="text-sm text-gray-700">
                      {userRole === USER_ROLES.ADMIN ? (
                        <p>
                          The organization is unregistered with us. Please contact the <strong>Educard Administrator</strong> for further assistance and to resolve this issue.
                        </p>
                      ) : (
                        <p>
                          Your organization has been rejected or is not registered. Please contact your <strong>Organization Admin or Principal</strong> for more information and next steps.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900 text-lg">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">1.</span>
                        <span>
                          Our team is currently reviewing your organization's information and documents.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">2.</span>
                        <span>
                          You'll receive an email notification once your organization is approved.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">3.</span>
                        <span>The approval process typically takes 1-2 business days.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">4.</span>
                        <span>After approval, you'll have full access to all features.</span>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">💬</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  {isRejected
                    ? userRole === USER_ROLES.ADMIN
                      ? 'Please contact the Educard support team to understand the rejection reason and how to proceed.'
                      : 'Please reach out to your Organization Admin or Principal for assistance with this matter.'
                    : 'If you have any questions or need to expedite the approval process, please contact our support team.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {(userRole === USER_ROLES.ADMIN || !isRejected) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => (window.location.href = 'mailto:support@educard.com')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isRejected ? 'Contact Educard Admin' : 'Email Support'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="brandOutline"
              className="w-full h-12 text-base font-semibold"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
