import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PageHeaderInfo {
  title: string;
  subtitle: string;
}

interface PageHeaderContextType {
  headerInfo: PageHeaderInfo;
  setHeaderInfo: (info: PageHeaderInfo) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerInfo, setHeaderInfo] = useState<PageHeaderInfo>({
    title: "",
    subtitle: "",
  });

  return (
    <PageHeaderContext.Provider value={{ headerInfo, setHeaderInfo }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
}

// Hook for pages to set their header
export function useSetPageHeader(title: string, subtitle: string) {
  const { setHeaderInfo } = usePageHeader();
  
  useEffect(() => {
    setHeaderInfo({ title, subtitle });
  }, [title, subtitle, setHeaderInfo]);
}
