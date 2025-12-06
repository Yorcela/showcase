/**
 * Base abstraite pour toutes les entités de domaine.
 *
 * Elle force :
 * - une méthode d’instance `toRaw()` (implémentation obligatoire)
 * - et, via un type helper, la présence des méthodes statiques `fromRaw()` et `toRaw()`.
 */

export abstract class AbstractAppEntity<Raw> {
  abstract toRaw(): Raw;
  abstract fromRaw(raw: Raw): AbstractAppEntity<Raw>;
}

export interface AppEntityStatic<Raw> {
  new (...args: any[]): any;
  fromRaw(raw: Raw): any;
  toRaw(entity: any): Raw;
}

export function StaticEntity<Raw>() {
  return <C extends AppEntityStatic<Raw>>(ctor: C) => ctor;
}
