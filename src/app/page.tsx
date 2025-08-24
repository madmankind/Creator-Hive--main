import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the mobile home page
  redirect('/home');
}
