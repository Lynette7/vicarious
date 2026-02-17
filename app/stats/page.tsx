
import { getUserCount } from '@/lib/user-stats';

export default async function StatsPage() {
  const totalUsers = await getUserCount();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">User Statistics</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-2">Total Users</h2>
        <p className="text-4xl font-bold">{totalUsers.toLocaleString()}</p>
      </div>
    </div>
  );
}