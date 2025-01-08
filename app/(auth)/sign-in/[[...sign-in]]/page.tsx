import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';

const defaultUrl = process.env.VERCEL_URL
  ? `https://codedock-ai.vercel.app/sign-in`
  : process.env.NODE_ENV === 'development'
  ? `http://localhost:3000/sign-in`
  : `https://codedock-ai.vercel.app/sign-in`;

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Sign in | CodeDock AI',
  description: 'Sign in to your CodeDock account'
};

const SignInPage = () => {
  return (
    <SignIn path="/sign-in" />
  )
};

export default SignInPage