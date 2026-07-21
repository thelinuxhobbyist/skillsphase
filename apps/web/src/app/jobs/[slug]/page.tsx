import { JobListingView } from "@/components/job-listing-view";
import { getJobBySlug } from "@/lib/api";
import { listingFromHorizonJob } from "@/lib/job-listing";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export default async function JobDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let job;
  try {
    job = await getJobBySlug(slug);
  } catch {
    notFound();
  }

  return <JobListingView listing={listingFromHorizonJob(job)} />;
}
