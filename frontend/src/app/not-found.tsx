import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f8f7] text-[#1d3137] p-4 text-center font-sans tracking-wide">
      <h1 className="text-6xl font-bold mb-4 text-[#285664]">404</h1>
      <h2 className="text-2xl mb-8">System node unallocated.</h2>
      <p className="max-w-md text-[#708188] mb-8">
        The DARPAN infrastructure diagnostic tool could not locate the requested resource. 
        It may have been re-indexed or removed from the national portfolio.
      </p>
      <Link href="/" className="px-6 py-3 bg-[#1d3137] text-white rounded-md font-medium hover:bg-[#285664] transition-colors">
        Return to Command Center
      </Link>
    </div>
  );
}
