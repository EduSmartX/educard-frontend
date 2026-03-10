/**
 * Coming Soon Page
 * Generic page to display for features under development
 */

import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
  title?: string;
  description?: string;
}

export default function ComingSoonPage({
  title = 'Coming Soon',
  description = 'This feature is currently under development and will be available soon.',
}: ComingSoonPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-2">
        <CardContent className="pt-12 pb-10">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Clock className="h-10 w-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

            {/* Description */}
            <p className="text-base text-gray-600">{description}</p>

            {/* Button */}
            <div className="pt-4">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
