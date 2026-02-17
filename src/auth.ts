import { getServerSession } from 'next-auth';
import { authOptions } from './auth.config';

export const auth = () => getServerSession(authOptions);
export const isAdmin = (session: any) => session?.user?.role === 'admin';
