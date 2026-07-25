import { ExampleJobListingView } from "@/components/job-listing-view";
import { similarCardsFromDemos } from "@/lib/job-listing";
import {
  findHomepageDemoJob,
  HOMEPAGE_DEMO_JOBS,
  similarHomepageDemoJobs,
} from "@horizon/shared";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return HOMEPAGE_DEMO_JOBS.map((job) => ({ slug: job.slug }));
}

export default async function ExampleJobPage({ params }: { params: Params }) {
  const { slug } = await params;
  const job = findHomepageDemoJob(slug);
  if (!job) notFound();
  const similarJobs = similarCardsFromDemos(similarHomepageDemoJobs(job.slug));
  return <ExampleJobListingView job={job} similarJobs={similarJobs} />;
}
