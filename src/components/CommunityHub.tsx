import React, { useState, useEffect } from 'react';
import { ForumPost, ChatRoom, StudyGroup } from '../types/gamification';

interface CommunityHubProps {
  userId: string;
  userName: string;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState<'forum' | 'chat' | 'groups'>('forum');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'technical' | 'projects' | 'career'>('general');

  // Dados mock
  useEffect(() => {
    setForumPosts([
      {
        id: 'post-1',
        authorId: 'user-1',
        authorName: 'João Silva',
        title: 'Dúvida sobre diagnóstico de injeção eletrônica',
        content: 'Estou com problemas no sistema de injeção de um VW Golf. Alguém tem experiência com esse modelo?',
        category: 'technical',
        tags: ['injeção', 'VW', 'diagnóstico'],
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
        likes: 12,
        replies: [],
        views: 45,
        isPinned: false
      },
      {
        id: 'post-2',
        authorId: 'user-2',
        authorName: 'Maria Santos',
        title: 'Projeto de restauração de Ford Mustang 1967',
        content: 'Compartilhando meu projeto de restauração. Já fiz a parte elétrica, agora vou para a mecânica.',
        category: 'projects',
        tags: ['restauração', 'Ford', 'Mustang'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        likes: 34,
        replies: [],
        views: 120,
        isPinned: true
      }
    ]);

    setChatRooms([
      {
        id: 'room-1',
        name: 'Sala Geral',
        type: 'public',
        participants: ['user-1', 'user-2', 'user-3'],
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 604800000),
        topic: 'Conversas gerais sobre automotiva'
      },
      {
        id: 'room-2',
        name: 'Estudo Módulo 5',
        type: 'study_group',
        participants: ['user-1', 'user-4', 'user-5'],
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 172800000),
        topic: 'Injeção Eletrônica'
      }
    ]);

    setStudyGroups([
      {
        id: 'group-1',
        name: 'Grupo de Estudo - Diagnóstico Avançado',
        description: 'Focado em módulos 8-15, diagnóstico de redes e sistemas avançados',
        creatorId: 'user-1',
        members: ['user-1', 'user-2', 'user-3', 'user-4'],
        moduleId: 8,
        maxMembers: 10,
        isPublic: true,
        createdAt: new Date(Date.now() - 1209600000),
        scheduledSessions: [
          { date: new Date(Date.now() + 86400000), topic: 'CAN Bus - Parte 1' }
        ]
      }
    ]);
  }, []);

  const createPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      authorId: userId,
      authorName: userName,
      title: newPostContent.split('\n')[0].substring(0, 50),
      content: newPostContent,
      category: selectedCategory,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: [],
      views: 0,
      isPinned: false
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostContent('');
  };

  const joinGroup = (groupId: string) => {
    setStudyGroups(studyGroups.map(group => {
      if (group.id === groupId && !group.members.includes(userId)) {
        return {
          ...group,
          members: [...group.members, userId]
        };
      }
      return group;
    }));
  };

  return (
    <div className="community-hub bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">👥 Comunidade</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['forum', 'chat', 'groups'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'forum' ? '💬 Fórum' : tab === 'chat' ? '💭 Chat' : '👥 Grupos'}
          </button>
        ))}
      </div>

      {/* Fórum */}
      {activeTab === 'forum' && (
        <div>
          {/* Criar Novo Post */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-2"
            >
              <option value="general">Geral</option>
              <option value="technical">Técnico</option>
              <option value="projects">Projetos</option>
              <option value="career">Carreira</option>
            </select>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Compartilhe sua dúvida, projeto ou experiência..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-2"
              rows={3}
            />
            <button
              onClick={createPost}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
            >
              Publicar
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {forumPosts.map(post => (
              <div
                key={post.id}
                className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md ${
                  post.isPinned ? 'border-2 border-yellow-400' : ''
                }`}
              >
                {post.isPinned && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">📌 Fixado</div>
                )}
                <div className="flex items-start mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {post.authorName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{post.authorName}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mt-1">{post.title}</h3>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      👍 {post.likes}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      💬 {post.replies.length}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      👁️ {post.views}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.category === 'technical' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                    post.category === 'projects' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                    post.category === 'career' ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {post.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lista de Salas */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Salas Disponíveis</h3>
              {chatRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="font-medium text-gray-800 dark:text-gray-200">{room.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {room.participants.length} participantes
                  </div>
                  {room.topic && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      {room.topic}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Área de Chat (Placeholder) */}
            <div className="md:col-span-2 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">💭</div>
                <div>Selecione uma sala para começar a conversar</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grupos de Estudo */}
      {activeTab === 'groups' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGroups.map(group => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{group.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
                  </div>
                  {group.isPublic && (
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Público
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Membros</div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      {group.members.length} / {group.maxMembers}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 ml-2 flex-1">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(group.members.length / group.maxMembers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {group.moduleId && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Módulo</div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">Módulo {group.moduleId}</div>
                  </div>
                )}

                {group.scheduledSessions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Próxima Sessão</div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">
                      {group.scheduledSessions[0].topic}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(group.scheduledSessions[0].date).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => joinGroup(group.id)}
                  disabled={group.members.includes(userId) || group.members.length >= group.maxMembers}
                  className={`w-full py-2 rounded-lg transition ${
                    group.members.includes(userId)
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : group.members.length >= group.maxMembers
                      ? 'bg-red-300 dark:bg-red-800 text-red-600 dark:text-red-300 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {group.members.includes(userId) ? '✓ Já Membro' :
                   group.members.length >= group.maxMembers ? 'Grupo Cheio' :
                   'Entrar no Grupo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
