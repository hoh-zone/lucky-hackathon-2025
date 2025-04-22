import EditDrawClient from "@/components/edit-draw-client";

interface PageProps {
  params: { id: string };
}

export default async function EditDrawPage({ params }: PageProps) {
  const { id } = await params;
  return <EditDrawClient drawId={id} />;
}
