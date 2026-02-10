/**
 * Common Table Columns Utilities
 * Reusable column definitions and action handlers for DataTable components
 * Provides standardized columns for Created By, Updated By, and Actions
 */

import { Edit, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Column } from '@/components/ui/data-table';

/**
 * Base interface for rows that support common columns
 */
export interface CommonRowData {
  created_by_name?: string | null;
  created_at: string;
  updated_by_name?: string | null;
  updated_at: string;
}

/**
 * Callbacks for action buttons
 */
export interface ActionCallbacks<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCustomAction?: (row: T, actionKey: string) => void;
}

/**
 * Custom action button configuration
 */
export interface CustomAction {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

/**
 * Options for the actions column
 */
export interface ActionsColumnOptions {
  variant?: 'buttons' | 'dropdown'; // Display as buttons or dropdown menu
  showLabels?: boolean; // Show text labels alongside icons
  align?: 'left' | 'center' | 'right';
  customActions?: CustomAction[];
}

/**
 * Format date for display in common columns
 */
function formatDateForDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Creates the "Created By" column
 */
export function createCreatedByColumn<T extends CommonRowData>(): Column<T> {
  return {
    header: 'Created By',
    accessor: (row) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{row.created_by_name || 'System'}</div>
        <div className="text-xs text-muted-foreground">{formatDateForDisplay(row.created_at)}</div>
      </div>
    ),
    sortable: true,
    sortKey: 'created_by_name',
  };
}

/**
 * Creates the "Last Updated" column
 */
export function createLastUpdatedColumn<T extends CommonRowData>(): Column<T> {
  return {
    header: 'Last Updated',
    accessor: (row) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{row.updated_by_name || 'System'}</div>
        <div className="text-xs text-muted-foreground">{formatDateForDisplay(row.updated_at)}</div>
      </div>
    ),
    sortable: true,
    sortKey: 'updated_at',
  };
}

/**
 * Creates the "Actions" column with View, Edit, and Delete buttons (Button variant)
 */
function createButtonActions<T>(
  row: T,
  callbacks: ActionCallbacks<T>,
  options?: ActionsColumnOptions
) {
  const { onView, onEdit, onDelete, onCustomAction } = callbacks;
  const { showLabels = false, customActions = [] } = options || {};

  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Button
          variant="ghost"
          size={showLabels ? 'sm' : 'icon'}
          onClick={(e) => {
            e.stopPropagation();
            onView(row);
          }}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="View details"
        >
          <Eye className="h-4 w-4" />
          {showLabels && <span className="ml-2">View</span>}
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size={showLabels ? 'sm' : 'icon'}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
          {showLabels && <span className="ml-2">Edit</span>}
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size={showLabels ? 'sm' : 'icon'}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
          {showLabels && <span className="ml-2">Delete</span>}
        </Button>
      )}
      {customActions.map((action) => {
        const Icon = action.icon;
        const variantClasses = {
          default: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50',
          destructive: 'text-red-600 hover:text-red-700 hover:bg-red-50',
          success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
          warning: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
        };

        return (
          <Button
            key={action.key}
            variant="ghost"
            size={showLabels ? 'sm' : 'icon'}
            onClick={(e) => {
              e.stopPropagation();
              onCustomAction?.(row, action.key);
            }}
            className={action.className || variantClasses[action.variant || 'default']}
            title={action.label}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {showLabels && <span className="ml-2">{action.label}</span>}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Creates the "Actions" column with dropdown menu
 */
function createDropdownActions<T>(
  row: T,
  callbacks: ActionCallbacks<T>,
  options?: ActionsColumnOptions
) {
  const { onView, onEdit, onDelete, onCustomAction } = callbacks;
  const { customActions = [] } = options || {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onView && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-600" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4 text-green-600" />
            Edit
          </DropdownMenuItem>
        )}
        {customActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.key}
              onClick={(e) => {
                e.stopPropagation();
                onCustomAction?.(row, action.key);
              }}
              className="cursor-pointer"
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              className="cursor-pointer text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Creates the "Actions" column with View, Edit, and Delete buttons
 * Supports both button and dropdown variants
 */
export function createActionsColumn<T>(
  callbacks: ActionCallbacks<T>,
  options?: ActionsColumnOptions
): Column<T> {
  const { variant = 'buttons', align = 'right' } = options || {};

  return {
    header: 'Actions',
    accessor: (row) =>
      variant === 'dropdown'
        ? createDropdownActions(row, callbacks, options)
        : createButtonActions(row, callbacks, options),
    headerClassName: align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : '',
  };
}

/**
 * Creates all common columns (Created By, Updated By, Actions)
 */
export function createCommonColumns<T extends CommonRowData>(
  callbacks: ActionCallbacks<T>,
  options?: {
    includeCreatedBy?: boolean;
    includeUpdatedBy?: boolean;
    actionsOptions?: ActionsColumnOptions;
  }
): Column<T>[] {
  const { includeCreatedBy = true, includeUpdatedBy = true, actionsOptions } = options || {};

  const columns: Column<T>[] = [];

  if (includeCreatedBy) {
    columns.push(createCreatedByColumn<T>());
  }

  if (includeUpdatedBy) {
    columns.push(createLastUpdatedColumn<T>());
  }

  columns.push(createActionsColumn<T>(callbacks, actionsOptions));

  return columns;
}
