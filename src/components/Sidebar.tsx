import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import modules from '../data/modules.json'
import { useThemeStore } from '../stores/useStore'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { theme, toggleTheme } = useThemeStore()
    const location = useLocation()
    const navigate = useNavigate()
    const [currentModule, setCurrentModule] = useState<any>(null)
    const [moduleLessons, setModuleLessons] = useState<any[]>([])
    const [userRole, setUserRole] = useState<string>('user')
    const [userName, setUserName] = useState<string>('')
    const [userAvatar, setUserAvatar] = useState<string>('')
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        basico: false,
        intermediario: false,
        avancado: false,
        especialista: false
    })

    // Atualizar role, nome e avatar quando localStorage mudar
    useEffect(() => {
        const userStr = localStorage.getItem('autoskill_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role || 'user');
            setUserName(user.name || user.email || 'Usuário');
            setUserAvatar(user.avatar || '');
        }
    }, [location.pathname]) // Atualiza quando navega

    const handleLogout = () => {
        localStorage.removeItem('autoskill_user');
        localStorage.removeItem('autoskill_token');
        navigate('/login');
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    // Aplica a classe 'dark' no elemento HTML sempre que o tema mudar
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    // Detecta se estamos em um módulo e carrega as aulas correspondentes
    useEffect(() => {
        const pathParts = location.pathname.split('/')
        if (pathParts[1] === 'modulo' && pathParts[2]) {
            const moduleId = pathParts[2]
            const module = modules.find(m => m.id.toString() === moduleId)
            
            if (module) {
                setCurrentModule(module)
                // Carrega as aulas do módulo
                import(`../data/modulo${moduleId}/index.json`)
                    .then(moduleData => {
                        setModuleLessons(moduleData.default.lessons)
                    })
                    .catch(err => {
                        console.error('Erro ao carregar aulas do módulo:', err)
                        setModuleLessons([])
                    })
            }
        } else {
            setCurrentModule(null)
            setModuleLessons([])
        }
    }, [location.pathname])

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shrink-0 h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Cabeçalho com título e botão de tema lado a lado */}
                <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-orange-600/20 to-transparent">
                    <div>
                        <h1 className="text-lg font-bold text-orange-500 flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            AutoSkill
                        </h1>
                        <p className="text-xs text-gray-400">Eletricidade Automotiva</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="text-gray-300 hover:text-orange-400 transition-all hover:scale-110 text-lg bg-gray-800/50 p-2 rounded-lg"
                            aria-label="Alternar tema"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-300 hover:text-orange-400 transition-all text-lg bg-gray-800/50 p-2 rounded-lg"
                            aria-label="Fechar menu"
                        >
                            ✕
                        </button>
                    </div>
                </div>

            <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="mb-3">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`
                        }
                    >
                        <span className="text-sm">🏠</span>
                        <span>Início</span>
                    </NavLink>
                </div>
                <div className="mb-3">
                    <NavLink
                        to="/certificacoes"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-green-400'}`
                        }
                    >
                        <span className="text-sm">🎓</span>
                        <span>Certificações</span>
                    </NavLink>
                </div>
                <div className="mb-3">
                    {userRole === 'admin' ? (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-purple-400'}`
                            }
                        >
                            <span className="text-sm">👑</span>
                            <span>Painel Admin</span>
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-orange-400'}`
                            }
                        >
                            <span className="text-sm">⚙️</span>
                            <span>Configurações</span>
                        </NavLink>
                    )}
                </div>
                
                {currentModule ? (
                    <>
                        <div className="text-xs uppercase text-gray-500 mt-3 mb-1.5 px-2">
                            {currentModule.icon} {currentModule.title.length > 25 ? currentModule.title.substring(0, 25) + '...' : currentModule.title}
                        </div>
                        <div className="mb-2">
                            <NavLink
                                to={`/modulo/${currentModule.id}`}
                                className={({ isActive }) =>
                                    `block px-2 py-1.5 rounded-md text-xs ${isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                                }
                            >
                                📋 Visão Geral
                            </NavLink>
                        </div>
                        <div className="text-xs uppercase text-gray-500 mt-3 mb-1.5 px-2">Aulas</div>
                        {moduleLessons.map((lesson, index) => (
                            <NavLink
                                key={lesson.id}
                                to={`/modulo/${currentModule.id}/aula/${lesson.id}`}
                                className={({ isActive }) =>
                                    `block px-2 py-1.5 rounded-md text-xs ${isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                                }
                            >
                                {String(index + 1).padStart(2, '0')}. {lesson.title.length > 30 ? lesson.title.substring(0, 30) + '...' : lesson.title}
                            </NavLink>
                        ))}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                            <NavLink
                                to="/"
                                className="block px-2 py-1.5 rounded-md text-xs text-gray-300 hover:bg-gray-800"
                            >
                                ← Voltar
                            </NavLink>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => toggleCategory('basico')}
                            className="w-full text-xs uppercase text-gray-500 mt-4 mb-2 px-3 font-bold flex items-center justify-between gap-2 hover:text-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Básico
                            </div>
                            <span className={`transform transition-transform ${expandedCategories.basico ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                        {expandedCategories.basico && modules.filter(mod => mod.id >= 1 && mod.id <= 6).map((mod) => (
                            <NavLink
                                key={mod.id}
                                to={`/modulo/${mod.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`
                                }
                            >
                                <span className="text-sm">{mod.icon}</span>
                                <span>{mod.id.toString().padStart(2, '0')}. {mod.title.length > 35 ? mod.title.substring(0, 35) + '...' : mod.title}</span>
                            </NavLink>
                        ))}
                        
                        <button
                            onClick={() => toggleCategory('intermediario')}
                            className="w-full text-xs uppercase text-gray-500 mt-4 mb-2 px-3 font-bold flex items-center justify-between gap-2 hover:text-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Intermediário
                            </div>
                            <span className={`transform transition-transform ${expandedCategories.intermediario ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                        {expandedCategories.intermediario && modules.filter(mod => mod.id >= 7 && mod.id <= 19).map((mod) => (
                            <NavLink
                                key={mod.id}
                                to={`/modulo/${mod.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`
                                }
                            >
                                <span className="text-sm">{mod.icon}</span>
                                <span>{mod.id.toString().padStart(2, '0')}. {mod.title.length > 35 ? mod.title.substring(0, 35) + '...' : mod.title}</span>
                            </NavLink>
                        ))}
                        
                        <button
                            onClick={() => toggleCategory('avancado')}
                            className="w-full text-xs uppercase text-gray-500 mt-4 mb-2 px-3 font-bold flex items-center justify-between gap-2 hover:text-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                Avançado
                            </div>
                            <span className={`transform transition-transform ${expandedCategories.avancado ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                        {expandedCategories.avancado && modules.filter(mod => mod.id >= 20 && mod.id <= 24).map((mod) => (
                            <NavLink
                                key={mod.id}
                                to={`/modulo/${mod.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`
                                }
                            >
                                <span className="text-sm">{mod.icon}</span>
                                <span>{mod.id.toString().padStart(2, '0')}. {mod.title.length > 35 ? mod.title.substring(0, 35) + '...' : mod.title}</span>
                            </NavLink>
                        ))}
                        
                        <button
                            onClick={() => toggleCategory('especialista')}
                            className="w-full text-xs uppercase text-gray-500 mt-4 mb-2 px-3 font-bold flex items-center justify-between gap-2 hover:text-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                Especialista
                            </div>
                            <span className={`transform transition-transform ${expandedCategories.especialista ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                        {expandedCategories.especialista && modules.filter(mod => mod.id >= 25 && mod.id <= 29).map((mod) => (
                            <NavLink
                                key={mod.id}
                                to={`/modulo/${mod.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`
                                }
                            >
                                <span className="text-sm">{mod.icon}</span>
                                <span>{mod.id.toString().padStart(2, '0')}. {mod.title.length > 35 ? mod.title.substring(0, 35) + '...' : mod.title}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* Footer com usuário e logout */}
            <div className="p-4 border-t border-gray-700/50 bg-gradient-to-t from-gray-900 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userName}</p>
                        <p className="text-xs text-gray-400 capitalize">{userRole === 'admin' ? 'Administrador' : 'Aluno'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 transition-all hover:scale-[1.02]"
                >
                    <span>🚪</span>
                    <span>Sair</span>
                </button>
            </div>
        </aside>
        </>
    )
}
