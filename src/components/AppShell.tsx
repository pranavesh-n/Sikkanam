import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import DesktopNav from "./DesktopNav";
import { Footer } from "./Footer";

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
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
