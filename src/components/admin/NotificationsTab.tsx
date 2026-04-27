import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'progress' | 'achievement' | 'reminder' | 'custom';
  enabled: boolean;
}

const NotificationsTab: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadTemplates();
    checkEmailConfig();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('autoskill_notification_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      const defaultTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Email de Boas-vindas',
          subject: 'Bem-vindo ao AutoSkill! 🚗',
          body: 'Olá {name},\n\nBem-vindo ao AutoSkill! Estamos felizes em ter você conosco.\n\nComece sua jornada agora!',
          type: 'welcome',
          enabled: true
        },
        {
          id: '2',
          name: 'Progresso de Aula',
          subject: 'Você completou uma aula! 🎉',
          body: 'Parabéns {name}!\n\nVocê completou a aula "{lesson}". Continue assim!',
          type: 'progress',
          enabled: true
        },
        {
          id: '3',
          name: 'Conquista Desbloqueada',
          subject: 'Nova conquista desbloqueada! 🏆',
          body: 'Incrível {name}!\n\nVocê desbloqueou a conquista "{achievement}"!',
          type: 'achievement',
          enabled: true
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('autoskill_notification_templates', JSON.stringify(defaultTemplates));
    }
  };

  const checkEmailConfig = async () => {
    try {
      const config = await notificationsAPI.checkConfig();
      setEmailConfig(config);
    } catch (error) {
      console.error('Erro ao verificar configuração:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveTemplate = (template: NotificationTemplate) => {
    try {
      const updatedTemplates = selectedTemplate
        ? templates.map(t => t.id === template.id ? template : t)
        : [...templates, { ...template, id: Date.now().toString() }];
      
      setTemplates(updatedTemplates);
      localStorage.setItem('autoskill_notification_templates', JSON.stringify(updatedTemplates));
      setShowModal(false);
      setSelectedTemplate(null);
      showMessage('success', 'Template salvo com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao salvar template');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Tem certeza que deseja deletar este template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      localStorage.setItem('autoskill_notification_templates', JSON.stringify(updatedTemplates));
      showMessage('success', 'Template deletado com sucesso!');
    }
  };

  const handleToggleTemplate = (templateId: string) => {
    const updatedTemplates = templates.map(t => 
      t.id === templateId ? { ...t, enabled: !t.enabled } : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('autoskill_notification_templates', JSON.stringify(updatedTemplates));
  };

  const handleSendTestEmail = async (template: NotificationTemplate) => {
    if (!testEmail) {
      showMessage('error', 'Digite um email para teste');
      return;
    }

    try {
      setSendingEmail(true);
      // Usar o novo endpoint que envia emails com templates HTML profissionais
      await notificationsAPI.sendTestEmail({
        to: testEmail,
        type: template.type as 'welcome' | 'progress' | 'achievement',
        name: 'Usuário Teste',
        lesson: 'Aula Teste',
        achievement: 'Conquista Teste'
      });
      showMessage('success', 'Email de teste enviado com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao enviar email de teste');
    } finally {
      setSendingEmail(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'achievement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'custom': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return '👋';
      case 'progress': return '📈';
      case 'achievement': return '🏆';
      case 'reminder': return '⏰';
      case 'custom': return '✉️';
      default: return '📧';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📧 Templates de Notificação</h3>
        
        {/* Config Status */}
        <div className={`mb-4 p-4 rounded-lg ${
          emailConfig?.hasConfig 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emailConfig?.hasConfig ? '✅' : '⚠️'}</span>
            <div>
              <p className={`font-medium ${emailConfig?.hasConfig ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                {emailConfig?.hasConfig ? 'Configuração de SMTP ativa' : 'Configuração de SMTP não encontrada'}
              </p>
              {!emailConfig?.hasConfig && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Configure as variáveis de ambiente SMTP_USER e SMTP_PASS no arquivo .env
                </p>
              )}
            </div>
          </div>
        </div>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white">
            Templates ({templates.length})
          </h4>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Novo Template
          </button>
        </div>

        {/* Test Email Input */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email para Teste
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="seu@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={() => checkEmailConfig()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Verificar Config
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-gray-800 dark:text-white">{template.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {getTypeIcon(template.type)} {template.type}
                    </span>
                    {!template.enabled && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                        Desativado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <strong>Assunto:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {template.body}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendTestEmail(template)}
                    disabled={sendingEmail || !emailConfig?.hasConfig}
                    className={`text-lg ${sendingEmail ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400'} disabled:opacity-50`}
                    title="Enviar teste"
                  >
                    {sendingEmail ? '⏳' : '📧'}
                  </button>
                  <button
                    onClick={() => handleToggleTemplate(template.id)}
                    className={`text-lg ${template.enabled ? 'text-green-600 hover:text-green-800 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'}`}
                    title={template.enabled ? 'Desativar' : 'Ativar'}
                  >
                    {template.enabled ? '🔔' : '🔕'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Deletar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const template: NotificationTemplate = {
                id: selectedTemplate?.id || '',
                name: formData.get('name') as string,
                subject: formData.get('subject') as string,
                body: formData.get('body') as string,
                type: formData.get('type') as any,
                enabled: selectedTemplate?.enabled ?? true
              };
              handleSaveTemplate(template);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  name="name"
                  defaultValue={selectedTemplate?.name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select
                  name="type"
                  defaultValue={selectedTemplate?.type || 'custom'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="welcome">👋 Boas-vindas</option>
                  <option value="progress">📈 Progresso</option>
                  <option value="achievement">🏆 Conquista</option>
                  <option value="reminder">⏰ Lembrete</option>
                  <option value="custom">✉️ Personalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto</label>
                <input
                  name="subject"
                  defaultValue={selectedTemplate?.subject}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corpo do Email</label>
                <textarea
                  name="body"
                  defaultValue={selectedTemplate?.body}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Use {{name}}, {{lesson}}, {{achievement}} para variáveis dinâmicas"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Variáveis disponíveis: {'{{name}}'}, {'{{lesson}}'}, {'{{achievement}}'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Informações</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Os templates são salvos no localStorage do navegador</li>
          <li>• Use variáveis como {'{{name}}'}, {'{{lesson}}'}, {'{{achievement}}'} para personalização</li>
          <li>• Sistema de email integrado com Nodemailer</li>
          <li>• Configure SMTP no arquivo .env do backend (SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT)</li>
          <li>• Use o botão 📧 para enviar emails de teste</li>
          <li>• Templates desativados não serão enviados automaticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsTab;
