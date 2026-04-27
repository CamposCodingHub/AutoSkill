export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'basic' | 'intermediate' | 'advanced' | 'master' | 'expert';
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
  avatar?: string;
}

export interface GamificationProfile {
  userId: string;
  totalXP: number;
  currentLevel: number;
  levelProgress: number; // 0-100
  streak: number;
  longestStreak: number;
  achievements: Achievement[];
  weeklyXP: number;
  monthlyXP: number;
  lastStudyDate?: Date;
}

export interface ModuleProgress {
  moduleId: number;
  moduleName: string;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  xpEarned: number;
  achievementsUnlocked: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  requirements: {
    lessonsCompleted?: number;
    averageScore?: number;
    streakDays?: number;
  };
  endDate: Date;
  isActive: boolean;
}

export interface GamificationStats {
  totalUsers: number;
  activeUsers: number;
  averageStreak: number;
  topAchievement: string;
  weeklyChallenges: Challenge[];
}

// Tipos para Analytics Avançados
export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // em segundos
  moduleId?: number;
  lessonId?: string;
  activitiesCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
}

export interface UserEngagementMetrics {
  userId: string;
  totalStudyTime: number; // em segundos
  averageSessionDuration: number;
  sessionsCount: number;
  mostActiveHour: number; // 0-23
  mostActiveDay: number; // 0-6 (domingo-sábado)
  preferredModule: number;
  completionRate: number;
  engagementScore: number; // 0-100
}

export interface LearningPattern {
  userId: string;
  patternType: 'consistent' | 'burst' | 'declining' | 'irregular';
  averageDailyStudyTime: number;
  peakStudyHours: number[];
  weakAreas: number[]; // módulos com menor desempenho
  strongAreas: number[]; // módulos com maior desempenho
  recommendedNextSteps: string[];
}

export interface RetentionMetrics {
  userId: string;
  firstSessionDate: Date;
  lastSessionDate: Date;
  daysActive: number;
  retentionRate: number; // porcentagem de dias ativos desde início
  churnRisk: 'low' | 'medium' | 'high';
  predictedChurnDate?: Date;
  factors: {
    streakConsistency: number;
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
    completionTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface AnalyticsDashboard {
  overview: {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    activeUsersMonth: number;
    averageSessionDuration: number;
    totalStudyTime: number;
  };
  engagement: {
    averageEngagementScore: number;
    topEngagedUsers: string[];
    mostPopularModules: { moduleId: number; completionRate: number }[];
    peakHours: { hour: number; activeUsers: number }[];
  };
  retention: {
    averageRetentionRate: number;
    churnRate: number;
    atRiskUsers: string[];
    returningUsers: number;
  };
  learning: {
    averageCompletionRate: number;
    fastestCompleters: string[];
    commonWeakAreas: { moduleId: number; difficulty: number }[];
    averageTimePerModule: number;
  };
}

// Tipos para Sistema de Mentoria
export interface Mentor {
  id: string;
  name: string;
  email: string;
  specializations: string[]; // ex: ['Elétrica', 'Injeção', 'Híbridos']
  experience: number; // anos de experiência
  certifications: string[];
  bio: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number; // 0-5
  sessionsCompleted: number;
  studentsMentored: number;
  hourlyRate?: number;
  languages: string[];
  profileImage?: string;
}

export interface MentoringSession {
  id: string;
  mentorId: string;
  studentId: string;
  scheduledDate: Date;
  duration: number; // em minutos
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  topic: string;
  notes?: string;
  recordingUrl?: string;
  studentRating?: number;
  mentorRating?: number;
  feedback?: string;
}

export interface MentoringRequest {
  id: string;
  studentId: string;
  mentorId: string;
  topic: string;
  description: string;
  preferredDate: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
}

export interface MentorshipMatch {
  studentId: string;
  mentorId: string;
  compatibilityScore: number; // 0-100
  reasons: string[];
  recommendedTopics: string[];
}

// Tipos para Laboratório Virtual 3D
export interface VirtualLabComponent {
  id: string;
  name: string;
  type: 'engine' | 'electrical' | 'brake' | 'suspension' | 'transmission';
  modelUrl: string;
  interactivePoints: {
    id: string;
    position: { x: number; y: number; z: number };
    label: string;
    description: string;
  }[];
  diagnosticTests: {
    id: string;
    name: string;
    procedure: string[];
    expectedResults: string;
  }[];
}

export interface LabSession {
  id: string;
  userId: string;
  componentId: string;
  startTime: Date;
  endTime?: Date;
  completedTests: string[];
  score: number;
  timeSpent: number;
  mistakes: string[];
}

// Tipos para Comunidade Integrada
export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'general' | 'technical' | 'projects' | 'career';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: number[];
  views: number;
  isPinned: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  likes: number;
  isAccepted: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'study_group';
  participants: string[];
  createdBy: string;
  createdAt: Date;
  topic?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  moduleId?: number;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  scheduledSessions: {
    date: Date;
    topic: string;
  }[];
}

// Tipos para Sistema de Portfólio
export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'diagnostic' | 'repair' | 'modification' | 'restoration';
  technologies: string[];
  images: string[];
  videos?: string[];
  documentation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionDate: Date;
  likes: number;
  comments: PortfolioComment[];
  isPublic: boolean;
  tags: string[];
}

