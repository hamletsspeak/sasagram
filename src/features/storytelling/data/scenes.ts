export type StoryScene = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  keyword: string;
  bgVideoSrc?: string;
  cta?: {
    label: string;
    href: string;
  };
  gradient: string;
};

export const STORY_SCENES: StoryScene[] = [
  {
    id: "scene-entry",
    eyebrow: "Scene 01",
    title: "Entry Point",
    description: "Открываешь историю и входишь в управляемый кинематографичный скролл с поэтапной подачей контента.",
    keyword: "ENTRY",
    bgVideoSrc: "/assets/bg/Фон_раздел_2.webm",
    gradient: "linear-gradient(180deg, #000000 0%, #000000 100%)",
  },
  {
    id: "scene-schedule",
    eyebrow: "Scene 02",
    title: "Time & Rhythm",
    description:
      "Здесь открывается консоль навигации по модели: сначала запускаешь панель, затем по очереди выбираешь зоны мозга и читаешь, за что отвечает каждая команда.",
    keyword: "SCHEDULE",
    cta: {
      label: "Открыть расписание",
      href: "/schedule",
    },
    gradient: "linear-gradient(180deg, #000000 0%, #000000 100%)",
  },
  {
    id: "scene-vods",
    eyebrow: "Scene 03",
    title: "Archive Memory",
    description: "Записи и клипы работают как монтаж: архив собирает лучшие моменты и удерживает атмосферу канала.",
    keyword: "VODS",
    bgVideoSrc: "/assets/bg/толик_сцена_3.2.webm",
    cta: {
      label: "Открыть записи",
      href: "/vods",
    },
    gradient: "linear-gradient(180deg, #000000 0%, #000000 100%)",
  },
  {
    id: "scene-community",
    eyebrow: "Scene 04",
    title: "ИСТОРИЯ СТАНОВЛЕНИЯ СООБЩЕСТВА 141",
    description:
      "Сообщество растет с каждым эфиром. Новые зрители становятся частью общей истории. Live продолжается здесь и сейчас.",
    keyword: "PULSE",
    gradient:
      "linear-gradient(180deg, rgba(0, 0, 0, 0.66) 0%, rgba(0, 0, 0, 0.82) 100%), url('/assets/bg/images.steamusercontent.jpg') center / cover no-repeat",
  },
];
