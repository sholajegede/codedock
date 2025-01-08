import { SignUp } from '@clerk/nextjs';
import { Metadata } from 'next';

const defaultUrl = process.env.VERCEL_URL
  ? `https://codedock-ai.vercel.app/sign-up`
  : process.env.NODE_ENV === 'development'
  ? `http://localhost:3000/sign-up`
  : `https://codedock-ai.vercel.app/sign-up`;

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Sign Up | CodeDock AI',
  description: 'Create a free account on CodeDock AI'
};

const SignUpPage = () => {
  return (
    <SignUp path="/sign-up" />
  )
};

export default SignUpPage