export interface PortfolioComment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface UserPortfolio {
  userId: string;
  projects: PortfolioProject[];
  skills: string[];
  certifications: string[];
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  totalViews: number;
  totalLikes: number;
}

// Tipos para Certificações Industriais
export interface Certification {
  id: string;
  name: string;
  description: string;
  issuer: string;
  category: 'electrical' | 'mechanical' | 'diagnostic' | 'hybrid' | 'ev';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  requirements: string[];
  modulesRequired: number[];
  examDuration: number; // em minutos
  passingScore: number;
  validityPeriod?: number; // em meses, undefined = permanente
  price?: number;
  imageUrl?: string;
}

export interface UserCertification {
  id: string;
  userId: string;
  certificationId: string;
  issueDate: Date;
  expiryDate?: Date;
  score: number;
  certificateUrl: string;
  verified: boolean;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  certificationId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  timeSpent: number;
}

// Tipos para Mobile App / PWA
export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'minimal-ui' | 'fullscreen';
  orientation: 'portrait' | 'landscape';
  icons: {
    src: string;
    sizes: string;
    type: string;
  }[];
}

export interface OfflineContent {
  moduleId: number;
  lessonId: string;
  downloaded: boolean;
  lastUpdated: Date;
  size: number; // em bytes
}

// Tipos para IA de Diagnóstico
export interface Symptom {
  id: string;
  description: string;
  category: 'engine' | 'electrical' | 'brake' | 'suspension' | 'transmission' | 'cooling' | 'exhaust';
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedSystems: string[];
}

export interface DiagnosticResult {
  id: string;
  problem: string;
  probability: number; // 0-100
  category: string;
  possibleCauses: string[];
  recommendedTests: string[];
  estimatedCost?: number;
  estimatedTime?: number; // em horas
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface DiagnosticSession {
  id: string;
  userId: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin?: string;
  };
  symptoms: Symptom[];
  results: DiagnosticResult[];
  timestamp: Date;
  confidence: number; // 0-100
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface DiagnosticTip {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedSymptoms: string[];
}

// Tipos para Marketplace de Serviços
export interface ServiceOffer {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: 'diagnostic' | 'repair' | 'maintenance' | 'modification' | 'restoration';
  location: {
    city: string;
    state: string;
    address?: string;
  };
  price: number;
  priceType: 'fixed' | 'hourly' | 'quote';
  availability: 'immediate' | 'within_24h' | 'within_week' | 'flexible';
  rating: number;
  reviews: number;
  verified: boolean;
  certifications: string[];
  images: string[];
  createdAt: Date;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    state: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  proposals: string[];
}

export interface ServiceReview {
  id: string;
  offerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Tipos para Microlearning
export interface MicroLesson {
  id: string;
  moduleId: number;
  originalLessonId: string;
  title: string;
  content: string[];
  duration: number; // em minutos (5-10)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prerequisites: string[];
  quiz?: {
    question: string;
    options: string[];
    correct: number;
  };
  completed: boolean;
  completedAt?: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  microLessons: string[];
  estimatedDuration: number; // em minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  progress: number; // 0-100
}

// Tipos para Configurações do Usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en' | 'es';
  notifications: {
    email: boolean;
    push: boolean;
    challenges: boolean;
    mentorship: boolean;
    community: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProgress: boolean;
    showPortfolio: boolean;
  };
  learning: {
    autoPlay: boolean;
    subtitles: boolean;
    quality: 'auto' | '720p' | '1080p';
    reminders: boolean;
    reminderTime: string; // HH:MM
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  joinedDate: Date;
  lastActive: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'challenge' | 'achievement' | 'mentorship' | 'community' | 'certification' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  subject: string;
  description: string;
  rating?: number;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

// Tipos para Sistema de Recomendações
export interface Recommendation {
  id: string;
  type: 'lesson' | 'microlesson' | 'challenge' | 'certification' | 'mentor' | 'path';
  itemId: string;
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-100
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserBehavior {
  userId: string;
  completedLessons: number[];
  completedMicroLessons: string[];
  completedChallenges: string[];
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeSpent: Record<number, number>; // moduleId -> minutes
  lastActive: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  completedLessons: number;
  completedChallenges: number;
  rank: number;
  change: number; // mudança no ranking
}

// Tipos para Sistema de Eventos ao Vivo
export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'qna' | 'demo';
  instructor: string;
  instructorAvatar?: string;
  scheduledDate: Date;
  duration: number; // em minutos
  category: string;
  maxParticipants?: number;
  currentParticipants: number;
  thumbnail?: string;
  tags: string[];
  registered: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  targetTab?: string;
  completed: boolean;
  order: number;
}
