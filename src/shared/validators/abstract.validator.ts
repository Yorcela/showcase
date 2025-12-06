import { Dictionnary } from "@apptypes/dictionnary.type";

// ====== Contrat
export interface ValidatorInterface {
  normalize(value: unknown): unknown;
  isValid(value: unknown): boolean;
  verify(value: unknown, reason: string, suggestions: string[]): ValidatorResult;
  normalizeInObject<T>(dto: T): T;
  validateInObject<T extends Record<string, any>>(dto: T): ValidatorResult[];
}

// ===== Types communs
export type ValidatorResult = {
  valid: boolean;
  reason?: string;
  suggestions?: string[];
};

// ===== Base générique
export abstract class ValidatorAbstract<V> {
  constructor(protected readonly keyInObject: string) {}
  protected abstract normalize(value: V): V;
  protected abstract isValid(value: V): boolean;
  protected abstract isTargetValue(value: unknown): value is V;

  static _isValid<V, T extends ValidatorAbstract<V>>(this: new () => T, value: V): boolean {
    const inst = new this();
    return inst.isValid(value);
  }

  protected defaultReason(): string {
    return "Invalid value";
  }
  protected defaultSuggestions(): string[] {
    return [];
  }
  protected normalizeInObject<T>(dto: T, mutate = true): T {
    const needle = this.keyInObject.toLowerCase();
    const matchKey = (k: string) => k.toLowerCase().includes(needle);

    const walk = (val: unknown): unknown => {
      if (Array.isArray(val)) return val.map(walk);
      if (val && typeof val === "object" && !(val instanceof Date)) {
        const obj = mutate ? (val as Dictionnary) : { ...(val as Dictionnary) };
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (matchKey(k) && this.isTargetValue(v)) obj[k] = this.normalize(v);
          else obj[k] = walk(v);
        }
        return obj;
      }
      return val;
    };
    return walk(dto) as T;
  }

  public verify(value: V, reason = "", suggestions: string[] = []): ValidatorResult {
    const valid = this.isValid(value);
    return {
      valid,
      reason: valid ? undefined : reason,
      suggestions: valid ? undefined : suggestions,
    };
  }

  public validateInObject<T extends Dictionnary>(dto: T): ValidatorResult[] {
    this.normalizeInObject(dto, true);
    const needle = this.keyInObject.toLowerCase();
    const matchKey = (k: string) => k.toLowerCase().includes(needle);

    const errors: ValidatorResult[] = [];
    const walk = (obj: unknown, path: string[] = []): void => {
      if (Array.isArray(obj)) return obj.forEach((it, i) => walk(it, [...path, String(i)]));
      if (obj && typeof obj === "object") {
        const rec = obj as Dictionnary;
        for (const k of Object.keys(rec)) {
          const v = rec[k];
          const p = [...path, k];
          if (matchKey(k) && this.isTargetValue(v)) {
            const res = this.verify(v, this.defaultReason(), this.defaultSuggestions());
            if (!res.valid) errors.push({ ...res, reason: `${p.join(".")}: ${res.reason}` });
          } else {
            walk(v, p);
          }
        }
      }
    };
    walk(dto);
    return errors;
  }
}

export abstract class StringValidator extends ValidatorAbstract<string> {
  protected isTargetValue(v: unknown): v is string {
    return typeof v === "string";
  }
}
