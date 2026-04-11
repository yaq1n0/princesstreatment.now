import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { useRequestState } from '../hooks/useRequestState';

interface Size {
  w?: number;
  h?: number;
}

const STORAGE_KEY = 'previewSize';
const MIN_W = 280;
const MIN_H = 200;
const DEFAULT_W = 480;
const DEFAULT_H = 360;

function readStoredSize(): Size {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const out: Size = {};
    if (typeof parsed.w === 'number') out.w = parsed.w;
    if (typeof parsed.h === 'number') out.h = parsed.h;
    return out;
  } catch {
    return {};
  }
}

function writeStoredSize(size: Size) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
  } catch {
    // ignore
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

interface Props {
  children: ReactNode;
}

export default function ResizablePreview({ children }: Props) {
  const navigate = useNavigate();
  const { queryString } = useRequestState();
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });
  const [size, setSize] = useState<Size>(() => readStoredSize());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsWide(e.matches);
      setSize((prev) => {
        const next: Size = { ...prev };
        if (e.matches) {
          delete next.h;
        } else {
          delete next.w;
        }
        writeStoredSize(next);
        return next;
      });
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const onPointerDown = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      ev.preventDefault();
      const handle = ev.currentTarget;
      handle.setPointerCapture(ev.pointerId);
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const startX = ev.clientX;
      const startY = ev.clientY;
      const startW = rect.width;
      const startH = rect.height;

      const onMove = (e: PointerEvent) => {
        if (isWide) {
          const dx = e.clientX - startX;
          const w = clamp(startW + dx, MIN_W, window.innerWidth * 0.7);
          setSize((prev) => ({ ...prev, w }));
        } else {
          const dy = e.clientY - startY;
          const h = clamp(startH - dy, MIN_H, window.innerHeight * 0.7);
          setSize((prev) => ({ ...prev, h }));
        }
      };

      const onUp = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        try {
          handle.releasePointerCapture(ev.pointerId);
        } catch {
          // ignore
        }
        setSize((prev) => {
          writeStoredSize(prev);
          return prev;
        });
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    },
    [isWide]
  );

  const style: React.CSSProperties = isWide
    ? { width: `${size.w ?? DEFAULT_W}px`, height: `${DEFAULT_H}px` }
    : { width: '100%', height: `${size.h ?? DEFAULT_H}px` };

  const handleMaximize = () => {
    navigate(`/view${queryString}`);
  };

  return (
    <div ref={containerRef} className="relative" style={style}>
      {children}
      <button
        type="button"
        data-testid="maximize"
        onClick={handleMaximize}
        aria-label="Maximize"
        className="absolute top-2 left-2 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-princess-700 hover:bg-white shadow"
      >
        <FontAwesomeIcon icon={faExpand} />
      </button>
      <div
        data-testid="resize-handle"
        onPointerDown={onPointerDown}
        className={
          isWide
            ? 'absolute top-0 right-0 h-full w-2 cursor-col-resize bg-princess-300/40 hover:bg-princess-400/60 z-20'
            : 'absolute top-0 left-0 w-full h-2 cursor-row-resize bg-princess-300/40 hover:bg-princess-400/60 z-20'
        }
        style={{ cursor: isWide ? 'col-resize' : 'row-resize' }}
      />
    </div>
  );
}
