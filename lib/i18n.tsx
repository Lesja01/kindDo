"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "ru";

const dictionaries = {
  en: {
    nav: { home: "Home", create: "Create", stories: "Kind stories", myDreams: "My dreams", chats: "Chats", profile: "Profile" },
    common: {
      dreamer: "Dreamer",
      you: "You",
      helper: "a helper",
      with: "with",
      helpedBy: "helped by",
      loadMore: "Load more",
      caughtUp: "You are caught up.",
      email: "Email",
      message: "Message",
      dreams: "Dreams",
      worldDreams: "World dreams",
      all: "All",
      allCategories: "All categories",
      filters: "Filters",
      location: "Location",
      searchArea: "Search area",
      customArea: "Custom area",
      customAreaPlaceholder: "Country, region, or city",
      ageFrom: "Age from",
      ageTo: "Age to",
      reset: "Reset",
      status: "Status",
      notifications: "Notifications",
      noNotifications: "No notifications yet",
      noNotificationsDescription: "Updates about dreams, chats, and gratitude stories will appear here.",
      newMessage: "New message",
      newMessageFrom: "New message from",
      storyReady: "Gratitude story is ready",
      storyReadyFrom: "Story from",
      open: "Open",
      helped: "Helped",
      reputation: "Reputation",
      saving: "Saving...",
      uploading: "Uploading...",
      uploadVideo: "Upload photo or video"
    },
    auth: {
      headline: "Help one person, beautifully.",
      intro: "Sign in to post dreams, offer help, chat, and share gratitude stories.",
      google: "Continue with Google",
      sendLink: "Send magic link",
      sending: "Sending...",
      checkInbox: "Check your inbox for a magic link."
    },
    dreams: {
      iWillHelp: "I will help",
      myDream: "My dream",
      shareTitle: "Share a dream",
      shareIntro: "Record the feeling. One person can step in and help.",
      title: "Title",
      description: "Description",
      category: "Category",
      visibility: "Visibility",
      publicVisibility: "Visible to everyone",
      publicVisibilityHint: "Visible in the public feed and available for one helper.",
      privateVisibility: "Visible only to me",
      privateVisibilityHint: "Only you can see it. It will not appear in the public feed.",
      post: "Post dream",
      posting: "Posting...",
      uploadRequired: "Please upload a short dream video.",
      createError: "Could not create dream.",
      signInToHelp: "Sign in to help",
      openChat: "Open chat",
      requestHelp: "Offer help",
      chooseHelper: "Choose helper",
      helperSelected: "Helper selected",
      helperSelectedMessage: "The dream author chose this helper.",
      unavailable: "This dream is no longer available.",
      about: "Dream details",
      tasks: "Fulfillment checklist",
      taskPlaceholder: "What needs to be done?",
      addTask: "Add task",
      noTasks: "No tasks yet",
      taskTakenBy: "Taken by",
      taskCompletedByAuthor: "Completed by author",
      completeTaskYourself: "Complete myself",
      taskSaveError: "Could not save the task. Check Supabase migration 006/007.",
      deleteTask: "Delete",
      sendThanks: "Send thanks",
      thanksPlaceholder: "Thank the helper personally",
      thanksSent: "Gratitude sent",
      published: "Published",
      helperStatus: "Helper",
      noHelperYet: "No one yet"
    },
    stories: {
      title: "Kind stories",
      watch: "Watch story",
      dreamCameTrue: "A dream came true",
      create: "Create gratitude story",
      createIntro: "Upload the thank-you video after the dream is fulfilled.",
      publish: "Publish gratitude story",
      publishing: "Publishing...",
      uploadRequired: "Please upload the gratitude video.",
      createError: "Could not create story.",
      noStories: "No stories yet.",
      viewOriginal: "View original dream",
      dreamsTab: "Dreams",
      storiesTab: "Stories",
      fulfilledBadge: "Dream fulfilled",
      thanksTo: "Thanks to",
      shareTitle: "Share this gratitude",
      shareIntro: "Prepare a post with a mention and story link.",
      mentionPerson: "Mention person",
      shareText: "Post text",
      copyShareText: "Copy text",
      copied: "Copied",
      openStory: "Open story",
      shareTelegram: "Share to Telegram",
      openInstagram: "Open Instagram",
      openTikTok: "Open TikTok"
    },
    reports: {
      report: "Report",
      title: "Report content",
      description: "Tell us what feels unsafe or inappropriate. Reports are private.",
      detailsPlaceholder: "Add details for moderation",
      submit: "Send report",
      sent: "Report sent. Thank you.",
      error: "Could not send report.",
      signInRequired: "Sign in to send a report.",
      reasons: {
        unsafe: "Unsafe",
        spam: "Spam",
        fraud: "Fraud",
        harassment: "Harassment",
        other: "Other"
      }
    },
    chats: {
      title: "Chats",
      dreamChat: "Dream chat",
      privateNote: "Only the dream author and helper can see this.",
      noChats: "No chats yet.",
      today: "Today",
      online: "Online",
      write: "Write a message",
      send: "Send message",
      loadError: "Unable to load messages",
      storyPublished: "Gratitude story is ready. Tap to watch.",
      noMessages: "No messages yet",
      unread: "new",
      emptyTitle: "No chats yet",
      emptyDescription: "When someone helps your dream, your conversation will appear here."
    },
    profile: {
      viewPublic: "View public profile",
      myDreams: "My dreams",
      listView: "List",
      gridView: "Grid",
      publishedDreams: "Published",
      hiddenDreams: "Hidden",
      activeDreams: "Active",
      completedDreams: "Fulfilled",
      publishedShort: "Visible to everyone",
      hiddenShort: "Only me",
      allMyDreams: "My dreams",
      helping: "Helping",
      about: "About",
      socialLinks: "Social links",
      editProfile: "Edit profile",
      noMyDreams: "You have not posted dreams yet.",
      noPublishedDreams: "No published dreams yet.",
      noHiddenDreams: "No hidden dreams yet.",
      emptyDescription: "Create a dream and choose whether it is visible to everyone or only to you.",
      noHelping: "You are not helping any dreams yet.",
      name: "Name",
      age: "Age",
      location: "Location",
      avatar: "Avatar URL",
      bio: "Bio",
      locationHint: "City, region, country",
      instagram: "Instagram URL",
      tiktok: "TikTok URL",
      telegram: "Telegram URL",
      saved: "Profile saved.",
      save: "Save profile",
      noBio: "The dreamer has not added a bio yet."
    },
    statuses: {
      OPEN: "Open",
      TAKEN: "Taken",
      COMPLETED: "Completed"
    },
    categories: {
      Family: "Family",
      Health: "Health",
      Learning: "Learning",
      Home: "Home",
      Work: "Work",
      Adventure: "Adventure",
      Other: "Dream details"
    }
  },
  ru: {
    nav: { home: "Главная", create: "Создать", stories: "Истории добрых дел", myDreams: "Мои мечты", chats: "Чаты", profile: "Профиль" },
    common: {
      dreamer: "Мечтатель",
      you: "Вы",
      helper: "помощником",
      with: "с",
      helpedBy: "помог",
      loadMore: "Загрузить ещё",
      caughtUp: "Вы всё посмотрели.",
      email: "Email",
      message: "Сообщение",
      dreams: "Мечты",
      worldDreams: "Мечты мира",
      all: "Все",
      allCategories: "Все категории",
      filters: "Фильтры",
      location: "Место",
      searchArea: "Область поиска",
      customArea: "Своя область",
      customAreaPlaceholder: "Страна, область или город",
      ageFrom: "Возраст от",
      ageTo: "Возраст до",
      reset: "Сбросить",
      status: "Статус",
      notifications: "Уведомления",
      noNotifications: "Уведомлений пока нет",
      noNotificationsDescription: "Здесь появятся обновления о мечтах, чатах и историях добрых дел.",
      newMessage: "Новое сообщение",
      newMessageFrom: "Новое сообщение от",
      storyReady: "История благодарности готова",
      storyReadyFrom: "История от",
      open: "Открыть",
      helped: "Помощь",
      reputation: "Репутация",
      saving: "Сохраняем...",
      uploading: "Загружаем...",
      uploadVideo: "Загрузить фото или видео"
    },
    auth: {
      headline: "Помоги одному человеку по-настоящему.",
      intro: "Войдите, чтобы публиковать мечты, помогать, общаться и делиться историями благодарности.",
      google: "Войти через Google",
      sendLink: "Отправить magic link",
      sending: "Отправляем...",
      checkInbox: "Проверьте почту: мы отправили ссылку для входа."
    },
    dreams: {
      iWillHelp: "Я помогу",
      myDream: "Моя мечта",
      shareTitle: "Поделиться мечтой",
      shareIntro: "Запишите живое видео. Один человек сможет откликнуться и помочь.",
      title: "Название",
      description: "Описание",
      category: "Категория",
      visibility: "Видимость",
      publicVisibility: "Видима всем",
      publicVisibilityHint: "Видна в общей ленте и доступна одному помощнику.",
      privateVisibility: "Видима только мне",
      privateVisibilityHint: "Видна только вам и не появится в общей ленте.",
      post: "Опубликовать мечту",
      posting: "Публикуем...",
      uploadRequired: "Загрузите короткое видео мечты.",
      createError: "Не удалось создать мечту.",
      signInToHelp: "Войти, чтобы помочь",
      openChat: "Открыть чат",
      requestHelp: "Предложить помощь",
      chooseHelper: "Выбрать исполнителем",
      helperSelected: "Исполнитель выбран",
      helperSelectedMessage: "Мечтатель выбрал этого исполнителя.",
      unavailable: "Эта мечта уже недоступна.",
      about: "Детали мечты",
      tasks: "Список дел",
      taskPlaceholder: "Что нужно сделать для исполнения?",
      addTask: "Добавить задачу",
      noTasks: "Задач пока нет",
      taskTakenBy: "Помогает",
      taskCompletedByAuthor: "Выполнено самостоятельно",
      completeTaskYourself: "Выполнено мной",
      taskSaveError: "Не удалось сохранить задачу. Проверьте миграции Supabase 006/007.",
      deleteTask: "Удалить",
      sendThanks: "Отправить благодарность",
      thanksPlaceholder: "Поблагодарите помощника лично",
      thanksSent: "Благодарность отправлена",
      published: "Опубликовано",
      helperStatus: "Поможет",
      noHelperYet: "Ещё никто"
    },
    stories: {
      title: "Истории добрых дел",
      watch: "Смотреть историю",
      dreamCameTrue: "Мечта сбылась",
      create: "Создать историю благодарности",
      createIntro: "Загрузите видео благодарности после того, как мечта исполнена.",
      publish: "Опубликовать историю",
      publishing: "Публикуем...",
      uploadRequired: "Загрузите видео благодарности.",
      createError: "Не удалось создать историю.",
      noStories: "Историй пока нет.",
      viewOriginal: "Открыть исходную мечту",
      dreamsTab: "Мечты",
      storiesTab: "Истории",
      fulfilledBadge: "Мечта исполнена",
      thanksTo: "Благодаря",
      shareTitle: "Поделиться благодарностью",
      shareIntro: "Подготовьте публикацию с упоминанием человека и ссылкой на историю.",
      mentionPerson: "Упомянуть человека",
      shareText: "Текст публикации",
      copyShareText: "Скопировать текст",
      copied: "Скопировано",
      openStory: "Открыть историю",
      shareTelegram: "Поделиться в Telegram",
      openInstagram: "Открыть Instagram",
      openTikTok: "Открыть TikTok"
    },
    reports: {
      report: "Пожаловаться",
      title: "Пожаловаться",
      description: "Расскажите, что кажется небезопасным или неуместным. Жалобы видны только модерации.",
      detailsPlaceholder: "Добавьте детали для модерации",
      submit: "Отправить жалобу",
      sent: "Жалоба отправлена. Спасибо.",
      error: "Не удалось отправить жалобу.",
      signInRequired: "Войдите, чтобы отправить жалобу.",
      reasons: {
        unsafe: "Небезопасно",
        spam: "Спам",
        fraud: "Обман",
        harassment: "Травля",
        other: "Другое"
      }
    },
    chats: {
      title: "Чаты",
      dreamChat: "Чат мечты",
      privateNote: "Этот чат видят только автор мечты и помощник.",
      noChats: "Чатов пока нет.",
      today: "Сегодня",
      online: "Онлайн",
      write: "Написать сообщение",
      send: "Отправить сообщение",
      loadError: "Не удалось загрузить сообщения",
      storyPublished: "История благодарности готова. Нажмите, чтобы посмотреть.",
      noMessages: "Сообщений пока нет",
      unread: "новых",
      emptyTitle: "Чатов пока нет",
      emptyDescription: "Когда кто-то поможет вашей мечте, переписка появится здесь."
    },
    profile: {
      viewPublic: "Открыть публичный профиль",
      myDreams: "Мои мечты",
      listView: "Список",
      gridView: "Сетка",
      publishedDreams: "Опубликованные",
      hiddenDreams: "Скрытые",
      activeDreams: "Активные",
      completedDreams: "Исполненные",
      publishedShort: "Видима всем",
      hiddenShort: "Только мне",
      allMyDreams: "Мои мечты",
      helping: "Помогаю",
      about: "О себе",
      socialLinks: "Социальные сети",
      editProfile: "Редактировать профиль",
      noMyDreams: "Вы ещё не публиковали мечты.",
      noPublishedDreams: "Опубликованных мечт пока нет.",
      noHiddenDreams: "Скрытых мечт пока нет.",
      emptyDescription: "Создайте мечту и выберите, будет ли она видна всем или только вам.",
      noHelping: "Вы пока не помогаете ни одной мечте.",
      name: "Имя",
      age: "Возраст",
      location: "Локация",
      avatar: "URL аватара",
      bio: "О себе",
      locationHint: "Город, область, страна",
      instagram: "Instagram URL",
      tiktok: "TikTok URL",
      telegram: "Telegram URL",
      saved: "Профиль сохранён.",
      save: "Сохранить профиль",
      noBio: "Мечтатель пока не добавил описание о себе."
    },
    statuses: {
      OPEN: "Открыта",
      TAKEN: "Взята",
      COMPLETED: "Завершена"
    },
    categories: {
      Family: "Семья",
      Health: "Здоровье",
      Learning: "Обучение",
      Home: "Дом",
      Work: "Работа",
      Adventure: "Приключение",
      Other: "Детали мечты"
    }
  }
};

type Dictionary = typeof dictionaries.en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("dream-locale");
    if (stored === "en" || stored === "ru") {
      setLocaleState(stored);
      return;
    }

    if (window.navigator.language.toLowerCase().startsWith("ru")) {
      setLocaleState("ru");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    function setLocale(nextLocale: Locale) {
      setLocaleState(nextLocale);
      window.localStorage.setItem("dream-locale", nextLocale);
      document.documentElement.lang = nextLocale;
    }

    return { locale, setLocale, t: dictionaries[locale] };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
