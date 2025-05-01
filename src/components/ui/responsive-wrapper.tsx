
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  className?: string;
}

export function ResponsiveWrapper({
  children,
  mobileClassName = "",
  desktopClassName = "",
  className = "",
}: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${className} ${isMobile ? mobileClassName : desktopClassName}`}>
      {children}
    </div>
  );
}

export function MobileOnly({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  return <>{children}</>;
}

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  if (isMobile) return null;
  return <>{children}</>;
}
