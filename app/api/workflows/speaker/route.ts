import { createSpeakerRequest } from '@/lib/speaker-requests';

export async function POST(request: Request) {
  return createSpeakerRequest(request);
}
