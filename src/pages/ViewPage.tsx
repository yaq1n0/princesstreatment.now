import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress } from '@fortawesome/free-solid-svg-icons';
import { useRequestState } from '../hooks/useRequestState';
import Preview from '../components/Preview';
import ShareButton from '../components/ShareButton';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function ViewPage() {
  const navigate = useNavigate();
  const { state, buildViewUrl, queryString } = useRequestState();
  const { message, visible, show } = useToast();

  const hasAnything = !!(state.src || state.audio || state.top || state.bottom);

  return (
    <div className="fixed inset-0 bg-princess-950 flex items-center justify-center">
      <div className="w-full h-full">
        <Preview
          src={state.src}
          audio={state.audio}
          top={state.top}
          bottom={state.bottom}
          fullscreen
        />
      </div>
      <button
        type="button"
        data-testid="minimize"
        onClick={() => navigate(`/${queryString}`)}
        aria-label="Minimize"
        className="absolute top-4 left-4 z-30 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-princess-700 hover:bg-white shadow"
      >
        <FontAwesomeIcon icon={faCompress} />
      </button>
      <div className="absolute bottom-6 right-6 z-30">
        <ShareButton url={buildViewUrl()} disabled={!hasAnything} onToast={show} />
      </div>
      <Toast message={message} visible={visible} />
    </div>
  );
}
