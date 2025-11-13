-- Add whatsapp_group_url column to ideas table
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.ideas.whatsapp_group_url IS 'WhatsApp group invite link for the idea community';
