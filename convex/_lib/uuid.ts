export const GALAXY_MAPPINGS: Record<string, { name: string; code: string }> = {
  "20": { name: "Cartwheel", code: "C" },
  "21": { name: "Andromeda", code: "A" },
  "22": { name: "Milky Way", code: "M" },
  "23": { name: "Whirlpool", code: "W" },
}

export const STAR_MAPPINGS: Record<string, { name: string; code: string }> = {
  mechanical: { name: "Vega", code: "V" },
  urp: { name: "Arcturus", code: "A" },
  architecture: { name: "Betelgeuse", code: "B" },
  pme: { name: "Capella", code: "C" },
  cse: { name: "Rigel", code: "R" },
  eee: { name: "Polaris", code: "P" },
  civil: { name: "Zubenelgenubi", code: "Z" },
  ete: { name: "Lethas", code: "L" },
  mie: { name: "Deneb", code: "D" },
  bme: { name: "Fomalhaut", code: "F" },
  mme: { name: "Kochab", code: "K" },
  wre: { name: "Sirius", code: "S" },
}

export function defaultUuidMapping(hscBatch: string, department: string) {
  const galaxy = GALAXY_MAPPINGS[hscBatch.trim().slice(-2)]
  const star = STAR_MAPPINGS[department.trim().toLowerCase()]
  if (!galaxy || !star) return null
  return {
    galaxyName: galaxy.name,
    starName: star.name,
    code: `${galaxy.code}${star.code}`,
  }
}
