// Templates HTML profissionais para emails

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export const getWelcomeEmailHTML = (name: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao AutoSkill</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; background-color: #1a1a1a; }
    .banner { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 60px 20px; text-align: center; border-bottom: 4px solid #ff6b35; }
    .content { padding: 40px 30px; background-color: #1a1a1a; }
    .logo { font-size: 72px; margin-bottom: 10px; }
    .logo-text { font-size: 48px; font-weight: bold; color: #ff6b35; margin: 0; }
    .logo-subtitle { color: #888888; font-size: 16px; margin-top: 10px; }
    h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
    h2 { color: #ffffff; font-size: 24px; margin-bottom: 20px; }
    p { color: #cccccc; line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .features { background-color: #2d2d2d; padding: 30px; margin: 20px 0; border-radius: 10px; border: 1px solid #3d3d3d; }
    .features h3 { color: #ff6b35; margin-top: 0; }
    .features ul { color: #cccccc; line-height: 1.8; }
    .footer { background-color: #0d0d0d; color: #888888; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #3d3d3d; }
    .hero-banner { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 80px 20px; text-align: center; border-bottom: 4px solid #ff6b35; }
    .hero-icon { font-size: 100px; margin-bottom: 20px; }
    .hero-image { max-width: 200px; height: auto; margin-bottom: 20px; border-radius: 10px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="hero-banner">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 20px;">
          <path d="M60 10L70 50H110L75 75L90 115L60 90L30 115L45 75L10 50H50L60 10Z" fill="#ff6b35" stroke="#ff8c61" stroke-width="2"/>
        </svg>
        <h1 class="logo-text">AutoSkill</h1>
        <p class="logo-subtitle">Cursos Técnicos Automotivos</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <h2>Olá, ${name}! 👋</h2>
        <p>Bem-vindo ao <strong>AutoSkill</strong>! Estamos muito felizes em ter você conosco nesta jornada de aprendizado automotivo.</p>
        
        <p>Você acabou de se cadastrar na plataforma mais completa de cursos técnicos automotivos. Aqui você encontrará:</p>
        
        <div class="features">
          <h3>🎯 O que você vai encontrar:</h3>
          <ul>
            <li>✅ <strong>29 Módulos</strong> completos de mecânica automotiva</li>
            <li>✅ <strong>Aulas detalhadas</strong> com conteúdo prático</li>
            <li>✅ <strong>Sistema de gamificação</strong> para tornar o aprendizado divertido</li>
            <li>✅ <strong>Certificações</strong> reconhecidas no mercado</li>
            <li>✅ <strong>Comunidade</strong> de profissionais da área</li>
          </ul>
        </div>
        
        <p>Para começar sua jornada, clique no botão abaixo:</p>
        
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px auto;">
          <tr>
            <td>
              <a href="http://localhost:5173/" class="button">Começar Agora 🚀</a>
            </td>
          </tr>
        </table>
        
        <p>Se tiver alguma dúvida, não hesite em nos contatar. Estamos aqui para ajudar!</p>
        
        <p>Atenciosamente,<br><strong>Equipe AutoSkill</strong></p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>© 2026 AutoSkill - Cursos Técnicos Automotivos</p>
        <p>Este email foi enviado automaticamente. Por favor, não responda.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getProgressEmailHTML = (name: string, lesson: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progresso de Aula</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; background-color: #1a1a1a; }
    .banner { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 60px 20px; text-align: center; border-bottom: 4px solid #ff6b35; }
    .content { padding: 40px 30px; background-color: #1a1a1a; }
    h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
    h2 { color: #ffffff; font-size: 24px; margin-bottom: 20px; }
    p { color: #cccccc; line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
    .progress-bar { background-color: #2d2d2d; border-radius: 10px; height: 30px; margin: 20px 0; overflow: hidden; border: 1px solid #3d3d3d; }
    .progress-fill { background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); height: 100%; width: 75%; border-radius: 10px; }
    .achievement { background-color: #2d2d2d; border: 2px solid #ff6b35; padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .achievement-icon { font-size: 64px; margin-bottom: 15px; }
    .footer { background-color: #0d0d0d; color: #888888; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #3d3d3d; }
    .hero-icon { font-size: 100px; margin-bottom: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="banner">
        <div class="hero-icon">⚡</div>
        <h1>Parabéns!</h1>
        <p style="color: #888888; margin: 10px 0 0 0; font-size: 16px;">Progresso Conquistado</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <h2>Olá, ${name}! 🌟</h2>
        <p>Excelente trabalho! Você completou a aula:</p>
        
        <div class="achievement">
          <div class="achievement-icon">📚</div>
          <h3 style="color: #ff6b35; margin: 0;">${lesson}</h3>
        </div>
        
        <p>Seu progresso está incrível! Continue assim para desbloquear mais conquistas e avançar no curso.</p>
        
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p style="text-align: center; color: #888888; font-size: 14px;">Seu progresso geral: 75%</p>
        
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px auto;">
          <tr>
            <td>
              <a href="http://localhost:5173/" class="button">Continuar Aprendendo 🚀</a>
            </td>
          </tr>
        </table>
        
        <p>Atenciosamente,<br><strong>Equipe AutoSkill</strong></p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>© 2026 AutoSkill - Cursos Técnicos Automotivos</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getAchievementEmailHTML = (name: string, achievement: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conquista Desbloqueada</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; background-color: #1a1a1a; }
    .banner { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 60px 20px; text-align: center; border-bottom: 4px solid #ff6b35; }
    .content { padding: 40px 30px; background-color: #1a1a1a; }
    h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
    h2 { color: #ffffff; font-size: 24px; margin-bottom: 20px; }
    p { color: #cccccc; line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
    .badge { background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4); }
    .badge-icon { font-size: 64px; margin-bottom: 15px; }
    .badge h3 { margin: 0; font-size: 24px; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #ff6b35; }
    .stat-label { color: #888888; font-size: 14px; }
    .footer { background-color: #0d0d0d; color: #888888; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #3d3d3d; }
    .hero-icon { font-size: 100px; margin-bottom: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="banner">
        <div class="hero-icon">⚡</div>
        <h1>Conquista Desbloqueada!</h1>
        <p style="color: #888888; margin: 10px 0 0 0; font-size: 16px;">Você alcançou um novo nível</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <h2>Incrível, ${name}! 🌟</h2>
        <p>Você desbloqueou uma nova conquista no AutoSkill!</p>
        
        <div class="badge">
          <div class="badge-icon">🎖️</div>
          <h3>${achievement}</h3>
        </div>
        
        <table class="stats" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
          <tr>
            <td class="stat" style="width: 33%;">
              <div class="stat-number">5</div>
              <div class="stat-label">Conquistas</div>
            </td>
            <td class="stat" style="width: 33%;">
              <div class="stat-number">1200</div>
              <div class="stat-label">XP Total</div>
            </td>
            <td class="stat" style="width: 33%;">
              <div class="stat-number">7</div>
              <div class="stat-label">Nível</div>
            </td>
          </tr>
        </table>
        
        <p>Continue assim para desbloquear mais conquistas e se tornar um especialista em mecânica automotiva!</p>
        
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px auto;">
          <tr>
            <td>
              <a href="http://localhost:5173/" class="button">Ver Minhas Conquistas 🏆</a>
            </td>
          </tr>
        </table>
        
        <p>Atenciosamente,<br><strong>Equipe AutoSkill</strong></p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>© 2026 AutoSkill - Cursos Técnicos Automotivos</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
