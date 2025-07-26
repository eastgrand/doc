import { AppProps } from 'next/app';
import { GeospatialChatProvider } from '@/components/geospatial-chat-context-provider';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GeospatialChatProvider maxMessages={50}>
      <Component {...pageProps} />
    </GeospatialChatProvider>
  );
}

export default MyApp; 