import React, { useState, useEffect } from 'react';
import { PortfolioProject, UserPortfolio } from '../types/gamification';

interface PortfolioSystemProps {
  userId: string;
  userName: string;
}

const PortfolioSystem: React.FC<PortfolioSystemProps> = ({ userId, userName }) => {
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'create' | 'profile'>('projects');
  const [newProject, setNewProject] = useState<Partial<PortfolioProject>>({
    title: '',
    description: '',
    category: 'diagnostic',
    technologies: [],
    images: [],
    documentation: '',
    difficulty: 'beginner',
    tags: []
  });

  useEffect(() => {
    // Mock portfolio data
    setUserPortfolio({
      userId,
      projects: [
        {
          id: 'proj-1',
          userId,
          title: 'Diagnóstico Completo BMW 320i',
          description: 'Diagnóstico e reparo de sistema de injeção e ignição',
          category: 'diagnostic',
          technologies: ['Scanner BMW', 'Osciloscópio', 'Multímetro'],
          images: ['/projects/bmw-1.jpg', '/projects/bmw-2.jpg'],
          documentation: 'Procedimento completo de diagnóstico incluindo códigos de falha, testes de pressão e verificação de sensores.',
          difficulty: 'intermediate',
          completionDate: new Date(Date.now() - 2592000000),
          likes: 23,
          comments: [],
          isPublic: true,
          tags: ['BMW', 'diagnóstico', 'injeção']
        },
        {
          id: 'proj-2',
          userId,
          title: 'Restauração Volkswagen Fusca 1972',
          description: 'Restauração completa de chassi, pintura e sistema elétrico',
          category: 'restoration',
          technologies: ['Solda', 'Pintura', 'Elétrica'],
          images: ['/projects/fusca-1.jpg'],
          documentation: 'Processo de restauração documentado com fotos de cada etapa.',
          difficulty: 'advanced',
          completionDate: new Date(Date.now() - 5184000000),
          likes: 45,
          comments: [],
          isPublic: true,
          tags: ['VW', 'restauração', 'clássico']
        }
      ],
      skills: ['Diagnóstico', 'Injeção Eletrônica', 'Elétrica', 'Restauração'],
      certifications: ['ASE', 'Bosch Certified'],
      bio: 'Profissional automotivo com 5 anos de experiência, especializado em diagnóstico e restauração.',
      totalViews: 156,
      totalLikes: 68
    });
  }, [userId]);

  const createProject = () => {
    if (!newProject.title || !newProject.description) return;

    const project: PortfolioProject = {
      id: `proj-${Date.now()}`,
      userId,
      title: newProject.title,
      description: newProject.description,
      category: newProject.category || 'diagnostic',
      technologies: newProject.technologies || [],
      images: newProject.images || [],
      documentation: newProject.documentation || '',
      difficulty: newProject.difficulty || 'beginner',
      completionDate: new Date(),
      likes: 0,
      comments: [],
      isPublic: true,
      tags: newProject.tags || []
    };

    setUserPortfolio(prev => prev ? {
      ...prev,
      projects: [project, ...prev.projects]
    } : null);

    setNewProject({
      title: '',
      description: '',
      category: 'diagnostic',
      technologies: [],
      images: [],
      documentation: '',
      difficulty: 'beginner',
      tags: []
    });

    setActiveTab('projects');
  };

  const addTechnology = (tech: string) => {
    if (tech && !newProject.technologies?.includes(tech)) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), tech]
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies?.filter(t => t !== tech) || []
    }));
  };

  return (
    <div className="portfolio-system bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-amber-600 dark:text-amber-400">📁 Portfólio</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['projects', 'create', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'projects' ? '📂 Meus Projetos' : tab === 'create' ? '➕ Criar Projeto' : '👤 Perfil'}
          </button>
        ))}
      </div>

      {/* Meus Projetos */}
      {activeTab === 'projects' && userPortfolio && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPortfolio.projects.map(project => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-6xl text-white">
                    {project.category === 'diagnostic' ? '🔧' :
                     project.category === 'repair' ? '🔨' :
                     project.category === 'modification' ? '⚡' :
                     '🚗'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>👍 {project.likes}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                      project.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{userPortfolio.projects.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projetos</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{userPortfolio.totalLikes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Curtidas</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{userPortfolio.totalViews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
            </div>
          </div>
        </div>
      )}

      {/* Criar Projeto */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Criar Novo Projeto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Título</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="Título do projeto"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Descrição</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={3}
                placeholder="Descreva seu projeto..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="diagnostic">Diagnóstico</option>
                <option value="repair">Reparo</option>
                <option value="modification">Modificação</option>
                <option value="restoration">Restauração</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Dificuldade</label>
              <select
                value={newProject.difficulty}
                onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tecnologias</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  placeholder="Adicionar tecnologia"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTechnology(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Adicionar tecnologia"]') as HTMLInputElement;
                    if (input) {
                      addTechnology(input.value);
                      input.value = '';
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newProject.technologies?.map(tech => (
                  <span
                    key={tech}
                    className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Documentação</label>
              <textarea
                value={newProject.documentation}
                onChange={(e) => setNewProject({ ...newProject, documentation: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={4}
                placeholder="Documente o processo, desafios e resultados..."
              />
            </div>

            <button
              onClick={createProject}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Criar Projeto
            </button>
          </div>
        </div>
      )}

      {/* Perfil */}
      {activeTab === 'profile' && userPortfolio && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex items-start mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
              {userName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{userName}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{userPortfolio.bio}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {userPortfolio.skills.map(skill => (
                <span key={skill} className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Certificações</h4>
            <div className="flex flex-wrap gap-2">
              {userPortfolio.certifications.map(cert => (
                <span key={cert} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">LinkedIn</label>
              <input
                type="url"
                defaultValue={userPortfolio.linkedinUrl}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">GitHub</label>
              <input
                type="url"
                defaultValue={userPortfolio.githubUrl}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSystem;
