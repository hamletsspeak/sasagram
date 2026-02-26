"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ScheduleSegment {
  id: string;
  title: string;
  category: string;
  category_id: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  timezone: string;
  canceled_until: string | null;
}

interface ScheduleData {
  segments: ScheduleSegment[];
  vacation: any;
  user: {
    id: string;
    login: string;
    display_name: string;
  };
}

const stats = [
  { value: "500K+", label: "Подписчиков" },
  { value: "1000+", label: "Стримов" },
  { value: "5+", label: "Лет в эфире" },
  { value: "∞", label: "Хорошего настроения" },
];

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

interface ScheduleItem {
  day: string;
  time: string;
  active: boolean;
  title: string;
  category: string;
  isToday: boolean;
  isVacation?: boolean;
  isCanceled?: boolean;
  isRecurring?: boolean;
}

function formatScheduleTime(startTime: string): string {
  const date = new Date(startTime);
  return date.toLocaleTimeString("ru-RU", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });
}

function getDayOfWeek(startTime: string): string {
  const date = new Date(startTime);
  return weekDays[date.getDay()];
}

function isToday(dayOfWeek: string): boolean {
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = weekDays.indexOf(dayOfWeek);
  return currentDayIndex === dayIndex;
}

export default function About() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch both schedule and current stream info
    Promise.all([
      fetch("/api/twitch/schedule"),
      fetch("/api/twitch")
    ])
      .then(([scheduleRes, streamRes]) => {
        if (!scheduleRes.ok || !streamRes.ok) throw new Error("API error");
        return Promise.all([
          scheduleRes.json(),
          streamRes.json()
        ]);
      })
      .then(([schedule, stream]) => {
        setScheduleData(schedule);
        setStreamData(stream);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Generate schedule array for the current week
  const generateWeekSchedule = () => {
    // If no schedule data from API, use fallback schedule
    if (!scheduleData?.segments.length) {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // If stream is live, calculate actual start time
      let actualStartTime = null;
      if (streamData?.isLive && streamData?.stream?.started_at) {
        const startedAt = new Date(streamData.stream.started_at);
        actualStartTime = startedAt.toLocaleTimeString("ru-RU", { 
          hour: "2-digit", 
          minute: "2-digit",
          hour12: false 
        });
      }
      
      return [
        { 
          day: "Вс", 
          time: currentDay === 0 && actualStartTime ? actualStartTime : "18:00", 
          active: true, 
          title: "Вечерний стрим", 
          category: "Стрим", 
          isToday: currentDay === 0, 
          isRecurring: true,
          actualStartTime: currentDay === 0 && actualStartTime ? actualStartTime : null
        },
        { 
          day: "Пн", 
          time: currentDay === 1 && actualStartTime ? actualStartTime : "20:00", 
          active: true, 
          title: "Вечерний стрим", 
          category: "Стрим", 
          isToday: currentDay === 1, 
          isRecurring: true,
          actualStartTime: currentDay === 1 && actualStartTime ? actualStartTime : null
        },
        { day: "Вт", time: "—", active: false, title: "", category: "", isToday: currentDay === 2 },
        { 
          day: "Ср", 
          time: currentDay === 3 && actualStartTime ? actualStartTime : "20:00", 
          active: true, 
          title: "Вечерний стрим", 
          category: "Стрим", 
          isToday: currentDay === 3, 
          isRecurring: true,
          actualStartTime: currentDay === 3 && actualStartTime ? actualStartTime : null
        },
        { 
          day: "Чт", 
          time: currentDay === 4 && actualStartTime ? actualStartTime : "20:00", 
          active: true, 
          title: "Вечерний стрим", 
          category: "Стрим", 
          isToday: currentDay === 4, 
          isRecurring: true,
          actualStartTime: currentDay === 4 && actualStartTime ? actualStartTime : null
        },
        { 
          day: "Пт", 
          time: currentDay === 5 && actualStartTime ? actualStartTime : "21:00", 
          active: true, 
          title: "Пятничный стрим", 
          category: "Стрим", 
          isToday: currentDay === 5, 
          isRecurring: true,
          actualStartTime: currentDay === 5 && actualStartTime ? actualStartTime : null
        },
        { 
          day: "Сб", 
          time: currentDay === 6 && actualStartTime ? actualStartTime : "18:00", 
          active: true, 
          title: "Выходной стрим", 
          category: "Стрим", 
          isToday: currentDay === 6, 
          isRecurring: true,
          actualStartTime: currentDay === 6 && actualStartTime ? actualStartTime : null
        },
      ];
    }
    
    // Check if streamer is on vacation
    if (scheduleData.vacation) {
      const vacationStart = new Date(scheduleData.vacation.start_time);
      const vacationEnd = new Date(scheduleData.vacation.end_time);
      const today = new Date();
      
      if (today >= vacationStart && today <= vacationEnd) {
        return weekDays.map(day => ({
          day,
          time: "ОТПУСК",
          active: false,
          title: "Стример в отпуске",
          category: "",
          isToday: false,
          isVacation: true
        }));
      }
    }
    
    const schedule = weekDays.map((day, index) => {
      const today = new Date();
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - today.getDay() + index);
      
      const dayStreams = scheduleData.segments.filter(segment => {
        const streamDate = new Date(segment.start_time);
        return streamDate.toDateString() === currentDay.toDateString();
      });
      
      if (dayStreams.length > 0) {
        const firstStream = dayStreams[0];
        
        // Check if stream is canceled
        if (firstStream.canceled_until) {
          const canceledUntil = new Date(firstStream.canceled_until);
          if (currentDay <= canceledUntil) {
            return {
              day,
              time: "ОТМЕНЕН",
              active: false,
              title: "Стрим отменен",
              category: "",
              isToday: isToday(day),
              isCanceled: true
            };
          }
        }
        
        return {
          day,
          time: formatScheduleTime(firstStream.start_time),
          active: true,
          title: firstStream.title,
          category: firstStream.category,
          isToday: isToday(day),
          isRecurring: firstStream.is_recurring
        };
      }
      
      return { day, time: "—", active: false, title: "", category: "", isToday: false };
    });
    
    return schedule;
  };

  const weekSchedule = generateWeekSchedule();
  return (
    <section id="about" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: avatar + schedule */}
          <div className="relative">
            <div className="max-w-md mx-auto lg:mx-0 rounded-3xl bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-white/10 overflow-hidden p-8">
              {/* Stream schedule */}
              <div className="w-full">
                <p className="text-gray-500 text-xs uppercase tracking-widest text-center mb-3">Расписание стримов</p>
                {loading ? (
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day: string) => (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className="text-gray-500 text-xs">{day}</span>
                        <div className="w-full rounded-lg py-1.5 bg-gray-800/50 border border-gray-700/50 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-gray-500 text-xs py-2">
                    Не удалось загрузить расписание
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {weekSchedule.map((s: ScheduleItem, index: number) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <span className="text-gray-500 text-xs">{s.day}</span>
                        <div
                          className={`w-full rounded-lg py-1.5 text-center text-xs font-semibold relative ${
                            s.active
                              ? s.isToday 
                                ? "bg-red-600/30 border border-red-500/40 text-red-300"
                                : "bg-purple-600/30 border border-purple-500/40 text-purple-300"
                              : (s as any).isVacation
                                ? "bg-yellow-600/20 border border-yellow-500/40 text-yellow-300"
                                : (s as any).isCanceled
                                  ? "bg-orange-600/20 border border-orange-500/40 text-orange-300"
                                  : "bg-gray-800/50 border border-gray-700/50 text-gray-600"
                          }`}
                          title={s.title ? `${s.title} - ${s.category}${(s as any).isRecurring ? ' (повторяющийся)' : ''} • ${(s as any).actualStartTime ? `Запущен в ${(s as any).actualStartTime}` : `Запуск в ${s.time}`}` : ""}
                        >
                          {s.time}
                          {s.isToday && s.active && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                          )}
                          {(s as any).isRecurring && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full" title="Повторяющийся стрим" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-purple-600/10 rounded-3xl border border-purple-500/20 -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-violet-600/10 rounded-2xl border border-violet-500/20 -z-10" />
          </div>

          {/* Right: content */}
          <div>
            <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
              О стримере
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Кто такой SASAVOT?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              SASAVOT — популярный русскоязычный стример и контент-мейкер. Стримлю уже более 5 лет,
              за это время собрал большое и дружное комьюнити. Каждый эфир — это не просто игра,
              это живое общение и хорошее настроение.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              На канале ты найдёшь разнообразный контент: от хардкорных прохождений до расслабленных
              чиллстримов. Главное — атмосфера и общение с чатом. Заходи, будет весело!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.twitch.tv/sasavot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
                Подписаться на Twitch
              </a>
              <a
                href="https://www.youtube.com/@sasavot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
