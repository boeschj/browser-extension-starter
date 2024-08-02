interface PageTemplateProps {
  children: React.ReactNode;
}

export default function PageTemplate({ children }: PageTemplateProps) {
  return <main className="h-screen w-screen">{children}</main>;
}
