import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    sortable?: boolean;
    sortKey?: keyof T;
    className?: string;
}

interface SearchableTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchKeys: (keyof T)[];
    searchPlaceholder?: string;
    headerActions?: React.ReactNode;
    rowsPerPage?: number;
}

export function SearchableTable<T extends { id?: any; [key: string]: any }>({
    data,
    columns,
    searchKeys,
    searchPlaceholder = 'Search records...',
    headerActions,
    rowsPerPage = 10,
}: SearchableTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Handle sort trigger
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter and Sort Data
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Search filter
        if (searchTerm.trim() !== '') {
            const query = searchTerm.toLowerCase();
            result = result.filter((item) => {
                return searchKeys.some((key) => {
                    const value = item[key];
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(query);
                });
            });
        }

        // 2. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const strA = String(aVal).toLowerCase();
                const strB = String(bVal).toLowerCase();

                if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, searchKeys, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, currentPage, rowsPerPage]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9"
                    />
                </div>
                {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
            </div>

            <div className="bg-card rounded-md border dark:border-neutral-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, idx) => (
                                <TableHead key={idx} className={`whitespace-nowrap${column.className ? ` ${column.className}` : ''}`}>
                                    {column.sortable && column.sortKey ? (
                                        <button
                                            onClick={() => handleSort(column.sortKey as string)}
                                            className="hover:text-foreground flex items-center gap-1 transition-colors"
                                        >
                                            {column.header}
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIdx) => (
                                <TableRow key={row.id || rowIdx} className="hover:bg-muted/40">
                                    {columns.map((column, colIdx) => (
                                        <TableCell key={colIdx} className={column.className}>
                                            {typeof column.accessor === 'function' ? column.accessor(row) : (row[column.accessor] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="lg:flex items-center justify-center lg:justify-between">
                    <p className="text-muted-foreground text-sm text-center lg:text-left mb-2 lg:mb-0">
                        Showing {Math.min(processedData.length, (currentPage - 1) * rowsPerPage + 1)} to{' '}
                        {Math.min(processedData.length, currentPage * rowsPerPage)} of {processedData.length} records
                    </p>
                    <div className="flex items-center justify-center lg:justify-normal gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
