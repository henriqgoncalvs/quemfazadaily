import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import { Inter } from 'next/font/google';
import '~/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`${inter.className} antialiased`}>
      <Component {...pageProps} />
    </main>
  );
};

export default api.withTRPC(MyApp);
