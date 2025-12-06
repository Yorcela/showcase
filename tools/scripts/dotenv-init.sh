#!/usr/bin/env bash
set -euo pipefail

PLACEHOLDER="CHANGE_ME"
EXAMPLE=".env.example"
ENV_MAIN=".env"

generate_password() {
  openssl rand -hex 32
}

process_env_file() {
  local env_file=$1
  local tmp_file
  tmp_file=$(mktemp)
  local updated=0

  while IFS= read -r line || [ -n "$line" ]; do
    if [[ -z "$line" || "$line" == \#* ]]; then
      echo "$line" >>"$tmp_file"
      continue
    fi

    if [[ "$line" =~ ^([A-Za-z0-9_]+)=(.*) ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"

      if [[ "$value" == *"$PLACEHOLDER"* ]]; then
        local password
        password=$(generate_password)
        echo "$key=$password" >>"$tmp_file"
        echo "Generated a password for $key in $env_file"
        updated=1
        continue
      fi
    fi

    echo "$line" >>"$tmp_file"
  done <"$env_file"

  if [[ $updated -eq 1 ]]; then
    mv "$tmp_file" "$env_file"
    echo "$env_file updated with strong passwords."
  else
    rm "$tmp_file"
    echo "No passwords generated for $env_file."
  fi
}

if [ ! -f "$ENV_MAIN" ]; then
  if [ -f "$EXAMPLE" ]; then
    cp "$EXAMPLE" "$ENV_MAIN"
    echo "Created $ENV_MAIN from $EXAMPLE"
  else
    echo "No $EXAMPLE found, creating an empty $ENV_MAIN."
    touch "$ENV_MAIN"
  fi
else
  echo "$ENV_MAIN already present."
fi

if [ -f "$ENV_MAIN" ]; then
  process_env_file "$ENV_MAIN"
fi

echo "Environment files are ready."
