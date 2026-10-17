import { useState, useCallback, useEffect, useRef } from "react";



export interface PaginationParams {
    currentPage: number;
    pageSize: number;
}

export interface UsePaginatedApiOptions<TItem, TExtraParams extends object> {
    fetcher: (params: PaginationParams & TExtraParams) => Promise<TItem[]>;
    initialPage?: number;
    initialPageSize?: number;
    extraParams?: TExtraParams;
    enabled?: boolean;
}

export interface UsePaginatedApiResult<TItem> {
    data: TItem[];
    loading: boolean;
    error: unknown;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    hasMoreData: boolean;
    refetch: () => void;
}

export function usePaginatedApi<TItem, TExtraParams extends object = {}>({
                                                                             fetcher,
                                                                             initialPage = 1,
                                                                             initialPageSize = 10,
                                                                             extraParams,
                                                                             enabled = true,
                                                                         }: UsePaginatedApiOptions<TItem, TExtraParams>): UsePaginatedApiResult<TItem> {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [data, setData] = useState<TItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [hasMoreData, setHasMoreData] = useState(true);

    const requestIdRef = useRef(0);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(null);

        try {
            const params = {
                currentPage,
                pageSize,
                ...(extraParams as TExtraParams),
            } as PaginationParams & TExtraParams;

            const result = await fetcher(params);


            if (requestId !== requestIdRef.current) return;

            setData(result);
            setHasMoreData(result.length > 0 && result.length >= pageSize);
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            setError(err);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }

    }, [currentPage, pageSize, fetcher, JSON.stringify(extraParams), enabled]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        hasMoreData,
        refetch: fetchData,
    };
}


export interface PageResult<TItem> {
    data: TItem[];
    hasMore: boolean;
}

export interface UseLoadMorePaginationOptions<TItem, TExtraParams extends object> {
    fetchPage: (params: PaginationParams & TExtraParams) => Promise<PageResult<TItem>>;
    initialData?: TItem[];
    initialPage?: number;
    pageSize?: number;
    extraParams?: TExtraParams;
    resetKey?: unknown;
}

export interface UseLoadMorePaginationResult<TItem> {
    data: TItem[];
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    hasMoreData: boolean;
    loading: boolean;
    error: unknown;
    loadMore: () => Promise<void>;
    reset: (newInitialData?: TItem[]) => void;
}

export function useLoadMorePagination<TItem, TExtraParams extends object = {}>({
                                                                                   fetchPage,
                                                                                   initialData = [],
                                                                                   initialPage = 1,
                                                                                   pageSize = 10,
                                                                                   extraParams,
                                                                                   resetKey,
                                                                               }: UseLoadMorePaginationOptions<TItem, TExtraParams>): UseLoadMorePaginationResult<TItem> {
    const [data, setData] = useState<TItem[]>(initialData);
    const [page, setPage] = useState(initialPage);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const requestIdRef = useRef(0);
    const isFirstRunRef = useRef(true);

    const reset = useCallback(
        (newInitialData: TItem[] = initialData) => {
            requestIdRef.current++;
            setData(newInitialData);
            setPage(initialPage);
            setHasMoreData(true);
            setError(null);
        },
        [initialPage]
    );

    useEffect(() => {
        if (isFirstRunRef.current) {
            isFirstRunRef.current = false;
            return;
        }
        reset(initialData);
    }, [resetKey]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMoreData) return;

        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(null);

        try {
            const nextPage = page + 1;
            const params = {
                currentPage: nextPage,
                pageSize,
                ...(extraParams as TExtraParams),
            } as PaginationParams & TExtraParams;

            const result = await fetchPage(params);

            if (requestId !== requestIdRef.current) return;

            setData((prev) => [...prev, ...result.data]);
            setPage(nextPage);
            setHasMoreData(result.hasMore);
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            setError(err);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [page, pageSize, JSON.stringify(extraParams), fetchPage, loading, hasMoreData]);

    return {
        data,
        page,
        setPage,
        pageSize,
        hasMoreData,
        loading,
        error,
        loadMore,
        reset,
    };
}