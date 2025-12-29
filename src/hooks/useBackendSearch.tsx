import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { DateRange, FilterValue } from "@/components/filters/FilterDialog";

interface UseBackendSearchOptions {
  endpoint: string;
  debounceMs?: number;
  initialSearch?: string;
}

interface SearchParams {
  search: string;
  dateRange: DateRange;
  keyValues: FilterValue[];
}

export function useBackendSearch<T>({
  endpoint,
  debounceMs = 500,
  initialSearch = "",
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
      fetchData({ search: searchQuery, dateRange, keyValues });
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, debounceMs, fetchData, dateRange, keyValues]);

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
    fetchData({ search: searchQuery, dateRange, keyValues });
  }, [fetchData, searchQuery, dateRange, keyValues]);

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
  };
}
