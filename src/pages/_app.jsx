import WhatsNewModal from '@/components/WhatsNewModal';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <WhatsNewModal />        
    </>
  );
}
