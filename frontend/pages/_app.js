import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export default function MyApp({ Component, pageProps }) {
  // Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in the frontend env.
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
