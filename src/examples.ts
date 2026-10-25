import { personas } from "../tests/personas";
import type { Person } from "./engine/types";

// The made-up people from the tests, so anyone can see a full path in one tap. Same data the persona tests check, so what the app shows
// for Maria is exactly what CI verified.
export interface Example {
  id: keyof typeof personas;
  name: string;
  line: { en: string; es: string };
  person: Person;
}

const lines: Record<string, Example["line"]> = {
  maria: { en: "34. Lost her papers, staying in a shelter.", es: "34 años. Perdió sus papeles; vive en un albergue." },
  deshawn: { en: "18. Leaving foster care without his documents.", es: "18 años. Sale del cuidado de crianza sin sus documentos." },
  luis: { en: "41. Just out of county jail, born in Texas, had an ID years ago.", es: "41 años. Recién salió de la cárcel del condado, nació en Texas, tuvo identificación hace años." },
  jayden: { en: "16. A LACES student getting his first ID.", es: "16 años. Estudiante de LACES que saca su primera identificación." },
};

export const examples: Example[] = (["maria", "deshawn", "luis", "jayden"] as const).map((id) => ({
  id,
  name: id === "deshawn" ? "DeShawn" : id[0].toUpperCase() + id.slice(1),
  line: lines[id],
  person: { facts: personas[id].facts, have: personas[id].have },
}));
