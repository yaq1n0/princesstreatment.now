import { useNavigate } from 'react-router-dom';
import { useRequestState } from '../hooks/useRequestState';
import Preview from '../components/Preview';
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
          onMinimise={() => navigate(`/${queryString}`)}
          shareUrl={hasAnything ? buildViewUrl() : ''}
          onShareToast={show}
        />
      </div>
      <Toast message={message} visible={visible} />
    </div>
  );
}
