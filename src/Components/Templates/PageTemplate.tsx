interface PageTemplateProps {
  children: React.ReactNode;
}

export default function PageTemplate({ children }: PageTemplateProps) {
  return (
    <main className="flex justify-center items-center h-full w-full">
      {children}
    </main>
  );
}
