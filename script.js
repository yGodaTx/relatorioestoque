let produtos = [
    { id: 1, nome: 'Papel A4 500 folhas', qtd: 12, unidade: 'caixa', categoria: 'Escritório', status: 'ok', minimo: 3, alerta: 6 },
    { id: 2, nome: 'Toner impressora HP', qtd: 2, unidade: 'un', categoria: 'Escritório', status: 'alert', minimo: 1, alerta: 3 },
    { id: 3, nome: 'Álcool gel 500ml', qtd: 0, unidade: 'un', categoria: 'Limpeza', status: 'critical', minimo: 5, alerta: 10 },
    { id: 4, nome: 'Caneta esferográfica', qtd: 45, unidade: 'un', categoria: 'Escritório', status: 'ok', minimo: 10, alerta: 20 },
    { id: 5, nome: 'Detergente 500ml', qtd: 3, unidade: 'un', categoria: 'Limpeza', status: 'alert', minimo: 2, alerta: 8 },
];

let nextId = 6;
let filtroAtual = 'todos';
let statusSelecionado = 'ok';
let autoMode = true;

function calcStatus(qtd, minimo, alerta) {
    if (qtd <= 0 || qtd <= minimo) return 'critical';
    if (alerta > 0 && qtd <= alerta) return 'alert';
    return 'ok';
}

function toggleAuto() {
    autoMode = document.getElementById('toggle-auto').checked;
    const btns = document.querySelectorAll('.status-btn');
    const lbl = document.getElementById('toggle-label');
    
    btns.forEach(b => {
        if (autoMode) b.classList.add('disabled-auto');
        else b.classList.remove('disabled-auto');
    });
    
    lbl.textContent = autoMode
        ? 'Status automático ativado — baseado nas quantidades acima'
        : 'Status manual — escolha abaixo';
        
    document.getElementById('status-auto-preview').textContent = '';
    
    if (!autoMode) selectStatus(statusSelecionado);
    else atualizarStatusAuto();
}

function atualizarStatusAuto() {
    if (!autoMode) return;
    const qtd = parseInt(document.getElementById('f-qtd').value) || 0;
    const minimo = parseInt(document.getElementById('f-minimo').value) || 0;
    const alerta = parseInt(document.getElementById('f-alerta').value) || 0;
    const s = calcStatus(qtd, minimo, alerta);
    
    const labels = { ok: 'Com estoque', alert: 'Alerta', critical: 'Crítico' };
    const colors = { ok: '#3B6D11', alert: '#854F0B', critical: '#A32D2D' };
    const prev = document.getElementById('status-auto-preview');
    
    if (document.getElementById('f-qtd').value !== '') {
        prev.textContent = 'Status calculado: ' + labels[s];
        prev.style.color = colors[s];
    } else {
        prev.textContent = '';
    }
    
    document.querySelectorAll('.status-btn').forEach(b =>
        b.classList.remove('active-ok', 'active-alert', 'active-critical')
    );
    
    const map = { ok: 'active-ok', alert: 'active-alert', critical: 'active-critical' };
    document.querySelector('[data-status="' + s + '"]').classList.add(map[s]);
    statusSelecionado = s;
}

function selectStatus(s) {
    if (autoMode) return;
    statusSelecionado = s;
    document.querySelectorAll('.status-btn').forEach(b =>
        b.classList.remove('active-ok', 'active-alert', 'active-critical')
    );
    const map = { ok: 'active-ok', alert: 'active-alert', critical: 'active-critical' };
    document.querySelector('[data-status="' + s + '"]').classList.add(map[s]);
}

function setFilter(f, el) {
    filtroAtual = f;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    renderTabela();
}

function adicionarProduto() {
    const nome = document.getElementById('f-nome').value.trim();
    const qtdVal = document.getElementById('f-qtd').value;
    const unidade = document.getElementById('f-unidade').value;
    const categoria = document.getElementById('f-categoria').value.trim();
    const minimo = parseInt(document.getElementById('f-minimo').value) || 0;
    const alerta = parseInt(document.getElementById('f-alerta').value) || 0;
    
    if (!nome) { 
        document.getElementById('f-nome').focus(); 
        return; 
    }
    
    const qtd = qtdVal === '' ? 0 : parseInt(qtdVal);
    const status = autoMode ? calcStatus(qtd, minimo, alerta) : statusSelecionado;
    
    produtos.push({ 
        id: nextId++, 
        nome, 
        qtd, 
        unidade, 
        categoria: categoria || '—', 
        status, 
        minimo, 
        alerta 
    });
    
    limparForm();
    renderTabela();
    atualizarStats();
}

