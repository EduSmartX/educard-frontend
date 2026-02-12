import { StudentsManagement } from '../components/students-management';

export default function StudentsListPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <StudentsManagement />
      </div>
    </div>
  );
}
