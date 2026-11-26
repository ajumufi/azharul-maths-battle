AZHARUL HIDAYA STUDENTS UNION - MULTIPLAYER MATHS BATTLE

ഈ ഫോൾഡറിൽ ഉള്ളത്:
- index.html : പ്രധാന Landing Page
- host.html : Laptop-ൽ കാണിക്കുന്ന Game Arena
- player.html : രണ്ട് ഫോണുകളിലും തുറക്കുന്ന Player Page
- game.js / styles.css : Game logic, design
- config.js : Supabase URL + publishable/anon key നൽകേണ്ട സ്ഥലം
- supabase-setup.sql : Supabase database സജ്ജീകരണത്തിനുള്ള SQL
- assets : നിങ്ങൾ നൽകിയ Union Logo, College Logo, Campus/Library photos

പ്രധാനമായി:
ഈ പ്രോജക്ട് പൂർണ്ണമായി Multiplayer ആയി പ്രവർത്തിക്കാൻ Supabase Project വേണം.
ഇത് വെറും PowerShell script മാത്രം കൊണ്ട് internet വഴി രണ്ട് ഫോണുകളെ ബന്ധിപ്പിക്കാൻ കഴിയില്ല.

സജ്ജീകരണം:
1. Supabase-ൽ പുതിയ Project സൃഷ്ടിക്കുക.
2. SQL Editor തുറന്ന് supabase-setup.sql മുഴുവൻ paste ചെയ്ത് Run ചെയ്യുക.
3. Project Settings > API-ൽ നിന്ന് Project URL, Publishable key (അല്ലെങ്കിൽ anon key) എടുക്കുക.
4. config.js തുറന്ന് placeholders മാറ്റി ആ രണ്ട് values paste ചെയ്യുക.
   Secret/service_role key ഒരിക്കലും ഇവിടെ paste ചെയ്യരുത്.
5. ഈ folder Vercel / Netlify പോലുള്ള static hosting-ൽ publish ചെയ്യുക.
6. Laptop-ൽ site-ന്റെ host.html തുറക്കുക; രണ്ട് ഫോണിലും അതേ website-ന്റെ player.html തുറക്കുക.
7. Host-ൽ Create Game Room അമർത്തുക. QR scan ചെയ്യുകയോ Room Code നൽകുകയോ ചെയ്ത് Team A, Team B join ചെയ്യുക.
8. രണ്ട് ടീമുകളും join ചെയ്താൽ Start Battle അമർത്തുക.

ശ്രദ്ധിക്കുക:
ഇത് exhibition prototype scaffold ആണ്. Demo policies permissive ആണ്; supervised event-നായി മാത്രം ഉപയോഗിക്കുക.
Production/public launch-ന് മുമ്പ് server-side answer validation, access control, duplicate-player protection,
reconnect handling, host authentication, database cleanup എന്നിവ ചേർത്ത് സുരക്ഷിതമാക്കണം.
ഇപ്പോൾ ഓരോ ശരിയുത്തരത്തിനും score/rope update നടക്കും; ഓരോ ടീമിനും പുതിയ വേറിട്ട question ലഭിക്കും.
