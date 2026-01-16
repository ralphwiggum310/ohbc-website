import { FiLoader } from 'react-icons/fi';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );
}
