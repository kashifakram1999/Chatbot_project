import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title={title} subtitle={subtitle} />
        <CardBody>{children}</CardBody>
      </Card>
    </div>
  );
}
