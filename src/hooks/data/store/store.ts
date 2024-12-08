import { Team } from '@hooks/data/user/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardStoreState {
  isPassportFlowEnabled: boolean;
  passportAuthToken: string;
  teamId: string;
  magicTeams: Team[];
  setIsPassportFlowEnabled: (isEnabled: boolean) => void;
  setPassportAuthToken: (token: string) => void;
  setTeamId: (teamId: string) => void;
  setMagicTeams: (teams: Team[]) => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set) => ({
      isPassportFlowEnabled: false,
      passportAuthToken: '',
      teamId: '',
      magicTeams: [],
      setIsPassportFlowEnabled: (isPassportFlowEnabled) => set({ isPassportFlowEnabled }),
      setPassportAuthToken: (passportAuthToken) => set({ passportAuthToken }),
      setTeamId: (teamId) => set({ teamId }),
      setMagicTeams: (magicTeams) => set({ magicTeams }),
    }),
    { name: 'dashboard-store', partialize: (state) => ({ passportAuthToken: state.passportAuthToken }) },
  ),
);
