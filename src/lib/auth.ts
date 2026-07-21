export function verifierIdentifiants(nomUtilisateur: string, motDePasse: string): boolean {
  return nomUtilisateur === import.meta.env.VITE_AUTH_USERNAME && motDePasse === import.meta.env.VITE_AUTH_PASSWORD
}
