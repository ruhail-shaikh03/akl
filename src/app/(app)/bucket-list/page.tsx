import { getBucketItems } from "./actions";
import { BucketListClient } from "./BucketListClient";

export default async function BucketListPage() {
  const items = await getBucketItems();

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-safe pt-6">
      <h1 className="mb-4 font-heading text-2xl">Bucket List</h1>
      <BucketListClient items={items} />
    </main>
  );
}
