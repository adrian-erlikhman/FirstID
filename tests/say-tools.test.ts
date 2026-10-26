import { describe, expect, it } from "vitest";
import { pickVoice } from "../src/screens/SayTools";

// Read aloud must stay on the device: a network voice sends the text to a server.
const voice = (lang: string, localService: boolean) => ({ lang, localService, name: lang }) as unknown as SpeechSynthesisVoice;

describe("Read aloud voice", () => {
  it("never picks a network voice, even the only one for the language", () => {
    expect(pickVoice([voice("es-US", false)], "es")).toBeNull();
  });
  it("picks an on-device voice over a network voice in a preferred region", () => {
    expect(pickVoice([voice("es-US", false), voice("es-ES", true)], "es")?.lang).toBe("es-ES");
  });
  it("takes any on-device voice of the language", () => {
    expect(pickVoice([voice("en_GB", true)], "en")?.lang).toBe("en_GB");
  });
});
