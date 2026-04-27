export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative mt-16 bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
            {/* Onda decorativa no topo */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 rotate-180">
                <svg
                    className="relative block w-full h-8 text-gray-900"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="currentColor"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Coluna 1: Marca + descrição */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">⚡</span>
                            <h3 className="text-2xl font-bold text-white">AutoSkill</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Cursos técnicos automotivos para profissionais que desejam dominar elétrica e eletrônica de veículos. Do básico ao avançado com simuladores interativos.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-xl">📘</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-xl">📷</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-xl">💬</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-xl">🎥</a>
                        </div>
                    </div>

                    {/* Coluna 2: Links rápidos */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-8 after:h-0.5 after:bg-orange-500">
                            Navegação
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-orange-500 transition">Início</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Todos os módulos</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Instrutores</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Certificados</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Blog</a></li>
                        </ul>
                    </div>

                    {/* Coluna 3: Suporte e legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-8 after:h-0.5 after:bg-orange-500">
                            Suporte
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-orange-500 transition">Central de ajuda</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Política de privacidade</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Termos de uso</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Trocas e reembolsos</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition">Fale conosco</a></li>
                        </ul>
                    </div>

                    {/* Coluna 4: Newsletter e selo de segurança */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-8 after:h-0.5 after:bg-orange-500">
                            Receba novidades
                        </h4>
                        <p className="text-sm text-gray-400 mb-3">Fique por dentro de novos módulos e descontos exclusivos.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition">
                                Assinar
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                            <span className="text-green-400">🔒</span> 100% seguro. Não enviamos spam.
                        </div>
                        <div className="flex gap-2 mt-3">
                            <span className="text-gray-500 text-lg">💳</span>
                            <span className="text-gray-500 text-lg">🔐</span>
                            <span className="text-gray-500 text-lg">⭐</span>
                        </div>
                    </div>
                </div>

                {/* Linha divisória com direitos autorais */}
                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <div>© {currentYear} AutoSkill. Todos os direitos reservados.</div>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <span>Feito com ⚡ para profissionais automotivos</span>
                        <span>v1.0</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}