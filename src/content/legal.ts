import type { Locale } from "@/i18n/config";

// Тексты «Конфиденциальность», «Условия» и FAQ. Базовая редакция — дополняется по мере развития сервиса.
// Описывают то, как UniKG устроен на самом деле: Supabase (вход и данные), Google (вход и AI на Gemini),
// хостинг Vercel и Render, cookie только для языка и сессии, без рекламных и аналитических трекеров.

type LegalSection = { h: string; p?: string[]; list?: string[] };
type LegalDoc = { title: string; lead: string; sections: LegalSection[] };
type Faq = { title: string; lead: string; items: { q: string; a: string }[] };

type Content = {
  updated: string;
  contactTitle: string;
  contactText: string;
  privacy: LegalDoc;
  terms: LegalDoc;
  faq: Faq;
};

/** Дата последней редакции (одна для всех документов) */
const UPDATED = { ru: "11 октября 2026", ky: "2026-жылдын 11-октябры", en: "11 October 2026" };

export const legal: Record<Locale, Content> = {
  ru: {
    updated: `Редакция от ${UPDATED.ru}`,
    contactTitle: "Контакты",
    contactText: "Вопросы, просьбы об удалении данных и сообщения об ошибках:",
    privacy: {
      title: "Политика конфиденциальности",
      lead: "Какие данные собирает UniKG, зачем они нужны и как ими управлять.",
      sections: [
        { h: "1. Общие положения", p: ["UniKG — информационная платформа об университетах и колледжах Кыргызстана. Политика описывает, как мы обрабатываем данные посетителей и зарегистрированных пользователей. Пользуясь сайтом, вы соглашаетесь с ней."] },
        {
          h: "2. Какие данные мы собираем",
          list: [
            "Данные аккаунта: имя и адрес электронной почты. При входе через Google — также имя и фото профиля из Google. Пароль хранится у провайдера входа (Supabase) в зашифрованном виде — мы его не видим.",
            "То, что вы создаёте сами: комментарии (публикуются открыто вместе с вашим именем), диалоги с AI-помощником и список избранного.",
            "Технические данные: cookie с языком интерфейса и сессией входа; в хранилище браузера (localStorage) — тема оформления и избранное, пока вы не вошли.",
          ],
        },
        { h: "3. Зачем мы их используем", list: ["чтобы работали вход, комментарии, избранное и история диалогов с AI-помощником;", "чтобы защищать сервис от злоупотреблений (например, ограничивать частоту публикаций);", "чтобы отвечать на ваши обращения."] },
        { h: "4. Чего мы не делаем", p: ["Мы не продаём данные, не передаём их рекламодателям и не используем рекламные и аналитические трекеры."] },
        {
          h: "5. Сторонние сервисы",
          list: [
            "Supabase — хранение данных и вход в аккаунт.",
            "Google — вход через Google (если вы его выбрали) и AI-помощник на основе Google Gemini: текст ваших сообщений помощнику передаётся в Google для подготовки ответа.",
            "Vercel и Render — хостинг сайта и сервера.",
          ],
        },
        { h: "6. Хранение и удаление", p: ["Данные хранятся, пока существует аккаунт. Свои комментарии и диалоги с AI-помощником вы можете удалить сами. Чтобы удалить аккаунт целиком, напишите нам — мы удалим профиль и все связанные с ним данные."] },
        { h: "7. Безопасность", p: ["Доступ к данным ограничен правилами на уровне базы данных: каждый пользователь видит только свои диалоги и избранное. Соединение с сайтом защищено (HTTPS)."] },
        { h: "8. Несовершеннолетние", p: ["Сервис рассчитан на абитуриентов. Если вам меньше 16 лет, регистрируйтесь с согласия родителей или законных представителей."] },
        { h: "9. Изменения политики", p: ["Мы можем обновлять политику. Актуальная редакция всегда на этой странице, дата указана вверху."] },
      ],
    },
    terms: {
      title: "Условия использования",
      lead: "Правила пользования UniKG. Пользуясь сайтом, вы принимаете эти условия.",
      sections: [
        { h: "1. О сервисе", p: ["UniKG помогает найти и сравнить университеты и колледжи Кыргызстана. Сервис бесплатный и не является официальным представителем учебных заведений или государственных органов."] },
        { h: "2. Информация на сайте", p: ["Данные собраны из открытых источников: портала 2020.edu.gov.kg, официальных сайтов учебных заведений и СМИ — источники указаны на странице каждого заведения. Информация может устареть или содержать неточности, а стоимость обучения — ориентировочная. Перед поступлением сверяйте сведения с официальными источниками. Решения о поступлении вы принимаете самостоятельно."] },
        { h: "3. AI-помощник", p: ["AI-помощник отвечает на основе данных каталога UniKG, но может ошибаться. Его ответы — справочная информация, а не официальная консультация."] },
        { h: "4. Аккаунт", p: ["Указывайте достоверные данные и не передавайте доступ к аккаунту другим. Вы отвечаете за действия, совершённые из вашего аккаунта."] },
        {
          h: "5. Комментарии",
          p: ["Комментарии отражают личный опыт пользователей. Запрещено публиковать:"],
          list: ["оскорбления, угрозы и дискриминационные высказывания;", "спам и рекламу;", "персональные данные других людей;", "заведомо ложную информацию и незаконный контент."],
        },
        { h: "6. Нарушения", p: ["Мы можем удалять комментарии, нарушающие эти правила, и ограничивать доступ к сервису."] },
        { h: "7. Ответственность", p: ["Сервис предоставляется «как есть». Мы стараемся поддерживать его работу и точность данных, но не гарантируем отсутствие перерывов и ошибок и не отвечаем за решения, принятые на основе информации с сайта."] },
        { h: "8. Изменения условий", p: ["Мы можем обновлять условия. Актуальная редакция всегда на этой странице."] },
      ],
    },
    faq: {
      title: "Частые вопросы",
      lead: "Коротко о том, как устроен UniKG и откуда берутся данные.",
      items: [
        { q: "Что такое UniKG?", a: "Бесплатная платформа для поиска и сравнения университетов и колледжей Кыргызстана: программы, стоимость, адреса, отзывы студентов и AI-помощник." },
        { q: "Откуда берутся данные?", a: "Из открытых источников: прейскурантов Министерства науки, высшего образования и инноваций КР на портале 2020.edu.gov.kg, официальных сайтов учебных заведений и СМИ. Источники перечислены на странице каждого заведения." },
        { q: "Насколько точна стоимость обучения?", a: "Указана минимальная стоимость очного контракта в сомах за год по официальным прейскурантам. Цены меняются, поэтому перед поступлением уточняйте их у учебного заведения." },
        { q: "Нужно ли регистрироваться?", a: "Для просмотра каталога — нет. Вход нужен, чтобы пользоваться AI-помощником, оставлять комментарии и видеть избранное на всех устройствах." },
        { q: "Как работает избранное?", a: "Нажмите на сердечко на карточке или странице заведения. Без входа избранное хранится в этом браузере, после входа — в вашем аккаунте, и сохранённое раньше переносится туда автоматически." },
        { q: "Как работает AI-помощник?", a: "Он ищет ответы в базе UniKG с помощью Google Gemini и подсказывает подходящие варианты. Помощник может ошибаться — важные сведения проверяйте на официальных сайтах." },
        { q: "Почему часть названий программ была на кыргызском?", a: "Это официальные названия из госпортала. Мы добавили к ним переводы на русский и английский." },
        { q: "Можно ли удалить свой комментарий?", a: "Да: на странице заведения у вашего комментария есть кнопка удаления." },
        { q: "На каких языках работает сайт?", a: "На русском, кыргызском и английском. Язык меняется внизу страницы или в настройках." },
        { q: "Это бесплатно?", a: "Да, все возможности UniKG бесплатны." },
      ],
    },
  },
  ky: {
    updated: `${UPDATED.ky} редакциясы`,
    contactTitle: "Байланыш",
    contactText: "Суроолор, маалыматтарды өчүрүү өтүнүчтөрү жана каталар тууралуу билдирүүлөр:",
    privacy: {
      title: "Купуялуулук саясаты",
      lead: "UniKG кандай маалыматтарды чогултат, алар эмне үчүн керек жана аларды кантип башкарууга болот.",
      sections: [
        { h: "1. Жалпы жоболор", p: ["UniKG — Кыргызстандын университеттери жана колледждери тууралуу маалымат платформасы. Бул саясат келүүчүлөрдүн жана катталган колдонуучулардын маалыматтарын кантип иштеткенибизди сүрөттөйт. Сайтты колдонуу менен сиз ага макул болосуз."] },
        {
          h: "2. Кандай маалыматтарды чогултабыз",
          list: [
            "Аккаунттун маалыматтары: аты жана электрондук почтанын дареги. Google аркылуу киргенде — Google профилиндеги аты жана сүрөтү. Сырсөз кирүү провайдеринде (Supabase) шифрленген түрдө сакталат — биз аны көрбөйбүз.",
            "Өзүңүз түзгөн нерселер: комментарийлер (атыңыз менен ачык жарыяланат), AI-жардамчы менен диалогдор жана тандалгандардын тизмеси.",
            "Техникалык маалыматтар: интерфейстин тили жана кирүү сессиясы бар cookie; браузердин сактагычында (localStorage) — жасалгалоо темасы жана кире электе тандалгандар.",
          ],
        },
        { h: "3. Аларды эмне үчүн колдонобуз", list: ["кирүү, комментарийлер, тандалгандар жана AI-жардамчы менен диалогдордун тарыхы иштеши үчүн;", "сервисти кыянаттыктан коргоо үчүн (мисалы, жарыялоолордун жыштыгын чектөө);", "кайрылууларыңызга жооп берүү үчүн."] },
        { h: "4. Эмнени жасабайбыз", p: ["Биз маалыматтарды сатпайбыз, жарнак берүүчүлөргө өткөрбөйбүз жана жарнамалык же аналитикалык трекерлерди колдонбойбуз."] },
        {
          h: "5. Үчүнчү тараптын сервистери",
          list: [
            "Supabase — маалыматтарды сактоо жана аккаунтка кирүү.",
            "Google — Google аркылуу кирүү (эгер аны тандасаңыз) жана Google Gemini негизиндеги AI-жардамчы: жардамчыга жазган билдирүүлөрүңүздүн тексти жооп даярдоо үчүн Google'га берилет.",
            "Vercel жана Render — сайттын жана сервердин хостинги.",
          ],
        },
        { h: "6. Сактоо жана өчүрүү", p: ["Маалыматтар аккаунт бар болгонго чейин сакталат. Комментарийлериңизди жана AI-жардамчы менен диалогдоруңузду өзүңүз өчүрө аласыз. Аккаунтту толугу менен өчүрүү үчүн бизге жазыңыз — профилди жана ага байланышкан бардык маалыматтарды өчүрөбүз."] },
        { h: "7. Коопсуздук", p: ["Маалыматтарга жетүү маалымат базасынын деңгээлиндеги эрежелер менен чектелген: ар бир колдонуучу өзүнүн гана диалогдорун жана тандалгандарын көрөт. Сайт менен байланыш корголгон (HTTPS)."] },
        { h: "8. Жашы жете электер", p: ["Сервис абитуриенттер үчүн арналган. Эгер сиз 16 жашка толо элек болсоңуз, ата-энеңиздин же мыйзамдуу өкүлдөрүңүздүн макулдугу менен катталыңыз."] },
        { h: "9. Саясаттын өзгөрүшү", p: ["Биз саясатты жаңыртып турушубуз мүмкүн. Учурдагы редакциясы ар дайым ушул бетте, датасы жогоруда көрсөтүлгөн."] },
      ],
    },
    terms: {
      title: "Колдонуу шарттары",
      lead: "UniKG'ни колдонуу эрежелери. Сайтты колдонуу менен сиз бул шарттарды кабыл аласыз.",
      sections: [
        { h: "1. Сервис тууралуу", p: ["UniKG Кыргызстандын университеттерин жана колледждерин табууга жана салыштырууга жардам берет. Сервис акысыз жана окуу жайлардын же мамлекеттик органдардын расмий өкүлү болуп саналбайт."] },
        { h: "2. Сайттагы маалымат", p: ["Маалыматтар ачык булактардан чогултулган: 2020.edu.gov.kg порталы, окуу жайлардын расмий сайттары жана ЖМК — булактар ар бир окуу жайдын бетинде көрсөтүлгөн. Маалымат эскириши же так эмес болушу мүмкүн, ал эми окуу акысы болжолдуу. Тапшыруудан мурун маалыматты расмий булактар менен салыштырыңыз. Тапшыруу тууралуу чечимди өзүңүз кабыл аласыз."] },
        { h: "3. AI-жардамчы", p: ["AI-жардамчы UniKG каталогунун маалыматтарынын негизинде жооп берет, бирок жаңылышы мүмкүн. Анын жооптору — расмий консультация эмес, маалымдама."] },
        { h: "4. Аккаунт", p: ["Чыныгы маалыматтарды көрсөтүңүз жана аккаунтка кирүүнү башкаларга бербеңиз. Аккаунтуңуздан жасалган аракеттер үчүн сиз жооп бересиз."] },
        {
          h: "5. Комментарийлер",
          p: ["Комментарийлер колдонуучулардын жеке тажрыйбасын чагылдырат. Төмөнкүлөрдү жарыялоого тыюу салынат:"],
          list: ["кордоолор, коркутуулар жана басмырлоочу сөздөр;", "спам жана жарнама;", "башка адамдардын жеке маалыматтары;", "атайын жалган маалымат жана мыйзамсыз мазмун."],
        },
        { h: "6. Бузуулар", p: ["Бул эрежелерди бузган комментарийлерди өчүрүп, сервиске жетүүнү чектешибиз мүмкүн."] },
        { h: "7. Жоопкерчилик", p: ["Сервис «кандай болсо ошондой» берилет. Биз анын иштешин жана маалыматтардын тактыгын колдоого аракет кылабыз, бирок үзгүлтүктөр жана каталар болбойт деп кепилдик бербейбиз жана сайттагы маалыматтын негизинде кабыл алынган чечимдер үчүн жооп бербейбиз."] },
        { h: "8. Шарттардын өзгөрүшү", p: ["Биз шарттарды жаңыртып турушубуз мүмкүн. Учурдагы редакциясы ар дайым ушул бетте."] },
      ],
    },
    faq: {
      title: "Көп берилүүчү суроолор",
      lead: "UniKG кантип иштейт жана маалыматтар кайдан алынат — кыскача.",
      items: [
        { q: "UniKG деген эмне?", a: "Кыргызстандын университеттерин жана колледждерин издөө жана салыштыруу үчүн акысыз платформа: программалар, окуу акысы, даректер, студенттердин пикирлери жана AI-жардамчы." },
        { q: "Маалыматтар кайдан алынат?", a: "Ачык булактардан: 2020.edu.gov.kg порталындагы КР Илим, жогорку билим берүү жана инновациялар министрлигинин прейскуранттарынан, окуу жайлардын расмий сайттарынан жана ЖМКдан. Булактар ар бир окуу жайдын бетинде көрсөтүлгөн." },
        { q: "Окуу акысы канчалык так?", a: "Расмий прейскуранттар боюнча күндүзгү контракттын жылдык эң төмөнкү баасы сом менен көрсөтүлгөн. Баалар өзгөрөт, ошондуктан тапшыруудан мурун окуу жайдан тактаңыз." },
        { q: "Катталуу керекпи?", a: "Каталогду көрүү үчүн — жок. AI-жардамчыны колдонуу, комментарий калтыруу жана тандалгандарды бардык түзмөктөрдө көрүү үчүн кирүү керек." },
        { q: "Тандалгандар кантип иштейт?", a: "Окуу жайдын карточкасындагы же бетиндеги жүрөкчөнү басыңыз. Кире электе тандалгандар ушул браузерде сакталат, киргенден кийин — аккаунтуңузда, мурда сакталгандар ага автоматтык түрдө өтөт." },
        { q: "AI-жардамчы кантип иштейт?", a: "Ал Google Gemini жардамы менен UniKG базасынан жооп издеп, ылайыктуу варианттарды сунуштайт. Жардамчы жаңылышы мүмкүн — маанилүү маалыматты расмий сайттардан текшериңиз." },
        { q: "Эмне үчүн программалардын аталыштарынын бир бөлүгү кыргызча болчу?", a: "Бул мамлекеттик порталдагы расмий аталыштар. Биз аларга орусча жана англисче котормолорду коштук." },
        { q: "Комментарийимди өчүрсө болобу?", a: "Ооба: окуу жайдын бетинде комментарийиңиздин жанында өчүрүү баскычы бар." },
        { q: "Сайт кайсы тилдерде иштейт?", a: "Орус, кыргыз жана англис тилдеринде. Тил барактын ылдый жагында же жөндөөлөрдө алмашат." },
        { q: "Бул акысызбы?", a: "Ооба, UniKG'нин бардык мүмкүнчүлүктөрү акысыз." },
      ],
    },
  },
  en: {
    updated: `Last updated ${UPDATED.en}`,
    contactTitle: "Contact",
    contactText: "Questions, data deletion requests and error reports:",
    privacy: {
      title: "Privacy Policy",
      lead: "What data UniKG collects, why it is needed and how you can manage it.",
      sections: [
        { h: "1. General", p: ["UniKG is an information platform about universities and colleges in Kyrgyzstan. This policy explains how we process the data of visitors and registered users. By using the site, you agree to it."] },
        {
          h: "2. What we collect",
          list: [
            "Account data: your name and email address. If you sign in with Google, also your name and profile photo from Google. Your password is stored by the sign-in provider (Supabase) in encrypted form — we never see it.",
            "Content you create: comments (published openly with your name), conversations with the AI assistant and your favorites list.",
            "Technical data: cookies with the interface language and your sign-in session; browser storage (localStorage) keeps the theme and, until you sign in, your favorites.",
          ],
        },
        { h: "3. Why we use it", list: ["to make sign-in, comments, favorites and AI conversation history work;", "to protect the service from abuse (for example, by limiting how often you can post);", "to respond to your requests."] },
        { h: "4. What we don't do", p: ["We do not sell your data, share it with advertisers or use advertising or analytics trackers."] },
        {
          h: "5. Third-party services",
          list: [
            "Supabase — data storage and account sign-in.",
            "Google — Google sign-in (if you choose it) and the AI assistant powered by Google Gemini: the text of your messages to the assistant is sent to Google to generate a reply.",
            "Vercel and Render — hosting for the website and the server.",
          ],
        },
        { h: "6. Retention and deletion", p: ["Data is kept while your account exists. You can delete your comments and AI conversations yourself. To delete your account entirely, contact us — we will delete your profile and all related data."] },
        { h: "7. Security", p: ["Access to data is restricted by database-level rules: each user sees only their own conversations and favorites. The connection to the site is encrypted (HTTPS)."] },
        { h: "8. Minors", p: ["The service is designed for prospective students. If you are under 16, please register with the consent of a parent or legal guardian."] },
        { h: "9. Changes", p: ["We may update this policy. The current version is always on this page, with the date shown at the top."] },
      ],
    },
    terms: {
      title: "Terms of Use",
      lead: "The rules for using UniKG. By using the site, you accept these terms.",
      sections: [
        { h: "1. About the service", p: ["UniKG helps you find and compare universities and colleges in Kyrgyzstan. The service is free and is not an official representative of any educational institution or government body."] },
        { h: "2. Information on the site", p: ["Data is collected from open sources: the 2020.edu.gov.kg portal, official institution websites and the media — sources are listed on each institution's page. Information may become outdated or contain inaccuracies, and tuition fees are approximate. Check the details with official sources before applying. You make your admission decisions yourself."] },
        { h: "3. AI assistant", p: ["The AI assistant answers based on the UniKG catalog but may make mistakes. Its answers are reference information, not official advice."] },
        { h: "4. Your account", p: ["Provide accurate information and do not share access to your account. You are responsible for actions taken from your account."] },
        {
          h: "5. Comments",
          p: ["Comments reflect users' personal experience. You may not post:"],
          list: ["insults, threats or discriminatory statements;", "spam or advertising;", "other people's personal data;", "knowingly false information or illegal content."],
        },
        { h: "6. Violations", p: ["We may remove comments that break these rules and restrict access to the service."] },
        { h: "7. Liability", p: ["The service is provided \"as is\". We work to keep it running and the data accurate, but we do not guarantee it will be free of interruptions or errors, and we are not liable for decisions made based on information from the site."] },
        { h: "8. Changes", p: ["We may update these terms. The current version is always on this page."] },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      lead: "A short guide to how UniKG works and where the data comes from.",
      items: [
        { q: "What is UniKG?", a: "A free platform for finding and comparing universities and colleges in Kyrgyzstan: programs, tuition fees, addresses, student reviews and an AI assistant." },
        { q: "Where does the data come from?", a: "From open sources: the fee schedules of the Ministry of Science, Higher Education and Innovation of the Kyrgyz Republic on the 2020.edu.gov.kg portal, official institution websites and the media. Sources are listed on each institution's page." },
        { q: "How accurate are the tuition fees?", a: "We show the minimum full-time contract fee in som per year, based on official fee schedules. Prices change, so confirm them with the institution before applying." },
        { q: "Do I need to register?", a: "Not to browse the catalog. You need to sign in to use the AI assistant, leave comments and have your favorites on all your devices." },
        { q: "How do favorites work?", a: "Tap the heart on an institution's card or page. Before you sign in, favorites are stored in this browser; once you sign in, they are kept in your account, and anything saved earlier is moved there automatically." },
        { q: "How does the AI assistant work?", a: "It searches the UniKG database using Google Gemini and suggests suitable options. The assistant can make mistakes — check important details on official websites." },
        { q: "Why were some program names in Kyrgyz?", a: "These are the official names from the government portal. We have added Russian and English translations." },
        { q: "Can I delete my comment?", a: "Yes: on the institution's page, your comment has a delete button." },
        { q: "Which languages does the site support?", a: "Russian, Kyrgyz and English. Switch the language at the bottom of the page or in settings." },
        { q: "Is it free?", a: "Yes, all UniKG features are free." },
      ],
    },
  },
};
