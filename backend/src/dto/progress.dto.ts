export interface LessonProgressDTO {
  moduleId: string;
  lessonId: string;
  completed: boolean;
}

export interface QuizAnswerDTO {
  moduleId: string;
  lessonId: string;
  answerIndex: number;
  correctIndex: number;
  totalQuizzes: number;
}

export interface LeaderboardEntryDTO {
  rank: number;
  userId: string;
  userName: string;
  xp: number;
  level: number;
  streak: number;
}

export interface ProgressDTO {
  userId: string;
  completedLessons: Record<string, boolean>;
  quizAnswers: Record<string, number>;
  lessonQuizProgress: Record<string, {
    answered: number;
    correct: number;
    total: number;
  }>;
}
