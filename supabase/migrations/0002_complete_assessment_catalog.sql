-- Complete the v1 assessment catalog without changing the original migration.
-- Existing first-three demo questions remain intact; the remaining twelve are idempotently added.
do $$
declare q_id uuid;
begin
  if not exists (select 1 from questions where sort_order = 4 and category = 'Lead Generation') then
    insert into questions (text, category, sort_order) values ('How predictable is your flow of qualified leads each month?', 'Lead Generation', 4) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Predictable enough to plan growth with confidence', 0, null),
      (q_id, 'It varies and creates occasional slow periods', 2, 'lead_gen_issues'),
      (q_id, 'Unpredictable or mostly dependent on referrals', 5, 'lead_gen_issues');
  end if;

  if not exists (select 1 from questions where sort_order = 5 and category = 'Conversation') then
    insert into questions (text, category, sort_order) values ('How consistently do your sales conversations uncover the buyer''s real needs?', 'Conversation', 5) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Consistently—I use a clear discovery framework', 0, null),
      (q_id, 'Usually, but some conversations stay surface-level', 2, 'no_persuasive_language'),
      (q_id, 'Rarely—I tend to present before fully discovering', 5, 'no_persuasive_language');
  end if;

  if not exists (select 1 from questions where sort_order = 6 and category = 'Conversation') then
    insert into questions (text, category, sort_order) values ('When presenting your offer, what do you focus on most?', 'Conversation', 6) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'The buyer''s desired outcome and decision criteria', 0, null),
      (q_id, 'A mix of outcomes, features, and benefits', 2, 'no_usp_features_only'),
      (q_id, 'The features, deliverables, and price', 5, 'no_usp_features_only');
  end if;

  if not exists (select 1 from questions where sort_order = 7 and category = 'Follow-up') then
    insert into questions (text, category, sort_order) values ('Do you have a defined follow-up system for every open opportunity?', 'Follow-up', 7) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Yes—timed, tracked, and used consistently', 0, null),
      (q_id, 'Partly—I use reminders but the cadence varies', 2, 'no_follow_up_system'),
      (q_id, 'No—I follow up when I remember or have time', 5, 'no_follow_up_system');
  end if;

  if not exists (select 1 from questions where sort_order = 8 and category = 'Follow-up') then
    insert into questions (text, category, sort_order) values ('How often do qualified opportunities go quiet without a clear next step?', 'Follow-up', 8) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Rarely—next steps are agreed before every call ends', 0, null),
      (q_id, 'Sometimes, especially on longer decisions', 1, 'no_follow_up_system'),
      (q_id, 'Often—ghosting is a major source of lost sales', 4, 'no_follow_up_system');
  end if;

  if not exists (select 1 from questions where sort_order = 9 and category = 'Referrals') then
    insert into questions (text, category, sort_order) values ('Does your business have a repeatable way to generate referrals?', 'Referrals', 9) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Yes—referrals are requested and tracked systematically', 0, null),
      (q_id, 'Somewhat—I ask when the moment feels right', 2, 'no_referral_system'),
      (q_id, 'No—referrals happen by chance', 5, 'no_referral_system');
  end if;

  if not exists (select 1 from questions where sort_order = 10 and category = 'Referrals') then
    insert into questions (text, category, sort_order) values ('How comfortable are you making a specific referral ask?', 'Referrals', 10) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Very—I use a natural, specific script', 0, null),
      (q_id, 'Mostly, though my ask could be clearer', 1, 'no_referral_system'),
      (q_id, 'Uncomfortable—I avoid asking directly', 4, 'no_referral_system');
  end if;

  if not exists (select 1 from questions where sort_order = 11 and category = 'Objections') then
    insert into questions (text, category, sort_order) values ('Do you use a consistent framework to work through buyer objections?', 'Objections', 11) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Yes—I diagnose the concern before responding', 0, null),
      (q_id, 'Usually, but difficult objections can throw me', 2, 'no_objection_handling'),
      (q_id, 'No—I respond differently each time', 5, 'no_objection_handling');
  end if;

  if not exists (select 1 from questions where sort_order = 12 and category = 'Objections') then
    insert into questions (text, category, sort_order) values ('How regularly do you review and practice objection handling?', 'Objections', 12) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Weekly or after every meaningful sales call', 0, null),
      (q_id, 'Occasionally, when a new objection appears', 1, 'no_objection_handling'),
      (q_id, 'Almost never', 4, 'no_objection_handling');
  end if;

  if not exists (select 1 from questions where sort_order = 13 and category = 'Growth') then
    insert into questions (text, category, sort_order) values ('Could your current sales process support twice as many opportunities?', 'Growth', 13) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Yes—the process and tools are ready to scale', 0, null),
      (q_id, 'Possibly, but some steps still depend on me', 2, 'scaling_strategy'),
      (q_id, 'No—more leads would overwhelm the process', 5, 'scaling_strategy');
  end if;

  if not exists (select 1 from questions where sort_order = 14 and category = 'Growth') then
    insert into questions (text, category, sort_order) values ('How clearly do you track the numbers that drive sales growth?', 'Growth', 14) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'I review conversion, velocity, and pipeline weekly', 0, null),
      (q_id, 'I track revenue and a few pipeline measures', 1, 'scaling_strategy'),
      (q_id, 'I mostly judge progress by feel or bank balance', 4, 'scaling_strategy');
  end if;

  if not exists (select 1 from questions where sort_order = 15 and category = 'Confidence') then
    insert into questions (text, category, sort_order) values ('How confident are you guiding a buyer to a clear decision without pressure?', 'Confidence', 15) returning id into q_id;
    insert into answer_options (question_id, text, weight, gap_flag) values
      (q_id, 'Very confident—I can challenge and guide with empathy', 0, null),
      (q_id, 'Fairly confident, but I sometimes soften the close', 2, 'no_persuasive_language'),
      (q_id, 'Not confident—I either push too hard or avoid the ask', 5, 'no_persuasive_language');
  end if;
end $$;
