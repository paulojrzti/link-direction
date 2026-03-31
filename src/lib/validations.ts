import { z } from "zod";

export const sellerSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  phone: z.string().regex(/^\d{10,15}$/, "Telefone inválido (somente números, ex: 5511999990000)"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug deve ter apenas letras minúsculas, números e hífens"),
  active: z.boolean().optional().default(true),
});

export const groupSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  inviteCode: z.string().min(1, "Código do grupo obrigatório"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug deve ter apenas letras minúsculas, números e hífens"),
  active: z.boolean().optional().default(true),
});

export const modeSchema = z.object({
  mode: z.enum(["NORMAL", "LAUNCH"]),
});
