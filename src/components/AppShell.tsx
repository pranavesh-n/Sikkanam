import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import DesktopNav from "./DesktopNav";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { pathname } = useLocation();
  const hideTop = pathname === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DesktopNav />
      <div className="md:hidden">{!hideTop && <TopBar />}</div>
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
