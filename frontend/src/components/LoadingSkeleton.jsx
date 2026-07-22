import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl animate-pulse space-y-4 shadow-sm">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="bg-slate-100 dark:bg-slate-800 h-12 w-full"></div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl animate-pulse space-y-4 shadow-sm h-64 flex flex-col justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      <div className="flex items-end justify-between space-x-2 flex-1 pt-6">
        <div className="bg-slate-200 dark:bg-slate-800 rounded h-16 w-1/6"></div>
        <div className="bg-slate-300 dark:bg-slate-700 rounded h-24 w-1/6"></div>
        <div className="bg-slate-200 dark:bg-slate-800 rounded h-36 w-1/6"></div>
        <div className="bg-slate-300 dark:bg-slate-700 rounded h-48 w-1/6"></div>
        <div className="bg-slate-200 dark:bg-slate-800 rounded h-28 w-1/6"></div>
        <div className="bg-slate-300 dark:bg-slate-700 rounded h-40 w-1/6"></div>
      </div>
    </div>
  );
};

export const NotificationSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
