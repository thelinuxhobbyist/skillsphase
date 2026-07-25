import {
  JobListingView,
  ExampleJobListingView,
} from "@/components/job-listing-view";
import { getJobBySlug, listPublishedJobs, type HorizonJob } from "@/lib/api";
import {
  listingFromHorizonJob,
  similarCardsFromDemos,
  similarCardsFromLive,
} from "@/lib/job-listing";
import {
  findHomepageDemoJob,
  similarHomepageDemoJobs,
} from "@horizon/shared";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export default async function JobDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let liveJob: HorizonJob | null = null;
  try {
    liveJob = await getJobBySlug(slug);
  } catch {
    liveJob = null;
  }

  if (liveJob) {
    const similar = await listPublishedJobs({ page: 1, pageSize: 6 }).catch(
      () => ({ jobs: [], meta: { page: 1, pageSize: 6, total: 0 } }),
    );
    const similarJobs = similarCardsFromLive(
      similar.jobs.filter((j) => j.slug !== slug).slice(0, 3),
    );

    return <JobListingView listing={listingFromHorizonJob(liveJob, similarJobs)} />;
  }

  // Fallback to example / demo job if live job not found or DB not configured
  const demoJob = findHomepageDemoJob(slug);
  if (demoJob) {
    const similarJobs = similarCardsFromDemos(
      similarHomepageDemoJobs(demoJob.slug),
    );
    return <ExampleJobListingView job={demoJob} similarJobs={similarJobs} />;
  }

  notFound();
}
