import React from 'react';
import UserStatsCard from '@/components/UserStatsCard';
import AchievementsPanel from '@/components/AchievementsPanel';

export default function GameificationDashboard() {
  return (
    <div className="space-y-6">
      <UserStatsCard />
      <AchievementsPanel />
    </div>
  );
}