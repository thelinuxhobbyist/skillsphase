import { JobListingView } from "@/components/job-listing-view";
import { getJobBySlug, listPublishedJobs } from "@/lib/api";
import {
  listingFromHorizonJob,
  similarCardsFromLive,
} from "@/lib/job-listing";
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

  const similar = await listPublishedJobs({ page: 1, pageSize: 6 }).catch(
    () => ({ jobs: [], meta: { page: 1, pageSize: 6, total: 0 } }),
  );
  const similarJobs = similarCardsFromLive(
    similar.jobs.filter((j) => j.slug !== slug).slice(0, 3),
  );

  return <JobListingView listing={listingFromHorizonJob(job, similarJobs)} />;
}
