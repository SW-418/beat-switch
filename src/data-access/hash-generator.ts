import { Track } from "@/services/track";
import { sha256Hash, base64encode } from "@/utils/crypto";

class HashGenerator {
    async generateTrackHash(track: Track): Promise<string> {
        const trackString = `${track.name}-${track.album}-${track.isrc}`;
        const hash = await sha256Hash(trackString);
        return base64encode(hash);
    }
}

export default HashGenerator;