function limparForm() {
    ['f-nome', 'f-qtd', 'f-minimo', 'f-alerta', 'f-categoria'].forEach(id =>
        document.getElementById(id).value = ''
    );
    document.getElementById('status-auto-preview').textContent = '';
    document.querySelectorAll('.status-btn').forEach(b =>
        b.classList.remove('active-ok', 'active-alert', 'active-critical')
    );
    document.querySelector('[data-status="ok"]').classList.add('active-ok');
    statusSelecionado = 'ok';
}

function removerProduto(id) {
    if (!confirm('Remover este produto?')) return;
    produtos = produtos.filter(p => p.id !== id);
    renderTabela();
    atualizarStats();
}

function atualizarStats() {
    document.getElementById('s-total').textContent = produtos.length;
    document.getElementById('s-ok').textContent = produtos.filter(p => p.status === 'ok').length;
    document.getElementById('s-alert').textContent = produtos.filter(p => p.status === 'alert').length;
    document.getElementById('s-critical').textContent = produtos.filter(p => p.status === 'critical').length;
}

function renderTabela() {
    const busca = document.getElementById('busca').value.toLowerCase();
    
    let lista = produtos.filter(p => {
        const mb = p.nome.toLowerCase().includes(busca) || (p.categoria && p.categoria.toLowerCase().includes(busca));
        const mf = filtroAtual === 'todos' || p.status === filtroAtual;
        return mb && mf;
    });
    
    const tbody = document.getElementById('tabela-body');
    const empty = document.getElementById('tabela-empty');
    
    if (lista.length === 0) { 
        tbody.innerHTML = ''; 
        empty.style.display = 'block'; 
        atualizarStats(); 
        return; 
    }
    
    empty.style.display = 'none';
    const bm = { ok: 'badge-ok', alert: 'badge-alert', critical: 'badge-critical' };
    const lm = { ok: 'Com estoque', alert: 'Alerta', critical: 'Crítico' };
    const barColor = s => s === 'ok' ? '#639922' : s === 'alert' ? '#BA7517' : '#E24B4A';
    
    tbody.innerHTML = lista.map(p => {
        const pct = p.alerta > 0 ? Math.min(100, Math.round((p.qtd / p.alerta) * 100)) : null;
        const bar = pct !== null
            ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${barColor(p.status)}"></div></div>`
            : '';
            
        return `<tr>
            <td style="font-weight:600">${p.nome}</td>
            <td style="color:#666">${p.categoria}</td>
            <td>${p.qtd}${bar}</td>
            <td style="color:#666">${p.unidade}</td>
            <td style="color:#666">${p.minimo || '—'}</td>
            <td><span class="badge ${bm[p.status]}">${lm[p.status]}</span></td>
            <td class="col-actions">
                <button class="action-btn" onclick="removerProduto(${p.id})" title="Remover produto">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
    
    atualizarStats();
}

function exportarExcel() {
    const lm = { ok: 'Com estoque', alert: 'Alerta', critical: 'Crítico' };
    const dados = produtos.map(p => ({
        'Produto': p.nome,
        'Categoria': p.categoria,
        'Quantidade': p.qtd,
        'Unidade': p.unidade,
        'Estoque Mínimo': p.minimo || 0,
        'Nível de Alerta': p.alerta || 0,
        'Status': lm[p.status],
    }));
    
    const ws = XLSX.utils.json_to_sheet(dados);
    ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, 'Estoque', ws);
    
    const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `relatorio_estoque_${data}.xlsx`);
}

function gerarPDF() {
    const criticos = produtos.filter(p => p.status === 'critical' || p.status === 'alert');
    if (criticos.length === 0) { 
        alert('Nenhum produto em Alerta ou Crítico para gerar o relatório.'); 
        return; 
    }
    
    const data = new Date().toLocaleDateString('pt-BR');
    const lm = { alert: 'Alerta', critical: 'Crítico' };
    
    const linhas = criticos.map(p => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${p.nome}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555">${p.categoria}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${p.qtd} ${p.unidade}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${p.minimo || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:${p.status === 'critical' ? '#A32D2D' : '#854F0B'}">${lm[p.status]}</td>
    </tr>`).join('');
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Relatório de Alertas — ${data}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #222; max-width: 820px; margin: auto; }
        h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .sub { color: #666; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 10px 12px; background: #f5f5f5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #ddd; }
        @media print { body { padding: 16px; } }
    </style></head>
    <body>
    <h1>Relatório de Alertas de Estoque</h1>
    <p class="sub">Gerado em ${data} — ${criticos.length} produto(s) em atenção</p>
    <table><thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Mínimo</th><th>Status</th></tr></thead>
    <tbody>${linhas}</tbody></table>
    </body></html>`;
    
    const w = window.open('', '_blank', 'width=900,height=600');
    if (w) { 
        w.document.write(html); 
        w.document.close(); 
        setTimeout(() => w.print(), 400); 
    }
}

// Inicializa o estado da tela
renderTabela();
atualizarStats();