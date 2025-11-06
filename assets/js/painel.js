/**
 * PAINEL.JS
 * Script para funcionalidades específicas do painel administrativo
 * Gerencia atualização de data/hora em tempo real e interações do dashboard
 */

(function() {
    'use strict';

    // ========================================
    // VARIÁVEIS GLOBAIS
    // ========================================
    let elementoDataHora = null;
    let intervaloAtualizacao = null;
    let toastsAtivos = []; // Array para gerenciar múltiplos toasts
    let containerToasts = null; // Container dos toasts

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    /**
     * Inicializa o script quando o DOM estiver pronto
     */
    function inicializar() {
        // Aguarda carregamento completo do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', configurarPainel);
        } else {
            configurarPainel();
        }
    }

    /**
     * Configura todas as funcionalidades do painel
     */
    function configurarPainel() {
        // Busca elemento de data/hora
        elementoDataHora = document.getElementById('data-hora-sistema');

        if (!elementoDataHora) {
            console.warn('Elemento de data/hora não encontrado');
            return;
        }

        // Atualiza data/hora imediatamente
        atualizarDataHora();

        // Atualiza a cada 1 segundo
        intervaloAtualizacao = setInterval(atualizarDataHora, 1000);

        // Anima os números das estatísticas
        animarEstatisticas();

        // Configura sistema de toasts
        criarContainerToasts();

        // Configura botões de ação rápida
        configurarBotoesAcaoRapida();

        // Configura botões de visualização da tabela
        configurarBotoesVisualizacao();
    }

    // ========================================
    // FUNÇÕES DE DATA E HORA
    // ========================================
    
    /**
     * Atualiza a exibição de data e hora com o horário do sistema
     */
    function atualizarDataHora() {
        const agora = new Date();
        
        // Formata a data
        const dataFormatada = formatarData(agora);
        
        // Formata a hora
        const horaFormatada = formatarHora(agora);
        
        // Monta texto completo
        const textoCompleto = `${dataFormatada} - ${horaFormatada}`;
        
        // Atualiza elemento HTML
        elementoDataHora.textContent = textoCompleto;
        
        // Atualiza atributo datetime (formato ISO 8601)
        elementoDataHora.setAttribute('datetime', agora.toISOString());
    }

    /**
     * Formata a data no padrão brasileiro (DD de Mês de AAAA)
     * @param {Date} data - Objeto Date a ser formatado
     * @returns {string} Data formatada
     */
    function formatarData(data) {
        const dia = data.getDate();
        const mes = obterNomeMes(data.getMonth());
        const ano = data.getFullYear();
        
        return `${dia} de ${mes} de ${ano}`;
    }

    /**
     * Formata a hora no padrão 24h (HH:MM)
     * @param {Date} data - Objeto Date a ser formatado
     * @returns {string} Hora formatada
     */
    function formatarHora(data) {
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        
        return `${horas}:${minutos}`;
    }

    /**
     * Retorna o nome do mês em português
     * @param {number} numeroMes - Número do mês (0-11)
     * @returns {string} Nome do mês
     */
    function obterNomeMes(numeroMes) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        return meses[numeroMes];
    }

    // ========================================
    // ANIMAÇÃO DE ESTATÍSTICAS
    // ========================================
    
    /**
     * Anima os números das estatísticas com efeito de contagem crescente
     */
    function animarEstatisticas() {
        // Busca todos os elementos com classe 'numero'
        const numerosEstatisticas = document.querySelectorAll('.info-estatistica .numero');

        // Anima cada número individualmente
        numerosEstatisticas.forEach((elemento, indice) => {
            // Delay progressivo para efeito cascata
            const delay = indice * 200; // 200ms entre cada animação

            setTimeout(() => {
                animarContador(elemento);
            }, delay);
        });
    }

    /**
     * Anima um contador individual com efeito de contagem crescente
     * @param {HTMLElement} elemento - Elemento que contém o número
     */
    function animarContador(elemento) {
        // Obtém o valor final do atributo data-value ou do texto
        const valorFinal = obterValorNumerico(elemento);
        
        if (valorFinal === null) {
            return; // Não é um número válido
        }

        const textoOriginal = elemento.textContent;
        const temPorcentagem = textoOriginal.includes('%');
        const temVirgula = textoOriginal.includes(',');

        // Configurações da animação
        const duracao = 6000; // 6 segundos
        const fps = 60; // Frames por segundo
        const totalFrames = (duracao / 1000) * fps;
        const incremento = valorFinal / totalFrames;
        
        let valorAtual = 0;
        let frame = 0;

        // Adiciona classe de animação
        elemento.classList.add('animando');

        // Função de animação usando requestAnimationFrame
        function animar() {
            frame++;
            valorAtual += incremento;

            // Verifica se atingiu o valor final
            if (valorAtual >= valorFinal) {
                valorAtual = valorFinal;
                elemento.textContent = formatarNumeroEstatistica(valorFinal, temVirgula, temPorcentagem);
                elemento.classList.remove('animando');
                elemento.classList.add('animado');
                return;
            }

            // Atualiza o display
            elemento.textContent = formatarNumeroEstatistica(Math.floor(valorAtual), temVirgula, temPorcentagem);

            // Continua a animação
            requestAnimationFrame(animar);
        }

        // Inicia a animação
        requestAnimationFrame(animar);
    }

    /**
     * Obtém o valor numérico de um elemento
     * @param {HTMLElement} elemento - Elemento que contém o número
     * @returns {number|null} Valor numérico ou null se inválido
     */
    function obterValorNumerico(elemento) {
        // Primeiro tenta o atributo value (mais confiável)
        const valorAtributo = elemento.getAttribute('value');
        if (valorAtributo) {
            const numero = parseFloat(valorAtributo);
            if (!isNaN(numero)) {
                return numero;
            }
        }

        // Se não houver atributo, tenta extrair do texto
        const texto = elemento.textContent.trim();
        // Remove caracteres não numéricos exceto dígitos e ponto
        const numeroLimpo = texto.replace(/[^\d]/g, '');
        const numero = parseFloat(numeroLimpo);

        return isNaN(numero) ? null : numero;
    }

    /**
     * Formata um número para exibição nas estatísticas
     * @param {number} numero - Número a ser formatado
     * @param {boolean} usarVirgula - Se deve usar separador de milhar
     * @param {boolean} usarPorcentagem - Se deve adicionar símbolo %
     * @returns {string} Número formatado
     */
    function formatarNumeroEstatistica(numero, usarVirgula, usarPorcentagem) {
        let resultado = numero.toString();

        // Adiciona separador de milhar se necessário
        if (usarVirgula && numero >= 1000) {
            resultado = numero.toLocaleString('pt-BR');
        }

        // Adiciona porcentagem se necessário
        if (usarPorcentagem) {
            resultado += '%';
        }

        return resultado;
    }

    // ========================================
    // OBSERVER PARA REANIMAR AO APARECER NA TELA
    // ========================================
    
    /**
     * Configura IntersectionObserver para reanimar quando aparecer na tela
     */
    function configurarObserverEstatisticas() {
        // Verifica se IntersectionObserver está disponível
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se o elemento está visível e ainda não foi animado
                if (entry.isIntersecting) {
                    const elemento = entry.target.querySelector('.numero');
                    if (elemento && !elemento.classList.contains('animado')) {
                        animarContador(elemento);
                    }
                }
            });
        }, {
            threshold: 0.5 // 50% do elemento visível
        });

        // Observa cada card de estatística
        const cards = document.querySelectorAll('.card-estatistica');
        cards.forEach(card => observer.observe(card));
    }

    // ========================================
    // SISTEMA DE TOASTS DE NOTIFICAÇÃO
    // ========================================

    /**
     * Cria o container para os toasts no DOM
     */
    function criarContainerToasts() {
        containerToasts = document.createElement('div');
        containerToasts.className = 'toast-container';
        containerToasts.setAttribute('aria-live', 'polite');
        containerToasts.setAttribute('aria-atomic', 'true');
        document.body.appendChild(containerToasts);
    }

    /**
     * Exibe um toast de notificação
     * @param {string} titulo - Título do toast
     * @param {string} mensagem - Mensagem do toast
     * @param {string} tipo - Tipo do toast (sucesso, erro, aviso, info)
     */
    function mostrarToast(titulo, mensagem, tipo = 'sucesso') {
        // Remove toasts antigos antes de adicionar novo
        fecharTodosToasts();

        // Cria elemento do toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo} toast-entrando`;
        toast.setAttribute('role', 'alert');

        // Define ícone baseado no tipo
        const icones = {
            sucesso: 'fa-check-circle',
            erro: 'fa-times-circle',
            aviso: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const icone = icones[tipo] || icones.info;

        // Monta estrutura HTML do toast
        toast.innerHTML = `
            <div class="toast-icone">
                <i class="fas ${icone}" aria-hidden="true"></i>
            </div>
            <div class="toast-conteudo">
                <strong class="toast-titulo">${titulo}</strong>
                <p class="toast-mensagem">${mensagem}</p>
            </div>
            <button class="toast-fechar" aria-label="Fechar notificação">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        // Adiciona toast ao container
        containerToasts.appendChild(toast);
        toastsAtivos.push(toast);

        // Animação de entrada (força reflow para aplicar transição)
        setTimeout(() => {
            toast.classList.remove('toast-entrando');
        }, 10);

        // Configura botão de fechar
        const botaoFechar = toast.querySelector('.toast-fechar');
        botaoFechar.addEventListener('click', () => fecharToast(toast));

        // Fecha automaticamente após 4 segundos
        const timeoutId = setTimeout(() => {
            fecharToast(toast);
        }, 4000);

        // Armazena timeout no elemento para possível cancelamento
        toast.dataset.timeoutId = timeoutId;
    }

    /**
     * Fecha um toast específico
     * @param {HTMLElement} toast - Elemento do toast a ser fechado
     */
    function fecharToast(toast) {
        if (!toast || !toast.parentElement) {
            return;
        }

        // Cancela o timeout de fechamento automático
        if (toast.dataset.timeoutId) {
            clearTimeout(parseInt(toast.dataset.timeoutId));
        }

        // Adiciona classe de saída
        toast.classList.add('toast-saindo');

        // Remove do array
        const indice = toastsAtivos.indexOf(toast);
        if (indice > -1) {
            toastsAtivos.splice(indice, 1);
        }

        // Remove do DOM após animação
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300); // Duração da animação de saída
    }

    /**
     * Fecha todos os toasts ativos
     */
    function fecharTodosToasts() {
        // Cria cópia do array para evitar problemas durante iteração
        const toastsParaFechar = [...toastsAtivos];
        toastsParaFechar.forEach(toast => fecharToast(toast));
    }

    // ========================================
    // BOTÕES DE AÇÃO RÁPIDA
    // ========================================

    /**
     * Configura os botões de ação rápida com loading e toasts
     */
    function configurarBotoesAcaoRapida() {
        const botoes = document.querySelectorAll('.botao-acao-rapida');

        botoes.forEach((botao) => {
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                executarAcaoRapida(this);
            });
        });
    }

    /**
     * Executa a ação do botão com animação de loading
     * @param {HTMLElement} botao - Botão clicado
     */
    function executarAcaoRapida(botao) {
        // Previne cliques múltiplos
        if (botao.classList.contains('carregando')) {
            return;
        }

        // Obtém informações da ação
        const cardAcao = botao.closest('.card-acao');
        const tituloAcao = cardAcao.querySelector('h3').textContent;
        const tipoAcao = botao.getAttribute('data-acao');
        const textoOriginal = botao.textContent;

        // Adiciona estado de loading
        botao.classList.add('carregando');
        botao.disabled = true;

        // Cria spinner de loading
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>';

        // Substitui texto por loading
        botao.innerHTML = '';
        botao.appendChild(spinner);

        // Adiciona texto "Carregando..."
        const textoLoading = document.createElement('span');
        textoLoading.textContent = 'Carregando...';
        botao.appendChild(textoLoading);

        // Simula processamento (1.5 a 2.5 segundos)
        const tempoProcessamento = 1500 + Math.random() * 1000;

        setTimeout(() => {
            // Remove loading
            botao.classList.remove('carregando');
            botao.disabled = false;
            botao.innerHTML = textoOriginal;

            // Determina o resultado baseado no tipo de ação
            const resultado = determinarResultadoAcao(tipoAcao);

            // Adiciona classe visual baseada no resultado
            const classeTemporaria = `${resultado.tipo}-temporario`;
            botao.classList.add(classeTemporaria);
            setTimeout(() => {
                botao.classList.remove(classeTemporaria);
            }, 600);

            // Exibe toast com o resultado
            mostrarToast(resultado.titulo, resultado.mensagem, resultado.tipo);
        }, tempoProcessamento);
    }

    /**
     * Determina o resultado da ação baseado no tipo
     * @param {string} tipoAcao - Tipo da ação executada
     * @returns {Object} Objeto com título, mensagem e tipo do resultado
     */
    function determinarResultadoAcao(tipoAcao) {
        switch (tipoAcao) {
            case 'novo-atendimento':
                // 30% de chance de erro (simula validação falha)
                if (Math.random() < 0.3) {
                    return {
                        tipo: 'erro',
                        titulo: 'Erro ao Criar Atendimento',
                        mensagem: 'Não foi possível criar o atendimento. Verifique os dados e tente novamente.'
                    };
                }
                return {
                    tipo: 'sucesso',
                    titulo: 'Atendimento Criado',
                    mensagem: 'Novo atendimento registrado com sucesso no sistema!'
                };

            case 'gerar-relatorio':
                // 40% de chance de aviso (simula dados incompletos)
                if (Math.random() < 0.4) {
                    return {
                        tipo: 'aviso',
                        titulo: 'Relatório Gerado com Ressalvas',
                        mensagem: 'O relatório foi gerado, mas alguns dados podem estar incompletos.'
                    };
                }
                return {
                    tipo: 'sucesso',
                    titulo: 'Relatório Gerado',
                    mensagem: 'Relatório completo gerado e disponível para download!'
                };

            case 'gerenciar-voluntarios':
                // Sempre retorna info (apenas acesso ao módulo)
                return {
                    tipo: 'info',
                    titulo: 'Módulo de Voluntários',
                    mensagem: 'Redirecionando para o painel de gerenciamento de voluntários...'
                };

            case 'configuracoes':
                // Sempre sucesso
                return {
                    tipo: 'sucesso',
                    titulo: 'Configurações Acessadas',
                    mensagem: 'Painel de configurações carregado com sucesso!'
                };

            default:
                return {
                    tipo: 'info',
                    titulo: 'Ação Executada',
                    mensagem: 'A ação foi processada pelo sistema.'
                };
        }
    }

    // ========================================
    // MODAL DE DETALHES DO ATENDIMENTO
    // ========================================

    /**
     * Configura os botões de visualização da tabela
     */
    function configurarBotoesVisualizacao() {
        const botoesVisualizar = document.querySelectorAll('.botao-acao.visualizar');

        botoesVisualizar.forEach(botao => {
            botao.addEventListener('click', function() {
                exibirModalDetalhes(this);
            });
        });
    }

    /**
     * Exibe o modal com os detalhes do atendimento
     * @param {HTMLElement} botao - Botão clicado
     */
    function exibirModalDetalhes(botao) {
        // Extrai dados do botão
        const dados = {
            id: botao.getAttribute('data-id'),
            paciente: botao.getAttribute('data-paciente'),
            voluntario: botao.getAttribute('data-voluntario'),
            especialidade: botao.getAttribute('data-especialidade'),
            data: botao.getAttribute('data-data'),
            horario: botao.getAttribute('data-horario'),
            status: botao.getAttribute('data-status'),
            tipoStatus: botao.getAttribute('data-tipo-status'),
            observacoes: botao.getAttribute('data-observacoes')
        };

        // Cria o modal
        const modal = criarModal(dados);

        // Adiciona ao body
        document.body.appendChild(modal);

        // Animação de entrada
        setTimeout(() => {
            modal.classList.add('modal-ativo');
        }, 10);

        // Configura eventos de fechamento
        configurarFechamentoModal(modal);
    }

    /**
     * Cria o HTML do modal
     * @param {Object} dados - Dados do atendimento
     * @returns {HTMLElement} Elemento do modal
     */
    function criarModal(dados) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-titulo');

        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-header-content">
                        <h2 id="modal-titulo">Detalhes do Atendimento</h2>
                        <span class="modal-id">#${dados.id}</span>
                    </div>
                    <button class="modal-botao-fechar-header" aria-label="Fechar modal">
                        <i class="fa-solid fa-times" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Badge de Status -->
                    <div class="modal-status-badge">
                        <span class="status ${dados.tipoStatus}">${dados.status}</span>
                    </div>

                    <!-- Grid de Informações -->
                    <div class="modal-info-grid">
                        <div class="modal-info-item">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Paciente</span>
                                <span class="modal-info-value">${dados.paciente}</span>
                            </div>
                        </div>

                        <div class="modal-info-item">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Voluntário</span>
                                <span class="modal-info-value">${dados.voluntario}</span>
                            </div>
                        </div>

                        <div class="modal-info-item">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Especialidade</span>
                                <span class="modal-info-value">${dados.especialidade}</span>
                            </div>
                        </div>

                        <div class="modal-info-item">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Data</span>
                                <span class="modal-info-value">${dados.data}</span>
                            </div>
                        </div>

                        <div class="modal-info-item">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Horário</span>
                                <span class="modal-info-value">${dados.horario}</span>
                            </div>
                        </div>

                        <div class="modal-info-item modal-info-item-full">
                            <div class="modal-info-content">
                                <span class="modal-info-label">Observações</span>
                                <span class="modal-info-value">${dados.observacoes}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Aviso de Desenvolvimento -->
                    <div class="modal-aviso-dev">
                        <strong>Funcionalidade em Desenvolvimento</strong>
                        <p>Recursos adicionais de edição e gerenciamento completo estarão disponíveis em breve.</p>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Configura os eventos de fechamento do modal
     * @param {HTMLElement} modal - Elemento do modal
     */
    function configurarFechamentoModal(modal) {
        const botaoFecharHeader = modal.querySelector('.modal-botao-fechar-header');
        const overlay = modal;

        // Função para fechar o modal
        const fecharModal = () => {
            modal.classList.remove('modal-ativo');
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.parentElement.removeChild(modal);
                }
            }, 300); // Duração da animação
        };

        // Evento no botão Fechar do header
        if (botaoFecharHeader) {
            botaoFecharHeader.addEventListener('click', fecharModal);
        }

        // Evento ao clicar no overlay (fora do modal)
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                fecharModal();
            }
        });

        // Evento da tecla ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                fecharModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    // ========================================
    // LIMPEZA
    // ========================================
    
    /**
     * Limpa recursos quando a página é descarregada
     */
    window.addEventListener('beforeunload', function() {
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
        }

        // Fecha todos os toasts
        fecharTodosToasts();
    });

    // ========================================
    // EXECUÇÃO
    // ========================================
    inicializar();

})();
