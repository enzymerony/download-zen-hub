
CREATE TABLE public.manuals (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  board_model TEXT NOT NULL DEFAULT '',
  pdf_url TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.manuals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuals TO authenticated;
GRANT ALL ON public.manuals TO service_role;

ALTER TABLE public.manuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manuals are viewable by everyone"
  ON public.manuals FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert manuals"
  ON public.manuals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update manuals"
  ON public.manuals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete manuals"
  ON public.manuals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_manuals_updated_at
  BEFORE UPDATE ON public.manuals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.manuals (id, brand, model, board_model, pdf_url, price, is_premium) VALUES
  ('juki-ddl-8700','Juki','DDL-8700','SC-921','https://drive.google.com/file/d/1qnkQH_zsiWu7uJCopABlcOZLQ34FjOyl/view?usp=sharing',0,false),
  ('brother-s7200c','Brother','S-7200C','MD-701','https://drive.google.com/file/d/1H7Na3RF6BQ7A6XYzLqbMw1GJ0khxtaIt/view?usp=sharing',200,true),
  ('singer-4423','Singer','Heavy Duty 4423','SG-4423B','https://drive.google.com/file/d/0B9pZyM5hT0mxWG1DNGpFbmJJbTA/view?usp=sharing',150,true),
  ('siruba-l818f','Siruba','L818F-M1','QIXING QX-2020','https://drive.google.com/file/d/1qnkQH_zsiWu7uJCopABlcOZLQ34FjOyl/view?usp=sharing',0,false),
  ('jack-a4','Jack','JK-A4','JK-A4-CT','https://drive.google.com/file/d/1H7Na3RF6BQ7A6XYzLqbMw1GJ0khxtaIt/view?usp=sharing',250,true)
ON CONFLICT (id) DO NOTHING;
