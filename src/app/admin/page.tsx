import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the admin dashboard by default
  redirect('/admin/dashboard');
  
  // This return statement is here to make TypeScript happy
  // but it will never be reached due to the redirect above
  return null;
}
