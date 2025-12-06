-- Script d'initialisation PostgreSQL pour yorcela
-- Création des extensions nécessaires

-- Extension pgvector pour les embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les fonctions de hachage
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Extension pour les fonctions de texte
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Extension pour la recherche full-text
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Création d'un utilisateur pour l'application (si nécessaire)
-- Note: L'utilisateur 'yorcela' est déjà créé via DATABASE_USER

-- Configuration de la base de données
ALTER DATABASE yorcela_dev SET timezone TO 'UTC';

-- Création d'un schéma pour les fonctions utilitaires
CREATE SCHEMA IF NOT EXISTS utils;

-- Fonction utilitaire pour générer des slugs
CREATE OR REPLACE FUNCTION utils.slugify(text)
RETURNS text AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent($1),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction utilitaire pour la recherche de similarité
CREATE OR REPLACE FUNCTION utils.similarity_search(
    query_embedding vector(1536),
    table_name text,
    embedding_column text DEFAULT 'embedding',
    limit_count integer DEFAULT 10,
    threshold real DEFAULT 0.7
)
RETURNS TABLE(id uuid, similarity real) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT id, 1 - (%I <=> $1) as similarity 
         FROM %I 
         WHERE 1 - (%I <=> $1) > $2 
         ORDER BY %I <=> $1 
         LIMIT $3',
        embedding_column, table_name, embedding_column, embedding_column
    ) USING query_embedding, threshold, limit_count;
END;
$$ LANGUAGE plpgsql;

-- Index pour optimiser les recherches de similarité
-- (sera créé automatiquement par Prisma pour les colonnes vector)

-- Configuration des permissions
GRANT USAGE ON SCHEMA utils TO yorcela;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO yorcela;

-- Log de l'initialisation
DO $$
BEGIN
    RAISE NOTICE 'Base de données yorcela initialisée avec succès';
    RAISE NOTICE 'Extensions installées: vector, uuid-ossp, pgcrypto, unaccent, pg_trgm';
    RAISE NOTICE 'Schéma utils créé avec fonctions utilitaires';
END $$;