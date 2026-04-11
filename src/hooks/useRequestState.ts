import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface RequestState {
  src: string;
  audio: string;
  top: string;
  bottom: string;
}

export type FieldKey = 'src' | 'audio' | 'top' | 'bottom';

export function useRequestState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state: RequestState = useMemo(() => {
    return {
      src: searchParams.get('src') ?? '',
      audio: searchParams.get('audio') ?? '',
      top: searchParams.get('top') ?? '',
      bottom: searchParams.get('bottom') ?? '',
    };
  }, [searchParams]);

  const setField = useCallback(
    (key: FieldKey, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      });
    },
    [setSearchParams]
  );

  const reset = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const queryString = useMemo(() => {
    const s = searchParams.toString();
    return s ? `?${s}` : '';
  }, [searchParams]);

  const buildViewUrl = useCallback(() => {
    return `${window.location.origin}/view${queryString}`;
  }, [queryString]);

  const buildCreateUrl = useCallback(() => {
    return `/${queryString}`;
  }, [queryString]);

  return { state, setField, reset, buildViewUrl, buildCreateUrl, queryString };
}
