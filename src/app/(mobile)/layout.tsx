import { TabBar } from '@/components/nav/TabBar';
import { FAB } from '@/components/ui/FAB';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <TabBar />
      <FAB>Create</FAB>
    </div>
  );
}