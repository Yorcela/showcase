import { Dictionnary } from "@apptypes/dictionnary.type";

export abstract class SanitizerAbstract<V> {
  constructor(protected readonly keyInObject: string) {}

  protected abstract isTargetValue(value: unknown): value is V;

  protected abstract sanitize(value: V): V;

  public sanitizeInObject<T>(dto: T, mutate = true): T {
    const needle = this.keyInObject.toLowerCase();
    const matchKey = (k: string) => k.toLowerCase().includes(needle);

    const walk = (val: unknown): unknown => {
      if (Array.isArray(val)) return val.map(walk);
      if (val && typeof val === "object" && !(val instanceof Date)) {
        const obj = mutate ? (val as Dictionnary) : { ...(val as Dictionnary) };
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (matchKey(k) && this.isTargetValue(v)) obj[k] = this.sanitize(v);
          else obj[k] = walk(v);
        }
        return obj;
      }
      return val;
    };

    return walk(dto) as T;
  }
}
