INSERT INTO storage.buckets (id, name, file_size_limit, allowed_mime_types, public)
VALUES ('sources', 'sources', 1048576, '{"image/png","image/jpg","image/jpeg","image/gif"}', true);

INSERT INTO storage.buckets (id, name, file_size_limit, allowed_mime_types, public)
VALUES ('items', 'items', 1048576, '{"image/png","image/jpg","image/jpeg","image/gif"}', true);
