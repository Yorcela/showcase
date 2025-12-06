-- Script d'initialisation PostgreSQL pour le développement
-- Données de test et configuration de développement

-- Création d'utilisateurs de test (sera fait via Prisma normalement)
-- Ce script sert principalement pour les tests et le développement

-- Configuration de développement
SET timezone = 'UTC';

-- Fonction pour créer des données de test
CREATE OR REPLACE FUNCTION create_test_data()
RETURNS void AS $$
BEGIN
    -- Cette fonction sera appelée après que Prisma ait créé les tables
    -- Pour l'instant, on se contente de préparer l'environnement
    
    RAISE NOTICE 'Environnement de développement PostgreSQL configuré';
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
    RAISE NOTICE 'Version PostgreSQL: %', version();
    
    -- Vérifier que pgvector est bien installé
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE NOTICE 'Extension pgvector installée et disponible';
    ELSE
        RAISE WARNING 'Extension pgvector non trouvée';
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter la fonction
SELECT create_test_data();

-- Nettoyer
DROP FUNCTION create_test_data();