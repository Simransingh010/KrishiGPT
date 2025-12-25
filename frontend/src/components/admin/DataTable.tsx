"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    isLoading?: boolean;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage = "No data found",
    isLoading,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    "px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={() => onRowClick?.(item)}
                            className={cn(
                                "transition-colors",
                                onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            )}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn(
                                        "px-4 py-4 text-sm text-slate-700 dark:text-slate-300",
                                        col.className
                                    )}
                                >
                                    {col.render
                                        ? col.render(item)
                                        : (item as Record<string, unknown>)[col.key]?.toString()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
