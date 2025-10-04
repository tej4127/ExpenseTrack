import { redirect } from 'next/navigation';


export default function AdminPage() {
  // The parent /admin route redirects to the first sub-item.
  redirect('/admin/users');
}
