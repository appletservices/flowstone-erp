import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { DateRange, FilterValue } from "@/components/filters/FilterDialog";

interface UseBackendSearchOptions {
  endpoint: string;
  debounceMs?: number;
  initialSearch?: string;
  pageSize?: number;
}

interface SearchParams {
  search: string;
  dateRange: DateRange;
  keyValues: FilterValue[];
  page: number;
  pageSize: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export function useBackendSearch<T>({
  endpoint,
  debounceMs = 500,
  initialSearch = "",
  pageSize: initialPageSize = 10,
}: UseBackendSearchOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [keyValues, setKeyValues] = useState<FilterValue[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: initialPageSize,
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const buildUrl = useCallback(
    (params: SearchParams) => {
      const url = new URL(`${import.meta.env.VITE_API_URL}${endpoint}`);

      if (params.search) {
        url.searchParams.append("search", params.search);
      }

      if (params.dateRange.from) {
        url.searchParams.append(
          "from_date",
          format(params.dateRange.from, "yyyy-MM-dd")
        );
      }

      if (params.dateRange.to) {
        url.searchParams.append(
          "to_date",
          format(params.dateRange.to, "yyyy-MM-dd")
        );
      }

      params.keyValues.forEach((kv) => {
        if (kv.key && kv.value) {
          url.searchParams.append(kv.key, kv.value);
        }
      });

      // Add pagination params
      url.searchParams.append("page", params.page.toString());
      url.searchParams.append("per_page", params.pageSize.toString());

      return url.toString();
    },
    [endpoint]
  );

  const fetchData = useCallback(
    async (params: SearchParams) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(buildUrl(params), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setData(result.data || []);
          if (result.summary) {
            setSummary(result.summary);
          }
          if (result.info) {
            setSummary(result.info);
          }
          // Update pagination info from response
          const totalRecords = result.recordsTotal || result.total || result.data?.length || 0;
          const totalPages = Math.ceil(totalRecords / params.pageSize) || 1;
          setPagination({
            currentPage: params.page,
            totalPages,
            totalRecords,
            pageSize: params.pageSize,
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl]
  );

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchData({ search: searchQuery, dateRange, keyValues, page: currentPage, pageSize });
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, debounceMs, fetchData, dateRange, keyValues, currentPage, pageSize]);

  // Reset to first page when search/filters/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, keyValues, pageSize]);

  const applyFilters = useCallback(
    (filters: { dateRange: DateRange; keyValues: FilterValue[] }) => {
      setDateRange(filters.dateRange);
      setKeyValues(filters.keyValues);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setDateRange({ from: undefined, to: undefined });
    setKeyValues([]);
  }, []);

  const refresh = useCallback(() => {
    fetchData({ search: searchQuery, dateRange, keyValues, page: currentPage, pageSize });
  }, [fetchData, searchQuery, dateRange, keyValues, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  }, [pagination.totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, pagination.totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const hasActiveFilters =
    !!dateRange.from || !!dateRange.to || keyValues.length > 0;

  return {
    data,
    setData,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    clearFilters,
    refresh,
    summary,
    hasActiveFilters,
    // Pagination
    pagination,
    currentPage,
    setCurrentPage: goToPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  };
}
