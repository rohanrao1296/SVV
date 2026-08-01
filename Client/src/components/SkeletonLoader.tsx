import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded ${className}`}>
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-12 rounded-lg" />
        <Skeleton className="h-8 w-12 rounded-lg" />
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, idx) => (
        <TableRowSkeleton key={idx} />
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
      <Skeleton className="h-6 w-1/4" />
      <div className="h-64 flex items-end justify-between gap-2 pt-6">
        <Skeleton className="h-1/3 flex-1" />
        <Skeleton className="h-2/3 flex-1" />
        <Skeleton className="h-1/2 flex-1" />
        <Skeleton className="h-3/4 flex-1" />
        <Skeleton className="h-2/5 flex-1" />
        <Skeleton className="h-5/6 flex-1" />
        <Skeleton className="h-1/2 flex-1" />
      </div>
    </div>
  );
};
