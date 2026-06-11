import WhatsNewModal from '@/components/WhatsNewModal';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function App({ Component, pageProps }) {
  const { applyUpdate } = useServiceWorker();

  return (
    <>
      <Component {...pageProps} />
      <WhatsNewModal onRefresh={applyUpdate} />
    </>
  );
}
