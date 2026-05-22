import { createDownloadRequest } from '@/lib/download-requests';

export async function POST(request: Request) {
  return createDownloadRequest(request);
}
