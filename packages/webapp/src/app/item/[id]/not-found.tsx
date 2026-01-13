import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
      <p className="text-gray-600 mb-4">The thought you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
