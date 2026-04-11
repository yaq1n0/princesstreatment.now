import { useRequestState } from '../hooks/useRequestState';
import { detectMediaKind } from '../utils/media';
import Preview from '../components/Preview';
import ResizablePreview from '../components/ResizablePreview';
import MediaInput from '../components/MediaInput';
import AudioInput from '../components/AudioInput';
import TextInput from '../components/TextInput';
import ShareButton from '../components/ShareButton';
import ResetButton from '../components/ResetButton';
import ThemeToggle from '../components/ThemeToggle';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function CreatorPage() {
  const { state, setField, reset, buildViewUrl } = useRequestState();
  const { message, visible, show } = useToast();

  const hasAnything = !!(state.src || state.audio || state.top || state.bottom);
  const kind = detectMediaKind(state.src);
  const hasVideo = kind === 'video-direct' || kind === 'video-youtube';

  return (
    <div className="min-h-full flex flex-col">
      <header className="w-full flex items-center justify-between px-4 md:px-8 py-4 border-b border-princess-200 dark:border-princess-800">
        <h1 className="font-princess text-2xl md:text-3xl">
          Request Princess Treatment <span className="text-princess-500">NOW</span>
        </h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex flex-col-reverse md:flex-row gap-6 p-4 md:p-8">
        <section className="flex-shrink-0">
          <ResizablePreview>
            <Preview
              src={state.src}
              audio={state.audio}
              top={state.top}
              bottom={state.bottom}
            />
          </ResizablePreview>
        </section>
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          <MediaInput src={state.src} onSrcChange={(v) => setField('src', v)} />
          <AudioInput
            audio={state.audio}
            hasVideo={hasVideo}
            onChange={(v) => setField('audio', v)}
          />
          <TextInput
            top={state.top}
            bottom={state.bottom}
            onTopChange={(v) => setField('top', v)}
            onBottomChange={(v) => setField('bottom', v)}
          />
          <div className="flex items-center gap-3">
            <ShareButton url={buildViewUrl()} disabled={!hasAnything} onToast={show} />
            <ResetButton onClick={reset} />
          </div>
        </section>
      </main>
      <Toast message={message} visible={visible} />
    </div>
  );
}
