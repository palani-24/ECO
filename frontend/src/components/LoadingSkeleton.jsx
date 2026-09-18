import React from 'react';

const ShimmerBar = ({ className = 'h-4 w-full rounded-xl' }) => (
  <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800/80 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[metallicShimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-emerald-400/10 to-transparent" />
  </div>
);

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <ShimmerBar className="h-3.5 w-1/3" />
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
      </div>
      <ShimmerBar className="h-8 w-1/2" />
      <ShimmerBar className="h-3 w-3/4" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
      <div className="bg-slate-100 dark:bg-slate-800/60 h-12 w-full flex items-center px-4 space-x-4">
        <ShimmerBar className="h-4 w-1/4" />
        <ShimmerBar className="h-4 w-1/4" />
        <ShimmerBar className="h-4 w-1/4" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 items-center">
            <ShimmerBar className="h-4 flex-1" />
            <ShimmerBar className="h-4 w-20" />
            <ShimmerBar className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm h-64 flex flex-col justify-between">
      <ShimmerBar className="h-4 w-1/4" />
      <div className="flex items-end justify-between space-x-2 flex-1 pt-6">
        <ShimmerBar className="h-16 w-1/6" />
        <ShimmerBar className="h-24 w-1/6" />
        <ShimmerBar className="h-36 w-1/6" />
        <ShimmerBar className="h-48 w-1/6" />
        <ShimmerBar className="h-28 w-1/6" />
        <ShimmerBar className="h-40 w-1/6" />
      </div>
    </div>
  );
};

export const NotificationSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBar className="h-4 w-1/3" />
            <ShimmerBar className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  NotificationSkeleton
};
