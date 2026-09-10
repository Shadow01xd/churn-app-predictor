/**
 * Reglas de coherencia entre features del dataset Telco.
 *
 * El modelo se entrenó SOLO con combinaciones que respetan estas reglas
 * (p.ej. si no hay servicio de internet, los add-ons de internet valen
 * "No internet service"). Alimentarlo con combinaciones imposibles hace que
 * extrapole fuera de su dominio y devuelva probabilidades poco fiables.
 */

const INTERNET_ADDON_KEYS = [
  'OnlineSecurity',
  'OnlineBackup',
  'DeviceProtection',
  'TechSupport',
  'StreamingTV',
  'StreamingMovies',
] as const;

const NO_INTERNET = 'No internet service';
const NO_PHONE = 'No phone service';

type FeatureLike = Record<string, unknown>;

/**
 * Devuelve la lista de incoherencias encontradas (vacía si todo está bien).
 * Sólo revisa los campos presentes en `f` (sirve para create y para update).
 */
export function checkFeatureCoherence(f: FeatureLike): string[] {
  const errors: string[] = [];

  const has = (k: string) => f[k] !== undefined && f[k] !== null;

  // ── Teléfono ↔ Múltiples líneas ──────────────────────────────────────────
  if (has('PhoneService') && has('MultipleLines')) {
    const noPhone = f.PhoneService === 'No';
    const linesNoPhone = f.MultipleLines === NO_PHONE;
    if (noPhone && !linesNoPhone) {
      errors.push(
        'Si el cliente no tiene servicio telefónico, "Múltiples líneas" debe ser "Sin servicio telefónico".',
      );
    }
    if (!noPhone && linesNoPhone) {
      errors.push(
        '"Múltiples líneas" sólo puede ser "Sin servicio telefónico" cuando el cliente no tiene servicio telefónico.',
      );
    }
  }

  // ── Internet ↔ add-ons de internet ──────────────────────────────────────
  if (has('InternetService')) {
    const noInternet = f.InternetService === 'No';
    for (const key of INTERNET_ADDON_KEYS) {
      if (!has(key)) continue;
      const addonNoInternet = f[key] === NO_INTERNET;
      if (noInternet && !addonNoInternet) {
        errors.push(
          `Si el cliente no tiene internet, "${key}" debe ser "Sin internet".`,
        );
      }
      if (!noInternet && addonNoInternet) {
        errors.push(
          `"${key}" sólo puede ser "Sin internet" cuando el cliente no tiene servicio de internet.`,
        );
      }
    }
  }

  // ── Antigüedad ↔ gasto total ────────────────────────────────────────────
  if (has('tenure') && has('TotalCharges')) {
    const tenure = Number(f.tenure);
    const total = Number(f.TotalCharges);
    if (tenure === 0 && total > 0) {
      errors.push(
        'Un cliente con antigüedad 0 no puede tener gasto total mayor a 0.',
      );
    }
  }

  return errors;
}
