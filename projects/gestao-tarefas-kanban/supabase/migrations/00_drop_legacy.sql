-- Limpeza: remove tabelas de sistema legado (bakery/admin) para o schema do Kanban.
-- ATENÇÃO: destrutivo — apaga a tabela users antiga e dados associados.
DROP TABLE IF EXISTS public.users CASCADE;
