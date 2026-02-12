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
      className={
        showDeleted
          ? `bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 [&>*]:!text-white ${className || ''}`
          : className
      }
    >
      {showDeleted ? (
        <>
          <RotateCcw className="h-4 w-4 mr-2" />
          View Active
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          View Deleted
        </>
      )}
    </Button>
  );
}
