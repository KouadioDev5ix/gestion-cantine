import { ACCES_AUTORISE } from "./access"

export function verifierIdentifiants(nomUtilisateur: string, motDePasse: string): boolean {
  return nomUtilisateur === ACCES_AUTORISE.nomUtilisateur && motDePasse === ACCES_AUTORISE.motDePasse
}
