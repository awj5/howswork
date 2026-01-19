import { useContext } from "react";
import { UserContext } from "@/context/user-context";

export function useUserContext() {
  const userContext = useContext(UserContext);
  if (!userContext) throw new Error("useUserContext must be used within a UserContext.Provider");
  return userContext;
}
