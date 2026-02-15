/**
 * Profile Settings Page
 * Main page for managing user profile with tabbed interface
 */

import { User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileInformationForm } from '../components/profile-information-form';
import { PasswordChangeForm } from '../components/password-change-form';
import { EmailUpdateForm } from '../components/email-update-form';
import { PhoneUpdateForm } from '../components/phone-update-form';
import { AddressUpdateForm } from '../components/address-update-form';

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information, security, and contact details
        </p>
      </div>

      <Card>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2 py-3">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2 py-3">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2 py-3">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Phone</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2 py-3">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Address</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileInformationForm />
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <PasswordChangeForm />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailUpdateForm />
          </TabsContent>

          <TabsContent value="phone" className="mt-6">
            <PhoneUpdateForm />
          </TabsContent>

          <TabsContent value="address" className="mt-6">
            <AddressUpdateForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
