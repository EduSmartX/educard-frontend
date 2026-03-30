import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeletedViewToggleProps {
  showDeleted: boolean;
  onToggle: () => void;
  resourceName?: string;
  className?: string;
}

export function DeletedViewToggle({
  showDeleted,
  onToggle,
  resourceName: _resourceName = 'items',
  className,
}: DeletedViewToggleProps) {
  return (
    <Button
      onClick={onToggle}
      variant={showDeleted ? 'default' : 'outline'}
      size="sm"
      className={
        showDeleted
          ? `border-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 [&>*]:!text-white ${className || ''}`
          : className
      }
    >
      {showDeleted ? (
        <>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          <span className="sm:hidden">Active</span>
          <span className="hidden sm:inline">View Active</span>
        </>
      ) : (
        <>
          <Trash2 className="mr-1.5 h-4 w-4" />
          <span className="sm:hidden">Deleted</span>
          <span className="hidden sm:inline">View Deleted</span>
        </>
      )}
    </Button>
  );
}
