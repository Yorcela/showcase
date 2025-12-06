export type RegexOptions = {
  caseInsensitive?: boolean;
  global?: boolean;
  multiline?: boolean;
};

function buildFlags(opts?: RegexOptions): string {
  return [
    opts?.global ? "g" : "",
    opts?.caseInsensitive ? "i" : "",
    opts?.multiline ? "m" : "",
  ].join("");
}

export function buildHexRegex(length?: number, opts?: RegexOptions): RegExp {
  const pattern = length ? `^[a-f0-9]{${length}}$` : "^[a-f0-9]+$";
  return new RegExp(pattern, buildFlags({ caseInsensitive: true, ...opts }));
}

export function buildJwtRegex(opts?: RegexOptions): RegExp {
  const pattern = "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$";
  return new RegExp(pattern, buildFlags(opts));
}

export function buildEmailRegex(opts?: RegexOptions): RegExp {
  const pattern =
    "^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}$";
  return new RegExp(pattern, buildFlags(opts));
}
