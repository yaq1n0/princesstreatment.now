import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { buildYouTubeEmbedUrl, getYouTubeId, postYouTubeCommand } from '../utils/youtube';
import { detectAudioKind, detectMediaKind, resolveMediaSrc } from '../utils/media';

interface Props {
  src: string;
  audio: string;
  top: string;
  bottom: string;
  fullscreen?: boolean;
}

export default function Preview({ src, audio, top, bottom, fullscreen }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const kind = detectMediaKind(src);
  const resolvedSrc = resolveMediaSrc(src);
  const audioKind = detectAudioKind(audio);
  const hasAudio = audioKind !== 'none';
  const hasPlayableMedia =
    kind === 'video-direct' ||
    kind === 'video-youtube' ||
    ((kind === 'image' || kind === 'iframe') && hasAudio);
  const isEmpty = !src && !top && !bottom;

  const playAudio = useCallback(() => {
    if (audioKind === 'youtube') {
      postYouTubeCommand(audioIframeRef.current, 'playVideo');
    } else if (audioKind === 'direct') {
      void audioRef.current?.play().catch(() => {});
    }
  }, [audioKind]);

  const pauseAudio = useCallback(() => {
    if (audioKind === 'youtube') {
      postYouTubeCommand(audioIframeRef.current, 'pauseVideo');
    } else if (audioKind === 'direct') {
      audioRef.current?.pause();
    }
  }, [audioKind]);

  // Reset playback state when the media source changes. Uses the React-docs "adjusting
  // state during render" pattern so that it doesn't trigger cascading renders like useEffect would.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const mediaKey = `${src}|${audio}`;
  const [prevMediaKey, setPrevMediaKey] = useState(mediaKey);
  if (prevMediaKey !== mediaKey) {
    setPrevMediaKey(mediaKey);
    setIsPlaying(false);
  }

  // Direct video + audio sync. For YouTube-audio we can only play/pause — the iframe
  // can't be precisely scrubbed without loading the full YT IFrame API SDK, so `seeked`
  // is a no-op in that case and the audio continues from wherever YT left it.
  useEffect(() => {
    if (kind !== 'video-direct' || !hasAudio) return;
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      if (audioKind === 'direct' && audioRef.current) {
        audioRef.current.currentTime = video.currentTime;
      }
      playAudio();
      setIsPlaying(true);
    };
    const onPause = () => {
      pauseAudio();
      setIsPlaying(false);
    };
    const onSeeked = () => {
      if (audioKind === 'direct' && audioRef.current) {
        audioRef.current.currentTime = video.currentTime;
      }
    };
    const onEnded = () => {
      pauseAudio();
      setIsPlaying(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onEnded);
    };
  }, [kind, hasAudio, audioKind, src, audio, playAudio, pauseAudio]);

  // Direct video without audio: track native play state
  useEffect(() => {
    if (kind !== 'video-direct' || hasAudio) return;
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [kind, hasAudio, src]);

  // YouTube video iframe: listen to YT postMessage events for the *visible* video player.
  // Filter by event.source so the audio-iframe's messages don't drive video-player state.
  useEffect(() => {
    if (kind !== 'video-youtube') return;
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      if (typeof ev.data !== 'string') return;
      try {
        const data = JSON.parse(ev.data);
        if (
          data?.event === 'infoDelivery' &&
          data?.info &&
          typeof data.info.playerState === 'number'
        ) {
          const state = data.info.playerState as number;
          // 1=playing, 2=paused, 0=ended
          if (state === 2 || state === 0) {
            pauseAudio();
            setIsPlaying(false);
          } else if (state === 1) {
            setIsPlaying(true);
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [kind, pauseAudio]);

  const handlePlayClick = useCallback(() => {
    if ((kind === 'image' || kind === 'iframe') && hasAudio) {
      playAudio();
      setIsPlaying(true);
      if (audioKind === 'direct' && audioRef.current) {
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      return;
    }
    if (kind === 'video-direct') {
      const v = videoRef.current;
      if (!v) return;
      void v.play().catch(() => {});
      return;
    }
    if (kind === 'video-youtube') {
      postYouTubeCommand(iframeRef.current, 'playVideo');
      if (hasAudio) playAudio();
      setIsPlaying(true);
      return;
    }
  }, [kind, hasAudio, audioKind, playAudio]);

  const rootClass = fullscreen
    ? 'relative w-full h-full bg-princess-100 dark:bg-princess-900 overflow-hidden'
    : 'relative w-full h-full bg-princess-100 dark:bg-princess-900 overflow-hidden rounded-md';

  const ytId = kind === 'video-youtube' ? getYouTubeId(src) : null;
  const audioYtId = audioKind === 'youtube' ? getYouTubeId(audio) : null;

  return (
    <div data-testid="preview" className={rootClass}>
      {isEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div data-testid="preview-empty" className="font-princess text-princess-300 text-6xl">
            ♡
          </div>
        </div>
      ) : null}

      {kind === 'image' && src ? (
        <img
          data-testid="preview-image"
          src={resolvedSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : null}

      {kind === 'iframe' && src ? (
        <iframe
          data-testid="preview-iframe"
          src={resolvedSrc}
          title="Embedded media"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : null}

      {kind === 'video-direct' && src ? (
        hasAudio ? (
          <video
            data-testid="preview-video"
            ref={(el) => {
              videoRef.current = el;
              if (el) el.setAttribute('muted', '');
            }}
            src={src}
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <video
            data-testid="preview-video"
            ref={videoRef}
            src={src}
            playsInline
            controls
            className="absolute inset-0 w-full h-full object-contain"
          />
        )
      ) : null}

      {kind === 'video-youtube' && ytId ? (
        <iframe
          data-testid="preview-youtube"
          ref={iframeRef}
          src={buildYouTubeEmbedUrl(ytId, { mute: hasAudio })}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : null}

      {audioKind === 'direct' ? (
        <audio
          data-testid="preview-audio"
          ref={audioRef}
          src={audio}
          preload="auto"
          className="hidden"
        />
      ) : null}

      {audioKind === 'youtube' && audioYtId ? (
        // Hidden YT iframe used purely as an audio source. Must remain in-DOM and not
        // `display:none` — some browsers suspend iframes that aren't laid out, which
        // breaks the postMessage JS API. Zero-size + transparent + no pointer events
        // keeps it out of the way while still functional.
        <iframe
          data-testid="preview-audio-youtube"
          ref={audioIframeRef}
          src={buildYouTubeEmbedUrl(audioYtId, { mute: false })}
          title="YouTube audio"
          allow="autoplay; encrypted-media"
          className="absolute w-0 h-0 opacity-0 pointer-events-none border-0"
          aria-hidden="true"
        />
      ) : null}

      {top ? (
        <div
          data-testid="preview-top"
          className="overlay-text absolute top-3 left-0 right-0 text-center text-2xl md:text-4xl px-4 pointer-events-none"
        >
          {top}
        </div>
      ) : null}

      {bottom ? (
        <div
          data-testid="preview-bottom"
          className="overlay-text absolute bottom-3 left-0 right-0 text-center text-2xl md:text-4xl px-4 pointer-events-none"
        >
          {bottom}
        </div>
      ) : null}

      {hasPlayableMedia && !isPlaying ? (
        <button
          type="button"
          data-testid="preview-play"
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Play"
        >
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 text-princess-600 shadow-lg">
            <FontAwesomeIcon icon={faPlay} size="2x" />
          </span>
        </button>
      ) : null}
    </div>
  );
}
