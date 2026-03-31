INSERT OR IGNORE INTO "User" (id, email, passwordHash, createdAt)
VALUES ('admin01', 'admin@link.local', '$2a$12$Ee9nk2TF1UiSIVm0fGgP9OgBNMEaVWNqWHxVtfMRMoNtC1rPRtCe2', datetime('now'));

INSERT OR IGNORE INTO "Link" (id, slug, mode, currentSellerIndex, createdAt)
VALUES ('link01', 'vendas', 'NORMAL', 0, datetime('now'));
