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
    // LIMPEZA
    // ========================================
    
    /**
     * Limpa o intervalo quando a página é descarregada
     */
    window.addEventListener('beforeunload', function() {
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
        }
    });

    // ========================================
    // EXECUÇÃO
    // ========================================
    inicializar();

})();
