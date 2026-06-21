-- KindDo test data: 10 dreams for local/manual QA.
-- Run in Supabase SQL Editor after applying migrations.
-- Safe to rerun: removes only prior dreams marked with [seed-kinddo].

do $$
declare
  user_ids uuid[];
  author_id uuid;
  dream_id uuid;
  row record;
begin
  select array_agg(id order by created_at) into user_ids from public.users;

  if coalesce(array_length(user_ids, 1), 0) = 0 then
    raise exception 'Create at least one user first, then rerun this seed.';
  end if;

  delete from public.dreams
  where description like '[seed-kinddo]%';

  for row in
    select *
    from (
      values
        (1, 'Увидеть океан', 'Travel', 'Я всю жизнь живу далеко от моря и мечтаю хотя бы один раз увидеть настоящий океан на рассвете. Хочу почувствовать простор, шум волн и сохранить это как новую точку опоры.', 'https://picsum.photos/id/1011/900/700.jpg', 'public', interval '2 days'),
        (2, 'Научиться играть на гитаре', 'Creativity', 'В детстве я часто слушала песни у костра и всегда мечтала сыграть одну сама. Нужен человек, который поможет выбрать простую гитару и проведет первые занятия.', 'https://picsum.photos/id/1066/900/700.jpg', 'public', interval '4 days'),
        (3, 'Полетать на воздушном шаре', 'Adventure', 'Эта мечта появилась после старой открытки с шарами над полями. Хочется пережить тихое утро в небе и перестать бояться высоты.', 'https://picsum.photos/id/1036/900/700.jpg', 'public', interval '6 days'),
        (4, 'Собрать уютный уголок для чтения', 'Home', 'Мне хочется сделать дома маленькое место, где можно читать, отдыхать и восстанавливаться после работы. Нужна помощь с идеей, светом и полками.', 'https://picsum.photos/id/1080/900/700.jpg', 'public', interval '8 days'),
        (5, 'Провести день без тревоги', 'Health', 'Мечта звучит просто, но для меня это большой шаг. Хочу провести спокойный день: прогулка, чай, разговор и поддержка человека рядом.', 'https://picsum.photos/id/1027/900/700.jpg', 'public', interval '10 days'),
        (6, 'Организовать маленький праздник для мамы', 'Family', 'Мама много лет заботилась обо всех, а я хочу устроить для нее теплый вечер-сюрприз. Нужны идеи, декор и помощь с организацией.', 'https://picsum.photos/id/1025/900/700.jpg', 'public', interval '12 days'),
        (7, 'Попробовать себя в керамике', 'Learning', 'Я давно смотрю на керамические мастерские и мечтаю слепить свою первую чашку. Было бы здорово найти человека, который покажет, с чего начать.', 'https://picsum.photos/id/1059/900/700.jpg', 'public', interval '14 days'),
        (8, 'Сделать красивую фотосессию', 'Creativity', 'Хочу увидеть себя мягкой и настоящей на фотографиях. Нужна помощь с местом, образом и человеком, который умеет снимать без напряжения.', 'https://picsum.photos/id/64/900/700.jpg', 'public', interval '16 days'),
        (9, 'Начать бегать без страха', 'Sport', 'Я несколько раз пытался начать бегать, но быстро сдавался. Мечтаю о первой спокойной пробежке с человеком, который поддержит темп и настроение.', 'https://picsum.photos/id/1041/900/700.jpg', 'public', interval '18 days'),
        (10, 'Подготовить двор к летнему вечеру', 'Community', 'Во дворе есть место, где соседи могли бы собираться и общаться. Хочу помочь сделать его уютнее: гирлянды, лавочки, цветы и общий чай.', 'https://picsum.photos/id/1048/900/700.jpg', 'public', interval '20 days')
    ) as seed(idx, title, category, body, media_url, visibility, age)
  loop
    author_id := user_ids[((row.idx - 1) % array_length(user_ids, 1)) + 1];

    insert into public.dreams (
      author_id,
      title,
      description,
      video_url,
      category,
      visibility,
      status,
      created_at
    )
    values (
      author_id,
      row.title,
      '[seed-kinddo] ' || row.body,
      row.media_url,
      row.category,
      row.visibility,
      'OPEN',
      now() - row.age
    )
    returning id into dream_id;

    insert into public.dream_media (dream_id, url, position)
    values
      (dream_id, row.media_url, 0),
      (dream_id, 'https://picsum.photos/id/' || (200 + row.idx)::text || '/900/700.jpg', 1);

    insert into public.dream_tasks (dream_id, author_id, text)
    values
      (dream_id, author_id, 'Помочь уточнить реальный план исполнения мечты'),
      (dream_id, author_id, 'Подсказать место, контакт или человека, который может помочь'),
      (dream_id, author_id, 'Поддержать организацию первого шага');
  end loop;
end $$;
