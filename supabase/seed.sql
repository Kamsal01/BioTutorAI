insert into public.topics (slug, title, description, level, estimated_minutes) values
('lesson-one-conservation-natural-resources', 'Lesson One: Conservation of Natural Resources', 'Meaning and importance of conservation, with soil and water conservation methods.', 1, 35),
('lesson-two-forest-wildlife-conservation', 'Lesson Two: Forest and Wildlife Conservation', 'Forest conservation, wildlife conservation, conservation symbols, and conservation slogans.', 1, 35),
('lesson-three-pests-diseases-control', 'Lesson Three: Pests and Diseases', 'Types of pests and plant diseases, control methods, and their benefits and drawbacks.', 2, 45),
('lesson-four-reproduction-birds-mammals', 'Lesson Four: Reproductive System in Birds and Mammals', 'Reproduction in birds and mammals, comparisons, and roles of reproductive organs.', 3, 45),
('lesson-six-fertilization-development-care', 'Lesson Six: Fertilization, Development, and Parental Care', 'Drawing reproductive systems, fertilization, embryonic development, and parental care.', 3, 50)
on conflict (slug) do update set
title = excluded.title,
description = excluded.description,
level = excluded.level,
estimated_minutes = excluded.estimated_minutes;
