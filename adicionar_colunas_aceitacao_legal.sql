-- Adicionar colunas para controle de aceitação legal
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS legal_accepted_at TIMESTAMP WITH TIME ZONE;

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_policy_accepted ON public.profiles(privacy_policy_accepted);
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON public.profiles(terms_accepted);
CREATE INDEX IF NOT EXISTS idx_profiles_legal_accepted_at ON public.profiles(legal_accepted_at);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.profiles.privacy_policy_accepted IS 'Indica se o utilizador aceitou a política de privacidade';
COMMENT ON COLUMN public.profiles.terms_accepted IS 'Indica se o utilizador aceitou os termos de uso';
COMMENT ON COLUMN public.profiles.legal_accepted_at IS 'Data e hora da aceitação dos termos legais';