import { UserBudgetInfo } from "@/ipc/ipc_types";

export function useUserBudgetInfo() {
  return {
    userBudget: null as UserBudgetInfo | null,
    isLoadingUserBudget: false,
    userBudgetError: null,
    isFetchingUserBudget: false,
    refetchUserBudget: async () => { },
  };
}
